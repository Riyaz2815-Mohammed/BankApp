"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
    OAuthCallbackError: "Sign-in failed. Wrong credentials or access denied.",
    AccessDenied: "Your account does not have access. Please register first.",
    SessionRequired: "Your session expired. Please sign in again.",
    Default: "Something went wrong. Please try again.",
};

function LoginContent() {
    const params = useSearchParams();
    const errorCode = params.get("error");
    const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default) : null;

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: "var(--surface)" }}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Welcome back</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Sign in to your BankApp account</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", color: "var(--danger)", border: "1px solid #FECACA" }}>
                        {errorMessage}
                    </div>
                )}

                <button
                    onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
                    className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-3"
                    style={{ backgroundColor: "var(--primary)" }}
                >
                    Sign In with Keycloak
                </button>
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
                    <span className="text-xs" style={{ color: "var(--muted)" }}>or</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
                </div>
                <a
                    href={`${process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER}/protocol/openid-connect/registrations?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}&response_type=code&scope=openid&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_NEXTAUTH_URL + "/api/auth/callback/keycloak")}`}
                    className="w-full py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center border mt-2"
                    style={{ color: "var(--primary)", borderColor: "var(--primary)" }}
                >
                    Create an Account
                </a>
                <p className="text-xs text-center mt-4" style={{ color: "var(--muted)" }}>
                    You will be redirected to your organisation login page
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}
