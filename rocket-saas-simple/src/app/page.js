export default function Home() {
  return (
    <main style={{padding:'2rem', fontFamily:'system-ui, Arial'}}>
      <h1>🚀 Rocket SaaS — Simple Starter</h1>
      <p>This is the simplest possible starter to deploy on Dokploy.</p>
      <ul>
        <li><a href="/onboarding">Create an organization (tenant)</a></li>
        <li><a href="/tenants">List organizations</a></li>
      </ul>
      <p style={{marginTop: '2rem', fontSize:'0.9rem', color:'#666'}}>
        Tip: In production, set a real database URL and configure a wildcard DNS if you want subdomains per tenant later.
      </p>
    </main>
  );
}
