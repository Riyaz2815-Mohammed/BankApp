"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "@/modules/profile/api";
import { getAccounts } from "@/modules/accounts/api";
import { getBeneficiaries } from "@/modules/beneficiaries/api";
import { ProfileResponse, ProfileUpdateRequest } from "@/modules/profile/types";
import { Account } from "@/modules/accounts/types";
import { Beneficiary } from "@/modules/beneficiaries/types";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const isUser = !(session?.roles?.includes("admin") || session?.roles?.includes("BankManager"));
    const router = useRouter();

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<ProfileUpdateRequest>({ firstName: "", lastName: "", email: "", phoneNumber: "" });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!isUser) { router.replace("/dashboard"); return; }
        Promise.all([getProfile(), getAccounts(), getBeneficiaries()])
            .then(([p, accs, bens]) => { setProfile(p); setAccounts(accs); setBeneficiaries(bens); setForm({ firstName: p.firstName, lastName: p.lastName, email: p.email, phoneNumber: p.phoneNumber }); })
            .catch(() => setError("Failed to load profile"))
            .finally(() => setLoading(false));
    }, [status, isUser, router]);

    if (status === "loading" || !isUser) return null;

    const openEdit = () => { if (profile) setForm({ firstName: profile.firstName, lastName: profile.lastName, email: profile.email, phoneNumber: profile.phoneNumber }); setSaveError(null); setEditing(true); };
    const cancelEdit = () => { setSaveError(null); setEditing(false); };

    const emailWillChange = profile && form.email.trim() !== profile.email;

    const handleSave = () => {
        setSaving(true);
        setSaveError(null);
        updateProfile(form)
            .then((res) => {
                setProfile(res);
                setEditing(false);
                if (res.emailChanged) {
                    signOut({ callbackUrl: "/api/auth/signin" });
                }
            })
            .catch((err) => {
                const msg = err?.response?.data?.message ?? "Failed to save changes.";
                setSaveError(typeof msg === "string" ? msg : "Failed to save changes.");
            })
            .finally(() => setSaving(false));
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Profile</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Your account overview</p>
                </div>
                {!editing && (
                    <button onClick={openEdit} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all hover:opacity-80" style={{ borderColor: "var(--primary)", color: "var(--primary)", backgroundColor: "transparent" }}>
                        Edit Profile
                    </button>
                )}
            </div>

            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}

            {!loading && profile && !editing && (
                <>
                    <section className="rounded-xl p-5 space-y-0" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>Personal Information</h3>
                        {[
                            ["Name", `${profile.firstName} ${profile.lastName}`],
                            ["Email", profile.email],
                            ["Phone", profile.phoneNumber],
                            ["PAN", profile.pan],
                        ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                                <span className="text-sm" style={{ color: "var(--muted)" }}>{label}</span>
                                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{value}</span>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-xl p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>Accounts ({accounts.length})</h3>
                        {accounts.length === 0 ? (
                            <p className="text-sm" style={{ color: "var(--muted)" }}>No accounts.</p>
                        ) : (
                            <div className="space-y-2">
                                {accounts.map((acc) => (
                                    <div key={acc.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                                        <div>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full mr-2" style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}>{acc.accountType}</span>
                                            <span className="text-sm font-mono" style={{ color: "var(--text)" }}>{acc.accountNo}</span>
                                        </div>
                                        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>₹{acc.balance.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl p-5" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>Beneficiaries ({beneficiaries.length})</h3>
                        {beneficiaries.length === 0 ? (
                            <p className="text-sm" style={{ color: "var(--muted)" }}>No beneficiaries added yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {beneficiaries.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{b.nickname}</p>
                                            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>{b.accountNo} · {b.accountType}</p>
                                        </div>
                                        <span className="text-xs" style={{ color: "var(--muted)" }}>{b.accountHolderName}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {!loading && profile && editing && (
                <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                    <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>Edit Profile</h3>

                    {emailWillChange && (
                        <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", color: "#92400E" }}>
                            You are changing your email address. After saving, you will be signed out and must sign in again with <strong>{form.email}</strong>.
                        </div>
                    )}

                    {saveError && <p className="text-sm" style={{ color: "var(--danger)" }}>{saveError}</p>}

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
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>Phone Number</label>
                        <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                    </div>
                    <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--muted)" }}>PAN</label>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm" style={{ borderColor: "var(--border)", backgroundColor: "#F8FAFC", color: "var(--muted)" }}>
                            <span className="flex-1 font-mono">{profile.pan}</span>
                            <span className="text-xs">Cannot be changed</span>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={cancelEdit} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                        <button onClick={handleSave} disabled={saving || !form.firstName || !form.lastName || !form.email || !form.phoneNumber} className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50" style={{ backgroundColor: emailWillChange ? "#D97706" : "var(--primary)" }}>
                            {saving ? "Saving..." : emailWillChange ? "Save & Sign Out" : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
