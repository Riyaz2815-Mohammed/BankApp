"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getAccounts, lookupAccount } from "@/modules/accounts/api";
import { getTransactions } from "@/modules/transactions/api";
import { Account } from "@/modules/accounts/types";
import { Transaction } from "@/modules/transactions/types";
import TransactionList from "@/modules/transactions/components/TransactionList";

const PAGE_SIZE = 20;

const DATE_PRESETS = [
    { label: "All", value: "all" },
    { label: "Last 5 days", value: "5" },
    { label: "Last 10 days", value: "10" },
    { label: "Last 30 days", value: "30" },
];

function filterByDate(transactions: Transaction[], days: string) {
    if (days === "all") return transactions;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(days));
    return transactions.filter((tx) => new Date(tx.timestamp) >= cutoff);
}

export default function TransactionsPage() {
    const { data: session, status } = useSession();
    const isStaff = (session?.roles?.includes("admin") || session?.roles?.includes("BankManager")) ?? false;

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingTx, setLoadingTx] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState("all");

    const [accountNoInput, setAccountNoInput] = useState("");
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [lookingUp, setLookingUp] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;
        if (isStaff) { setLoadingAccounts(false); return; }
        getAccounts().then(setAccounts).catch(() => setError("Failed to load accounts")).finally(() => setLoadingAccounts(false));
    }, [status, isStaff]);

    const fetchTransactions = useCallback((account: Account, p: number) => {
        setLoadingTx(true);
        setError(null);
        getTransactions(account.id, p, PAGE_SIZE)
            .then((data) => { setTransactions(data.content); setTotalPages(data.totalPages); setTotal(data.totalElements); setPage(data.number); })
            .catch(() => setError("Failed to load transactions"))
            .finally(() => setLoadingTx(false));
    }, []);

    const selectAccount = useCallback((account: Account) => {
        setSelectedAccount(account);
        setTransactions([]);
        setPage(0);
        setDateFilter("all");
        fetchTransactions(account, 0);
    }, [fetchTransactions]);

    const handleLookup = async () => {
        const no = accountNoInput.trim();
        if (!no) return;
        setLookingUp(true);
        setLookupError(null);
        try {
            const acc = await lookupAccount(no);
            selectAccount(acc);
        } catch {
            setLookupError("Account not found. Check the number and try again.");
        } finally {
            setLookingUp(false);
        }
    };

    const filtered = filterByDate(transactions, dateFilter);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Transactions</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    {isStaff ? "Enter an account number to look up transactions" : "Select an account to view transactions"}
                </p>
            </div>

            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

            {isStaff ? (
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Account number (e.g. 191360926865)"
                            value={accountNoInput}
                            onChange={(e) => setAccountNoInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm border outline-none"
                            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--text)" }}
                        />
                        <button
                            onClick={handleLookup}
                            disabled={lookingUp || !accountNoInput.trim()}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "var(--primary)" }}
                        >
                            {lookingUp ? "Searching…" : "Search"}
                        </button>
                    </div>
                    {lookupError && <p className="text-xs" style={{ color: "var(--danger)" }}>{lookupError}</p>}
                    {selectedAccount && (
                        <div className="flex gap-4 items-center px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--light)", border: "1px solid var(--border)" }}>
                            <span className="font-mono font-medium" style={{ color: "var(--text)" }}>{selectedAccount.accountNo}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}>{selectedAccount.accountType}</span>
                            {selectedAccount.customerName && <span style={{ color: "var(--muted)" }}>{selectedAccount.customerName}</span>}
                            {selectedAccount.balance != null && <span className="ml-auto font-semibold" style={{ color: "var(--text)" }}>₹{selectedAccount.balance.toLocaleString()}</span>}
                        </div>
                    )}
                </div>
            ) : (
                loadingAccounts ? (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>Loading accounts…</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {accounts.map((acc) => {
                            const active = selectedAccount?.id === acc.id;
                            return (
                                <button key={acc.id} onClick={() => selectAccount(acc)} className="text-left p-4 rounded-xl border transition-all" style={{ backgroundColor: active ? "var(--primary)" : "var(--surface)", borderColor: active ? "var(--primary)" : "var(--border)", color: active ? "#fff" : "var(--text)" }}>
                                    <p className="text-xs font-medium mb-1" style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--muted)" }}>{acc.accountType} · {acc.accountNo}</p>
                                    <p className="text-lg font-bold">₹{acc.balance.toLocaleString()}</p>
                                </button>
                            );
                        })}
                    </div>
                )
            )}

            {selectedAccount && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                            {selectedAccount.accountType} · {selectedAccount.accountNo}
                        </h3>
                        <div className="flex gap-2">
                            {DATE_PRESETS.map((p) => (
                                <button key={p.value} onClick={() => setDateFilter(p.value)}
                                    className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                                    style={{ backgroundColor: dateFilter === p.value ? "var(--primary)" : "var(--surface)", borderColor: dateFilter === p.value ? "var(--primary)" : "var(--border)", color: dateFilter === p.value ? "#fff" : "var(--muted)" }}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {loadingTx ? (
                        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
                    ) : (
                        <TransactionList
                            transactions={filtered}
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            onPrev={() => fetchTransactions(selectedAccount, page - 1)}
                            onNext={() => fetchTransactions(selectedAccount, page + 1)}
                            isDateFiltered={dateFilter !== "all"}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
