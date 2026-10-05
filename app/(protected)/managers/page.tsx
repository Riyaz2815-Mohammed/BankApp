"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getManagers, createManager } from "@/modules/customers/api";
import { ManagerResponse, CreateManagerRequest, CreateManagerResponse } from "@/modules/customers/types";

const emptyManagerForm: CreateManagerRequest = { username: "", email: "", firstName: "", lastName: "", temporaryPassword: "" };

const PAGE_SIZE = 5;

export default function ManagersPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const router = useRouter();
    const [managers, setManagers] = useState<ManagerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [managerForm, setManagerForm] = useState<CreateManagerRequest>(emptyManagerForm);
    const [creatingManager, setCreatingManager] = useState(false);
    const [managerResult, setManagerResult] = useState<CreateManagerResponse | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);

    const openManagerModal = () => { setManagerForm(emptyManagerForm); setManagerResult(null); setCreateError(null); setShowManagerModal(true); };
    const handleCreateManager = () => {
        setCreatingManager(true);
        setCreateError(null);
        createManager(managerForm).then((res) => {
            setManagerResult(res);
            setManagers((prev) => [...prev, { id: res.keycloakId, username: res.username, email: res.email, firstName: res.firstName, lastName: res.lastName }]);
        }).catch((err) => {
            const msg = err?.response?.data?.message ?? err?.response?.data ?? "Failed to create manager.";
            setCreateError(typeof msg === "string" ? msg : "Failed to create manager.");
        }).finally(() => setCreatingManager(false));
    };

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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Managers</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>All bank managers with BankManager role</p>
                </div>
                <button onClick={openManagerModal} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: "#7C3AED" }}>+ Create Manager</button>
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

            {showManagerModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        {managerResult ? (
                            <>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Manager Created</h3>
                                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>{managerResult.message}</p>
                                <div className="rounded-lg p-4 space-y-2 text-sm mb-4" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                                    <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Name</span><span style={{ color: "var(--text)" }}>{managerResult.firstName} {managerResult.lastName}</span></div>
                                    <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Email</span><span style={{ color: "var(--text)" }}>{managerResult.email}</span></div>
                                    <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Username</span><span className="font-mono text-xs" style={{ color: "var(--text)" }}>{managerForm.username}</span></div>
                                    <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Temp Password</span><span className="font-mono text-xs" style={{ color: "var(--text)" }}>{managerForm.temporaryPassword}</span></div>
                                </div>
                                <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Share these credentials with the manager. They will log in via Keycloak.</p>
                                <button onClick={() => { setShowManagerModal(false); setManagerResult(null); }} className="w-full py-2 rounded-lg text-sm text-white font-semibold" style={{ backgroundColor: "#7C3AED" }}>Done</button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Create Bank Manager</h3>
                                <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Creates a Keycloak account with the BankManager role. No customer record is created.</p>
                                {createError && <p className="text-xs mb-3" style={{ color: "var(--danger)" }}>{createError}</p>}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="First Name" value={managerForm.firstName} onChange={(e) => setManagerForm({ ...managerForm, firstName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-purple-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                        <input placeholder="Last Name" value={managerForm.lastName} onChange={(e) => setManagerForm({ ...managerForm, lastName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-purple-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    </div>
                                    <input placeholder="Email" value={managerForm.email} onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-purple-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    <input placeholder="Username (for login)" value={managerForm.username} onChange={(e) => setManagerForm({ ...managerForm, username: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-purple-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    <input placeholder="Temporary Password" value={managerForm.temporaryPassword} onChange={(e) => setManagerForm({ ...managerForm, temporaryPassword: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-purple-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowManagerModal(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                                    <button onClick={handleCreateManager} disabled={creatingManager || !managerForm.firstName || !managerForm.email || !managerForm.username || !managerForm.temporaryPassword} className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50" style={{ backgroundColor: "#7C3AED" }}>{creatingManager ? "Creating..." : "Create Manager"}</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
