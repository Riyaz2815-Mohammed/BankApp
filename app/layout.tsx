import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
    title: "BankApp",
    description: "Banking Application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${geist.variable} h-full`}>
            <body className="min-h-full">{children}</body>
        </html>
    );
}
