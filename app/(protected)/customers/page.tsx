"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, registerUser } from "@/modules/customers/api";
import { Customer, CustomerRequest, RegisterUserRequest, RegisterUserResponse } from "@/modules/customers/types";
import CustomerRow from "@/modules/customers/components/CustomerRow";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const emptyForm: CustomerRequest = { pan: "", firstName: "", lastName: "", email: "", phoneNumber: "" };
const emptyRegisterForm: RegisterUserRequest = {
    firstName: "", lastName: "", email: "", pan: "", phoneNumber: "", username: "", temporaryPassword: "",
};

export default function CustomersPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.roles?.includes("admin") ?? false;
    const isManager = session?.roles?.includes("BankManager") ?? false;
    const isStaff = isAdmin || isManager;
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create/Edit modal (admin only)
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [form, setForm] = useState<CustomerRequest>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    // Register User modal (admin + manager)
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerForm, setRegisterForm] = useState<RegisterUserRequest>(emptyRegisterForm);
    const [registering, setRegistering] = useState(false);
    const [registerResult, setRegisterResult] = useState<RegisterUserResponse | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!isStaff) {
            router.replace("/dashboard");
            return;
        }
        getCustomers()
            .then(setCustomers)
            .catch(() => setError("Failed to load customers"))
            .finally(() => setLoading(false));
    }, [status, isStaff, router]);

    if (status === "loading" || !isStaff) return null;

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };
    const openEdit = (c: Customer) => {
        setEditing(c);
        setForm({ pan: c.pan, firstName: c.firstName, lastName: c.lastName, email: c.email, phoneNumber: c.phoneNumber });
        setShowModal(true);
    };
    const handleSave = () => {
        setSaving(true);
        const action = editing ? updateCustomer(editing.id, form) : createCustomer(form);
        action
            .then((saved) => {
                setCustomers((prev) => editing ? prev.map((c) => c.id === editing.id ? saved : c) : [...prev, saved]);
                setShowModal(false);
            })
            .catch(() => setError("Failed to save customer"))
            .finally(() => setSaving(false));
    };
    const handleDelete = (id: string) => setConfirmDelete(id);
    const confirmDeleteAction = () => {
        if (!confirmDelete) return;
        deleteCustomer(confirmDelete)
            .then(() => setCustomers((prev) => prev.filter((c) => c.id !== confirmDelete)))
            .catch(() => setError("Failed to delete customer"))
            .finally(() => setConfirmDelete(null));
    };

    const openRegister = () => {
        setRegisterForm(emptyRegisterForm);
        setRegisterResult(null);
        setShowRegisterModal(true);
    };
    const handleRegister = () => {
        setRegistering(true);
        setError(null);
        registerUser(registerForm)
            .then((res) => {
                setRegisterResult(res);
                setCustomers((prev) => [...prev, {
                    id: res.customerId,
                    pan: res.pan,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    email: res.email,
                    phoneNumber: res.phoneNumber,
                }]);
            })
            .catch((err) => {
                const msg = err?.response?.data?.message ?? err?.response?.data ?? "Registration failed.";
                setError(typeof msg === "string" ? msg : "Registration failed.");
            })
            .finally(() => setRegistering(false));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Customers</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Manage all bank customers</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={openRegister}
                        className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                        style={{ backgroundColor: "var(--success, #16a34a)" }}
                    >
                        + Register User
                    </button>
                    {isAdmin && (
                        <button
                            onClick={openCreate}
                            className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                            style={{ backgroundColor: "var(--primary)" }}
                        >
                            + New Customer
                        </button>
                    )}
                </div>
            </div>
            {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
            {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
            {!loading && customers.length > 0 && (
                <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)" }}>
                    <table className="w-full text-sm" style={{ backgroundColor: "var(--surface)" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#F8FAFC" }}>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Name</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>PAN</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Email</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Phone</th>
                                <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--muted)" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c) => (
                                <CustomerRow key={c.id} customer={c} isAdmin={isAdmin} onEdit={openEdit} onDelete={handleDelete} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && customers.length === 0 && !error && (
                <p className="text-sm" style={{ color: "var(--muted)" }}>No customers found.</p>
            )}

            {/* Create/Edit customer modal (admin only) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>
                            {editing ? "Edit Customer" : "New Customer"}
                        </h3>
                        <div className="space-y-3">
                            <input placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="PAN (10 chars)" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                            <input placeholder="Phone (10 digits)" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg text-sm text-white font-semibold" style={{ backgroundColor: "var(--primary)" }}>{saving ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <ConfirmDialog
                    title="Delete Customer"
                    message="This will permanently remove the customer. This action cannot be undone."
                    onConfirm={confirmDeleteAction}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            {/* Register User modal (admin + manager) */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "var(--surface)" }}>
                        {registerResult ? (
                            <>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>User Registered</h3>
                                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>{registerResult.message}</p>
                                <div className="rounded-lg p-4 space-y-2 text-sm mb-4" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                                    <div className="flex justify-between">
                                        <span style={{ color: "var(--muted)" }}>Name</span>
                                        <span style={{ color: "var(--text)" }}>{registerResult.firstName} {registerResult.lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: "var(--muted)" }}>Email</span>
                                        <span style={{ color: "var(--text)" }}>{registerResult.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: "var(--muted)" }}>Username</span>
                                        <span className="font-mono text-xs" style={{ color: "var(--text)" }}>{registerForm.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: "var(--muted)" }}>Temp Password</span>
                                        <span className="font-mono text-xs" style={{ color: "var(--text)" }}>{registerForm.temporaryPassword}</span>
                                    </div>
                                </div>
                                <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                                    Share these credentials with the user. They will be prompted to change their password on first login.
                                </p>
                                <button
                                    onClick={() => { setShowRegisterModal(false); setRegisterResult(null); }}
                                    className="w-full py-2 rounded-lg text-sm text-white font-semibold"
                                    style={{ backgroundColor: "var(--primary)" }}
                                >
                                    Done
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>Register New User</h3>
                                <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Creates a Keycloak account and customer record. Share credentials with the user.</p>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="First Name" value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                        <input placeholder="Last Name" value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    </div>
                                    <input placeholder="Email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    <input placeholder="PAN (10 chars)" value={registerForm.pan} onChange={(e) => setRegisterForm({ ...registerForm, pan: e.target.value.toUpperCase() })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    <input placeholder="Phone Number" value={registerForm.phoneNumber} onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    <input placeholder="Username (for login)" value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                    <input placeholder="Temporary Password" value={registerForm.temporaryPassword} onChange={(e) => setRegisterForm({ ...registerForm, temporaryPassword: e.target.value })} className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }} />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowRegisterModal(false)} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>Cancel</button>
                                    <button
                                        onClick={handleRegister}
                                        disabled={registering || !registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.username || !registerForm.temporaryPassword}
                                        className="flex-1 py-2 rounded-lg text-sm text-white font-semibold disabled:opacity-50"
                                        style={{ backgroundColor: "var(--success, #16a34a)" }}
                                    >
                                        {registering ? "Registering..." : "Register"}
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
