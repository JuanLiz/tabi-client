import { JwtPayload, jwtDecode } from "jwt-decode";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {

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

    const isTokenValid: boolean | null = decodedToken
        && decodedToken !== null
        && validateToken(decodedToken?.exp)

    if ((request.nextUrl.pathname == '/'
        || request.nextUrl.pathname.startsWith("/dashboard")
        || request.nextUrl.pathname == '/settings')
        && !isTokenValid
    ) {
        request.cookies.delete("user");
        const response = NextResponse.redirect(new URL("/login", request.nextUrl.origin));
        response.cookies.delete("user");

        return response;
    }

    if ((request.nextUrl.pathname == '/' || request.nextUrl.pathname.includes("/login"))
        && isTokenValid) {
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
    }

    // Check if user has farms, instead redirect to onboarding
    if (request.nextUrl.pathname.includes('/dashboard') && decodedToken) {

        // Search for user farms. Use fetch
        const userValue = request.cookies.get("user")?.value;
        const userID = userValue ? JSON.parse(userValue).userID : undefined;
        if (!userID) return NextResponse.redirect(new URL("/login", request.nextUrl.origin));

        // Hardcoded value for players
        if (userValue && JSON.parse(userValue).userTypeID === 2)
            return NextResponse.redirect(new URL("/onboarding", request.nextUrl.origin));

        const data = await fetch(
            `${request.nextUrl.origin}/api/Farm?Filters=UserID%3D%3D${userID}`,
            { headers: { Authorization: `Bearer ${token}` }, })
            .then((res) => res.json())
            .catch((err) => console.log(err));

        if (data.length === 0) {
            return NextResponse.redirect(new URL("/onboarding", request.nextUrl.origin));
        }
    }

    if (request.nextUrl.pathname == '/onboarding' && decodedToken) {
        // Search for user farms. Use fetch
        const userValue = request.cookies.get("user")?.value;
        const userID = userValue ? JSON.parse(userValue).userID : undefined;
        if (!userID) return NextResponse.redirect(new URL("/login", request.nextUrl.origin));

        if (userValue && JSON.parse(userValue).userTypeID === 2) return;

        const data = await fetch(
            `${request.nextUrl.origin}/api/Farm?Filters=UserID%3D%3D${userID}`,
            { headers: { Authorization: `Bearer ${token}` }, })
            .then((res) => res.json())
            .catch((err) => console.log(err));

        if (data.length > 0) {
            return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
        }

    }
}