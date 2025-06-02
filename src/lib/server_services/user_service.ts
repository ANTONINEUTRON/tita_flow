import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../supabaseconfig";
import { AppConstants } from "../app_constants";
import AppUser from "../types/user";
import { objectToSnake } from "ts-case-convert";


// All operations here are rendered on the server side
// DON'T CALL FROM ANY FRONT FACING COMPONENT
export class UserService {
    private static instance: UserService;
    private client: Promise<SupabaseClient>;

    private constructor() {
        this.client = SUPABASE_CLIENT;
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    public async saveUserRecordToDb(user: AppUser) {
        try {
            console.log("Value to update into db", user);

            const { data, error } = await (await this.client)
                .from(AppConstants.USER_TABLE)
                .upsert([objectToSnake(user)]);

            if (error) {
                throw error;
            }

        } catch (error) {
            console.error("Error saving user to DB:", error);
            throw error;
        }
    }

    public async updateUserRecordInDb(user: AppUser) {
        try {
            const { data, error } = await (await this.client)
                .from(AppConstants.USER_TABLE)
                .update(objectToSnake(user))
                .eq("id", user.id);

            if (error) {
                throw error;
            }

        } catch (error) {
            console.error("Error updating user in DB:", error);
            throw error;
        }
    }

    public async getUserRecord(userId: string): Promise<AppUser> {
        try {
            const { data: user, error } = await (await this.client)
                .from(AppConstants.USER_TABLE)
                .select("*")
                .eq("id", userId);

            if (error) {
                throw error;
            }

            return user[0];
        } catch (error) {
            console.error("Error fetching user record:", error);
            throw error;
        }
    }

    public async getUserRecordByEmail(userEmail: string): Promise<AppUser> {
        try {
            const { data: user, error } = await (await this.client)
                .from(AppConstants.USER_TABLE)
                .select("*")
                .eq("email", userEmail);

            if (error) {
                throw error;
            }

            return user[0];
        } catch (error) {
            console.error("Error fetching user record by email:", error);
            throw error;
        }
    }

}