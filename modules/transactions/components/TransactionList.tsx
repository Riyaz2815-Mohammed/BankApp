import { Transaction } from "../types";

interface Props {
    transactions: Transaction[];
}

function formatDateTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        + " · "
        + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function TransactionList({ transactions }: Props) {
    if (transactions.length === 0) {
        return <p className="text-sm" style={{ color: "var(--muted)" }}>No transactions found.</p>;
    }
    return (
        <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm" style={{ backgroundColor: "var(--surface)" }}>
                <thead>
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
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tx.accountType === "CREDIT" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                                    {tx.accountType}
                                </span>
                            </td>
                            <td className="px-5 py-3 max-w-xs truncate" style={{ color: "var(--muted)" }}>
                                {tx.description || (tx.accountType === "CREDIT" ? "Credit" : "Debit")}
                            </td>
                            <td className="px-5 py-3 font-medium" style={{ color: tx.accountType === "CREDIT" ? "var(--success)" : "var(--danger)" }}>
                                {tx.accountType === "CREDIT" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                            </td>
                            <td className="px-5 py-3" style={{ color: "var(--text)" }}>₹{tx.balance.toLocaleString()}</td>
                            <td className="px-5 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>
                                {formatDateTime(tx.timestamp)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
