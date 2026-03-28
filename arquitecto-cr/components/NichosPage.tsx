// components/NichosPage.tsx
import React, { useState, useMemo } from 'react'
import { CantonNicho } from '../types'
import { fmt_num, colones_to_usd, PROVINCIAS } from '../lib/scoring'
import { PageHeader, FilterSelect, ScoreBadge, PillTag, PrioridadBadge } from './Layout'
import { exportToCSV } from '../lib/store'

interface Props { cantones: CantonNicho[] }

const ALL_NICHOS = [
  'Nicho Premium', 'Crecimiento Acelerado', 'Mercado Emergente',
  'Volumen Masivo Residencial', 'Turístico / Vacacional', 'Alta Competencia Probable',
  'Comercial / Servicios', 'Remodelación / Ampliación', 'Oportunidad Especulativa',
  'Volumen Estable', 'Alta Rentabilidad',
]

export default function NichosPage({ cantones }: Props) {
  const [filtProv, setFiltProv] = useState('')
  const [filtNicho, setFiltNicho] = useState('')
  const [filtPrioridad, setFiltPrioridad] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'score' | 'yoy' | 'm2' | 'valor'>('score')

  const filtered = useMemo(() => {
    let data = [...cantones]
    if (filtProv) data = data.filter(c => c.provincia === filtProv)
    if (filtNicho) data = data.filter(c => c.nichoSugerido.includes(filtNicho))
    if (filtPrioridad) data = data.filter(c => c.prioridad === filtPrioridad)
    if (search) data = data.filter(c => c.canton.toLowerCase().includes(search.toLowerCase()))
    data.sort((a, b) => {
      if (sortBy === 'score') return b.opportunityScore - a.opportunityScore
      if (sortBy === 'yoy') return (b.yoy_m2_pct ?? -99) - (a.yoy_m2_pct ?? -99)
      if (sortBy === 'm2') return (b.m2_2025 ?? 0) - (a.m2_2025 ?? 0)
      return (b.colones_por_m2_2025 ?? 0) - (a.colones_por_m2_2025 ?? 0)
    })
    return data
  }, [cantones, filtProv, filtNicho, filtPrioridad, search, sortBy])

  const handleExport = () => {
    exportToCSV(filtered.map(c => ({
      Provincia: c.provincia,
      Cantón: c.canton,
      'm² 2025': c.m2_2025,
      'Crecimiento %': c.yoy_m2_pct ? (c.yoy_m2_pct * 100).toFixed(1) : '',
      'Valor Decl./m² (USD) [DERIVADO]': colones_to_usd(c.colones_por_m2_2025)?.toFixed(0) ?? '',
      'Obras 2025': c.obras_2025,
      'Opp. Score': c.opportunityScore,
      'Nichos': c.nichoSugerido.join(' | '),
      'Cliente Ideal': c.clienteIdeal,
      'Tipo Obra': c.tipoObraDominante,
      'Prioridad': c.prioridad,
    })), 'nichos_cr_2025.csv')
  }

  // Summary cards
  const alta = cantones.filter(c => c.prioridad === 'ALTA').length
  const turismo = cantones.filter(c => c.nichoSugerido.includes('Turístico / Vacacional')).length
  const premium = cantones.filter(c => c.nichoSugerido.includes('Nicho Premium') || c.nichoSugerido.includes('Alta Rentabilidad')).length
  const emergentes = cantones.filter(c => c.nichoSugerido.includes('Mercado Emergente') || c.nichoSugerido.includes('Crecimiento Acelerado')).length

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Detector de Nichos"
        subtitle="Clasificación automática de zonas por oportunidad comercial · Basado en datos INEC 2024–2025"
        badge="Nichos de Mercado"
      />

      {/* Summary pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Zonas alta prioridad', value: alta, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
          { label: 'Turístico / Vacacional', value: turismo, color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
          { label: 'Nicho premium / lujo', value: premium, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
          { label: 'Mercados emergentes', value: emergentes, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: item.color, fontFamily: 'DM Mono' }}>{item.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Buscar</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cantón..."
            className="input-field"
            style={{ padding: '7px 10px', fontSize: 13, width: 150 }}
          />
        </div>
        <FilterSelect label="Provincia" value={filtProv} onChange={setFiltProv} options={PROVINCIAS} />
        <FilterSelect label="Nicho" value={filtNicho} onChange={setFiltNicho} options={ALL_NICHOS} />
        <FilterSelect label="Prioridad" value={filtPrioridad} onChange={setFiltPrioridad} options={['ALTA', 'MEDIA', 'BAJA']} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ordenar</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
            <option value="score">Score</option>
            <option value="yoy">Crecimiento</option>
            <option value="m2">Volumen m²</option>
            <option value="valor">Valor/m²</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px', background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8,
              color: 'var(--accent-green)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
        Mostrando {filtered.length} cantones
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Score</th>
              <th>Cantón</th>
              <th>Provincia</th>
              <th>m² 2025</th>
              <th>Crec.</th>
              <th>Valor Decl./m² ⚠</th>
              <th>Obras</th>
              <th>Nichos detectados</th>
              <th>Cliente ideal</th>
              <th>Tipo obra</th>
              <th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={`${c.provincia}-${c.canton}`}>
                <td><ScoreBadge score={c.opportunityScore} /></td>
                <td style={{ fontWeight: 600, fontSize: 13 }}>{c.canton}</td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.provincia}</td>
                <td style={{ fontFamily: 'DM Mono', fontSize: 12 }}>{fmt_num(c.m2_2025)}</td>
                <td style={{
                  fontFamily: 'DM Mono', fontSize: 12,
                  color: (c.yoy_m2_pct ?? 0) > 0 ? '#34d399' : '#f87171'
                }}>
                  {c.yoy_m2_pct != null ? `${(c.yoy_m2_pct * 100) > 0 ? '+' : ''}${(c.yoy_m2_pct * 100).toFixed(1)}%` : '—'}
                </td>
                <td style={{ fontFamily: 'DM Mono', fontSize: 12, color: 'var(--accent-gold)' }}>
                  ${(colones_to_usd(c.colones_por_m2_2025) ?? 0).toFixed(0)}
                </td>
                <td style={{ fontFamily: 'DM Mono', fontSize: 12 }}>{fmt_num(c.obras_2025)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 280 }}>
                    {c.nicho_tags.slice(0, 3).map(t => (
                      <PillTag key={t.label} label={t.label} color={t.color} bg={t.bg} />
                    ))}
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 160 }}>{c.clienteIdeal}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.tipoObraDominante}</td>
                <td><PrioridadBadge p={c.prioridad} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)' }}>
        ⚠ Valor Decl./m²: métrica derivada de valor declarado en permiso / área. No equivale a precio de mercado real. Usar como referencia relativa entre cantones.
      </div>
    </div>
  )
}
