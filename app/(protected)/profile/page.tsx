"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/modules/profile/api";
import { ProfileResponse, ProfileUpdateRequest } from "@/modules/profile/types";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const isUser = !(session?.roles?.includes("admin") || session?.roles?.includes("BankManager"));
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<ProfileUpdateRequest>({ pan: "", firstName: "", lastName: "", email: "", phoneNumber: "" });

    useEffect(() => {
        if (status === "loading") return;
        if (!isUser) { router.replace("/dashboard"); return; }
        getProfile().then((p) => { setProfile(p); setForm({ pan: p.pan, firstName: p.firstName, lastName: p.lastName, email: p.email, phoneNumber: p.phoneNumber }); }).catch(() => setError("Failed to load profile")).finally(() => setLoading(false));
    }, [status, isUser, router]);

    if (status === "loading" || !isUser) return null;

    const handleSave = () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        updateProfile(form).then((p) => { setProfile(p); setSuccess(true); }).catch(() => setError("Failed to save profile")).finally(() => setSaving(false));
    };

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Profile</h2>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Update your personal information</p>
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
            {success && <p className="text-sm" style={{ color: "var(--success)" }}>Profile updated successfully.</p>}
            {!loading && profile && (
                <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>First Name</label>
                            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Last Name</label>
                            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Email</label>
                        <input value={form.email} readOnly className="w-full px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)", backgroundColor: "#F8FAFC" }} />
                        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Email cannot be changed here.</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>PAN</label>
                        <input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} maxLength={10} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Phone Number</label>
                        <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                    </div>
                    <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Saving..." : "Save Changes"}</button>
                </div>
            )}
        </div>
    );
}
