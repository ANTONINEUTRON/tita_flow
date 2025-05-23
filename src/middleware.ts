import { authMiddleware } from "@civic/auth-web3/nextjs/middleware"

export default authMiddleware();

export const config = {
    // include the paths you wish to secure here
    matcher: [
        /*
         * Match all request paths except:
         * - _next directory (Next.js static files)
         * - favicon.ico, sitemap.xml, robots.txt
         * - image files
         */
        '/((?!_next|favicon.ico|api/ably|api/flow|api/test|faq|flow|use-cases|auth|sitemap.xml|robots.txt|.*\.jpg|.*\.png|.*\.svg|.*\.gif).*)',
    ],
}
