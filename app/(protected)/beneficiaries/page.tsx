"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getMyBeneficiaries, addMyBeneficiary, removeMyBeneficiary, lookupAccount } from "@/modules/beneficiaries/api";
import { Beneficiary, AccountLookup } from "@/modules/beneficiaries/types";
import BeneficiaryList from "@/modules/beneficiaries/components/BeneficiaryList";

export default function BeneficiariesPage() {
    const { status } = useSession();
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState<"search" | "confirm">("search");
    const [accountNoInput, setAccountNoInput] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [foundAccount, setFoundAccount] = useState<AccountLookup | null>(null);
    const [nickname, setNickname] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status !== "authenticated") return;
        getMyBeneficiaries()
            .then(setBeneficiaries)
            .catch(() => setError("Failed to load beneficiaries"))
            .finally(() => setLoading(false));
    }, [status]);

    const openModal = () => {
        setStep("search");
        setAccountNoInput("");
        setFoundAccount(null);
        setNickname("");
        setSearchError(null);
        setShowModal(true);
    };

    const handleSearch = () => {
        const trimmed = accountNoInput.trim();
        if (!trimmed) return;
        setSearching(true);
        setSearchError(null);
        lookupAccount(trimmed)
            .then((result) => {
                setFoundAccount(result);
                setNickname(result.accountHolderName.split(" ")[0]);
                setStep("confirm");
            })
            .catch(() => setSearchError("No account found with that account number."))
            .finally(() => setSearching(false));
    };

    const handleAdd = () => {
        if (!foundAccount || !nickname.trim()) return;
        setSaving(true);
        addMyBeneficiary({ accountId: foundAccount.id, nickname: nickname.trim() })
            .then((b) => {
                setBeneficiaries((prev) => [...prev, b]);
                setShowModal(false);
            })
            .catch(() => setSearchError("Failed to add beneficiary. They may already be in your list."))
            .finally(() => setSaving(false));
    };

    const handleRemove = (id: string) => {
        removeMyBeneficiary(id)
            .then(() => setBeneficiaries((prev) => prev.filter((b) => b.id !== id)))
            .catch(() => setError("Failed to remove beneficiary"));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Beneficiaries</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>People you can transfer money to</p>
                </div>
                <button
                    onClick={openModal}
                    className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: "var(--primary)" }}
                >
                    + Add Beneficiary
                </button>
            </div>

            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            {!loading && <BeneficiaryList beneficiaries={beneficiaries} onDelete={handleRemove} />}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: "var(--surface)" }}>

                        {step === "search" && (
                            <>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Add Beneficiary</h3>
                                <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                                    Enter the account number of the person you want to add.
                                </p>
                                <input
                                    placeholder="Account number (e.g. SB002001)"
                                    value={accountNoInput}
                                    onChange={(e) => { setAccountNoInput(e.target.value); setSearchError(null); }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                    autoFocus
                                />
                                {searchError && (
                                    <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>{searchError}</p>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2 rounded-lg text-sm border"
                                        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSearch}
                                        disabled={searching || !accountNoInput.trim()}
                                        className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
                                        style={{ backgroundColor: "var(--primary)" }}
                                    >
                                        {searching ? "Searching..." : "Search"}
                                    </button>
                                </div>
                            </>
                        )}

                        {step === "confirm" && foundAccount && (
                            <>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Confirm Beneficiary</h3>
                                <div
                                    className="rounded-lg p-4 mb-4 mt-3"
                                    style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
                                >
                                    <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{foundAccount.accountHolderName}</p>
                                    <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                                        {foundAccount.accountType} · {foundAccount.accountNo}
                                    </p>
                                </div>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>
                                    Nickname (how you'll see them)
                                </label>
                                <input
                                    placeholder="e.g. Priya"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                                    autoFocus
                                />
                                {searchError && (
                                    <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>{searchError}</p>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setStep("search")}
                                        className="flex-1 py-2 rounded-lg text-sm border"
                                        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        disabled={saving || !nickname.trim()}
                                        className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
                                        style={{ backgroundColor: "var(--primary)" }}
                                    >
                                        {saving ? "Adding..." : "Add Beneficiary"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
