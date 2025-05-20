

// All operations here are rendered on the server side

import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../supabaseconfig";
import { Update } from "../types/update";
import { AppConstants } from "../app_constants";

// DON'T CALL FROM ANY FRONT FACING COMPONENT
export class UpdateService {
    private static instance: UpdateService;
    private client: Promise<SupabaseClient>;

    private constructor() {
        this.client = SUPABASE_CLIENT;
    }

    public static getInstance(): UpdateService {
        if (!UpdateService.instance) {
            UpdateService.instance = new UpdateService();
        }
        return UpdateService.instance;
    }


    public async saveUpdateToDB(updateObj: Update) {
        try {
            const { data, error } = await (await this.client)
                .from(AppConstants.UPDATE_TABLE)
                .insert(updateObj);

            if (error) {
                console.log(error)
                throw error;
            }

        } catch (error) {
            console.error("Error saving update to DB:", error);
            throw error;
        }
    }

    public async fetchUpdates(flowId: string): Promise<Update[]> {
        try {
            const { data: updates, error } = await (await this.client)
                .from(AppConstants.UPDATE_TABLE)
                .select("*, users(*)")
                .eq("flow_id", flowId);

            if (error) {
                throw error;
            }

            return updates;
        } catch (error) {
            console.error("Error fetching updates by campaign id:", error);
            throw error;
        }
    }
}