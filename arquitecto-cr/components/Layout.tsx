// components/Layout.tsx — AK Studio Arquitectos brand
import React, { useState } from 'react'
import { NavPage } from '../types'

const NAV_ITEMS: { id: NavPage; label: string; icon: string }[] = [
  { id: 'ejecutivo',  label: 'Ejecutivo',    icon: '★' },
  { id: 'dashboard',  label: 'Dashboard',    icon: '◈' },
  { id: 'nichos',     label: 'Nichos',       icon: '◎' },
  { id: 'score',      label: 'Score',        icon: '◉' },
  { id: 'estrategia', label: 'Estrategia',   icon: '◐' },
  { id: 'campanas',   label: 'Campañas',     icon: '◑' },
  { id: 'prospectos', label: 'Prospectos',   icon: '◒' },
]

function AKLogo({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div style={{ display:'flex', alignItems:'baseline', gap:1, padding:'0 4px' }}>
        <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:17, color:'#F0F4FF' }}>A</span>
        <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:17, color:'#C9A96E' }}>K</span>
      </div>
    )
  }
  return (
    <div style={{ userSelect:'none' }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:0 }}>
        <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:19, color:'#F0F4FF', letterSpacing:'-0.01em' }}>AK</span>
        <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:300, fontSize:19, color:'#C9A96E', letterSpacing:'0.13em', marginLeft:6 }}>STUDIO</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
        <div style={{ height:1, width:16, background:'rgba(168,180,216,0.35)' }} />
        <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:300, fontSize:8, color:'#A8B4D8', letterSpacing:'0.24em', textTransform:'uppercase' }}>ARQUITECTOS</span>
        <div style={{ height:1, width:16, background:'rgba(168,180,216,0.35)' }} />
      </div>
      <div style={{ fontFamily:'Lato,sans-serif', fontSize:9, color:'#5C6E9A', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:5 }}>
        Market Intel · INEC CR
      </div>
    </div>
  )
}

interface LayoutProps {
  activePage: NavPage
  onNavigate: (page: NavPage) => void
  children: React.ReactNode
}

