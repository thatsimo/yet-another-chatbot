import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Add environment variables to the request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-backend-url", process.env.BACKEND_URL || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
