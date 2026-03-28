// components/ScorePage.tsx
import React, { useState } from 'react'
import { CantonNicho, ScoreWeights } from '../types'
import { DEFAULT_WEIGHTS, colones_to_usd, fmt_num } from '../lib/scoring'
import { saveWeights } from '../lib/store'
import { PageHeader, ScoreBadge, PillTag, PrioridadBadge } from './Layout'

interface Props {
  cantones: CantonNicho[]
  weights: ScoreWeights
  onWeightsChange: (w: ScoreWeights) => void
}

const WEIGHT_LABELS: Record<keyof ScoreWeights, { label: string; desc: string; color: string }> = {
  volumen: { label: 'Volumen de m²', desc: 'Peso del tamaño total de construcción en el cantón', color: '#10b981' },
  crecimiento: { label: 'Crecimiento interanual', desc: 'Peso de la variación porcentual 2024→2025', color: '#3b82f6' },
  valorM2: { label: 'Valor declarado/m²', desc: 'Peso del ticket estimado (métrica derivada)', color: '#f59e0b' },
  numObras: { label: 'N° de obras', desc: 'Peso de la cantidad de permisos activos', color: '#a78bfa' },
  nichoTipo: { label: 'Bonus de nicho', desc: 'Bonus según tipo de nicho detectado (turístico, premium, etc.)', color: '#f43f5e' },
}

function pctStr(n: number) { return `${Math.round(n * 100)}%` }

export default function ScorePage({ cantones, weights, onWeightsChange }: Props) {
  const [localW, setLocalW] = useState<ScoreWeights>(weights)
  const [top, setTop] = useState(20)

  const total = Object.values(localW).reduce((s, v) => s + v, 0)
  const balanced = Math.abs(total - 1) < 0.01

  function updateWeight(key: keyof ScoreWeights, val: number) {
    setLocalW(prev => ({ ...prev, [key]: val }))
  }

  function applyWeights() {
    if (!balanced) return
    onWeightsChange(localW)
    saveWeights(localW)
  }

  function resetWeights() {
    setLocalW(DEFAULT_WEIGHTS)
    onWeightsChange(DEFAULT_WEIGHTS)
    saveWeights(DEFAULT_WEIGHTS)
  }

  const top20 = cantones.slice(0, top)

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Opportunity Score"
        subtitle="Ranking de cantones por oportunidad comercial · Configura los pesos de la fórmula"
        badge="Score 0–100"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Weight configurator */}
        <div className="card" style={{ padding: 20, position: 'sticky', top: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Configurar Pesos de la Fórmula
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Los pesos deben sumar 100%. El ranking se recalcula en tiempo real.
          </div>

          {/* Formula display */}
          <div style={{
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 11, lineHeight: 1.7,
            fontFamily: 'DM Mono', color: 'var(--text-secondary)'
          }}>
            <div style={{ color: 'var(--accent-green)', fontWeight: 700, marginBottom: 4 }}>FÓRMULA ACTUAL</div>
            Score = (Vol × {pctStr(localW.volumen)}) + (Crec × {pctStr(localW.crecimiento)}) + (Val/m² × {pctStr(localW.valorM2)}) + (Obras × {pctStr(localW.numObras)}) + (Nicho × {pctStr(localW.nichoTipo)})
            <div style={{ marginTop: 4, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>
              Cada componente se normaliza 0–100 dentro del dataset
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(Object.keys(localW) as (keyof ScoreWeights)[]).map(key => {
              const info = WEIGHT_LABELS[key]
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{info.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{info.desc}</div>
                    </div>
                    <span style={{
                      fontFamily: 'DM Mono', fontSize: 13, fontWeight: 700,
                      color: info.color, minWidth: 36, textAlign: 'right'
                    }}>
                      {pctStr(localW[key])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0} max={1} step={0.05}
                    value={localW[key]}
                    onChange={e => updateWeight(key, parseFloat(e.target.value))}
                    style={{ accentColor: info.color }}
                  />
                </div>
              )
            })}
          </div>

          {/* Total indicator */}
          <div style={{
            marginTop: 16, padding: '8px 12px', borderRadius: 8,
            background: balanced ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${balanced ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
            fontSize: 12, color: balanced ? '#34d399' : '#f87171',
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span>Total de pesos:</span>
            <span style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>{pctStr(total)}</span>
          </div>
          {!balanced && (
            <div style={{ fontSize: 11, color: '#f87171', marginTop: 6 }}>
              ⚠ Los pesos deben sumar exactamente 100% para aplicar
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              onClick={applyWeights}
              disabled={!balanced}
              style={{
                flex: 1, padding: '9px', borderRadius: 8,
                background: balanced ? 'var(--accent-green)' : 'var(--bg-card)',
                border: 'none', color: balanced ? '#000' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 700, cursor: balanced ? 'pointer' : 'not-allowed',
              }}
            >
              Aplicar pesos
            </button>
            <button
              onClick={resetWeights}
              style={{
                padding: '9px 12px', borderRadius: 8,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Ranking table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Ranking completo · {cantones.length} cantones con datos
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mostrar:</span>
              {[10, 20, 40, 100].map(n => (
                <button
                  key={n}
                  onClick={() => setTop(n)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12,
                    background: top === n ? 'rgba(16,185,129,0.15)' : 'transparent',
                    border: `1px solid ${top === n ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                    color: top === n ? 'var(--accent-green)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Score</th>
                  <th>Cantón</th>
                  <th>Provincia</th>
                  <th>m² 2025</th>
                  <th>Crec.</th>
                  <th>Valor Decl./m² ⚠</th>
                  <th>Obras</th>
                  <th>Nichos</th>
                  <th>Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((c, i) => (
                  <tr key={`${c.provincia}-${c.canton}`}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono', fontSize: 12 }}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                    </td>
                    <td><ScoreBadge score={c.opportunityScore} /></td>
                    <td style={{ fontWeight: 700 }}>{c.canton}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{c.provincia}</td>
                    <td style={{ fontFamily: 'DM Mono', fontSize: 12 }}>{fmt_num(c.m2_2025)}</td>
                    <td style={{ fontFamily: 'DM Mono', fontSize: 12, color: (c.yoy_m2_pct ?? 0) > 0 ? '#34d399' : '#f87171' }}>
                      {c.yoy_m2_pct != null ? `${(c.yoy_m2_pct * 100) > 0 ? '+' : ''}${(c.yoy_m2_pct * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--accent-gold)' }}>
                      ${(colones_to_usd(c.colones_por_m2_2025) ?? 0).toFixed(0)}
                    </td>
                    <td style={{ fontFamily: 'DM Mono', fontSize: 12 }}>{fmt_num(c.obras_2025)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 240 }}>
                        {c.nicho_tags.slice(0, 2).map(t => (
                          <PillTag key={t.label} label={t.label} color={t.color} bg={t.bg} />
                        ))}
                      </div>
                    </td>
                    <td><PrioridadBadge p={c.prioridad} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
            ⚠ Valor Decl./m² es métrica derivada (valor declarado en permiso / área). No equivale a precio de mercado real.
          </div>
        </div>
      </div>
    </div>
  )
}
