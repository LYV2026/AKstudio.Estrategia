// components/EjecutivoPage.tsx
import React from 'react'
import { CantonNicho } from '../types'
import { colones_to_usd, getEstrategia } from '../lib/scoring'
import { PageHeader, PillTag, ScoreBadge } from './Layout'

interface Props { cantones: CantonNicho[] }

const PLAN_30 = [
  {
    semana: 'Semana 1',
    titulo: 'Análisis y Foco',
    color: '#3b82f6',
    tareas: [
      'Revisá el ranking de cantones y elegí 2–3 zonas prioritarias para atacar primero',
      'Analizá los nichos detectados y confirmá cuál se alinea mejor con tu portafolio actual',
      'Definí tu cliente ideal concreto (¿Airbnb? ¿Familia? ¿Comerciante?) para cada zona',
      'Revisá tu portafolio: ¿tenés proyectos terminados en esas zonas? Fotografialos o documentalos',
      'Armá una lista base de 20–30 prospectos potenciales en las zonas prioritarias',
    ],
  },
  {
    semana: 'Semana 2',
    titulo: 'Landing + Lead Magnet',
    color: '#a78bfa',
    tareas: [
      'Creá o actualizá tu landing page enfocada en el nicho/zona elegida (no una página genérica)',
      'Producí el lead magnet: guía de costos, estimador de presupuesto o checklist de permisos',
      'Configurá un formulario de captura + integración a WhatsApp',
      'Instalá Google Analytics y Meta Pixel en tu landing para trackear desde el día 1',
      'Grabá un video corto (60–90 seg) hablando de construcción en la zona objetivo',
    ],
  },
  {
    semana: 'Semana 3',
    titulo: 'Lanzar Campaña',
    color: '#10b981',
    tareas: [
      'Activá Meta Ads con los 3 copies generados por la app — empezá con presupuesto de $5–15/día',
      'Subí contenido orgánico en Instagram: datos de mercado, antes/después, proceso de obra',
      'Hacé WhatsApp outreach manual a los 20–30 prospectos de tu lista usando el opener generado',
      'Publicá en grupos de Facebook relevantes (Airbnb CR, Inversiones Inmobiliarias CR)',
      'Mandá 5–10 emails de prospección a potenciales clientes identificados en directorios',
    ],
  },
  {
    semana: 'Semana 4',
    titulo: 'Seguimiento y Optimización',
    color: '#f59e0b',
    tareas: [
      'Revisá métricas de Meta Ads: CPC, CTR, conversiones — pausá lo que no funcione',
      'Hacé seguimiento a todos los leads capturados: al menos 2 toques por lead',
      'Agenda 3–5 reuniones o videollamadas con prospectos calientes',
      'Ajustá el copy según feedback de los primeros contactos reales',
      'Decidí si escalar presupuesto en el canal que mejor funcionó',
    ],
  },
]

