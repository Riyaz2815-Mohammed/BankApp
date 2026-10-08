"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { getCustomer } from "@/modules/customers/api";
import { getAccounts } from "@/modules/accounts/api";
import { Customer } from "@/modules/customers/types";
import { Account } from "@/modules/accounts/types";
import { CreditCard, ChevronRight } from "lucide-react";

export default function CustomerDetailPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status !== "authenticated" || !isStaff) return;
        Promise.all([getCustomer(id), getAccounts()])
            .then(([cust, accs]) => { setCustomer(cust); setAccounts(accs.filter((a) => a.customerId === id)); })
            .catch(() => setError("Failed to load customer details"))
            .finally(() => setLoading(false));
    }, [status, isStaff, id]);

    if (status === "loading" || loading) return <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>;
    if (!isStaff) { router.replace("/dashboard"); return null; }
    if (error || !customer) return <p className="text-sm" style={{ color: "var(--danger)" }}>{error ?? "Customer not found."}</p>;

    const typeColor: Record<string, string> = { SAVINGS: "#1a7a4a", CURRENT: "#1d4ed8", FIXED: "#b45309" };
    const typeBg: Record<string, string> = { SAVINGS: "#f0faf4", CURRENT: "#eff6ff", FIXED: "#fefce8" };

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="text-sm px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>← Back</button>
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{customer.firstName} {customer.lastName}</h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>Customer details &amp; accounts</p>
                </div>
            </div>

            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>CUSTOMER</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Name</p><p className="font-semibold" style={{ color: "var(--text)" }}>{customer.firstName} {customer.lastName}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Email</p><p style={{ color: "var(--text)" }}>{customer.email}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Phone</p><p style={{ color: "var(--text)" }}>{customer.phoneNumber}</p></div>
                    <div><p className="text-xs mb-1" style={{ color: "var(--muted)" }}>PAN</p><p className="font-mono text-xs" style={{ color: "var(--text)" }}>{customer.pan}</p></div>
                </div>
            </div>

            <div>
                <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>Accounts
                    {accounts.length > 0 && <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}>{accounts.length}</span>}
                </h3>
                {accounts.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>No accounts for this customer.</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
                        {accounts.map((acc) => (
                            <div key={acc.id} className="card card-hover" onClick={() => router.push(`/accounts/${acc.id}`)} style={{ padding: "20px", cursor: "pointer" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px", color: typeColor[acc.accountType] ?? "var(--text)", background: typeBg[acc.accountType] ?? "var(--light)", letterSpacing: "0.04em" }}>{acc.accountType}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><CreditCard size={14} color="var(--muted)" /><ChevronRight size={14} color="var(--muted)" /></div>
                                </div>
                                <p style={{ fontSize: "24px", fontWeight: 800, color: "var(--text)", lineHeight: 1, marginBottom: "6px" }}>₹{acc.balance.toLocaleString()}</p>
                                <p style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{acc.accountNo}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
