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
                    Sign In
                </button>
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
