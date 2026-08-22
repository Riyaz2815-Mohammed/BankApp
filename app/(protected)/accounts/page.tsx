"use client";

import { useEffect, useState } from "react";
import { getAccounts } from "@/modules/accounts/api";
import { Account } from "@/modules/accounts/types";
import AccountCard from "@/modules/accounts/components/AccountCard";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAccounts()
            .then(setAccounts)
            .catch(() => setError("Failed to load accounts"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Accounts</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>All your bank accounts</p>
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((acc) => <AccountCard key={acc.id} account={acc} />)}
            </div>
        </div>
    );
}
