"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { getAccount } from "@/modules/accounts/api";
import { getCustomer } from "@/modules/customers/api";
import { getBeneficiaries } from "@/modules/beneficiaries/api";
import { Account } from "@/modules/accounts/types";
import { Customer } from "@/modules/customers/types";
import { Beneficiary } from "@/modules/beneficiaries/types";
import BeneficiaryList from "@/modules/beneficiaries/components/BeneficiaryList";

export default function AccountDetailPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;

    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [account, setAccount] = useState<Account | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status !== "authenticated" || !isStaff) return;
        getAccount(id)
            .then((acc) => {
                setAccount(acc);
                return Promise.all([
                    getCustomer(acc.customerId),
                    getBeneficiaries(acc.customerId),
                ]);
            })
            .then(([cust, bens]) => {
                setCustomer(cust);
                setBeneficiaries(bens);
            })
            .catch(() => setError("Failed to load account details"))
            .finally(() => setLoading(false));
    }, [status, isStaff, id]);

    if (status === "loading" || loading) {
        return <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>;
    }
    if (!isStaff) {
        router.replace("/accounts");
        return null;
    }
    if (error || !account) {
        return <p className="text-sm" style={{ color: "var(--danger)" }}>{error ?? "Account not found."}</p>;
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="text-sm px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                    ← Back
                </button>
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Account Details</h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{account.accountNo}</p>
                </div>
            </div>

            {/* Account info */}
            <div className="rounded-xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>ACCOUNT</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Account Number</p>
                        <p className="font-mono font-semibold" style={{ color: "var(--text)" }}>{account.accountNo}</p>
                    </div>
                    <div>
                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Type</p>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">{account.accountType}</span>
                    </div>
                    <div>
                        <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Balance</p>
                        <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>₹{account.balance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Account holder info */}
            {customer && (
                <div className="rounded-xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>ACCOUNT HOLDER</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Name</p>
                            <p className="font-semibold" style={{ color: "var(--text)" }}>{customer.firstName} {customer.lastName}</p>
                        </div>
                        <div>
                            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Email</p>
                            <p style={{ color: "var(--text)" }}>{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>Phone</p>
                            <p style={{ color: "var(--text)" }}>{customer.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>PAN</p>
                            <p className="font-mono text-xs" style={{ color: "var(--text)" }}>{customer.pan}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Beneficiaries */}
            <div>
                <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text)" }}>
                    Beneficiaries
                    {beneficiaries.length > 0 && (
                        <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}>
                            {beneficiaries.length}
                        </span>
                    )}
                </h3>
                <BeneficiaryList beneficiaries={beneficiaries} />
            </div>
        </div>
    );
}
