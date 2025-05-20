"use client";

// import { ChatClient, RoomOptions } from '@ably/chat';
// import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
// import * as Ably from 'ably';

// const roomOptions: RoomOptions = {};

// const ablyClient = new Ably.Realtime({authUrl: '/api/ably', clientId: 'ably-chat-demo'});

// const chatClient = new ChatClient(ablyClient);


export default function FlowLayout({ children }: { children: React.ReactNode }) {
    return (
        // <ChatClientProvider client={chatClient}>
        //     <ChatRoomProvider id="chat-demo" options={roomOptions}>
        //         {children}
        //     </ChatRoomProvider>
        // </ChatClientProvider>
        <div>
            {children}
        </div>
    )
}