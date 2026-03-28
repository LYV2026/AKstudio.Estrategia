// components/EstrategiaPage.tsx
import React, { useState } from 'react'
import { CantonNicho } from '../types'
import { getEstrategia, PROVINCIAS, colones_to_usd } from '../lib/scoring'
import { PageHeader, FilterSelect, PillTag } from './Layout'
import { FUENTES_PROSPECCION } from '../lib/scoring'

interface Props { cantones: CantonNicho[] }

export default function EstrategiaPage({ cantones }: Props) {
  const [filtProv, setFiltProv] = useState('')
  const [selected, setSelected] = useState<CantonNicho | null>(null)

  const filtered = cantones.filter(c => !filtProv || c.provincia === filtProv)
  const top = filtered.slice(0, 30)

  const estrategia = selected ? getEstrategia(selected) : null

  function getFuentes(canton: CantonNicho): string[] {
    for (const nicho of canton.nichoSugerido) {
      if (FUENTES_PROSPECCION[nicho]) return FUENTES_PROSPECCION[nicho]
    }
    return FUENTES_PROSPECCION['default'].map(f => f + canton.canton)
  }

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Recomendador de Estrategia"
        subtitle="Seleccioná un cantón para ver la estrategia de marketing recomendada"
        badge="Marketing Strategy"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Canton selector list */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <FilterSelect label="Filtrar por provincia" value={filtProv} onChange={setFiltProv} options={PROVINCIAS} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 620, overflow: 'auto' }}>
            {top.map(c => (
              <button
                key={`${c.provincia}-${c.canton}`}
                onClick={() => setSelected(c)}
                style={{
                  background: selected?.canton === c.canton && selected?.provincia === c.provincia
                    ? 'rgba(16,185,129,0.12)' : 'var(--bg-card)',
                  border: `1px solid ${selected?.canton === c.canton && selected?.provincia === c.provincia ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.canton}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.provincia}</div>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 800, fontFamily: 'DM Mono',
                    color: c.opportunityScore >= 65 ? '#34d399' : c.opportunityScore >= 40 ? '#fbbf24' : '#94a3b8',
                  }}>
                    {c.opportunityScore}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {c.nicho_tags.slice(0, 2).map(t => (
                    <PillTag key={t.label} label={t.label} color={t.color} bg={t.bg} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy panel */}
        {selected && estrategia ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-slide-up">
            {/* Header */}
            <div className="card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.05))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne' }}>
                    Estrategia para {selected.canton}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{selected.provincia}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'DM Mono', color: '#34d399' }}>
                    {selected.opportunityScore}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Opportunity Score</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                {selected.nicho_tags.map(t => <PillTag key={t.label} label={t.label} color={t.color} bg={t.bg} />)}
              </div>
            </div>

            {/* Data snapshot */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'm² 2025', value: selected.m2_2025 ? `${(selected.m2_2025 / 1000).toFixed(0)}k` : '—' },
                { label: 'Crec.', value: selected.yoy_m2_pct != null ? `${(selected.yoy_m2_pct * 100) > 0 ? '+' : ''}${(selected.yoy_m2_pct * 100).toFixed(1)}%` : '—', color: (selected.yoy_m2_pct ?? 0) > 0 ? '#34d399' : '#f87171' },
                { label: 'Obras', value: selected.obras_2025?.toString() ?? '—' },
                { label: 'Val. Decl./m² ⚠', value: `$${(colones_to_usd(selected.colones_por_m2_2025) ?? 0).toFixed(0)}`, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} className="card" style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'DM Mono', color: item.color || 'var(--text-primary)', marginTop: 4 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Strategy grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StratCard title="🎯 Tipo de Cliente Objetivo" content={selected.clienteIdeal} />
              <StratCard title="🏗 Servicio Recomendado" content={estrategia.servicio} />
              <StratCard title="📢 Canal de Adquisición" content={estrategia.canal} />
              <StratCard title="🎨 Tono de Comunicación" content={estrategia.tono} />
              <StratCard title="📎 Lead Magnet Sugerido" content={estrategia.leadMagnet} />
              <StratCard title="📄 Tipo de Landing Page" content={estrategia.landing} />
            </div>

            {/* CTA */}
            <div className="card" style={{ padding: '16px 20px', background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                CTA Principal
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{estrategia.cta}</div>
            </div>

            {/* Prospecting sources */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                🔍 Fuentes de Prospección Recomendadas para {selected.canton}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {getFuentes(selected).map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: 1 }}>◉</span>
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                Estas son sugerencias de canales para búsqueda manual de prospectos. La app no realiza scraping ni recolección automática de datos personales.
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 400, color: 'var(--text-muted)', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 48 }}>◎</div>
            <div style={{ fontSize: 14 }}>Seleccioná un cantón de la lista para ver la estrategia</div>
          </div>
        )}
      </div>
    </div>
  )
}

function StratCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{content}</div>
    </div>
  )
}
