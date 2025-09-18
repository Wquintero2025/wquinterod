"use client";
import { useState } from "react";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subdomain: sub })
    });
    const data = await res.json();
    if (data.ok) {
      alert(`Created: ${data.org.name} (subdomain: ${sub})`);
      window.location.href = "/tenants";
    } else {
      alert(data.error || "Error creating tenant");
    }
  }

  return (
    <main style={{padding:'2rem', fontFamily:'system-ui, Arial'}}>
      <h2>Create your organization</h2>
      <form onSubmit={handleCreate} style={{maxWidth: 420}}>
        <label style={{display:'block', margin:'1rem 0 .25rem'}}>Organization name</label>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="My Church / My Org" required style={{width:'100%', padding:'.6rem'}}/>

        <label style={{display:'block', margin:'1rem 0 .25rem'}}>Subdomain (optional)</label>
        <input value={sub} onChange={(e)=>setSub(e.target.value)} placeholder="myorg" style={{width:'100%', padding:'.6rem'}}/>

        <button type="submit" style={{marginTop:'1rem', padding:'.6rem 1rem'}}>Create</button>
      </form>
    </main>
  );
}
