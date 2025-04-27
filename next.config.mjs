/** @type {import('next').NextConfig} */
import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"

const nextConfig = {}


const withCivicAuth = createCivicAuthPlugin({
    clientId: process.env.CIVIC_CLIENT_ID,
    // callbackUrl: "/app/dashboard",

    // loginUrl: '/auth/',
});

export default withCivicAuth(nextConfig)
