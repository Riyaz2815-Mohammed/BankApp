"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAccounts, getMyAccounts, createAccount, updateAccount, deleteAccount } from "@/modules/accounts/api";
import { getCustomers } from "@/modules/customers/api";
import { Account } from "@/modules/accounts/types";
import { Customer } from "@/modules/customers/types";

export default function AccountsPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;
    const router = useRouter();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create modal
    const [showCreate, setShowCreate] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [createForm, setCreateForm] = useState({ accountNo: "", accountType: "SAVINGS", balance: 0 });
    const [creating, setCreating] = useState(false);

    // Edit modal
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [editForm, setEditForm] = useState({ accountType: "SAVINGS", balance: 0 });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;
        const load = isStaff ? getAccounts() : getMyAccounts();
        load
            .then(setAccounts)
            .catch(() => setError("Failed to load accounts"))
            .finally(() => setLoading(false));
    }, [status, isAdmin]);

    const openCreate = () => {
        setCreateForm({ accountNo: "", accountType: "SAVINGS", balance: 0 });
        setSelectedCustomer(null);
        setCustomerSearch("");
        setShowDropdown(false);
        if (customers.length === 0) {
            getCustomers().then(setCustomers).catch(() => {});
        }
        setShowCreate(true);
    };

    const openEdit = (a: Account) => {
        setEditingAccount(a);
        setEditForm({ accountType: a.accountType, balance: a.balance });
    };

    const handleCreate = () => {
        if (!selectedCustomer) return;
        setCreating(true);
        createAccount({ ...createForm, customerId: selectedCustomer.id })
            .then((saved) => {
                setAccounts((prev) => [...prev, saved]);
                setShowCreate(false);
            })
            .catch(() => setError("Failed to create account"))
            .finally(() => setCreating(false));
    };

    const handleEdit = () => {
        if (!editingAccount) return;
        setSaving(true);
        updateAccount(editingAccount.id, {
            accountNo: editingAccount.accountNo,
            accountType: editForm.accountType,
            balance: editForm.balance,
            customerId: editingAccount.customerId,
        })
            .then((saved) => {
                setAccounts((prev) => prev.map((a) => a.id === saved.id ? saved : a));
                setEditingAccount(null);
            })
            .catch(() => setError("Failed to update account"))
            .finally(() => setSaving(false));
    };

    const handleDelete = (id: string) => {
        deleteAccount(id)
            .then(() => setAccounts((prev) => prev.filter((a) => a.id !== id)))
            .catch(() => setError("Failed to delete account"));
    };

    const filteredCustomers = customers.filter((c) => {
        const q = customerSearch.toLowerCase();
        return (
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                        {isStaff ? "All Accounts" : "My Accounts"}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        {isStaff ? "All registered bank accounts" : "Your bank accounts"}
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
                            <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>{acc.accountNo}</span>
                        </div>
                        <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                            ₹{acc.balance.toLocaleString()}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Available Balance</p>
                        {isStaff && acc.customerName && (
                            <p className="text-sm mt-3 font-medium truncate" style={{ color: "var(--text)" }}>
                                {acc.customerName}
                            </p>
                        )}
                        {isStaff && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => router.push(`/accounts/${acc.id}`)}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-medium border"
                                    style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                                >
                                    View Details
                                </button>
                                {isAdmin && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Account Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>New Account</h3>
                        <div className="space-y-3">
                            {/* Customer search */}
                            <div className="relative">
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Customer</label>
                                {selectedCustomer ? (
                                    <div
                                        className="w-full px-4 py-2 rounded-lg border text-sm flex items-center justify-between"
                                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
                                    >
                                        <span style={{ color: "var(--text)" }}>
                                            {selectedCustomer.firstName} {selectedCustomer.lastName}
                                            <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>
                                                {selectedCustomer.email}
                                            </span>
                                        </span>
                                        <button
                                            onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}
                                            className="text-xs ml-2"
                                            style={{ color: "var(--muted)" }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            placeholder="Search by name or email…"
                                            value={customerSearch}
                                            onChange={(e) => { setCustomerSearch(e.target.value); setShowDropdown(true); }}
                                            onFocus={() => setShowDropdown(true)}
                                            className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                        />
                                        {showDropdown && filteredCustomers.length > 0 && (
                                            <div
                                                className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                                                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                                            >
                                                {filteredCustomers.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => { setSelectedCustomer(c); setShowDropdown(false); }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors"
                                                        style={{ color: "var(--text)" }}
                                                    >
                                                        <span className="font-medium">{c.firstName} {c.lastName}</span>
                                                        <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>{c.email}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {showDropdown && customerSearch && filteredCustomers.length === 0 && (
                                            <div
                                                className="absolute top-full left-0 right-0 mt-1 rounded-lg px-4 py-3 text-sm"
                                                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
                                            >
                                                No customers match "{customerSearch}"
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Account Number</label>
                                <input
                                    placeholder="e.g. SB009001"
                                    value={createForm.accountNo}
                                    onChange={(e) => setCreateForm({ ...createForm, accountNo: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Account Type</label>
                                <select
                                    value={createForm.accountType}
                                    onChange={(e) => setCreateForm({ ...createForm, accountType: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                >
                                    <option value="SAVINGS">SAVINGS</option>
                                    <option value="CURRENT">CURRENT</option>
                                    <option value="FIXED">FIXED</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Opening Balance (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 10000"
                                    min={0}
                                    value={createForm.balance || ""}
                                    onChange={(e) => setCreateForm({ ...createForm, balance: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 py-2 rounded-lg text-sm border"
                                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !selectedCustomer || !createForm.accountNo}
                                className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                {creating ? "Creating..." : "Create Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Account Modal */}
            {editingAccount && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Edit Account</h3>
                        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                            {editingAccount.customerName} · {editingAccount.accountNo}
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Account Type</label>
                                <select
                                    value={editForm.accountType}
                                    onChange={(e) => setEditForm({ ...editForm, accountType: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                >
                                    <option value="SAVINGS">SAVINGS</option>
                                    <option value="CURRENT">CURRENT</option>
                                    <option value="FIXED">FIXED</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Balance (₹)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={editForm.balance}
                                    onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setEditingAccount(null)}
                                className="flex-1 py-2 rounded-lg text-sm border"
                                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                disabled={saving}
                                className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
                                style={{ backgroundColor: "var(--primary)" }}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
