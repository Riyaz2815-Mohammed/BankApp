import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

function decodeJwtPayload(token: string): Record<string, unknown> {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(Buffer.from(base64, "base64").toString());
    } catch {
        return {};
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Keycloak({
            clientId: process.env.KEYCLOAK_CLIENT_ID!,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
            issuer: process.env.KEYCLOAK_ISSUER,
        }),
    ],
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
