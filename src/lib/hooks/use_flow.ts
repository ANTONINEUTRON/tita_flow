"use client"

import { useState } from "react";
import { FundingFlow } from "../types/flow";
import { FlowCreationValues } from "@/components/flows/create-flow-form";
import toast from "react-hot-toast";

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
            duration: formValues.duration,
            startdate: formValues.startdate,
            currency: formValues.currency,

            rules: formValues.rules,
            creator: creator, // Placeholder for creator's address
            creator_id: creator_id!, // Placeholder for creator's ID
            milestones: formValues.milestones || [],
            votingPowerModel: formValues.votingPowerModel,
            quorumPercentage: formValues.quorumPercentage,
            approvalPercentage: formValues.approvalPercentage,
            votingPeriodDays: formValues.votingPeriodDays,
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

    const createFlowTransaction = async () => {

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

    // Example usage
    // try {
    //     const result = await getUserFlows('user123', {
    //         page: 2,
    //         pageSize: 20,
    //         filters: {
    //             status: ['active', 'completed'],
    //             title: 'project',
    //             createdAfter: '2023-01-01'
    //         },
    //         sortBy: 'title',
    //         sortOrder: 'asc'
    //     });

    //     console.log(`Found ${result.pagination.total} flows`);
    //     console.log(`Showing page ${result.pagination.page} of ${result.pagination.totalPages}`);

    //     // Render the flows
    //     result.flows.forEach((flow) => {
    //         console.log(flow.title);
    //     });
    // } catch (error) {
    //     console.error('Error:', error);
    // }

    return { getUserFlows, prepareFlowData, createFlowTransaction, saveFlowToStore, loading, error, flows, pagination }
}