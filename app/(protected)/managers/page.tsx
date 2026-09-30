"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getManagers } from "@/modules/customers/api";
import { ManagerResponse } from "@/modules/customers/types";

const PAGE_SIZE = 5;

export default function ManagersPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const router = useRouter();
    const [managers, setManagers] = useState<ManagerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (status === "loading") return;
        if (!isAdmin) { router.replace("/dashboard"); return; }
        getManagers().then(setManagers).catch(() => setError("Failed to load managers")).finally(() => setLoading(false));
    }, [status, isAdmin, router]);

    if (status === "loading" || !isAdmin) return null;

    const totalPages = Math.max(1, Math.ceil(managers.length / PAGE_SIZE));
    const visible = managers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Managers</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>All bank managers with BankManager role</p>
            </div>

            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

            {!loading && managers.length > 0 && (
                <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            <table className="w-full text-sm" style={{ backgroundColor: "var(--surface)", borderCollapse: "separate", borderSpacing: 0 }}>
                                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                    <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#F8FAFC" }}>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Name</th>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Username</th>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Email</th>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((m) => (
                                        <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                            <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{m.firstName} {m.lastName}</td>
                                            <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{m.username}</td>
                                            <td className="px-5 py-3" style={{ color: "var(--muted)" }}>{m.email}</td>
                                            <td className="px-5 py-3">
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">BankManager</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>Page {page} of {totalPages} · {managers.length} records</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-3 py-1 rounded-lg text-xs font-medium border disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Prev</button>
                            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="px-3 py-1 rounded-lg text-xs font-medium border disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Next</button>
                        </div>
                    </div>
                </div>
            )}
            {!loading && managers.length === 0 && !error && <p className="text-sm" style={{ color: "var(--muted)" }}>No managers found.</p>}
        </div>
    );
}
