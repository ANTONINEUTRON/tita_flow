"use client"

import { useState } from "react";
import { FundingFlow, anchorAnumBasedOnVotingPowerModel, VotingPowerModel } from "../types/funding_flow";
import { FlowCreationValues } from "@/components/flows/create-flow-form";
import toast from "react-hot-toast";
import { getTitaFlowProgram } from "@project/anchor";
import { AppConstants } from "../app_constants";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SolanaWallet } from "@civic/auth-web3";
import { FundingFlowResponse } from "../types/funding_flow.response";

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

const connection = AppConstants.APP_CONNECTION;
const program = getTitaFlowProgram({ connection } as any);

export default function useFlow() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [flows, setFlows] = useState<FundingFlowResponse[]>([]);
    const [pagination, setPagination] = useState({})
    const [activeFlowOnchainData, setActiveFlowOnChainData] = useState<any>(null);

    const fetchFlowOC = async (address: string) => {
        try {
            const flow = await program.account.flow.fetch(new PublicKey(address));
             
            setActiveFlowOnChainData(flow);
            return flow;
        }catch (error) {
            console.error("Error fetching flow:", error);
            setError("Failed to fetch flow data");
        }
    }

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
            const mediaFiles = formValues.media!.filter(item => item.file); 

            const formData = new FormData();

            mediaFiles.forEach((mediaItem, index) => {
                formData.append(mediaItem.type, mediaItem.file);
            });

            // Upload the media files
            const uploadResponse = await fetch('/api/upload-flow-media', {
                method: 'POST',
                body: formData,
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload media files');
            }

            // Get the uploaded media URLs
            const uploadedMedia = await uploadResponse.json();


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
    ): Promise<any> => {
        const userPubKey = new PublicKey(fundingFlow.creator);

        const selectedCurrency = AppConstants.SUPPORTEDCURRENCIES.find((currency) => currency.name === fundingFlow.currency)!;
        const selectedTokenMint: PublicKey = new PublicKey(selectedCurrency.address);
        
        const flowId: string = fundingFlow.id;
        const goal: BN = new BN(Number(fundingFlow.goal) * Math.pow(10, selectedCurrency.decimals));

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

        const trx = new Transaction({
            ...blockhash,
            feePayer: userPubKey,
        });

        trx.add(inx)

        const signature = await solanaWallet.sendTransaction(trx, connection);
        
        await connection.confirmTransaction({ signature, ...blockhash });

        const flowAddress = flowPda.toString();
        return {flowAddress, signature};
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

    
    const getUserFlows = async (userId: string, options: FetchFlowOptions = {}) => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('/api/user/flows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    page: options.page || 1,
                    pageSize: options.pageSize || 30,
                    filters: options.filters || {},
                    sortBy: options.sortBy || 'createdAt',
                    sortOrder: options.sortOrder || 'desc',
                }),
            });

            let data = await response.json();
            
            // Update flows with blockchain data
            const updatedFlows = await Promise.all(
                data.flows.map(async (flow: any) => {
                    // Only fetch on-chain data if the flow has an address
                    if (flow.address) {
                        const onChainData = await fetchFlowOC(flow.address);
                        
                        if (onChainData) {
                            // Return flow with updated on-chain data
                            let completedMilestones = !onChainData.milestones ? 0 : onChainData.milestones.filter((m: any) => m.completed).length;
                            return {
                                ...flow,
                                raised: onChainData.raised,
                                goal: onChainData.goal,
                                completedMilestones: completedMilestones,
                            };
                        }
                    }
                    // If no address or error fetching on-chain data, return original flow
                    return flow;
                })
            );
            
            // Update data with enriched flows
            data = {
                ...data,
                flows: updatedFlows
            };
            
            console.log("Flows with on-chain data:", updatedFlows);
            
            setFlows(data.flows);
            setPagination({
                total: data.pagination.total,
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
            });
            
        } catch (error: any) {
            console.error("Error in getUserFlows:", error);
            setError(error.toString() || 'An error occurred while fetching flows');
            return [];
        } finally {
            setLoading(false);
        }
    };

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
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch flow');
            }
            
            const flowData = await response.json();
            return flowData;
        } catch (error) {
            console.error('Error fetching flow:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    };

    // Fetch a flow's on-chain data and return it (instead of setting state)
    // const fetchFlowOnChainData = async (address: string) => {
    //     try {
    //         const flow = await program.account.flow.fetch(new PublicKey(address));
    //         let completedMilestones = !flow.milestones ? 0 : flow.milestones.filter((m: any) => m.completed).length;
    //         return {
    //             raised: flow.raised.toString(),
    //             goal: flow.goal.toString(),
    //             completedMilestones: completedMilestones,
    //         };
    //     } catch (error) {
    //         console.error(`Error fetching on-chain data for flow ${address}:`, error);
    //         return null;
    //     }
    // };

    return {
        getUserFlows, 
        getFlowById, 
        prepareFlowData, 
        createFlowTransaction, 
        saveFlowToStore, 
        fetchFlowOC,
        activeFlowOnchainData,
        loading, 
        error, 
        flows, 
        pagination,
    };
}