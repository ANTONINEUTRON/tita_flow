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

    public async fetchFundingFlowsByUserId() {}
}
