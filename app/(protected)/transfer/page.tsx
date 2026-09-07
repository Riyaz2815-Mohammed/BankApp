"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getMyAccounts } from "@/modules/accounts/api";
import { lookupAccount } from "@/modules/beneficiaries/api";
import { transfer } from "@/modules/transactions/api";
import { Account } from "@/modules/accounts/types";
import { AccountLookup } from "@/modules/beneficiaries/types";
import { TransferResponse } from "@/modules/transactions/types";

const BANK_IFSC = "BNKX0001234";

type Step = "lookup" | "details" | "confirm" | "success";

export default function TransferPage() {
    const { status } = useSession();

    const [step, setStep] = useState<Step>("lookup");
    const [myAccounts, setMyAccounts] = useState<Account[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Step 1 — lookup
    const [recipientAccountNo, setRecipientAccountNo] = useState("");
    const [searching, setSearching] = useState(false);
    const [recipient, setRecipient] = useState<AccountLookup | null>(null);

    // Step 2 — details
    const [fromAccountId, setFromAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    // Success
    const [result, setResult] = useState<TransferResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;
        getMyAccounts().then(setMyAccounts).catch(() => {});
    }, [status]);

    const selectedAccount = myAccounts.find((a) => a.id === fromAccountId) ?? null;

    const handleLookup = () => {
        const trimmed = recipientAccountNo.trim().toUpperCase();
        if (!trimmed) return;
        setSearching(true);
        setError(null);
        lookupAccount(trimmed)
            .then((found) => {
                setRecipient(found);
                setStep("details");
            })
            .catch(() => setError("No account found with that account number."))
            .finally(() => setSearching(false));
    };

    const handleConfirm = () => {
        if (!recipient || !fromAccountId || !amount) return;
        setSubmitting(true);
        setError(null);
        transfer({
            fromAccountId,
            recipientAccountNo: recipient.accountNo,
            amount: Number(amount),
            note: note.trim() || undefined,
        })
            .then((res) => {
                setResult(res);
                setStep("success");
            })
            .catch((err) => {
                const msg = err?.response?.data?.message ?? err?.response?.data ?? "Transfer failed. Please try again.";
                setError(typeof msg === "string" ? msg : "Transfer failed. Please try again.");
            })
            .finally(() => setSubmitting(false));
    };

    const reset = () => {
        setStep("lookup");
        setRecipientAccountNo("");
        setRecipient(null);
        setFromAccountId("");
        setAmount("");
        setNote("");
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Transfer Money</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Send money to any account in this bank</p>
            </div>

            {/* Step indicator */}
            {step !== "success" && (
                <div className="flex items-center gap-2">
                    {(["lookup", "details", "confirm"] as Step[]).map((s, i) => {
                        const steps: Step[] = ["lookup", "details", "confirm"];
                        const currentIndex = steps.indexOf(step);
                        const done = i < currentIndex;
                        const active = s === step;
                        return (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold`}
                                    style={{
                                        backgroundColor: done ? "var(--success)" : active ? "var(--primary)" : "var(--border)",
                                        color: done || active ? "#fff" : "var(--muted)",
                                    }}
                                >
                                    {done ? "✓" : i + 1}
                                </div>
                                <span className="text-xs font-medium capitalize" style={{ color: active ? "var(--text)" : "var(--muted)" }}>
                                    {s === "lookup" ? "Recipient" : s === "details" ? "Amount" : "Confirm"}
                                </span>
                                {i < 2 && <div className="w-8 h-px" style={{ backgroundColor: "var(--border)" }} />}
                            </div>
                        );
                    })}
                </div>
            )}

            {error && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", color: "var(--danger)", border: "1px solid #FECACA" }}>
                    {error}
                </div>
            )}

            {/* ── Step 1: Lookup ── */}
            {step === "lookup" && (
                <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                    <h3 className="font-semibold" style={{ color: "var(--text)" }}>Enter recipient details</h3>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Account Number</label>
                        <input
                            placeholder="e.g. SB002001"
                            value={recipientAccountNo}
                            onChange={(e) => { setRecipientAccountNo(e.target.value.toUpperCase()); setError(null); }}
                            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                            className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>IFSC Code</label>
                        <input
                            value={BANK_IFSC}
                            readOnly
                            className="w-full px-4 py-2 rounded-lg border text-sm font-mono"
                            style={{ borderColor: "var(--border)", color: "var(--muted)", backgroundColor: "#F8FAFC" }}
                        />
                        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>All accounts are within BankApp — IFSC is the same for all.</p>
                    </div>
                    <button
                        onClick={handleLookup}
                        disabled={searching || !recipientAccountNo.trim()}
                        className="w-full py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                        style={{ backgroundColor: "var(--primary)" }}
                    >
                        {searching ? "Looking up..." : "Find Account"}
                    </button>
                </div>
            )}

            {/* ── Step 2: Amount + source account ── */}
            {step === "details" && recipient && (
                <div className="space-y-4">
                    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <p className="text-xs font-medium mb-1" style={{ color: "var(--muted)" }}>Sending to</p>
                        <p className="font-semibold" style={{ color: "var(--text)" }}>{recipient.accountHolderName}</p>
                        <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{recipient.accountType} · {recipient.accountNo} · {BANK_IFSC}</p>
                    </div>

                    <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>From Account</label>
                            <select
                                value={fromAccountId}
                                onChange={(e) => setFromAccountId(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            >
                                <option value="">Select your account</option>
                                {myAccounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.accountType} · {a.accountNo} — ₹{a.balance.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Amount (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 5000"
                                min={1}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            />
                            {selectedAccount && amount && Number(amount) > selectedAccount.balance && (
                                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                                    Insufficient balance. Available: ₹{selectedAccount.balance.toLocaleString()}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Note / Remark (optional)</label>
                            <input
                                placeholder="e.g. Rent for June"
                                maxLength={50}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setStep("lookup"); setError(null); }}
                            className="flex-1 py-2.5 rounded-lg text-sm border"
                            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                        >
                            Back
                        </button>
                        <button
                            onClick={() => { setError(null); setStep("confirm"); }}
                            disabled={!fromAccountId || !amount || Number(amount) <= 0 || (!!selectedAccount && Number(amount) > selectedAccount.balance)}
                            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                            style={{ backgroundColor: "var(--primary)" }}
                        >
                            Review Transfer
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 3: Confirm ── */}
            {step === "confirm" && recipient && selectedAccount && (
                <div className="space-y-4">
                    <div className="rounded-xl p-6 space-y-3" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>Review your transfer</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>From</span>
                                <span style={{ color: "var(--text)" }}>{selectedAccount.accountType} · {selectedAccount.accountNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>To</span>
                                <span style={{ color: "var(--text)" }}>{recipient.accountHolderName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>Account</span>
                                <span style={{ color: "var(--text)" }}>{recipient.accountNo} · {BANK_IFSC}</span>
                            </div>
                            <div className="h-px my-1" style={{ backgroundColor: "var(--border)" }} />
                            <div className="flex justify-between font-semibold text-base">
                                <span style={{ color: "var(--muted)" }}>Amount</span>
                                <span style={{ color: "var(--danger)" }}>-₹{Number(amount).toLocaleString()}</span>
                            </div>
                            {note && (
                                <div className="flex justify-between">
                                    <span style={{ color: "var(--muted)" }}>Note</span>
                                    <span style={{ color: "var(--text)" }}>{note}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {error && (
                        <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#FEF2F2", color: "var(--danger)", border: "1px solid #FECACA" }}>
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setStep("details"); setError(null); }}
                            className="flex-1 py-2.5 rounded-lg text-sm border"
                            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                            style={{ backgroundColor: "var(--primary)" }}
                        >
                            {submitting ? "Processing..." : "Confirm & Transfer"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Success ── */}
            {step === "success" && result && (
                <div className="rounded-xl p-8 text-center space-y-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-2xl" style={{ backgroundColor: "#D1FAE5" }}>
                        ✓
                    </div>
                    <div>
                        <p className="text-xl font-bold" style={{ color: "var(--success)" }}>₹{result.amount.toLocaleString()} Sent</p>
                        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>to {result.recipientName} · {result.recipientAccountNo}</p>
                    </div>
                    <div className="text-left rounded-lg p-4 space-y-2 text-sm" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                        <div className="flex justify-between">
                            <span style={{ color: "var(--muted)" }}>Reference ID</span>
                            <span className="font-mono text-xs" style={{ color: "var(--text)" }}>{result.referenceId.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: "var(--muted)" }}>Remaining Balance</span>
                            <span style={{ color: "var(--text)" }}>₹{result.remainingBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: "var(--muted)" }}>Date & Time</span>
                            <span style={{ color: "var(--text)" }}>
                                {new Date(result.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                {" · "}
                                {new Date(result.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            </span>
                        </div>
                        {result.note && (
                            <div className="flex justify-between">
                                <span style={{ color: "var(--muted)" }}>Note</span>
                                <span style={{ color: "var(--text)" }}>{result.note}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={reset}
                        className="w-full py-2.5 rounded-lg text-white text-sm font-semibold"
                        style={{ backgroundColor: "var(--primary)" }}
                    >
                        New Transfer
                    </button>
                </div>
            )}
        </div>
    );
}
