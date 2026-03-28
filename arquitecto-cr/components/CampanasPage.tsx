// components/CampanasPage.tsx
import React, { useState } from 'react'
import { CantonNicho } from '../types'
import { generateCampaign, GeneratedCampaign } from '../lib/campaigns'
import { PROVINCIAS, TIPOS_CLIENTE, TONOS_MARCA } from '../lib/scoring'
import { saveCampaign, getCampaigns, deleteCampaign } from '../lib/store'
import { PageHeader, FilterSelect } from './Layout'

interface Props { cantones: CantonNicho[] }

const ALL_NICHOS = [
  'Nicho Premium', 'Turístico / Vacacional', 'Comercial / Servicios',
  'Crecimiento Acelerado', 'Mercado Emergente', 'Volumen Masivo Residencial', 'Remodelación / Ampliación'
]

function CopyBlock({ label, items, accent }: { label: string; items: string[]; accent?: string }) {
  const [copied, setCopied] = useState<number | null>(null)
  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 1500)
  }
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: accent || 'var(--text-muted)', marginBottom: 12
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: 'rgba(255,255,255,0.02)', borderRadius: 6, padding: '10px 12px',
            border: '1px solid var(--border)',
          }}>
            <span style={{ color: accent || 'var(--accent-green)', fontSize: 12, flexShrink: 0, marginTop: 2 }}>
              {i + 1}.
            </span>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{item}</div>
            <button
              onClick={() => copy(item, i)}
              style={{
                flexShrink: 0, padding: '3px 8px', borderRadius: 4, fontSize: 11,
                background: copied === i ? 'rgba(52,211,153,0.15)' : 'transparent',
                border: `1px solid ${copied === i ? 'rgba(52,211,153,0.4)' : 'var(--border)'}`,
                color: copied === i ? '#34d399' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {copied === i ? '✓' : 'Copiar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CampanasPage({ cantones }: Props) {
  const [filtProv, setFiltProv] = useState('')
  const [selCanton, setSelCanton] = useState('')
  const [selNicho, setSelNicho] = useState('')
  const [selCliente, setSelCliente] = useState(TIPOS_CLIENTE[0])
  const [selTono, setSelTono] = useState(TONOS_MARCA[0])
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'generate' | 'history'>('generate')
  const [history, setHistory] = useState(() => getCampaigns())

  const cantonesFiltered = cantones.filter(c => !filtProv || c.provincia === filtProv)
  const cantonObj = cantones.find(c => c.canton === selCanton)

  function generate() {
    if (!cantonObj) return
    const nicho = selNicho || cantonObj.nichoSugerido[0] || 'Volumen Estable'
    const gen = generateCampaign({ canton: cantonObj, nicho, tipoCliente: selCliente, tono: selTono })
    setCampaign(gen)
    setSaved(false)
  }

  function saveCurrentCampaign() {
    if (!campaign || !cantonObj) return
    const c = {
      id: Date.now().toString(),
      provincia: cantonObj.provincia,
      canton: cantonObj.canton,
      nicho: selNicho,
      tipoCliente: selCliente,
      tono: selTono,
      ...campaign,
      createdAt: new Date().toISOString(),
    }
    saveCampaign(c)
    setHistory(getCampaigns())
    setSaved(true)
  }

  function deleteHist(id: string) {
    deleteCampaign(id)
    setHistory(getCampaigns())
  }

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Campaign Studio"
        subtitle="Generá campañas de marketing personalizadas basadas en datos del mercado"
        badge="Generador de Campañas"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[
          { id: 'generate', label: '+ Nueva campaña' },
          { id: 'history', label: `Historial (${history.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{
              padding: '10px 18px', background: 'transparent',
              border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--accent-green)' : 'transparent'}`,
              color: tab === t.id ? 'var(--accent-green)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'generate' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Config panel */}
          <div className="card" style={{ padding: 20, position: 'sticky', top: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Configurar campaña
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FilterSelect label="Provincia" value={filtProv} onChange={v => { setFiltProv(v); setSelCanton('') }} options={PROVINCIAS} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cantón *</label>
                <select
                  value={selCanton}
                  onChange={e => setSelCanton(e.target.value)}
                  className="input-field"
                  style={{ padding: '7px 10px', fontSize: 13 }}
                >
                  <option value="">Seleccioná cantón</option>
                  {cantonesFiltered.map(c => (
                    <option key={`${c.provincia}-${c.canton}`} value={c.canton}>
                      {c.canton} (Score: {c.opportunityScore})
                    </option>
                  ))}
                </select>
              </div>

              <FilterSelect label="Nicho objetivo" value={selNicho} onChange={setSelNicho} options={ALL_NICHOS} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tipo de cliente</label>
                <select value={selCliente} onChange={e => setSelCliente(e.target.value)} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
                  {TIPOS_CLIENTE.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tono de marca</label>
                <select value={selTono} onChange={e => setSelTono(e.target.value)} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
                  {TONOS_MARCA.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button
                onClick={generate}
                disabled={!selCanton}
                style={{
                  padding: '11px', borderRadius: 8,
                  background: selCanton ? 'var(--accent-green)' : 'var(--bg-card)',
                  border: 'none', color: selCanton ? '#000' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 700, cursor: selCanton ? 'pointer' : 'not-allowed',
                  marginTop: 4,
                }}
              >
                Generar campaña →
              </button>

              {cantonObj && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: 4 }}>{cantonObj.canton}</div>
                  Nichos: {cantonObj.nichoSugerido.slice(0, 2).join(', ')}<br />
                  Score: {cantonObj.opportunityScore}<br />
                  Crec.: {cantonObj.yoy_m2_pct != null ? `+${(cantonObj.yoy_m2_pct * 100).toFixed(1)}%` : '—'}
                </div>
              )}
            </div>
          </div>

          {/* Campaign output */}
          {campaign ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="animate-slide-up">
              {/* Headline */}
              <div className="card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.05))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Headline Principal
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne', lineHeight: 1.3, marginBottom: 10 }}>
                      {campaign.headline}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                      {campaign.subtitulo}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Propuesta de valor:</strong><br />
                      {campaign.propuestaValor}
                    </div>
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <button
                      onClick={saveCurrentCampaign}
                      style={{
                        padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: saved ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${saved ? 'rgba(52,211,153,0.4)' : 'var(--border)'}`,
                        color: saved ? '#34d399' : 'var(--text-secondary)', cursor: 'pointer',
                      }}
                    >
                      {saved ? '✓ Guardada' : '↓ Guardar'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <CopyBlock label="📘 Meta Ads (3 versiones)" items={campaign.metaAds} accent="#3b82f6" />
                <CopyBlock label="🔍 Google Ads (3 versiones)" items={campaign.googleAds} accent="#10b981" />
              </div>

              <CopyBlock label="📱 Ideas de Contenido Orgánico" items={campaign.contenidoOrganico} accent="#a78bfa" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: 10 }}>
                    📎 Lead Magnet
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>{campaign.leadMagnet}</div>
                </div>
                <div className="card" style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399', marginBottom: 10 }}>
                    🎯 CTA Principal
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{campaign.cta}</div>
                </div>
              </div>

              {/* WhatsApp opener */}
              <div className="card" style={{ padding: '16px 18px', background: 'rgba(37,211,102,0.04)', borderColor: 'rgba(37,211,102,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#25d366', marginBottom: 10 }}>
                      💬 WhatsApp Opener / Mini guion de venta
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{campaign.whatsappOpener}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(campaign.whatsappOpener)}
                    style={{ flexShrink: 0, marginLeft: 12, padding: '6px 12px', borderRadius: 6, fontSize: 11, background: 'transparent', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366', cursor: 'pointer' }}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 48 }}>◑</div>
              <div style={{ fontSize: 14 }}>Configurá los parámetros y generá tu campaña</div>
            </div>
          )}
        </div>
      ) : (
        /* History */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>◑</div>
              <div>No hay campañas guardadas aún</div>
            </div>
          ) : (
            history.map(c => (
              <div key={c.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne' }}>{c.headline}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {c.canton} · {c.provincia} · {c.nicho} · {new Date(c.createdAt).toLocaleDateString('es-CR')}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{c.subtitulo}</div>
                  </div>
                  <button
                    onClick={() => deleteHist(c.id)}
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'transparent', border: '1px solid var(--border)', color: '#f87171', cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
