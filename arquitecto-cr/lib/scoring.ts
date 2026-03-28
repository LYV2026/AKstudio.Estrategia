// lib/scoring.ts
// Motor de cálculo de Opportunity Score y detección de nichos

import { CantonData, CantonNicho, NichoTag, ScoreWeights } from '../types'

export const DEFAULT_WEIGHTS: ScoreWeights = {
  volumen: 0.35,
  crecimiento: 0.25,
  valorM2: 0.20,
  numObras: 0.10,
  nichoTipo: 0.10,
}

// Normaliza un valor entre 0–100 dado min y max del dataset
function normalize(value: number | null | undefined, min: number, max: number): number {
  if (value == null || max === min) return 0
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

// Convierte colones a USD aproximado (tasa ~520 CRC/USD)
export const CRC_TO_USD = 520

export function colones_to_usd(colones: number | null | undefined): number | null {
  if (colones == null) return null
  return colones / CRC_TO_USD
}

export function fmt_usd(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function fmt_crc(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1e9) return `₡${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `₡${(n / 1e6).toFixed(1)}M`
  return `₡${n?.toFixed(0)}`
}

export function fmt_pct(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${(n * 100).toFixed(1)}%`
}

export function fmt_num(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('es-CR')
}

// Detecta nichos para un cantón
export function detectNichos(canton: CantonData): { tags: string[], cliente: string, tipoObra: string } {
  const yoy = canton.yoy_m2_pct ?? 0
  const m2 = canton.m2_2025 ?? 0
  const cpm2 = canton.colones_por_m2_2025 ?? 0
  const obras = canton.obras_2025 ?? 0
  const prov = canton.provincia

  const tags: string[] = []
  let cliente = 'Propietario privado'
  let tipoObra = 'Mixto'

  // Detección por valor por m2 (alto ticket) - umbral ~400k CRC/m2
  if (cpm2 > 450000) {
    tags.push('Nicho Premium')
    cliente = 'Inversionista / Comprador premium'
    tipoObra = 'Apartamentos / Diseño'
  }

  // Crecimiento acelerado (>40%)
  if (yoy > 0.40) {
    tags.push('Crecimiento Acelerado')
    tipoObra = 'Casas / Residencial'
  }

  // Mercado emergente (crecimiento significativo en zona pequeña)
  if (yoy > 0.20 && m2 < 50000 && obras < 400) {
    tags.push('Mercado Emergente')
    cliente = 'Dueño de lote / Pequeño promotor'
  }

  // Volumen masivo residencial (>150k m2)
  if (m2 > 150000) {
    tags.push('Volumen Masivo Residencial')
    cliente = 'Familia / Promotor medio'
    tipoObra = 'Casas'
  }

  // Turístico / vacacional (Guanacaste y zonas costeras)
  const zonasT = ['Santa Cruz', 'Carrillo', 'Nicoya', 'Liberia', 'Quepos', 'Garabito', 'Osa', 'Golfito', 'Puerto Jiménez', 'Parrita', 'Monteverde']
  if (prov === 'Guanacaste' || zonasT.includes(canton.canton)) {
    tags.push('Turístico / Vacacional')
    cliente = 'Inversionista Airbnb / Segunda residencia'
    tipoObra = 'Casas vacacionales / Cabinas'
  }

  // Alto ticket y alta participación → alta competencia probable
  if (cpm2 > 350000 && m2 > 80000) {
    tags.push('Alta Competencia Probable')
  }

  // Comercial (San José centro y zonas de servicio)
  const zonasCom = ['San José', 'Escazú', 'Curridabat', 'Montes de Oca', 'Tibás', 'Goicoechea']
  if (zonasCom.includes(canton.canton)) {
    tags.push('Comercial / Servicios')
    cliente = 'Empresario / Desarrollador comercial'
    tipoObra = 'Local comercial / Oficina'
  }

  // Remodelación (caída de m2 pero obras estables)
  if ((canton.yoy_m2_pct ?? 0) < -0.10 && obras > 200) {
    tags.push('Remodelación / Ampliación')
    cliente = 'Propietario existente'
    tipoObra = 'Remodelación'
  }

  // Oportunidad especulativa (alta volatilidad)
  if (Math.abs(yoy) > 1.0) {
    tags.push('Oportunidad Especulativa')
  }

  if (tags.length === 0) {
    tags.push('Volumen Estable')
    cliente = 'Propietario privado / Familia'
  }

  return { tags, cliente, tipoObra }
}

// Etiqueta de mercado según métricas
export function getMarketLabel(canton: CantonData): string {
  const yoy = canton.yoy_m2_pct ?? 0
  const cpm2 = canton.colones_por_m2_2025 ?? 0
  const m2 = canton.m2_2025 ?? 0

  if (cpm2 > 450000) return 'Alta Rentabilidad'
  if (yoy > 1.0) return 'Oportunidad Especulativa'
  if (yoy > 0.30) return 'Mercado Emergente'
  if (m2 > 200000) return 'Volumen Estable'
  if (cpm2 > 380000) return 'Nicho Premium'
  if (yoy < -0.2) return 'Mercado en Contracción'
  return 'Mercado Activo'
}

export function getPrioridad(score: number): 'ALTA' | 'MEDIA' | 'BAJA' {
  if (score >= 65) return 'ALTA'
  if (score >= 40) return 'MEDIA'
  return 'BAJA'
}

export function getNichoTags(tags: string[]): NichoTag[] {
  const colorMap: Record<string, { color: string; bg: string }> = {
    'Nicho Premium': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    'Crecimiento Acelerado': { color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
    'Mercado Emergente': { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
    'Volumen Masivo Residencial': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    'Turístico / Vacacional': { color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
    'Alta Competencia Probable': { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    'Comercial / Servicios': { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
    'Remodelación / Ampliación': { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
    'Oportunidad Especulativa': { color: '#e879f9', bg: 'rgba(232,121,249,0.12)' },
    'Volumen Estable': { color: '#6ee7b7', bg: 'rgba(110,231,183,0.12)' },
    'Alta Rentabilidad': { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  }
  return tags.map(t => ({ label: t, ...(colorMap[t] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }) }))
}

// Calcula bonus de nicho (0-1)
function getNichoBonus(tags: string[]): number {
  const bonusMap: Record<string, number> = {
    'Nicho Premium': 1.0,
    'Turístico / Vacacional': 0.9,
    'Crecimiento Acelerado': 0.8,
    'Comercial / Servicios': 0.7,
    'Mercado Emergente': 0.75,
    'Volumen Masivo Residencial': 0.6,
    'Alta Rentabilidad': 0.95,
  }
  let best = 0
  for (const t of tags) {
    if (bonusMap[t] !== undefined && bonusMap[t] > best) best = bonusMap[t]
  }
  return best
}

export function calculateScores(cantones: CantonData[], weights: ScoreWeights): CantonNicho[] {
  // Filter to valid rows
  const valid = cantones.filter(c => c.canton && c.m2_2025 != null)

  // Compute stats for normalization
  const m2Values = valid.map(c => c.m2_2025 ?? 0)
  const yoyValues = valid.filter(c => c.yoy_m2_pct != null).map(c => c.yoy_m2_pct ?? 0)
  const cpm2Values = valid.filter(c => c.colones_por_m2_2025 != null).map(c => c.colones_por_m2_2025 ?? 0)
  const obrasValues = valid.map(c => c.obras_2025 ?? 0)

  const minM2 = Math.min(...m2Values), maxM2 = Math.max(...m2Values)
  const minYoy = Math.min(...yoyValues), maxYoy = Math.max(...yoyValues)
  const minCpm2 = Math.min(...cpm2Values), maxCpm2 = Math.max(...cpm2Values)
  const minObras = Math.min(...obrasValues), maxObras = Math.max(...obrasValues)

  return valid.map(c => {
    const { tags, cliente, tipoObra } = detectNichos(c)
    const nichoBonus = getNichoBonus(tags)

    const normM2 = normalize(c.m2_2025, minM2, maxM2)
    const normYoy = normalize(c.yoy_m2_pct, minYoy, maxYoy)
    const normCpm2 = normalize(c.colones_por_m2_2025, minCpm2, maxCpm2)
    const normObras = normalize(c.obras_2025, minObras, maxObras)
    const normNicho = nichoBonus * 100

    const score = Math.round(
      normM2 * weights.volumen +
      normYoy * weights.crecimiento +
      normCpm2 * weights.valorM2 +
      normObras * weights.numObras +
      normNicho * weights.nichoTipo
    )

    return {
      ...c,
      opportunityScore: Math.min(100, Math.max(0, score)),
      nichoSugerido: tags,
      clienteIdeal: cliente,
      prioridad: getPrioridad(score),
      nicho_tags: getNichoTags(tags),
      etiquetas: [getMarketLabel(c)],
      tipoObraDominante: tipoObra,
    }
  }).sort((a, b) => b.opportunityScore - a.opportunityScore)
}

// Estrategia de marketing por nicho
export function getEstrategia(canton: CantonNicho) {
  const prov = canton.provincia
  const cant = canton.canton
  const cpm2 = canton.colones_por_m2_2025 ?? 0
  const yoy = canton.yoy_m2_pct ?? 0
  const tags = canton.nichoSugerido

  let servicio = 'Diseño arquitectónico residencial'
  let canal = 'Meta Ads + Instagram Orgánico'
  let leadMagnet = 'Guía de costos de construcción en ' + cant
  let cta = 'Solicita tu consulta gratuita'
  let tono = 'Profesional y cercano'
  let landing = 'Landing de captura con formulario + WhatsApp'

  if (tags.includes('Nicho Premium') || tags.includes('Alta Rentabilidad')) {
    servicio = 'Arquitectura de lujo y diseño premium'
    canal = 'Google Ads + LinkedIn + Referidos'
    leadMagnet = 'Portfolio exclusivo de proyectos premium'
    cta = 'Agenda una consulta de diseño personalizada'
    tono = 'Exclusivo, aspiracional'
    landing = 'Landing de marca con galería y video'
  }

  if (tags.includes('Turístico / Vacacional')) {
    servicio = 'Diseño de casas vacacionales y Airbnb rentables'
    canal = 'Instagram + Google Ads turístico + Facebook Groups'
    leadMagnet = 'Guía: Cómo construir un Airbnb rentable en ' + (prov === 'Guanacaste' ? 'Guanacaste' : cant)
    cta = 'Calcula la rentabilidad de tu proyecto'
    tono = 'Aspiracional y orientado al ROI'
    landing = 'Landing con calculadora de rentabilidad Airbnb'
  }

  if (tags.includes('Comercial / Servicios')) {
    servicio = 'Diseño de locales comerciales y oficinas'
    canal = 'Google Ads + LinkedIn + Directorios empresariales'
    leadMagnet = 'Checklist de permisos comerciales en ' + cant
    cta = 'Solicita planos de tu local en 48h'
    tono = 'Eficiente, profesional'
    landing = 'Landing B2B con casos de éxito'
  }

  if (tags.includes('Mercado Emergente') || tags.includes('Crecimiento Acelerado')) {
    servicio = 'Diseño de casas eficientes y proyectos de primera construcción'
    canal = 'Facebook + WhatsApp + Google Local'
    leadMagnet = 'Estimador de presupuesto de construcción en ' + cant
    cta = 'Recibe tu estimado gratis en 24h'
    tono = 'Accesible, orientado al ahorro'
    landing = 'Landing con estimador de costos interactivo'
  }

  return { servicio, canal, leadMagnet, cta, tono, landing }
}

export const PROVINCIAS = ['Alajuela', 'Cartago', 'Guanacaste', 'Heredia', 'Limón', 'Puntarenas', 'San José']

export const TIPOS_CLIENTE = [
  'Inversionista Airbnb',
  'Dueño de lote',
  'Desarrollador pequeño',
  'Comerciante / Empresario',
  'Familia que quiere construir',
  'Comprador de segunda residencia',
  'Promotor inmobiliario',
  'Propietario que quiere remodelar',
]

export const TONOS_MARCA = [
  'Profesional y cercano',
  'Exclusivo y aspiracional',
  'Orientado al ROI',
  'Accesible y práctico',
  'Innovador y moderno',
]

export const FUENTES_PROSPECCION: Record<string, string[]> = {
  'Nicho Premium': [
    'LinkedIn (buscar: inversionistas inmobiliarios CR)',
    'Instagram (hashtags: #inmobiliariaCR #proyectosCR)',
    'Directorios de cámaras empresariales',
    'Portales: CRPropiedad, Encuentra24',
    'Grupos Facebook: "Inversiones Inmobiliarias CR"',
    'Referidos de notarios y abogados',
  ],
  'Turístico / Vacacional': [
    'Grupos Facebook: "Airbnb Costa Rica Hosts"',
    'Instagram: dueños de propiedades vacacionales',
    'Portales: Airbnb Community, VRBO owners',
    'Cámara de Turismo de Guanacaste',
    'Grupos de expats CR (Facebook)',
    'Portales inmobiliarios con lotes en zonas costeras',
  ],
  'default': [
    'Google Maps: buscar desarrolladores en ' ,
    'Municipalidad: registros de permisos públicos',
    'Grupos Facebook locales de construcción',
    'Cámara Costarricense de la Construcción',
    'Portales: Encuentra24, CRPropiedad',
    'WhatsApp: grupos de ferretería y materiales',
  ],
}
