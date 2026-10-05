"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAccounts } from "@/modules/accounts/api";
import { getCustomers } from "@/modules/customers/api";
import { TrendingUp, Layers, Users, Activity } from "lucide-react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;
    const router = useRouter();

    const [totalBalance, setTotalBalance] = useState<number | null>(null);
    const [accountCount, setAccountCount] = useState<number | null>(null);
    const [customerCount, setCustomerCount] = useState<number | null>(null);

    useEffect(() => {
        if (status !== "authenticated") return;
        getAccounts().then((accounts) => { setAccountCount(accounts.length); setTotalBalance(accounts.reduce((s, a) => s + a.balance, 0)); }).catch(() => {});
        if (isStaff) getCustomers().then((c) => setCustomerCount(c.length)).catch(() => {});
    }, [status, isStaff]);

    const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString());
    const firstName = session?.user?.name?.split(" ")[0] ?? "there";

    const stats = isStaff
        ? [
            { label: "Total Bank Balance", value: totalBalance === null ? "—" : `₹${totalBalance.toLocaleString()}`, icon: TrendingUp, href: "/accounts" },
            { label: "Total Accounts", value: fmt(accountCount), icon: Layers, href: "/accounts" },
            { label: "Total Customers", value: fmt(customerCount), icon: Users, href: "/customers" },
            { label: "System Status", value: "Live", icon: Activity, href: null },
        ]
        : [
            { label: "Total Balance", value: totalBalance === null ? "—" : `₹${totalBalance.toLocaleString()}`, icon: TrendingUp, href: "/accounts" },
            { label: "My Accounts", value: fmt(accountCount), icon: Layers, href: "/accounts" },
            { label: "Status", value: "Active", icon: Activity, href: null },
        ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div>
                <h1 className="page-title">
                    {isStaff ? "Overview" : `Good day, ${firstName}`}
                </h1>
                <p className="page-sub">
                    {isStaff ? "Bank-wide activity at a glance" : "Your financial summary"}
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: "16px" }}>
                {stats.map((s) => {
                    const Icon = s.icon;
                    const clickable = !!s.href;
                    return (
                        <div
                            key={s.label}
                            className={`stat-card${clickable ? " card-hover" : ""}`}
                            onClick={() => s.href && router.push(s.href)}
                            style={{ cursor: clickable ? "pointer" : "default" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
                                <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={15} color="var(--muted)" strokeWidth={2} />
                                </div>
                            </div>
                            <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{s.value}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
