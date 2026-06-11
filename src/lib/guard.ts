import { NextResponse } from "next/server";
import { isAuthenticated, verifySameOrigin } from "./auth";

/**
 * Guards admin API routes: verifies the session cookie and, for mutating
 * requests, the same-origin policy (CSRF protection).
 */
export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
