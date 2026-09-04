"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getAccounts, getMyAccounts } from "@/modules/accounts/api";
import { getTransactions, createTransaction } from "@/modules/transactions/api";
import { Account } from "@/modules/accounts/types";
import { Transaction } from "@/modules/transactions/types";
import TransactionList from "@/modules/transactions/components/TransactionList";

const emptyForm = { type: "CREDIT", amount: 0 };

export default function TransactionsPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingTx, setLoadingTx] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;
        const load = isAdmin ? getAccounts() : getMyAccounts();
        load
            .then(setAccounts)
            .catch(() => setError("Failed to load accounts"))
            .finally(() => setLoadingAccounts(false));
    }, [status, isAdmin]);

    const selectAccount = (account: Account) => {
        setSelectedAccount(account);
        setTransactions([]);
        setError(null);
        setLoadingTx(true);
        getTransactions(account.id)
            .then(setTransactions)
            .catch(() => setError("Failed to load transactions"))
            .finally(() => setLoadingTx(false));
    };

    const handleCreate = () => {
        if (!selectedAccount) return;
        setSaving(true);
        setError(null);
        createTransaction(selectedAccount.id, form)
            .then((tx) => {
                setTransactions((prev) => [tx, ...prev]);
                setSelectedAccount((a) => a ? { ...a, balance: tx.balance } : a);
                setShowModal(false);
                setForm(emptyForm);
            })
            .catch(() => setError("Failed to create transaction"))
            .finally(() => setSaving(false));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Transactions</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Select an account to view and create transactions
                    </p>
                </div>
                {selectedAccount && (
                    <button
                        onClick={() => { setForm(emptyForm); setShowModal(true); }}
                        className="px-5 py-2 rounded-lg text-white text-sm font-semibold"
                        style={{ backgroundColor: "var(--primary)" }}
                    >
                        + New Transaction
                    </button>
                )}
            </div>

            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

            {loadingAccounts ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>Loading accounts...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {accounts.map((acc) => {
                        const active = selectedAccount?.id === acc.id;
                        return (
                            <button
                                key={acc.id}
                                onClick={() => selectAccount(acc)}
                                className="text-left p-4 rounded-xl border transition-all"
                                style={{
                                    backgroundColor: active ? "var(--primary)" : "var(--surface)",
                                    borderColor: active ? "var(--primary)" : "var(--border)",
                                    color: active ? "#fff" : "var(--text)",
                                }}
                            >
                                <p className="text-xs font-medium mb-1" style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--muted)" }}>
                                    {acc.accountType} · {acc.accountNo}
                                </p>
                                <p className="text-lg font-bold">₹{acc.balance.toLocaleString()}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {selectedAccount && (
                <div className="space-y-3">
                    <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                        Transactions — {selectedAccount.accountType} ({selectedAccount.accountNo})
                    </h3>
                    {loadingTx ? (
                        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
                    ) : (
                        <TransactionList transactions={transactions} />
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>New Transaction</h3>
                        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                            Account: {selectedAccount?.accountNo} · Balance: ₹{selectedAccount?.balance.toLocaleString()}
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                >
                                    <option value="CREDIT">CREDIT — Add money</option>
                                    <option value="DEBIT">DEBIT — Withdraw money</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 5000"
                                    min={1}
                                    value={form.amount || ""}
                                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={saving || !form.amount}
                                className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                {saving ? "Processing..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
