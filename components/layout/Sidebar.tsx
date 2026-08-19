"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "⊞" },
    { label: "Accounts", href: "/accounts", icon: "◈" },
    { label: "Transactions", href: "/transactions", icon: "↔" },
    { label: "Beneficiaries", href: "/beneficiaries", icon: "◎" },
];

export default function Sidebar() {
    const pathname = usePathname();
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
            <div className="px-6 py-4 border-t border-slate-700">
                <p className="text-slate-500 text-xs">v0.1.0</p>
            </div>
        </aside>
    );
}
