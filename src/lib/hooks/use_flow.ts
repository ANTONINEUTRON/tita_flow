"use client"

import { useState } from "react";
import { FundingFlow, anchorAnumBasedOnVotingPowerModel, VotingPowerModel } from "../types/flow";
import { FlowCreationValues } from "@/components/flows/create-flow-form";
import toast from "react-hot-toast";
import { getTitaFlowProgram } from "@project/anchor";
import { AppConstants } from "../app_constants";
import { PublicKey, SystemProgram, Transaction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import BN from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useUser } from "@civic/auth-web3/react";
import { SolanaWallet, userHasWallet } from "@civic/auth-web3";
import { FundingFlowResponse } from "../types/flow.response";

interface FetchFlowOptions {
    page?: number;
    pageSize?: number;
    filters?: {
        title?: string;
        createdAfter?: Date;
        createdBefore?: Date;
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export default function useFlow() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [flows, setFlows] = useState<FundingFlow[]>([]);
    const [pagination, setPagination] = useState({})

    const prepareFlowData = async (flowId: string, formValues: FlowCreationValues, creator: string, creator_id: string): Promise<FundingFlow> => {
        const mediaUploadRes = (formValues.media && formValues.media.length > 0)
            ? await uploadMediaFiles(formValues)
            : { imageUrls: [], videoUrl: "" };

        const now = new Date().toISOString()
        return {
            id: flowId,
            title: formValues.title,
            description: formValues.description,
            goal: formValues.goal,
            enddate: formValues.endDate,
            startdate: formValues.startdate,
            currency: formValues.currency,

            rules: formValues.rules,
            creator: creator, // Placeholder for creator's address
            creator_id: creator_id!, // Placeholder for creator's ID
            milestones: formValues.milestones || [],
            votingPowerModel: formValues.votingPowerModel,
            images: mediaUploadRes.imageUrls,
            video: mediaUploadRes.videoUrl,
            status: "active",
            raised: 0,
        }
    }

    const uploadMediaFiles = async (formValues: FlowCreationValues): Promise<{
        imageUrls: string[];
        videoUrl: string;
    }> => {
        try {
            // Prepare for media upload
            const mediaFiles = formValues.media!.filter(item => item.file); // Only items with files need upload

            // Create FormData for file upload
            const formData = new FormData();

            // Append each media file to FormData
            mediaFiles.forEach((mediaItem, index) => {
                formData.append(mediaItem.type, mediaItem.file);

            });

            // Upload the media files
            const uploadResponse = await fetch('/api/upload-flow-media', {
                method: 'POST',
                body: formData,
            });
            console.log("Upload response:", uploadResponse);
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload media files');
            }

            // Get the uploaded media URLs
            const uploadedMedia = await uploadResponse.json();

            console.log("Uploaded media:", uploadedMedia);


            return {
                imageUrls: uploadedMedia.imageUrls || [],
                videoUrl: uploadedMedia.videoUrl || "",
            }
        } catch (uploadError) {
            console.error("Media upload error:", uploadError);
            toast.error("There was a problem uploading your media files. Please try again.");

            throw new Error('Failed to upload media files');
        }
    }

