"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function Navbar() {
    const { data: session } = useSession();
    const initials = session?.user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
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
        <header style={{ height: "56px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 24px", gap: "12px", flexShrink: 0 }}>
            {session?.user?.name && (
                <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 400 }}>{session.user.name}</span>
            )}
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>{initials}</span>
            </div>
            <button
                onClick={handleSignOut}
                style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 500, color: "var(--muted)", background: "transparent", border: "1px solid var(--border)", borderRadius: "7px", padding: "5px 10px", cursor: "pointer", transition: "color 0.15s, border-color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "var(--danger)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
                <LogOut size={12} />
                Sign out
            </button>
        </header>
    );
}
