import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import type { OIDCConfig } from "next-auth/providers";

function decodeJwtPayload(token: string): Record<string, unknown> {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(Buffer.from(base64, "base64").toString());
    } catch {
        return {};
    }
}

// KEYCLOAK_ISSUER        — public URL the browser uses (localhost:8180 or EC2 IP)
// KEYCLOAK_INTERNAL_URL  — Docker-internal URL for server-side token exchange (keycloak:8080)
//                          Only needed when Next.js runs inside Docker. Leave unset for native dev.
function buildKeycloakProvider() {
    const publicIssuer = process.env.KEYCLOAK_ISSUER!;
    const internalBase = process.env.KEYCLOAK_INTERNAL_URL;

    const base = Keycloak({
        clientId: process.env.KEYCLOAK_CLIENT_ID!,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
        issuer: publicIssuer,
    }) as OIDCConfig<Record<string, unknown>>;

    if (internalBase) {
        // Browser follows the public authorization URL; server calls go through internal Docker DNS.
        base.authorization = {
            url: `${publicIssuer}/protocol/openid-connect/auth`,
            params: { scope: "openid email profile" },
        };
        base.token = { url: `${internalBase}/protocol/openid-connect/token` };
        base.userinfo = { url: `${internalBase}/protocol/openid-connect/userinfo` };
        (base as unknown as Record<string, unknown>).jwks_endpoint =
            `${internalBase}/protocol/openid-connect/certs`;
        delete (base as unknown as Record<string, unknown>).wellKnown;
    }

    return base;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [buildKeycloakProvider()],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.idToken = account.id_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
                const payload = decodeJwtPayload(account.access_token as string);
                const realmAccess = payload.realm_access as { roles?: string[] } | undefined;
                token.roles = realmAccess?.roles ?? [];
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.idToken = token.idToken;
            session.roles = token.roles as string[];
            return session;
        },
    },
});
