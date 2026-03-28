// components/DashboardPage.tsx
import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { CantonData, ProvinciaData, DestinoObraData } from '../types'
import { fmt_num, fmt_pct, colones_to_usd, fmt_usd, PROVINCIAS } from '../lib/scoring'
import { KPICard, PageHeader, FilterSelect } from './Layout'

interface Props {
  cantones: CantonData[]
  provincias: ProvinciaData[]
  destinos: DestinoObraData[]
  provDest: any[]
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#a78bfa', '#38bdf8', '#fb923c']

function shortCant(s: string) { return s.length > 12 ? s.slice(0, 11) + '…' : s }

export default function DashboardPage({ cantones, provincias, destinos, provDest }: Props) {
  const [filtProv, setFiltProv] = useState('')
  const [filtSort, setFiltSort] = useState<'m2' | 'yoy' | 'valor'>('m2')

  // Total KPIs
  const totalM2 = cantones.reduce((s, c) => s + (c.m2_2025 ?? 0), 0)
  const totalObras = cantones.reduce((s, c) => s + (c.obras_2025 ?? 0), 0)
  const totalValor = cantones.reduce((s, c) => s + (c.valor_2025 ?? 0), 0)
  const avgCpm2 = cantones.filter(c => c.colones_por_m2_2025).reduce((s, c, _, arr) => s + (c.colones_por_m2_2025 ?? 0) / arr.length, 0)

  // Growth cantones (with data)
  const withGrowth = cantones.filter(c => c.yoy_m2_pct != null)
  const avgGrowth = withGrowth.reduce((s, c) => s + (c.yoy_m2_pct ?? 0), 0) / (withGrowth.length || 1)

  // Filtered cantones
  const filtered = useMemo(() => {
    let data = [...cantones].filter(c => c.m2_2025 != null)
    if (filtProv) data = data.filter(c => c.provincia === filtProv)
    if (filtSort === 'm2') data.sort((a, b) => (b.m2_2025 ?? 0) - (a.m2_2025 ?? 0))
    if (filtSort === 'yoy') data.sort((a, b) => (b.yoy_m2_pct ?? -99) - (a.yoy_m2_pct ?? -99))
    if (filtSort === 'valor') data.sort((a, b) => (b.colones_por_m2_2025 ?? 0) - (a.colones_por_m2_2025 ?? 0))
    return data.slice(0, 15)
  }, [cantones, filtProv, filtSort])

  // Scatter data (growth vs valor)
  const scatterData = cantones
    .filter(c => c.yoy_m2_pct != null && c.colones_por_m2_2025 != null && c.m2_2025)
    .map(c => ({
      name: c.canton,
      x: Math.round((c.yoy_m2_pct ?? 0) * 100),
      y: Math.round((colones_to_usd(c.colones_por_m2_2025) ?? 0)),
      z: Math.round((c.m2_2025 ?? 0) / 1000),
      prov: c.provincia,
    }))

  // Province pie
  const provPie = provincias.map((p, i) => ({
    name: p.provincia, value: p.m2_2025 ?? 0, fill: COLORS[i % COLORS.length]
  }))

  // Destinos (top 8 excluding total)
  const destinosFiltered = destinos
    .filter(d => d.nivel === 'Detalle' && d.tipo_obra && d.tipo_obra !== 'Total Costa Rica')
    .sort((a, b) => (b.m2 ?? 0) - (a.m2 ?? 0))
    .slice(0, 8)

  // ProvDest bar
  const provDestBar = provDest.map(p => ({
    provincia: p.provincia?.slice(0, 8),
    Viviendas: Math.round((p.Viviendas ?? 0) / 1000),
    Comercio: Math.round((p.Comercio ?? 0) / 1000),
    Industria: Math.round((p.Industria ?? 0) / 1000),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    return (
      <div style={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{d.name}</div>
        <div style={{ color: 'var(--text-secondary)' }}>Crecimiento: {d.x > 0 ? '+' : ''}{d.x}%</div>
        <div style={{ color: 'var(--text-secondary)' }}>Valor/m²: ${d.y}/m²</div>
        <div style={{ color: 'var(--text-muted)' }}>Volumen: {d.z}k m²</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Dashboard General"
        subtitle="Panorama del mercado de construcción en Costa Rica · Datos INEC 2024–2025"
        badge="INEC CR · 2025"
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
        <KPICard
          label="M² Totales 2025"
          value={`${(totalM2 / 1e6).toFixed(2)}M`}
          sub="metros cuadrados construidos"
          color="var(--accent-green)"
          tooltip="Suma de m² de todos los cantones con datos en 2025. Dato oficial INEC."
        />
        <KPICard
          label="Obras Totales"
          value={fmt_num(totalObras)}
          sub="permisos de construcción"
          tooltip="Número total de obras registradas en 2025. Dato oficial INEC."
        />
        <KPICard
          label="Crecimiento Prom."
          value={`+${(avgGrowth * 100).toFixed(1)}%`}
          sub="variación interanual m²"
          color="var(--accent-green)"
          tooltip="Promedio de crecimiento interanual en m² entre 2024 y 2025, por cantón. [DERIVADO]"
        />
        <KPICard
          label="Valor Decl. Prom./m²"
          value={`$${(colones_to_usd(avgCpm2) ?? 0).toFixed(0)}`}
          sub="[DERIVADO] valor declarado promedio"
          color="var(--accent-gold)"
          tooltip="Promedio de valor declarado por m² entre cantones. MÉTRICA DERIVADA: colones_por_m2 proviene de valor/área declarados en permisos, no es precio de mercado real."
        />
        <KPICard
          label="Valor Total Declarado"
          value={fmt_usd(colones_to_usd(totalValor) ?? 0)}
          sub="[DERIVADO] suma valor declarado"
          tooltip="Suma del valor declarado en permisos. MÉTRICA DERIVADA: puede diferir del valor real de mercado."
        />
      </div>

      {/* Row 1: Ranking cantones + Pie provincias */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Ranking cantones */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Ranking de Cantones</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top 15 por métrica seleccionada</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <FilterSelect label="" value={filtProv} onChange={setFiltProv} options={PROVINCIAS} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ordenar</label>
                <select
                  value={filtSort}
                  onChange={e => setFiltSort(e.target.value as any)}
                  className="input-field"
                  style={{ padding: '7px 10px', fontSize: 13 }}
                >
                  <option value="m2">Por m²</option>
                  <option value="yoy">Por crecimiento</option>
                  <option value="valor">Por valor/m²</option>
                </select>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filtered.map(c => ({
              name: shortCant(c.canton),
              value: filtSort === 'm2' ? Math.round((c.m2_2025 ?? 0) / 1000)
                : filtSort === 'yoy' ? Math.round((c.yoy_m2_pct ?? 0) * 100)
                : Math.round(colones_to_usd(c.colones_por_m2_2025) ?? 0),
              prov: c.provincia,
            }))} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                formatter={(v: any) => filtSort === 'm2' ? [`${v}k m²`, 'Área'] : filtSort === 'yoy' ? [`${v}%`, 'Crecimiento'] : [`$${v}/m²`, 'Valor decl.']}
                contentStyle={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {filtered.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {filtSort !== 'm2' && (
            <div style={{ fontSize: 10, color: 'var(--accent-gold)', marginTop: 8 }}>
              ⚠ Métrica derivada: valor declarado/m² proviene de permisos, no refleja precios de mercado reales.
            </div>
          )}
        </div>

        {/* Pie provincias */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Distribución por Provincia</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Participación en m² totales 2025</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={provPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                {provPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip
                formatter={(v: any) => [`${(v / 1000).toFixed(0)}k m²`, 'Área']}
                contentStyle={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Provincia table mini */}
          <table className="data-table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Provincia</th>
                <th style={{ textAlign: 'right' }}>Crec.</th>
                <th style={{ textAlign: 'right' }}>Valor/m²</th>
              </tr>
            </thead>
            <tbody>
              {provincias.sort((a, b) => (b.yoy_m2_pct ?? 0) - (a.yoy_m2_pct ?? 0)).map(p => (
                <tr key={p.provincia}>
                  <td style={{ fontSize: 12 }}>{p.provincia}</td>
                  <td style={{ textAlign: 'right', fontSize: 12, color: (p.yoy_m2_pct ?? 0) > 0 ? '#34d399' : '#f87171' }}>
                    {fmt_pct(p.yoy_m2_pct)}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--accent-gold)' }}>
                    ${(colones_to_usd(p.colones_por_m2_2025) ?? 0).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Scatter + Destinos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Scatter */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Crecimiento vs Valor Declarado/m²</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
            Eje X: crecimiento interanual (%) · Eje Y: valor declarado por m² (USD) [DERIVADO] · Tamaño: no representativo
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="x" name="Crec. %" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Crecimiento %', position: 'insideBottom', offset: -5, fill: '#475569', fontSize: 11 }} />
              <YAxis dataKey="y" name="Valor/m²" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'USD/m²', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} fill="#10b981" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Destinos */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Tipos de Obra 2025</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Ranking por m² — país total</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={destinosFiltered.map(d => ({ name: shortCant(d.tipo_obra ?? ''), m2: Math.round((d.m2 ?? 0) / 1000) }))} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                formatter={(v: any) => [`${v}k m²`, 'Área']}
                contentStyle={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="m2" fill="#3b82f6" fillOpacity={0.8} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Prov x Destino */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Distribución por Provincia y Destino de Obra</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>M² totales por categoría (miles) · 2025</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={provDestBar}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="provincia" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any, name: string) => [`${v}k m²`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Viviendas" stackId="a" fill="#10b981" />
            <Bar dataKey="Comercio" stackId="a" fill="#3b82f6" />
            <Bar dataKey="Industria" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>
        <strong style={{ color: '#fbbf24' }}>⚠ Nota metodológica:</strong>
        {' '}Las métricas marcadas como [DERIVADO] (valor declarado por m², valor total) se calculan a partir de los montos declarados en los permisos de construcción del INEC.
        Estos valores no equivalen a precios de mercado reales. Los datos de área (m²), número de obras y crecimiento interanual son datos oficiales directos del INEC CR.
      </div>
    </div>
  )
}
