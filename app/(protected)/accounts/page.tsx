"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAccounts, getMyAccounts, createAccount, updateAccount, deleteAccount } from "@/modules/accounts/api";
import { Account, AccountRequest } from "@/modules/accounts/types";

const emptyForm: AccountRequest = { accountNo: "", accountType: "SAVINGS", balance: 0, customerId: "" };

export default function AccountsPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);
    const [form, setForm] = useState<AccountRequest>(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;
        const load = isAdmin ? getAccounts() : getMyAccounts();
        load
            .then(setAccounts)
            .catch(() => setError("Failed to load accounts"))
            .finally(() => setLoading(false));
    }, [status, isAdmin]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };
    const openEdit = (a: Account) => {
        setEditing(a);
        setForm({ accountNo: a.accountNo, accountType: a.accountType, balance: a.balance, customerId: a.customerId });
        setShowModal(true);
    };
    const handleSave = () => {
        setSaving(true);
        const action = editing ? updateAccount(editing.id, form) : createAccount(form);
        action
            .then((saved) => {
                setAccounts((prev) => editing ? prev.map((a) => a.id === editing.id ? saved : a) : [...prev, saved]);
                setShowModal(false);
            })
            .catch(() => setError("Failed to save account"))
            .finally(() => setSaving(false));
    };
    const handleDelete = (id: string) => {
        deleteAccount(id)
            .then(() => setAccounts((prev) => prev.filter((a) => a.id !== id)))
            .catch(() => setError("Failed to delete account"));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                        {isAdmin ? "All Accounts" : "My Accounts"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        {isAdmin ? "Manage all bank accounts" : "Your bank accounts"}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={openCreate}
                        className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                        style={{ backgroundColor: "var(--primary)" }}
                    >
                        + New Account
                    </button>
                )}
            </div>

            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            {!loading && accounts.length === 0 && !error && (
                <p className="text-sm" style={{ color: "var(--muted)" }}>No accounts found.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((acc) => (
                    <div
                        key={acc.id}
                        className="rounded-xl p-5 shadow-sm"
                        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                {acc.accountType}
                            </span>
                            <span className="text-xs" style={{ color: "var(--muted)" }}>{acc.accountNo}</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                            ₹{acc.balance.toLocaleString()}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Available Balance</p>
                        {isAdmin && (
                            <p className="text-xs mt-2 truncate" style={{ color: "var(--muted)" }}>
                                Customer: {acc.customerId}
                            </p>
                        )}
                        {isAdmin && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => openEdit(acc)}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-medium border"
                                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(acc.id)}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                                    style={{ color: "var(--danger)", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModal && isAdmin && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
                            {editing ? "Edit Account" : "New Account"}
                        </h3>
                        <div className="space-y-3">
                            <input
                                placeholder="Account Number"
                                value={form.accountNo}
                                onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            />
                            <select
                                value={form.accountType}
                                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            >
                                <option value="SAVINGS">SAVINGS</option>
                                <option value="CURRENT">CURRENT</option>
                                <option value="FIXED">FIXED</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Balance"
                                value={form.balance}
                                onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
                                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            />
                            <input
                                placeholder="Customer ID"
                                value={form.customerId}
                                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 rounded-lg text-sm border"
                                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-2 rounded-lg text-sm text-white font-semibold"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
