import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const domains = await prisma.domain.findMany({ include: { organization: true } });
  const orgs = await prisma.organization.findMany();
  const list = orgs.map(o => {
    const d = domains.find(x => x.organizationId === o.id);
    return { id: o.id, name: o.name, subdomain: d?.subdomain || null };
  });
  return NextResponse.json({ list });
}

export async function POST(req) {
  try {
    const { name, subdomain } = await req.json();
    if (!name) return NextResponse.json({ ok: false, error: "name is required" }, { status: 400 });
    const org = await prisma.organization.create({ data: { name } });
    if (subdomain) {
      const safe = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");
      await prisma.domain.create({ data: { subdomain: safe, organizationId: org.id } });
    }
    return NextResponse.json({ ok: true, org });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
