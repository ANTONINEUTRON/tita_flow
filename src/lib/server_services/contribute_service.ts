

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
                .from(AppConstants.CONT_TABLE)
                .insert(contribution); 

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Error saving campaign to DB:", error);
            throw error;
        }
    }

    public async getContributionsAnalyticsByCreator(userId: string): Promise<any[]> {
        try {
            const { data: userFlows, error: flowsError } = await (await this.client)
                .from(AppConstants.FLOW_TABLE)
                .select("id")
                .eq("creator_id", userId);

            if (flowsError) throw flowsError;
            if (!userFlows || userFlows.length === 0) return [];

            // Get all contributions to these flows
            const flowIds = userFlows.map(flow => flow.id);
            const { data: contributions, error: contribError } = await (await this.client)
                .from(AppConstants.CONT_TABLE)
                .select("*")
                .in("flow_id", flowIds);

            if (contribError) throw contribError;
            if (!contributions) return [];

            // Format data for analytics by month
            // Get all months from the current month back to January of the previous year
            const months: any[] = [];
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const previousYear = currentYear - 1;

            // Create an array of all months we want to display
            for (let year of [previousYear, currentYear]) {
                // For previous year, start from January
                // For current year, go up to current month
                const startMonth = year === previousYear ? 0 : 0;
                const endMonth = year === currentYear ? currentDate.getMonth() : 11;

                for (let month = startMonth; month <= endMonth; month++) {
                    const date = new Date(year, month, 1);
                    months.push({
                        name: date.toLocaleString('default', { month: 'short' }),
                        fullName: date.toLocaleString('default', { month: 'long' }),
                        year,
                        month,
                        value: 0 // Initialize with zero
                    });
                }
            }

            // Aggregate contribution amounts by month
            contributions.forEach(contribution => {
                const contribDate = new Date(contribution.created_at);
                const contribYear = contribDate.getFullYear();
                const contribMonth = contribDate.getMonth();

                // Find the matching month in our array
                const monthData = months.find(m =>
                    m.year === contribYear && m.month === contribMonth
                );

                if (monthData) {
                    // Convert from smallest units (lamports/microUSDC) to standard units
                    monthData.value += contribution.amount;
                }
            });

            // Format to the required output, keeping only months with data
            // Format: [{ name: "Jan", value: 5000 }, { name: "Feb", value: 12000 }, ...]
            return months
                .filter(month => month.value > 0 || months.indexOf(month) > months.length - 12)
                .map(month => ({
                    name: month.name,
                    value: Math.round(month.value * 100) / 100 // Round to 2 decimal places
                }));

        } catch (error) {
            console.error("Error fetching contribution analytics:", error);
            throw error;
        }
    }
}