export default function Layout({ activePage, onNavigate, children }: LayoutProps) {
  const [sideCollapsed, setSideCollapsed] = useState(false)

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sideCollapsed ? 58 : 208,
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{
          padding: sideCollapsed ? '18px 10px' : '20px 18px',
          borderBottom: '1px solid var(--border)',
          minHeight: 78,
          display: 'flex',
          alignItems: 'center',
        }}>
          <AKLogo collapsed={sideCollapsed} />
        </div>

        {/* Gold accent bar */}
        <div style={{ height:2, background:'linear-gradient(90deg, #C9A96E 40%, transparent)', opacity:0.45 }} />

        {/* Nav items */}
        <nav style={{ flex:1, padding:'12px 0' }}>
          {NAV_ITEMS.map(item => {
            const active = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={sideCollapsed ? item.label : undefined}
                style={{
                  width:'100%',
                  display:'flex',
                  alignItems:'center',
                  gap:10,
                  padding: sideCollapsed ? '10px 0' : '10px 18px',
                  justifyContent: sideCollapsed ? 'center' : 'flex-start',
                  background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
                  border:'none',
                  borderLeft: active ? '2px solid #C9A96E' : '2px solid transparent',
                  cursor:'pointer',
                  transition:'all 0.14s',
                }}
              >
                <span style={{
                  fontSize:15,
                  color: active ? '#C9A96E' : 'var(--text-muted)',
                  flexShrink:0, width:20, textAlign:'center',
                }}>
                  {item.icon}
                </span>
                {!sideCollapsed && (
                  <span style={{
                    fontSize:12.5,
                    fontFamily:'Montserrat,sans-serif',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace:'nowrap',
                    letterSpacing:'0.02em',
                  }}>
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div style={{ padding:'10px 8px', borderTop:'1px solid var(--border)' }}>
          <button
            onClick={() => setSideCollapsed(!sideCollapsed)}
            style={{
              width:'100%', padding:'6px',
              background:'transparent',
              border:'1px solid var(--border)',
              borderRadius:6,
              color:'var(--text-muted)',
              cursor:'pointer',
              fontSize:11,
              fontFamily:'Lato,sans-serif',
            }}
          >
            {sideCollapsed ? '→' : '← Colapsar'}
          </button>
        </div>

        {!sideCollapsed && (
          <div style={{ padding:'8px 18px 14px', fontSize:10, color:'var(--text-muted)', lineHeight:1.6 }}>
            Fuente: INEC CR · 2024–2025<br/>
            <span style={{ color:'#C9A96E', opacity:0.75 }}>● Datos oficiales</span>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex:1, overflow:'auto', minWidth:0 }}>
        {children}
      </main>
    </div>
  )
}

// ── Shared UI components ─────────────────────────────────────

export function PageHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <div style={{ marginBottom:28 }}>
      {badge && (
        <span style={{
          fontSize:9, fontWeight:700, letterSpacing:'0.14em',
          textTransform:'uppercase', color:'#C9A96E',
          background:'rgba(201,169,110,0.12)',
          padding:'3px 10px', borderRadius:999,
          display:'inline-block', marginBottom:10,
          fontFamily:'Montserrat,sans-serif',
        }}>
          {badge}
        </span>
      )}
      <h1 style={{
        fontFamily:'Montserrat,sans-serif',
        fontSize:23, fontWeight:700,
        color:'var(--text-primary)',
        letterSpacing:'-0.02em', margin:0,
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize:13, color:'var(--text-secondary)', margin:'6px 0 0', lineHeight:1.55 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function KPICard({ label, value, sub, color, tooltip }: {
  label: string; value: string; sub?: string; color?: string; tooltip?: string
}) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div className="card" style={{ padding:'18px 20px', position:'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{
          fontSize:10, color:'var(--text-muted)', fontWeight:700,
          letterSpacing:'0.1em', textTransform:'uppercase',
          fontFamily:'Montserrat,sans-serif',
        }}>
          {label}
        </div>
        {tooltip && (
          <div style={{ position:'relative', cursor:'help' }}
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}>
            <span style={{
              fontSize:10, color:'var(--text-muted)',
              border:'1px solid var(--border)', borderRadius:999,
              width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center',
            }}>?</span>
            {showTip && (
              <div style={{
                position:'absolute', right:0, top:20, zIndex:50,
                background:'#162357', border:'1px solid rgba(201,169,110,0.2)',
                borderRadius:8, padding:'8px 12px', width:220,
                fontSize:11, color:'var(--text-secondary)', lineHeight:1.5,
              }}>
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{
        fontSize:25, fontWeight:700,
        color: color || 'var(--text-primary)',
        letterSpacing:'-0.02em', marginTop:8,
        fontFamily:'DM Mono,monospace',
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 65 ? '#C9A96E' : score >= 40 ? '#7BA7E0' : '#E05470'
  const bg    = score >= 65 ? 'rgba(201,169,110,0.14)' : score >= 40 ? 'rgba(123,167,224,0.12)' : 'rgba(224,84,112,0.12)'
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      minWidth:42, padding:'3px 8px', borderRadius:6,
      background:bg, color, fontWeight:700, fontSize:13,
      fontFamily:'DM Mono,monospace',
    }}>
      {score}
    </span>
  )
}

export function PillTag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'2px 8px', borderRadius:999,
      fontSize:10, fontWeight:700, letterSpacing:'0.05em',
      textTransform:'uppercase', color, background:bg,
      whiteSpace:'nowrap', fontFamily:'Montserrat,sans-serif',
    }}>
      {label}
    </span>
  )
}

export function PrioridadBadge({ p }: { p: 'ALTA' | 'MEDIA' | 'BAJA' }) {
  const styles = {
    ALTA:  { color:'#C9A96E', bg:'rgba(201,169,110,0.12)' },
    MEDIA: { color:'#7BA7E0', bg:'rgba(123,167,224,0.10)' },
    BAJA:  { color:'#5C6E9A', bg:'rgba(92,110,154,0.10)' },
  }
  const s = styles[p]
  return (
    <span style={{
      padding:'2px 8px', borderRadius:4, fontSize:10,
      fontWeight:700, letterSpacing:'0.06em',
      color:s.color, background:s.bg,
      fontFamily:'Montserrat,sans-serif',
    }}>
      {p}
    </span>
  )
}

export function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && (
        <label style={{
          fontSize:10, color:'var(--text-muted)', fontWeight:700,
          letterSpacing:'0.1em', textTransform:'uppercase',
          fontFamily:'Montserrat,sans-serif',
        }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field"
        style={{ padding:'7px 10px', fontSize:13, minWidth:140 }}
      >
        <option value="">Todos</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
      <div style={{ fontSize:36, marginBottom:12 }}>◎</div>
      <div style={{ fontSize:14 }}>{message}</div>
    </div>
  )
}
