import Link from "next/link";

async function getTenants() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/tenants`, { cache: "no-store" });
  try { return await res.json(); } catch { return { list: [] }; }
}

export default async function TenantsPage() {
  const data = await getTenants();
  const list = Array.isArray(data.list) ? data.list : [];
  return (
    <main style={{padding:'2rem', fontFamily:'system-ui, Arial'}}>
      <h2>Organizations</h2>
      <ul>
        {list.map(t => (
          <li key={t.id}>{t.name} {t.subdomain ? <em>({t.subdomain})</em> : null}</li>
        ))}
      </ul>
      <p><Link href="/onboarding">Create another</Link></p>
    </main>
  );
}
