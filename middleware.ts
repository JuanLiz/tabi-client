import { JwtPayload, jwtDecode } from "jwt-decode";
import { NextResponse, type NextRequest } from "next/server";


export function middleware(request: NextRequest) {

    let token = request.cookies.get("token")?.value;

    let decodedToken: JwtPayload | null = null;

    if (token && token != "null") {
        decodedToken = jwtDecode(token);
    }

    function validateToken(tokenExp: number | undefined) {
        if (!tokenExp) {
            return false;
        } else {
            return (Date.now() / 1000) < tokenExp;
        }
    }

    if ((request.nextUrl.pathname == '/' || request.nextUrl.pathname.startsWith("/dashboard"))
        && (!decodedToken || decodedToken === null || !validateToken(decodedToken?.exp))
    ) {
        request.cookies.delete("user");
        const response = NextResponse.redirect(new URL("/login", request.nextUrl.origin));
        response.cookies.delete("user");

        return response;
    }

    if ((request.nextUrl.pathname == '/' || request.nextUrl.pathname.includes("/login"))
        && decodedToken
        && decodedToken !== null
        && validateToken(decodedToken?.exp)) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
    }




}