export default function EjecutivoPage({ cantones }: Props) {
  const top5 = cantones.slice(0, 5)

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Recomendación Ejecutiva"
        subtitle="Los 5 mejores cantones para atacar ahora y un plan de acción de 30 días"
        badge="Estrategia Ejecutiva"
      />

      {/* Top 5 */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne', marginBottom: 4 }}>
          🏆 Los 5 Mejores Cantones para Atacar Ahora
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Basado en el Opportunity Score combinado de volumen, crecimiento, valor declarado y nicho
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {top5.map((c, i) => {
            const est = getEstrategia(c)
            const yoyPos = (c.yoy_m2_pct ?? 0) > 0
            const rank = ['🥇', '🥈', '🥉', '④', '⑤'][i]
            return (
              <div key={`${c.provincia}-${c.canton}`} className="card" style={{ padding: '22px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>{rank}</span>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Syne' }}>{c.canton}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.provincia}</div>
                      </div>
                      <ScoreBadge score={c.opportunityScore} />
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {c.nicho_tags.slice(0, 3).map(t => <PillTag key={t.label} label={t.label} color={t.color} bg={t.bg} />)}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                      {[
                        { label: 'm² 2025', value: c.m2_2025 ? `${(c.m2_2025 / 1000).toFixed(0)}k` : '—' },
                        { label: 'Crecimiento', value: c.yoy_m2_pct != null ? `${yoyPos ? '+' : ''}${(c.yoy_m2_pct * 100).toFixed(1)}%` : '—', color: yoyPos ? '#34d399' : '#f87171' },
                        { label: 'Obras 2025', value: c.obras_2025?.toString() ?? '—' },
                        { label: 'Val. Decl./m² ⚠', value: `$${(colones_to_usd(c.colones_por_m2_2025) ?? 0).toFixed(0)}`, color: '#f59e0b' },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono', color: item.color || 'var(--text-primary)', marginTop: 4 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 4 }}>Cliente ideal</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{c.clienteIdeal}</div>
                      </div>
                      <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 4 }}>Servicio</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{est.servicio}</div>
                      </div>
                      <div style={{ background: 'rgba(245,158,11,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 4 }}>Canal principal</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{est.canal}</div>
                      </div>
                    </div>

                    {/* Why */}
                    <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid rgba(16,185,129,0.4)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>¿Por qué atacar {c.canton}?</strong>{' '}
                        {c.yoy_m2_pct != null && (c.yoy_m2_pct * 100) > 10
                          ? `La construcción creció ${(c.yoy_m2_pct * 100).toFixed(0)}% interanual — señal clara de mercado activo. `
                          : `Registra ${(c.m2_2025 ?? 0 / 1000).toFixed(0)}k m² de construcción, uno de los cantones más activos. `}
                        {c.nichoSugerido.includes('Turístico / Vacacional')
                          ? 'Es una zona turística con alta demanda de casas vacacionales y proyectos Airbnb. '
                          : c.nichoSugerido.includes('Nicho Premium')
                          ? `El valor declarado de $${(colones_to_usd(c.colones_por_m2_2025) ?? 0).toFixed(0)}/m² indica mercado premium con clientes de alto ticket. `
                          : c.nichoSugerido.includes('Mercado Emergente')
                          ? 'Es un mercado emergente con oportunidad de posicionarse antes que la competencia se densifique. '
                          : 'Combina volumen de obras y valor de mercado que lo hace atractivo para servicios de arquitectura. '}
                        El tipo de cliente ideal es <strong style={{ color: 'var(--text-primary)' }}>{c.clienteIdeal}</strong>. Empezá con <strong style={{ color: 'var(--accent-green)' }}>{est.canal.split('+')[0].trim()}</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 30-day plan */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Syne', marginBottom: 4 }}>
          📅 Plan de Acción de 30 Días
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Tácticas concretas para pasar de datos a clientes reales
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {PLAN_30.map(week => (
            <div key={week.semana} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${week.color}18`, border: `1px solid ${week.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: week.color, fontFamily: 'DM Mono',
                }}>
                  S{week.semana.split(' ')[1]}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: week.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{week.semana}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{week.titulo}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {week.tareas.map((t, i) => (
                  <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ marginTop: 3, accentColor: week.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final note */}
      <div style={{ marginTop: 28, padding: '18px 20px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <strong style={{ color: 'var(--accent-green)' }}>💡 Recordá:</strong>{' '}
        Esta app es tu brújula estratégica. Los datos del INEC te dicen <em>dónde</em> hay mercado.
        Tu portafolio, tu red y tu presencia digital te dicen <em>cómo</em> capturarlo.
        La clave es enfoque: elegí 1–2 nichos y 2–3 cantones, y ejecutá con consistencia durante 60–90 días antes de diversificar.
        Los mejores clientes llegan de la combinación de datos + conversación real + contenido auténtico.
      </div>
    </div>
  )
}
