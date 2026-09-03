"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAccounts, getMyAccounts } from "@/modules/accounts/api";
import { getCustomers } from "@/modules/customers/api";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const [totalBalance, setTotalBalance] = useState<number | null>(null);
    const [accountCount, setAccountCount] = useState<number | null>(null);
    const [customerCount, setCustomerCount] = useState<number | null>(null);

    useEffect(() => {
        if (status !== "authenticated") return;
        const loadAccounts = isAdmin ? getAccounts() : getMyAccounts();
        loadAccounts
            .then((accounts) => {
                setAccountCount(accounts.length);
                setTotalBalance(accounts.reduce((sum, a) => sum + a.balance, 0));
            })
            .catch(() => {});
        if (isAdmin) {
            getCustomers()
                .then((customers) => setCustomerCount(customers.length))
                .catch(() => {});
        }
    }, [status, isAdmin]);

    const fmt = (n: number | null) => (n === null ? "—" : n.toLocaleString());

    const adminStats = [
        { label: "Total Balance", value: totalBalance === null ? "—" : `₹${totalBalance.toLocaleString()}`, color: "var(--primary)" },
        { label: "Accounts", value: fmt(accountCount), color: "var(--success)" },
        { label: "Customers", value: fmt(customerCount), color: "#F59E0B" },
        { label: "Status", value: "Active", color: "#8B5CF6" },
    ];

    const userStats = [
        { label: "My Balance", value: totalBalance === null ? "—" : `₹${totalBalance.toLocaleString()}`, color: "var(--primary)" },
        { label: "My Accounts", value: fmt(accountCount), color: "var(--success)" },
        { label: "Status", value: "Active", color: "#8B5CF6" },
    ];

    const stats = isAdmin ? adminStats : userStats;
    const firstName = session?.user?.name?.split(" ")[0] ?? "there";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Dashboard</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {isAdmin ? "Overview of all banking activity" : `Welcome back, ${firstName}`}
                </p>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl p-5 shadow-sm"
                        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>{stat.label}</p>
                        <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
