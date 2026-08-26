import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ArrowRight, ArrowDown, ShieldCheck, GitMerge, Settings, Play } from 'lucide-react';

export function Landing() {
  return (
    <div className="overview-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
      
      {/* Navbar */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="sidebar-brand" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
          <div className="brand-mark">EF</div>
          <h1 style={{ fontSize: '16px', margin: 0, fontWeight: 700 }}>EnterpriseFlow AI</h1>
        </div>
        
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>How it works</a>
          <a href="#bob" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>IBM Bob</a>
          <a href="#impact" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)' }}>Impact Analysis</a>
          <Link to="/demo">
            <Button>Open Demo</Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="overview-main" style={{ flex: 1, padding: '64px 32px', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '80px', background: 'var(--bg)' }}>
        
        {/* Hero Section */}
        <section className="hero-panel" style={{ maxWidth: '1100px', width: '100%', display: 'flex', flexDirection: 'column', gap: '40px', padding: '64px 48px', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '48px', letterSpacing: '-0.02em', margin: '0 0 24px 0', lineHeight: 1.1, color: 'var(--text)' }}>
              Turn business workflows into working software.
            </h1>
            <p className="hero-copy" style={{ fontSize: '18px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              EnterpriseFlow transforms messy business processes into structured automation blueprints, then uses IBM Bob to help turn those blueprints into tested, documented software.
            </p>
            <div style={{ marginTop: '32px' }}>
              <Link to="/demo">
                <Button size="lg" style={{ fontSize: '15px' }}>Try EnterpriseFlow <ArrowRight size={16} style={{ marginLeft: '8px' }} /></Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual Block Diagram */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Card style={{ padding: '16px 24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: '14px', margin: 0 }}>Business Requirement</strong>
            </Card>
            <ArrowRight size={20} color="var(--muted)" />
            
            <Card style={{ padding: '16px 24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: '14px', margin: 0 }}>Workflow</strong>
            </Card>
            <ArrowRight size={20} color="var(--muted)" />

            <Card style={{ padding: '16px 24px', background: 'var(--accent-tint)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: '14px', margin: 0 }}>Automation Blueprint</strong>
            </Card>
            <ArrowRight size={20} color="var(--muted)" />

            <Card style={{ padding: '16px 24px', background: 'var(--ai-tint)', border: '1px solid var(--ai)', color: 'var(--ai)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: '14px', margin: 0 }}>IBM Bob</strong>
            </Card>
            <ArrowRight size={20} color="var(--muted)" />

            <Card style={{ padding: '16px 24px', background: 'var(--success-tint)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: '14px', margin: 0 }}>Working Software</strong>
            </Card>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" style={{ maxWidth: '1100px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <p className="eyebrow">The Problem</p>
            <h2 style={{ fontSize: '32px', letterSpacing: '-0.02em', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Business processes change faster than software.
            </h2>
            <p className="hero-copy" style={{ fontSize: '15px', margin: 0 }}>
              When a policy changes, engineering is typically the bottleneck. 
              The result is a fragile patchwork of manual steps and disconnected tools. 
              EnterpriseFlow replaces this entropy with a deterministic engine that maps requirements directly to code.
            </p>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Card style={{ width: '100%', textAlign: 'center', borderColor: 'var(--danger)', background: 'var(--danger-tint)', color: 'var(--danger)' }}>
              <strong style={{ margin: 0 }}>Email</strong>
            </Card>
            <ArrowDown size={20} color="var(--muted)" />
            <Card style={{ width: '100%', textAlign: 'center', borderColor: 'var(--danger)', background: 'var(--danger-tint)', color: 'var(--danger)' }}>
              <strong style={{ margin: 0 }}>Spreadsheet</strong>
            </Card>
            <ArrowDown size={20} color="var(--muted)" />
            <Card style={{ width: '100%', textAlign: 'center', borderColor: 'var(--danger)', background: 'var(--danger-tint)', color: 'var(--danger)' }}>
              <strong style={{ margin: 0 }}>Manual verification</strong>
            </Card>
            <ArrowDown size={20} color="var(--muted)" />
            <Card style={{ width: '100%', textAlign: 'center', borderColor: 'var(--danger)', background: 'var(--danger-tint)', color: 'var(--danger)' }}>
              <strong style={{ margin: 0 }}>Manager email</strong>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" style={{ maxWidth: '1100px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="eyebrow">How It Works</p>
            <h2 style={{ fontSize: '32px', letterSpacing: '-0.02em', margin: 0 }}>From messy reality to deterministic execution</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <Card>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-tint)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <GitMerge size={20} />
              </div>
              <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>1. Map the process</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>Upload your existing documentation or describe the process. EnterpriseFlow extracts a canonical state machine.</p>
            </Card>
            <Card>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--ai-tint)', color: 'var(--ai)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Settings size={20} />
              </div>
              <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>2. Build with Bob</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>The Automation Blueprint is sent to IBM Bob, our engineering agent, who writes the actual implementation code.</p>
            </Card>
            <Card>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--success-tint)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>3. Validate & Run</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>Security tests, unit tests, and API documentation are generated. Once approved, the workflow is live.</p>
            </Card>
          </div>
        </section>

        {/* The Bob Relationship */}
        <section id="bob" style={{ maxWidth: '1100px', width: '100%', background: 'var(--dark-bg)', color: 'var(--dark-text)', borderRadius: 'var(--radius-lg)', padding: '64px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ maxWidth: '700px' }}>
            <div className="pill ai" style={{ marginBottom: '16px' }}>Engineering Agent</div>
            <h2 style={{ fontSize: '32px', letterSpacing: '-0.02em', margin: '0 0 16px 0', color: '#fff' }}>Meet IBM Bob</h2>
            <p style={{ fontSize: '16px', color: 'var(--dark-muted)', lineHeight: 1.6, margin: 0 }}>
              Bob isn't a chatbot. Bob is an autonomous engineering agent that lives in your repository. 
              When a workflow blueprint is approved, Bob analyzes the required state machine, plans the codebase changes, implements the backend services, writes the tests, and opens a Pull Request.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div style={{ background: 'var(--dark-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-border)' }}>
               <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '16px' }}>Code Generation</h4>
               <p style={{ margin: 0, fontSize: '13px', color: 'var(--dark-muted)' }}>Bob implements the exact state machine defined in the blueprint.</p>
             </div>
             <div style={{ background: 'var(--dark-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--dark-border)' }}>
               <h4 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '16px' }}>Security Validation</h4>
               <p style={{ margin: 0, fontSize: '13px', color: 'var(--dark-muted)' }}>All code is tested for boundary conditions and security flaws.</p>
             </div>
          </div>
        </section>

        {/* Rule Change Demo / Impact Analysis */}
        <section id="impact" style={{ maxWidth: '1100px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <Card style={{ padding: '32px', position: 'relative' }}>
             <div style={{ position: 'absolute', top: '-14px', left: '32px', background: 'var(--warning-tint)', color: '#9c6400', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--warning)' }}>Change Detected</div>
             <h3 style={{ fontSize: '18px', margin: '16px 0 24px 0', display: 'flex', alignItems: 'center' }}>Approval Threshold: <span style={{ textDecoration: 'line-through', color: 'var(--muted)', marginLeft: '8px' }}>₹5,00,000</span> <ArrowRight size={14} style={{ margin: '0 8px' }} /> <span style={{ color: 'var(--accent)' }}>₹10,00,000</span></h3>
             <p className="eyebrow" style={{ margin: 0 }}>Impact Analysis</p>
             <ul style={{ margin: '12px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text)' }}><ShieldCheck size={16} color="var(--success)" /> Approval Router modified</li>
               <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text)' }}><ShieldCheck size={16} color="var(--success)" /> CFO Route Tests updated</li>
               <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text)' }}><ShieldCheck size={16} color="var(--success)" /> API Documentation synced</li>
             </ul>
          </Card>
          <div>
            <p className="eyebrow">Impact Analysis</p>
            <h2 style={{ fontSize: '32px', letterSpacing: '-0.02em', margin: '0 0 16px 0', lineHeight: 1.2 }}>
              Change a rule, update the system.
            </h2>
            <p className="hero-copy" style={{ fontSize: '15px', margin: 0 }}>
              When business rules change, you don't need a 3-month engineering sprint. 
              EnterpriseFlow maps the exact dependency graph. Bob updates the affected services, rewrites the tests, and syncs the documentation automatically.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ maxWidth: '1100px', width: '100%', textAlign: 'center', padding: '64px 0', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '36px', letterSpacing: '-0.02em', margin: '0 0 24px 0' }}>Ready to structure your enterprise?</h2>
          <Link to="/demo">
            <Button size="lg" style={{ fontSize: '15px' }}>Start Demo Workflow <Play size={16} style={{ marginLeft: '8px', fill: 'currentColor' }} /></Button>
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ padding: '32px', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', fontSize: '13px' }}>
        <p style={{ margin: 0 }}>© 2026 EnterpriseFlow. Internal Demonstration.</p>
      </footer>
    </div>
  );
}
