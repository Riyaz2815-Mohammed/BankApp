"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { getBeneficiaries, createBeneficiary, deleteBeneficiary } from "@/modules/beneficiaries/api";
import { Beneficiary, BeneficiaryRequest } from "@/modules/beneficiaries/types";
import BeneficiaryList from "@/modules/beneficiaries/components/BeneficiaryList";

const emptyForm: BeneficiaryRequest = { accountId: "", nickname: "" };

export default function BeneficiariesPage() {
    const { data: session } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [customerId, setCustomerId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<BeneficiaryRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const fetchBeneficiaries = () => {
        if (!customerId.trim()) return;
        setLoading(true);
        setError(null);
        getBeneficiaries(customerId)
            .then(setBeneficiaries)
            .catch(() => setError("Failed to load beneficiaries"))
            .finally(() => setLoading(false));
    };
    const handleCreate = () => {
        if (!customerId.trim()) return;
        setSaving(true);
        createBeneficiary(customerId, form)
            .then((b) => {
                setBeneficiaries((prev) => [...prev, b]);
                setShowModal(false);
                setForm(emptyForm);
            })
            .catch(() => setError("Failed to add beneficiary"))
            .finally(() => setSaving(false));
    };
    const handleDelete = (beneficiaryId: string) => {
        deleteBeneficiary(customerId, beneficiaryId)
            .then(() => setBeneficiaries((prev) => prev.filter((b) => b.id !== beneficiaryId)))
            .catch(() => setError("Failed to remove beneficiary"));
    };
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Beneficiaries</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Manage saved beneficiaries</p>
            </div>
            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Customer ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 w-80"
                    style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--surface)" }}
                />
                <button onClick={fetchBeneficiaries} className="px-5 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: "var(--primary)" }}>Load</button>
                {customerId.trim() && (
                    <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="px-5 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>+ Add Beneficiary</button>
                )}
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            <BeneficiaryList beneficiaries={beneficiaries} onDelete={isAdmin ? handleDelete : undefined} />
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-sm shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>Add Beneficiary</h3>
                        <div className="space-y-3">
                            <input placeholder="Account ID" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="Nickname" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                            <button onClick={handleCreate} disabled={saving} className="flex-1 py-2 rounded-lg text-sm text-white font-semibold" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Saving..." : "Add"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
