
import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/notification';
import toast from 'react-hot-toast';
import { getNotificationContent } from '../utils/notification_message';

interface NotificationWithTitleDesc{
    title: string;
    description: string;
    notification: Notification;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationWithTitleDesc[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [, forceUpdate] = useState({});

    const fetchNotifications = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications?userId=' + userId);

            const data = await response.json();
            
            setNotifications(data.notifications.map((notification: Notification) => {
                const {title, message} = getNotificationContent(notification);

                return ({
                    title: title,
                    description: message,
                    notification: notification
                });
            }));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Failed to mark notification as read');

            // Update local state
            setNotifications(prev =>
                prev.map(notification =>
                    notification.notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = async (userId: string) => {
        try {
            const response = await fetch('/api/notifications/mark_all_read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId })
            });

            fetchNotifications(userId);

            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const clearNotifications = async (userId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId })
            });
            
            const data = await response.json();
            if (data.success) {
                setNotifications([]);
                toast.success('Notifications cleared successfully');
            } else {
                toast.error('Failed to clear notifications');
            }
        } catch (error) {
            console.error('Error clearing notifications:', error);
            toast.error('Failed to clear notifications');
        }
    };

    return {
        notifications,
        loading,
        fetchNotifications,
        markAllAsRead,
        clearNotifications
    };
}