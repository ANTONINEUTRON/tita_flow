

import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../supabaseconfig";
import { AppConstants } from "../app_constants";
import { objectToSnake } from "ts-case-convert";
import { Contribution } from "../types/contribution";


// All operations here are rendered on the server side
// DON'T CALL FROM ANY FRONT FACING COMPONENT
export class ContributeService {
    private static instance: ContributeService;
    private client: Promise<SupabaseClient>;

    private constructor() {
        this.client = SUPABASE_CLIENT;
    }

    public static getInstance(): ContributeService {
        if (!ContributeService.instance) {
            ContributeService.instance = new ContributeService();
        }
        return ContributeService.instance;
    }

    public async saveContribution(contribution: Contribution): Promise<void> {
        try {
            const { data, error } = await (await this.client)
                .from(AppConstants.FLOW_TABLE)
                .insert(contribution); //format object keys to snake_case

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Error saving campaign to DB:", error);
            throw error;
        }
    }
}