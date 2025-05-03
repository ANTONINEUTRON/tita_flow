import AuthGuard from "@/components/auth_guard";


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            {children}
        </AuthGuard>
    )
}