"use client"

import { useState } from "react";
import { FundingFlow } from "../types/flow";

interface FetchFlowOptions{
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

export default function useFlow(){
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [flows, setFlows] = useState<FundingFlow[]>([]);
    const [pagination, setPagination] = useState({})


    /**
     * Fetches flows for a given user with optional pagination, filters, and sorting.
     * @param userId - The ID of the user whose flows to fetch.
     * @param options - Optional parameters for pagination, filters, and sorting.
     * @returns A promise that resolves to the fetched flows and pagination metadata.
     */
    const getUserFlows = async (userId: string, options: FetchFlowOptions = {}) => {
       try{
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

       }catch (error) {
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

    return { getUserFlows, loading, error, flows, pagination }
}