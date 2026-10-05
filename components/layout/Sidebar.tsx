"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Users, UserCog, CreditCard, ArrowLeftRight, Banknote, Send, Star, User } from "lucide-react";

const allNavItems = [
    { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard, staffOnly: false, userOnly: false, adminOnly: false },
    { label: "Customers",     href: "/customers",     icon: Users,           staffOnly: true,  userOnly: false, adminOnly: false },
    { label: "Managers",      href: "/managers",      icon: UserCog,         staffOnly: false, userOnly: false, adminOnly: true  },
    { label: "Accounts",      href: "/accounts",      icon: CreditCard,      staffOnly: false, userOnly: false, adminOnly: false },
    { label: "Transactions",  href: "/transactions",  icon: ArrowLeftRight,  staffOnly: false, userOnly: false, adminOnly: false },
    { label: "Payments",      href: "/payments",      icon: Banknote,        staffOnly: false, userOnly: false, adminOnly: false },
    { label: "Transfer",      href: "/transfer",      icon: Send,            staffOnly: false, userOnly: true,  adminOnly: false },
    { label: "Beneficiaries", href: "/beneficiaries", icon: Star,            staffOnly: false, userOnly: true,  adminOnly: false },
    { label: "Profile",       href: "/profile",       icon: User,            staffOnly: false, userOnly: true,  adminOnly: false },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;
    const navItems = allNavItems.filter((item) => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.staffOnly && !isStaff) return false;
        if (item.userOnly && isStaff) return false;
        return true;
    });

    const roleLabel = isAdmin ? "Admin" : isManager ? "Manager" : "Customer";

    return (
        <aside style={{ width: "232px", minHeight: "100vh", backgroundColor: "var(--sidebar-bg)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            {/* Brand */}
            <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1A1A1A" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "30px", height: "30px", background: "#fff", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C0C0C" }}>B</span>
                    </div>
                    <div>
                        <p style={{ color: "#fff", fontSize: "14px", fontWeight: 700, lineHeight: 1 }}>BankApp</p>
                        <p style={{ color: "#444", fontSize: "11px", marginTop: "3px" }}>Portal</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "12px 10px" }}>
                {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "9px 12px",
                                borderRadius: "8px",
                                marginBottom: "2px",
                                fontSize: "13px",
                                fontWeight: active ? 600 : 400,
                                color: active ? "#fff" : "var(--sidebar-text)",
                                backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
                                textDecoration: "none",
                                transition: "background 0.1s, color 0.1s",
                            }}
                            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "#161616"; e.currentTarget.style.color = "#ccc"; } }}
                            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--sidebar-text)"; } }}
                        >
                            <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: "14px 20px 20px", borderTop: "1px solid #1A1A1A" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#888" }}>
                            {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </span>
                    </div>
                    <div style={{ overflow: "hidden", flex: 1 }}>
                        <p style={{ color: "#ccc", fontSize: "12px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {session?.user?.name ?? "User"}
                        </p>
                        <p style={{ color: "#555", fontSize: "11px", marginTop: "1px" }}>{roleLabel}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
