"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getAccounts } from "@/modules/accounts/api";
import { getTransactions } from "@/modules/transactions/api";
import { Account } from "@/modules/accounts/types";
import { Transaction } from "@/modules/transactions/types";
import TransactionList from "@/modules/transactions/components/TransactionList";

const PAGE_SIZE = 10;

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

    useEffect(() => {
        if (status !== "authenticated") return;
        getAccounts().then(setAccounts).catch(() => setError("Failed to load accounts")).finally(() => setLoadingAccounts(false));
    }, [status, isStaff]);

    const fetchTransactions = useCallback((account: Account, p: number) => {
        setLoadingTx(true);
        setError(null);
        getTransactions(account.id, p, PAGE_SIZE)
            .then((data) => {
                setTransactions(data.content);
                setTotalPages(data.totalPages);
                setTotal(data.totalElements);
                setPage(data.number);
            })
            .catch(() => setError("Failed to load transactions"))
            .finally(() => setLoadingTx(false));
    }, []);

    const selectAccount = (account: Account) => {
        setSelectedAccount(account);
        setTransactions([]);
        setPage(0);
        fetchTransactions(account, 0);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Transactions</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Select an account to view transactions</p>
            </div>

            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

            {loadingAccounts ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>Loading accounts...</p>
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
            )}

            {selectedAccount && (
                <div className="space-y-3">
                    <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Transactions — {selectedAccount.accountType} ({selectedAccount.accountNo})</h3>
                    {loadingTx ? (
                        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
                    ) : (
                        <TransactionList
                            transactions={transactions}
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            onPrev={() => fetchTransactions(selectedAccount, page - 1)}
                            onNext={() => fetchTransactions(selectedAccount, page + 1)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
