"use client";

import { useEffect, useState } from "react";
import { getTransactions } from "@/modules/transactions/api";
import { Transaction } from "@/modules/transactions/types";
import TransactionList from "@/modules/transactions/components/TransactionList";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accountId, setAccountId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = () => {
        if (!accountId.trim()) return;
        setLoading(true);
        setError(null);
        getTransactions(accountId)
            .then(setTransactions)
            .catch(() => setError("Failed to load transactions"))
            .finally(() => setLoading(false));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Transactions</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>View transactions by account</p>
            </div>
            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Account ID"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 w-80"
                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--surface)" }}
                />
                <button
                    onClick={fetchTransactions}
                    className="px-5 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: "var(--primary)" }}
                >
                    Search
                </button>
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            <TransactionList transactions={transactions} />
        </div>
    );
}
