import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
    title: "BankApp",
    description: "Banking Application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${geist.variable} h-full`}>
            <body className="min-h-full">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
