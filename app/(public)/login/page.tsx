"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: "var(--surface)" }}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Welcome back</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Sign in to your BankApp account</p>
                </div>
                <button
                    onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
                    className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-3"
                    style={{ backgroundColor: "var(--primary)" }}
                >
                    Sign In with Keycloak
                </button>
                <p className="text-xs text-center mt-4" style={{ color: "var(--muted)" }}>
                    You will be redirected to your organisation login page
                </p>
            </div>
        </div>
    );
}
