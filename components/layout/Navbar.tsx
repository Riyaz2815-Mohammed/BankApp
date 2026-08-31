"use client";

import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();
    const initials = session?.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";
    const handleSignOut = async () => {
        const idToken = session?.idToken;
        await signOut({ redirect: false });
        const params = new URLSearchParams({
            post_logout_redirect_uri: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/login`,
            id_token_hint: idToken ?? "",
        });
        window.location.href = `${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${params}`;
    };
    return (
        <header className="h-16 border-b flex items-center justify-between px-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
            <div />
            <div className="flex items-center gap-4">
                {session?.user?.name && (
                    <span className="text-sm" style={{ color: "var(--muted)" }}>{session.user.name}</span>
                )}
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {initials}
                </div>
                <button
                    onClick={handleSignOut}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ color: "var(--danger)", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}
