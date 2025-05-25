import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../supabaseconfig";
import { Notification } from "../types/notification";
import { UserPreferences } from "../types/user";
import { UserService } from "./user_service";
import { EmailService } from "../services/email.service";


// All operations here are rendered on the server side
// DON'T CALL FROM ANY FRONT FACING COMPONENT
export class NotificationService {
    private static instance: NotificationService;
    private client: Promise<SupabaseClient>;

    private constructor() {
        this.client = SUPABASE_CLIENT;
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public async saveNotification(notificationObj: Notification): Promise<Notification> {
        try {
            // save notification to db
            const { data, error } = await (await this.client)
                .from("notifications")
                .insert(notificationObj);


            const user = await UserService.getInstance().getUserRecord(
                notificationObj.user_id
            );
                //fetch userId from the request
                const userPreference: UserPreferences = user.preferences!;
                
                // if userPresence is set, send notification through selected channels to the user
                //Send notification to the user through the notification channel
                if(userPreference.notifications?.email){
                    // call email service
                    EmailService.getInstance().sendNotificationEmail(
                        user.email,
                        user.username,
                        notificationObj
                    );
                }

            if (error) {
                throw error;
            }

            return data as any as Notification;
        } catch (error) {
            console.error("Error creating notification:", error);
            throw error;
        }
    }

    public async deleteNotification(notificationId: string) {
        try {
            const { data, error } = await (await this.client)
                .from("notifications")
                .delete()
                .eq("id", notificationId);

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Error deleting notification:", error);
            throw error;
        }
    }

    public async markNotificationAsRead(notificationId: string) {
        try {
            const { data, error } = await (await this.client)
                .from("notifications")
                .update({ is_read: true, is_seen: true })
                .eq("id", notificationId);

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }

    public async clearNotifications(userId: string) {
        try {
            const { data, error } = await (await this.client)
                .from("notifications")
                .delete()
                .eq("user_id", userId);

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Error deleting notification:", error);
            throw error;
        }
    }


    public async fetchUserNotifications(userId: string): Promise<Notification[]> {
        try {
            const { data: notifications, error } = await (await this.client)
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return notifications;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    }

    public async markAllNotificationsAsRead(userId: string) {
        try {
            const { data, error } = await (await this.client)
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", userId);

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw error;
        }
    }
}