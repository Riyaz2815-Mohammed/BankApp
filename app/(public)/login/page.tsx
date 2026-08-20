export default function LoginPage() {
    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: "var(--surface)" }}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Welcome back</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Sign in to your BankApp account</p>
                </div>
                <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--surface)" }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text)" }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--surface)" }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg text-white text-sm font-semibold transition-colors hover:opacity-90"
                        style={{ backgroundColor: "var(--primary)" }}
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
