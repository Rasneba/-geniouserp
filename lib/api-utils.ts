import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;

export function ok<T>(data: T) {
  return NextResponse.json(data);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function err(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return err("Unauthorized", 401);
}

export function notFound(entity: string = "Resource") {
  return err(`${entity} not found`, 404);
}

export function badRequest(message: string) {
  return err(message, 400);
}

export function deleted(entity: string = "Resource") {
  return NextResponse.json({ message: `${entity} deleted` });
}

type Handler = (user: AuthUser, req: Request) => Promise<NextResponse>;

export async function withAuth(
  req: Request,
  handler: Handler
): Promise<NextResponse> {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return handler(user as AuthUser, req);
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === "super_admin";
}

export function buildCompanyFilter(
  user: AuthUser,
  params: any[],
  alias: string = ""
): string {
  const table = alias ? `${alias}.` : "";
  params.push(user.company_id);
  return ` AND ${table}company_id = $${params.length}`;
}
