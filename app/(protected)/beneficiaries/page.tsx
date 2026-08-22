"use client";

import { useEffect, useState } from "react";
import { getBeneficiaries, deleteBeneficiary } from "@/modules/beneficiaries/api";
import { Beneficiary } from "@/modules/beneficiaries/types";
import BeneficiaryList from "@/modules/beneficiaries/components/BeneficiaryList";

export default function BeneficiariesPage() {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [customerId, setCustomerId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBeneficiaries = () => {
        if (!customerId.trim()) return;
        setLoading(true);
        setError(null);
        getBeneficiaries(customerId)
            .then(setBeneficiaries)
            .catch(() => setError("Failed to load beneficiaries"))
            .finally(() => setLoading(false));
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
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Manage your saved beneficiaries</p>
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
                <button
                    onClick={fetchBeneficiaries}
                    className="px-5 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: "var(--primary)" }}
                >
                    Load
                </button>
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            <BeneficiaryList beneficiaries={beneficiaries} onDelete={handleDelete} />
        </div>
    );
}
