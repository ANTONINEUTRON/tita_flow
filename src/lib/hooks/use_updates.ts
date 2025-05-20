import { ChatClient, RoomOptions } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { Update, UpdateFile } from '../types/update';
import { useState } from 'react';
import axios from 'axios';

export default function useUpdates() {
    // const roomOptions: RoomOptions = {};
    // const ablyClient = new Ably.Realtime({authUrl: '/api/ably', clientId: 'ably-chat-demo'});
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
fetchUpdates(update.flow_id);
            setLoading(false);
            return true
        } catch (e) {
            setError("Failed to create update");
            setLoading(false);
            return false
        }
    }

    const uploadFile = async (attachments: File[], id: string) => {
        setLoading(true);
        const formData = new FormData();

        // Add all attachments to the form data
        attachments.forEach(file => {
            formData.append("files", file);
        });

        // Add flow ID to form data
        // formData.append("flowId", id);

        // Upload the files
        const uploadResponse = await fetch("/api/upload-flow-media", {
            method: "POST",
            body: formData,
        });

        // Get the uploaded file URLs from the response
        const uploadResult = await uploadResponse.json();
        
        // Transform the upload results into the UpdateFile format
        return uploadResult.files.map((url: string, index: number) => {
            // Determine file type based on extension or mime type
            const fileType = attachments[index].type.match(/\.(jpeg|jpg|png|gif)$/i)
                ? "image"
                : url.match(/\.(mp4|webm|mov)$/i)
                    ? "video"
                    : "document";

            return {
                url,
                type: fileType,
                created_at: new Date().toISOString()
            };
        });
    }
    
    return {
        updates,
        loading,
        error,
        uploadFile,
        createUpdate,
        fetchUpdates,
    };
}
