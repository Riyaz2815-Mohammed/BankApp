"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "@/modules/accounts/api";
import { getCustomers } from "@/modules/customers/api";
import { Account } from "@/modules/accounts/types";
import { Customer } from "@/modules/customers/types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { CreditCard, ChevronRight } from "lucide-react";

export default function AccountsPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;
    const router = useRouter();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [createForm, setCreateForm] = useState({ accountType: "SAVINGS", balance: 0 });
    const [creating, setCreating] = useState(false);

    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [editForm, setEditForm] = useState({ accountType: "SAVINGS", balance: 0 });
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        if (status !== "authenticated") return;
        getAccounts().then(setAccounts).catch(() => setError("Failed to load accounts")).finally(() => setLoading(false));
    }, [status]);

    const openCreate = () => {
        setCreateForm({ accountType: "SAVINGS", balance: 0 });
        setSelectedCustomer(null); setCustomerSearch(""); setShowDropdown(false);
        if (customers.length === 0) getCustomers().then(setCustomers).catch(() => {});
        setShowCreate(true);
    };

    const handleCreate = () => {
        if (!selectedCustomer) return;
        setCreating(true);
        createAccount({ ...createForm, customerId: selectedCustomer.id })
            .then((saved) => { setAccounts((p) => [...p, saved]); setShowCreate(false); })
            .catch(() => setError("Failed to create account"))
            .finally(() => setCreating(false));
    };

    const handleEdit = () => {
        if (!editingAccount) return;
        setSaving(true);
        updateAccount(editingAccount.id, { accountType: editForm.accountType, balance: editForm.balance, customerId: editingAccount.customerId })
            .then((saved) => { setAccounts((p) => p.map((a) => a.id === saved.id ? saved : a)); setEditingAccount(null); })
            .catch(() => setError("Failed to update account"))
            .finally(() => setSaving(false));
    };

    const confirmDeleteAction = () => {
        if (!confirmDelete) return;
        deleteAccount(confirmDelete).then(() => setAccounts((p) => p.filter((a) => a.id !== confirmDelete))).catch(() => setError("Failed to delete")).finally(() => setConfirmDelete(null));
    };

    const filteredCustomers = customers.filter((c) => { const q = customerSearch.toLowerCase(); return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q); });

    const typeColor: Record<string, string> = { SAVINGS: "#1a7a4a", CURRENT: "#1d4ed8", FIXED: "#b45309" };
    const typeBg: Record<string, string> = { SAVINGS: "#f0faf4", CURRENT: "#eff6ff", FIXED: "#fefce8" };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{isStaff ? "All Accounts" : "My Accounts"}</h1>
                    <p className="page-sub">{isStaff ? `${accounts.length} accounts registered` : "Your bank accounts"}</p>
                </div>
                {isStaff && (
                    <button className="btn-primary" onClick={openCreate}>+ New Account</button>
                )}
            </div>

            {error && <p style={{ color: "var(--danger)", marginBottom: "16px", fontSize: "13px" }}>{error}</p>}
            {loading && <p style={{ color: "var(--muted)", fontSize: "13px" }}>Loading accounts…</p>}
            {!loading && accounts.length === 0 && !error && <p style={{ color: "var(--muted)", fontSize: "13px" }}>No accounts found.</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
                {accounts.map((acc) => (
                    <div
                        key={acc.id}
                        className="card card-hover"
                        onClick={() => isStaff && router.push(`/accounts/${acc.id}`)}
                        style={{ padding: "20px", cursor: isStaff ? "pointer" : "default" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px", color: typeColor[acc.accountType] ?? "var(--text)", background: typeBg[acc.accountType] ?? "var(--light)", letterSpacing: "0.04em" }}>
                                {acc.accountType}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <CreditCard size={14} color="var(--muted)" />
                                {isStaff && <ChevronRight size={14} color="var(--muted)" />}
                            </div>
                        </div>

                        <p style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", lineHeight: 1, marginBottom: "6px" }}>
                            ₹{acc.balance.toLocaleString()}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: isStaff ? "14px" : "0" }}>
                            {acc.accountNo}
                        </p>

                        {isStaff && acc.customerName && (
                            <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                                {acc.customerName}
                            </p>
                        )}

                        {isAdmin && (
                            <div style={{ display: "flex", gap: "6px", marginTop: "12px" }} onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => { setEditingAccount(acc); setEditForm({ accountType: acc.accountType, balance: acc.balance }); }}
                                    className="btn-ghost"
                                    style={{ flex: 1, padding: "6px 0", fontSize: "12px" }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(acc.id)}
                                    style={{ flex: 1, padding: "6px 0", fontSize: "12px", background: "transparent", border: "1px solid #FECACA", borderRadius: "8px", color: "var(--danger)", cursor: "pointer" }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {confirmDelete && <ConfirmDialog title="Delete Account" message="This will permanently remove the account and all its transactions." onConfirm={confirmDeleteAction} onCancel={() => setConfirmDelete(null)} />}

            {showCreate && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "28px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "20px" }}>New Account</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "6px" }}>Customer</label>
                                {selectedCustomer ? (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}>
                                        <span>{selectedCustomer.firstName} {selectedCustomer.lastName} <span style={{ color: "var(--muted)", fontSize: "12px" }}>{selectedCustomer.email}</span></span>
                                        <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }} style={{ color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>×</button>
                                    </div>
                                ) : (
                                    <div style={{ position: "relative" }}>
                                        <input className="input" placeholder="Search by name or email…" value={customerSearch} onChange={(e) => { setCustomerSearch(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} />
                                        {showDropdown && filteredCustomers.length > 0 && (
                                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
                                                {filteredCustomers.map((c) => (
                                                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowDropdown(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: "13px", background: "none", border: "none", cursor: "pointer", color: "var(--text)" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--light)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                                                        <span style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</span> <span style={{ color: "var(--muted)", fontSize: "12px" }}>{c.email}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "6px" }}>Account Type</label>
                                <select className="input" value={createForm.accountType} onChange={(e) => setCreateForm({ ...createForm, accountType: e.target.value })}>
                                    <option value="SAVINGS">SAVINGS</option><option value="CURRENT">CURRENT</option><option value="FIXED">FIXED</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "6px" }}>Opening Balance (₹)</label>
                                <input className="input" type="number" placeholder="e.g. 10000" min={0} value={createForm.balance || ""} onChange={(e) => setCreateForm({ ...createForm, balance: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={creating || !selectedCustomer}>{creating ? "Creating…" : "Create Account"}</button>
                        </div>
                    </div>
                </div>
            )}

            {editingAccount && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
                    <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "28px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Edit Account</h3>
                        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>{editingAccount.customerName} · {editingAccount.accountNo}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "6px" }}>Account Type</label>
                                <select className="input" value={editForm.accountType} onChange={(e) => setEditForm({ ...editForm, accountType: e.target.value })}>
                                    <option value="SAVINGS">SAVINGS</option><option value="CURRENT">CURRENT</option><option value="FIXED">FIXED</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "6px" }}>Balance (₹)</label>
                                <input className="input" type="number" min={0} value={editForm.balance} onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditingAccount(null)}>Cancel</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
