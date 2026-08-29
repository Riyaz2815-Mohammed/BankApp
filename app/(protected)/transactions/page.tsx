"use client";

import { useState } from "react";
import { getTransactions, createTransaction } from "@/modules/transactions/api";
import { Transaction, TransactionRequest } from "@/modules/transactions/types";
import TransactionList from "@/modules/transactions/components/TransactionList";

const emptyForm: TransactionRequest = { type: "CREDIT", amount: 0 };

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accountId, setAccountId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<TransactionRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const fetchTransactions = () => {
        if (!accountId.trim()) return;
        setLoading(true);
        setError(null);
        getTransactions(accountId)
            .then(setTransactions)
            .catch(() => setError("Failed to load transactions"))
            .finally(() => setLoading(false));
    };
    const handleCreate = () => {
        if (!accountId.trim()) return;
        setSaving(true);
        createTransaction(accountId, form)
            .then((tx) => {
                setTransactions((prev) => [tx, ...prev]);
                setShowModal(false);
                setForm(emptyForm);
            })
            .catch(() => setError("Failed to create transaction"))
            .finally(() => setSaving(false));
    };
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Transactions</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>View and create transactions by account</p>
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
                <button onClick={fetchTransactions} className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: "var(--primary)" }}>Search</button>
                {accountId.trim() && (
                    <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="px-5 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>+ New Transaction</button>
                )}
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            <TransactionList transactions={transactions} />
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>New Transaction</h3>
                        <div className="space-y-3">
                            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}>
                                <option value="CREDIT">CREDIT</option>
                                <option value="DEBIT">DEBIT</option>
                            </select>
                            <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                            <button onClick={handleCreate} disabled={saving} className="flex-1 py-2 rounded-lg text-sm text-white font-semibold" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Processing..." : "Submit"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
