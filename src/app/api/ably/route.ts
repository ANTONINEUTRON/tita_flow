import Ably from "ably";
import { NextRequest } from "next/server";

// ensure Vercel doesn't cache the result of this route,
// as otherwise the token request data will eventually become outdated
// and we won't be able to authenticate on the client side
export const revalidate = 0;

export async function GET(request: NextRequest) {
    const client = new Ably.Rest(process.env.ABLY_API_KEY!);
    const tokenRequestData = await client.auth.createTokenRequest({
        clientId: "ably-chat-demo",
    });
    return Response.json(tokenRequestData);
}