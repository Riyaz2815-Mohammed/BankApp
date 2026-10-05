"use client";

import { Transaction } from "../types";

interface Props {
    transactions: Transaction[];
    page: number;
    totalPages: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    isDateFiltered?: boolean;
}

function formatDateTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function TransactionList({ transactions, page, totalPages, total, onPrev, onNext, isDateFiltered }: Props) {
    if (transactions.length === 0) return <p className="text-sm" style={{ color: "var(--muted)" }}>{isDateFiltered ? "No transactions in this date range. Try a wider filter or navigate to an earlier page." : "No transactions found."}</p>;

    return (
        <div className="space-y-3">
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
                <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                    <table className="w-full text-sm" style={{ backgroundColor: "var(--surface)", borderCollapse: "separate", borderSpacing: 0 }}>
                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#F8FAFC" }}>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Type</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Description</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Amount</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Balance</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tx.transactionType === "CREDIT" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{tx.transactionType}</span>
                                    </td>
                                    <td className="px-5 py-3 max-w-xs truncate" style={{ color: "var(--muted)" }}>{tx.description || (tx.transactionType === "CREDIT" ? "Cash Deposit" : "Cash Withdrawal")}</td>
                                    <td className="px-5 py-3 font-medium" style={{ color: tx.transactionType === "CREDIT" ? "var(--success)" : "var(--danger)" }}>{tx.transactionType === "CREDIT" ? "+" : "-"}₹{tx.amount.toLocaleString()}</td>
                                    <td className="px-5 py-3" style={{ color: "var(--text)" }}>{tx.balance != null ? `₹${tx.balance.toLocaleString()}` : "—"}</td>
                                    <td className="px-5 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>{formatDateTime(tx.timestamp)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex items-center justify-between px-1">
                <span className="text-xs" style={{ color: "var(--muted)" }}>Page {page + 1} of {Math.max(1, totalPages)} · {total} records</span>
                <div className="flex gap-2">
                    <button onClick={onPrev} disabled={page === 0} className="px-3 py-1 rounded-lg text-xs font-medium border disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Prev</button>
                    <button onClick={onNext} disabled={page >= totalPages - 1} className="px-3 py-1 rounded-lg text-xs font-medium border disabled:opacity-40" style={{ borderColor: "var(--border)", color: "var(--text)" }}>Next</button>
                </div>
            </div>
        </div>
    );
}
