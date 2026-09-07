"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const allNavItems = [
    { label: "Dashboard",     href: "/dashboard",     icon: "⊞", staffOnly: false, userOnly: false },
    { label: "Customers",     href: "/customers",     icon: "◉", staffOnly: true,  userOnly: false },
    { label: "Accounts",      href: "/accounts",      icon: "◈", staffOnly: false, userOnly: false },
    { label: "Transactions",  href: "/transactions",  icon: "↔", staffOnly: false, userOnly: false },
    { label: "Transfer",      href: "/transfer",      icon: "➤", staffOnly: false, userOnly: true  },
    { label: "Beneficiaries", href: "/beneficiaries", icon: "◎", staffOnly: false, userOnly: true  },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;
    const navItems = allNavItems.filter((item) => {
        if (item.staffOnly && !isStaff) return false;
        if (item.userOnly && isStaff) return false;
        return true;
    });

    const roleBadge = isAdmin
        ? { label: "Admin", className: "bg-amber-500 text-white" }
        : isManager
        ? { label: "Manager", className: "bg-emerald-600 text-white" }
        : { label: "User", className: "bg-slate-600 text-slate-300" };

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
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge.className}`}>
                    {roleBadge.label}
                </span>
                <p className="text-slate-500 text-xs">v0.1.0</p>
            </div>
        </aside>
    );
}
