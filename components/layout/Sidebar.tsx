"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const allNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: "⊞", adminOnly: false },
    { label: "Customers", href: "/customers", icon: "◉", adminOnly: true },
    { label: "Accounts", href: "/accounts", icon: "◈", adminOnly: false },
    { label: "Transactions", href: "/transactions", icon: "↔", adminOnly: false },
    { label: "Transfer", href: "/transfer", icon: "➤", adminOnly: false },
    { label: "Beneficiaries", href: "/beneficiaries", icon: "◎", adminOnly: false },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

    return (
        <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: "var(--sidebar-bg)" }}>
            <div className="px-6 py-6 border-b border-slate-700">
                <h1 className="text-white text-xl font-bold tracking-tight">BankApp</h1>
                <p className="text-slate-400 text-xs mt-1">Banking Portal</p>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                active
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:bg-slate-700 hover:text-white"
                            }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="px-6 py-4 border-t border-slate-700 space-y-2">
                {session?.user?.name && (
                    <p className="text-slate-300 text-xs truncate">{session.user.name}</p>
                )}
                <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        isAdmin ? "bg-amber-500 text-white" : "bg-slate-600 text-slate-300"
                    }`}
                >
                    {isAdmin ? "Admin" : "User"}
                </span>
                <p className="text-slate-500 text-xs">v0.1.0</p>
            </div>
        </aside>
    );
}
