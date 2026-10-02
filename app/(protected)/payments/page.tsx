"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getPayments } from "@/modules/payments/api";
import { PaymentResponse } from "@/modules/payments/types";

const PAGE_SIZE = 10;

function formatDateTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function PaymentsPage() {
    const { data: session, status } = useSession();
    const isStaff = (session?.roles?.includes("admin") || session?.roles?.includes("BankManager")) ?? false;
    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    const fetchPage = useCallback((p: number) => {
        setLoading(true);
        setError(null);
        getPayments(p, PAGE_SIZE)
            .then((data) => {
                setPayments(data.content);
                setTotalPages(data.totalPages);
                setTotal(data.totalElements);
                setPage(data.number);
            })
            .catch(() => setError("Failed to load payments"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (status !== "authenticated") return;
        fetchPage(0);
    }, [status, fetchPage]);

    const statusBadge = (s: PaymentResponse["status"]) => {
        if (s === "COMPLETED") return "bg-green-50 text-green-700";
        if (s === "FAILED") return "bg-red-50 text-red-600";
        return "bg-yellow-50 text-yellow-700";
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Payments</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {isStaff ? "All transfer payments initiated by users" : "Your payment history"}
                </p>
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            {!loading && payments.length === 0 && !error && <p className="text-sm" style={{ color: "var(--muted)" }}>No payments found.</p>}
            {!loading && payments.length > 0 && (
                <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
                        <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                            <table className="w-full text-sm" style={{ backgroundColor: "var(--surface)", borderCollapse: "separate", borderSpacing: 0 }}>
                                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                    <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#F8FAFC" }}>
                                        {isStaff && <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Initiated By</th>}
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>From</th>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>To</th>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Amount</th>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Status</th>
                                        <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.paymentId} style={{ borderBottom: "1px solid var(--border)" }}>
                                            {isStaff && <td className="px-5 py-3 font-medium" style={{ color: "var(--text)" }}>{p.initiatedByName}</td>}
                                            <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--muted)" }}>{p.fromAccountNo}</td>
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-xs" style={{ color: "var(--text)" }}>{p.toAccountName}</p>
                                                <p className="font-mono text-xs" style={{ color: "var(--muted)" }}>{p.toAccountNo}</p>
                                            </td>
                                            <td className="px-5 py-3 font-medium" style={{ color: "var(--danger)" }}>-₹{p.amount.toLocaleString()}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>{p.status}</span>
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted)" }}>{formatDateTime(p.initiatedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs" style={{ color: "var(--muted)" }}>Page {page + 1} of {Math.max(1, totalPages)} · {total} records</span>
                        <div className="flex gap-2">
                            <button onClick={() => fetchPage(page - 1)} disabled={page === 0} className="px-3 py-1 rounded-lg text-xs font-medium border disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Prev</button>
                            <button onClick={() => fetchPage(page + 1)} disabled={page >= totalPages - 1} className="px-3 py-1 rounded-lg text-xs font-medium border disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Next</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
