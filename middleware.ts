import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    if (!req.auth) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/customers/:path*",
        "/accounts/:path*",
        "/transactions/:path*",
        "/transfer/:path*",
        "/beneficiaries/:path*",
    ],
};
