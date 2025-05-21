import { ChatClient, RoomOptions } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { Update, UpdateFile } from '../types/update';
import { useState } from 'react';
import axios from 'axios';
import { UpdateResponse } from '../types/update.response';

export default function useUpdates() {
    // const roomOptions: RoomOptions = {};
    // const ablyClient = new Ably.Realtime({authUrl: '/api/ably', clientId: 'ably-chat-demo'});
    // const chatClient = new ChatClient(ablyClient);
    const [updates, setUpdates] = useState<UpdateResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUpdates = async (flowId: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/updates?id=' + flowId);
            const updates = await response.json();

            const sortedUpdates = updates.sort((a: UpdateResponse, b: UpdateResponse) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            setUpdates(sortedUpdates);
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
            const mimeType = attachments[index].type;

            let fileType;
            if (mimeType.startsWith('image/')) {
                fileType = "image";
            } else if (mimeType.startsWith('video/')) {
                fileType = "video";
            } else {
                // Fallback to URL extension check if MIME type is ambiguous
                if (url.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i)) {
                    fileType = "image";
                } else if (url.match(/\.(mp4|webm|mov|avi|mkv|flv)$/i)) {
                    fileType = "video";
                } else {
                    fileType = "document";
                }
            }

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
