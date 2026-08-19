"use client";

export default function Navbar() {
    return (
        <header className="h-16 border-b flex items-center justify-between px-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
            <div />
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    U
                </div>
            </div>
        </header>
    );
}
