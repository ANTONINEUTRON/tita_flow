import { ChatClient, RoomOptions } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { Update } from '../types/update';
import { useState } from 'react';
import axios from 'axios';

export default function useUpdates() {
    // const roomOptions: RoomOptions = {};
    const ablyClient = new Ably.Realtime({authUrl: '/api/ably', clientId: 'ably-chat-demo'});
    // const chatClient = new ChatClient(ablyClient);
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUpdates = async (campaignId: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/updates?id=' + campaignId);
            const updates = await response.json();

            setUpdates(updates);
            setLoading(false);
        } catch (e) {
            console.log(e);
            setError("An error occurred while fetching updates");
            setLoading(false);
        }
    }

    const createUpdate = async (update: Update): Promise<boolean> => {
        setLoading(true);
        try {
            await axios.post('/api/updates', update);

            setLoading(false);
            return true
        } catch (e) {
            setError("Failed to create update");
            setLoading(false);
            return false
        }
    }
    
    return {
        updates,
        loading,
        error,
        createUpdate,
        fetchUpdates,
    };
}
