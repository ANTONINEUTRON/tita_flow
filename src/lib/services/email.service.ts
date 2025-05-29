// Resend email service class

import { Resend } from 'resend';
import { AppConstants } from '../app_constants';
import { Notification } from '../types/notification';
import { NotificationTypes } from '../types/notification_types';
import { getNotificationContent } from '../utils/notification_message';

// Email service configuration
interface EmailConfig {
    apiKey: string;
    defaultFrom: string;
    defaultReplyTo?: string;
}

// Email service for sending various notification emails
export class EmailService {
    private static instance: EmailService;
    private resend: Resend;
    private config: EmailConfig;

    private constructor() {
        this.config = {
            apiKey: process.env.RS_EMAIL_KEY || '',
            defaultFrom: 'Titaflow <no-reply@titaflow.com>',
            defaultReplyTo: AppConstants.SUPPORT_EMAIL,
        };

        this.resend = new Resend(this.config.apiKey);
    }

    /**
     * Get singleton instance of EmailService
     */
    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }
    /**
     * Send email notification based on notification object
     * Uses the notification_message utility to format content consistently
     */
    public async sendNotificationEmail(
        to: string,
        recipientName: string,
        notification: Notification
    ): Promise<boolean> {
        try {
            // Get standardized title and message from the existing utility
            const { title, message } = getNotificationContent(notification);

            // Build the action URL
            const actionUrl = notification.action_url
                ? `${AppConstants.APP_URL}${notification.action_url}`
                : null;

            // Get appropriate color based on notification type
            const colorMap = {
                [NotificationTypes.ACCOUNT_CREATED]: "#3b82f6",     // blue
                [NotificationTypes.NEW_CONTRIBUTION]: "#f59e0b",    // amber
                [NotificationTypes.NEW_WITHDRAW]: "#8b5cf6",        // violet
                [NotificationTypes.NEW_UPDATE]: "#6366f1",          // indigo
                [NotificationTypes.FLOW_GOAL_REACHED]: "#f59e0b",   // amber
                [NotificationTypes.FLOW_CANCELED]: "#ef4444",       // red
                [NotificationTypes.FLOW_COMPLETED]: "#10b981",      // green
                [NotificationTypes.FLOW_CREATED]: "#06b6d4",        // cyan
            };

            const accentColor = colorMap[notification.type] || "#6b7280"; // Default gray

            // Send email with standardized template
            const { data, error } = await this.resend.emails.send({
                from: this.config.defaultFrom,
                to,
                subject: title,
                html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Logo Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="${AppConstants.APP_URL}/logo.png" alt="Titaflow Logo" style="max-width: 180px; height: auto;">
                </div>
                
                <!-- Notification Header -->
                <h1 style="color: ${accentColor};">${title}</h1>
                
                <!-- Greeting -->
                <p>Hello ${recipientName},</p>
                
                <!-- Message -->
                <div style="margin: 20px 0; line-height: 1.5;">
                    <p>${message}</p>
                </div>
                
                <!-- Action Button (if URL exists) -->
                ${actionUrl ? `
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${actionUrl}" 
                       style="background-color: ${accentColor}; 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 4px;
                              font-weight: 500;
                              display: inline-block;">
                       View Details
                    </a>
                </div>
                ` : ''}
                
                <!-- Signature -->
                <p>Thank you for using Titaflow!</p>
                <p>Best regards,<br>The Titaflow Team</p>
                
                <!-- Footer -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #666; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} Titaflow. All rights reserved.</p>
                    <p>
                        <a href="${AppConstants.APP_URL}/privacy" style="color: #666; text-decoration: underline;">Privacy Policy</a> | 
                        <a href="${AppConstants.APP_URL}/terms" style="color: #666; text-decoration: underline;">Terms of Service</a>
                    </p>
                </div>
            </div>
            `,
            });

            if (error) {
                console.error('Error sending notification email:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Failed to send notification email:', error);
            return false;
        }
    }
}