    const createFlowTransaction = async (
        fundingFlow: FundingFlow,
        solanaWallet: SolanaWallet
    ): Promise<string> => {
        const connection = AppConstants.APP_CONNECTION;
        const program = getTitaFlowProgram({ connection } as any);

        const userPubKey = new PublicKey(fundingFlow.creator);
        const selectedTokenMint: PublicKey = new PublicKey(AppConstants.SUPPORTEDCURRENCIES.find((currency) => currency.name === fundingFlow.currency)!.address);
        const flowId: string = fundingFlow.id;
        const goal: BN = new BN(fundingFlow.goal);

        // Handle start time - could be optional on chain
        let startTime: BN | null = null;
        if (fundingFlow.startdate) {
            const startDate = new Date(fundingFlow.startdate);
            if (isNaN(startDate.getTime())) {
                throw new Error("Invalid start date");
            }
            startTime = new BN(Math.floor(startDate.getTime() / 1000));
        }

        // Handle end time - could be optional on chain
        let endTime: BN | null = null;
        if (fundingFlow.enddate) {
            const endDate = new Date(fundingFlow.enddate);
            if (isNaN(endDate.getTime())) {
                throw new Error("Invalid end date");
            }
            endTime = new BN(Math.floor(endDate.getTime() / 1000));
        }

        // Only validate time relationship if both times are provided
        if (startTime && endTime && endTime.lte(startTime)) {
            throw new Error("End time must be after start time");
        }

        
        let vPowerModel: VotingPowerModel = fundingFlow.votingPowerModel;

        let milestones = null;
        if(fundingFlow.rules.milestone){
            milestones = fundingFlow?.milestones!.map((milestone) => {
                return {
                    id: milestone.id,
                    amount: new BN(milestone.amount),
                    deadline: new BN(new Date(milestone.deadline).getTime() / 1000),
                    completed: false,
                };
            });
        }

        // Find the flow PDA
        const [flowPda] = await PublicKey.findProgramAddressSync(
            [
                AppConstants.TITA_FLOW_SEED,
                Buffer.from(flowId),
                userPubKey.toBuffer(),
            ],
            program.programId
        );

        // Find the flow token account PDA
        const [flowTokenAccount] = await PublicKey.findProgramAddressSync(
            [
                AppConstants.TITA_FLOW_TA_SEED,
                flowPda.toBuffer(),
                selectedTokenMint.toBuffer(),
            ],
            program.programId
        );

        const inx = await program.methods.createFlow(
            flowId,
            goal,
            startTime,
            endTime,
            anchorAnumBasedOnVotingPowerModel(vPowerModel),
            milestones // no milestones = direct flow
        ).accountsPartial({
            creator: new PublicKey(fundingFlow.creator),
            flow: flowPda,
            flowTokenAccount: flowTokenAccount,
            tokenMint: selectedTokenMint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        }).instruction();

        const blockhash = await connection.getLatestBlockhash();
        console.log("blockhash", blockhash.blockhash);
        // create v0 compatible message
        // const insructions = [inx];
        // const messageV0 = new TransactionMessage({
        //     instructions: insructions,
        //     payerKey: userPubKey,
        //     recentBlockhash: blockhash.blockhash,
        // }).compileToV0Message();

        // const transferTransaction = new VersionedTransaction(messageV0);
        // console.log(messageV0.recentBlockhash);

        const trx = new Transaction({
            ...blockhash,
            feePayer: userPubKey,
        });

        trx.add(inx)

        const signature = await solanaWallet.sendTransaction(trx, connection);
        
        await connection.confirmTransaction({ signature, ...blockhash });

        return signature;
    }

    const saveFlowToStore = async (flowToSubmitted: FundingFlow) => {
        const response = await fetch('/api/flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flowToSubmitted),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create flow');
        }

        const flowData = await response.json();
    }

    /**
     * Fetches flows for a given user with optional pagination, filters, and sorting.
     * @param userId - The ID of the user whose flows to fetch.
     * @param options - Optional parameters for pagination, filters, and sorting.
     * @returns A promise that resolves to the fetched flows and pagination metadata.
     */
    const getUserFlows = async (userId: string, options: FetchFlowOptions = {}) => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/flows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    page: options.page || 1,
                    pageSize: options.pageSize || 10,
                    filters: options.filters || {},
                    sortBy: options.sortBy || 'createdAt',
                    sortOrder: options.sortOrder || 'desc',
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                setError(error.message || 'Failed to fetch user flows');
                //    throw new Error(error.message || 'Failed to fetch user flows');
            }
            let data = await response.json()
            console.log("Response", data)

            setFlows(data.flows);
            setPagination({
                total: data.pagination.total,
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
            });

            // return response.json();

        } catch (error) {
            console.error("Error fetching user flows:", error);
            //    throw new Error('Failed to fetch user flows');
        }
        setLoading(false);
    }

    // Function to fetch a specific flow by ID
    const getFlowById = async (id: string): Promise<FundingFlowResponse | null> => {
        if (!id) {
            throw new Error('Flow ID is required');
        }
        
        try {
            const response = await fetch(`/api/flow?id=${encodeURIComponent(id)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log("Flow response:", response);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch flow');
            }
            
            const flowData = await response.json();
            console.log("Flow responseJSJSJS:", flowData);
            return flowData;
        } catch (error) {
            console.error('Error fetching flow:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    };

    return {
        getUserFlows, 
        getFlowById, 
        prepareFlowData, 
        createFlowTransaction, 
        saveFlowToStore, 
        loading, 
        error, 
        flows, 
        pagination,
    };
}