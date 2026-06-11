export const dynamic = "force-dynamic";

/** Health check — no database to probe, always ok if the process is alive. */
export async function GET() {
  return Response.json({ ok: true });
}
