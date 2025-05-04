import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../supabaseconfig";
import { FundingFlow } from "../types/flow";
import { AppConstants } from "../app_constants";
import { objectToSnake } from "ts-case-convert";


// All operations here are rendered on the server side
// DON'T CALL FROM ANY FRONT FACING COMPONENT
export class FlowService {
    private static instance: FlowService;
    private client: Promise<SupabaseClient>;

    private constructor() {
        this.client = SUPABASE_CLIENT;
    }

    public static getInstance(): FlowService {
        if (!FlowService.instance) {
            FlowService.instance = new FlowService();
        }
        return FlowService.instance;
    }

    public async fetchFundingFlow() {}

    public async createFundingFlow(flow: FundingFlow): Promise<void> {
        try {
            const { data, error } = await (await this.client)
                .from(AppConstants.FLOW_TABLE)
                .insert(objectToSnake(flow)); //format object keys to snake_case

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Error saving campaign to DB:", error);
            throw error;
        }
    }

    public async updateFundingFlow() {}

    public async deleteFundingFlow() {}

    /**
     * Fetches funding flows created by a specific user with pagination support
     * 
     * @param userId The ID of the user whose flows to fetch
     * @param page The page number to fetch (starts from 1)
     * @param pageSize The number of items per page
     * @param filters Optional filters for status, type, etc.
     * @param sortBy Optional field to sort by
     * @param sortOrder Optional sort direction ('asc' or 'desc')
     * @returns A paginated result containing flows and pagination metadata
     */
    public async fetchFundingFlowsByUserId(
        userId: string,
        page: number = 1,
        pageSize: number = 20,
        filters?: {
            title?: string;
            createdAfter?: Date;
            createdBefore?: Date;
        },
        sortBy: string = 'created_at',
        sortOrder: 'asc' | 'desc' = 'desc'
    ): Promise<{
        flows: FundingFlow[];
        pagination: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
            hasMore: boolean;
        };
    }> {
        try {
            // Calculate offset for pagination
            const offset = (page - 1) * pageSize;

            // Start building the query
            let query = (await this.client)
                .from(AppConstants.FLOW_TABLE)
                .select('*', { count: 'exact' });

            // Add user ID filter
            query = query.eq('creator_id', userId);

            // Apply optional filters if provided
            if (filters) {
                // Filter by title (partial match)
                if (filters.title) {
                    query = query.ilike('title', `%${filters.title}%`);
                }

                // Filter by creation date range
                if (filters.createdAfter) {
                    query = query.gte('created_at', filters.createdAfter.toISOString());
                }

                if (filters.createdBefore) {
                    query = query.lte('created_at', filters.createdBefore.toISOString());
                }
            }

            // Add sorting
            // query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Add pagination
            query = query.range(offset, offset + pageSize - 1);

            // Execute the query
            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching funding flows:', error);
                throw error;
            }

            // Calculate pagination metadata
            const total = count || 0;
            const totalPages = Math.ceil(total / pageSize);

            return {
                flows: (data || []) as FundingFlow[],
                pagination: {
                    total,
                    page,
                    pageSize,
                    totalPages,
                    hasMore: page < totalPages
                }
            };
        } catch (error) {
            console.error('Exception fetching funding flows by user ID:', error);
            throw error;
        }
    }
}
