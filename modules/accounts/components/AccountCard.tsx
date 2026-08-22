import { Account } from "../types";

interface Props {
    account: Account;
}

export default function AccountCard({ account }: Props) {
    return (
        <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                    {account.accountType}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{account.accountNo}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                ₹{account.balance.toLocaleString()}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Available Balance</p>
        </div>
    );
}
