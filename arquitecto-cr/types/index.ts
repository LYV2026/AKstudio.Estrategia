// Core data types from INEC

export interface CantonData {
  rank?: number
  provincia: string
  canton: string
  m2_2024?: number | null
  m2_2025?: number | null
  delta_m2?: number | null
  yoy_m2_pct?: number | null
  obras_2024?: number | null
  obras_2025?: number | null
  valor_miles_2024?: number | null
  valor_miles_2025?: number | null
  valor_2025?: number | null
  colones_por_m2_2025?: number | null
  participacion_m2_2025?: number | null
}

export interface ProvinciaData {
  rank?: number
  provincia: string
  m2_2024?: number | null
  m2_2025?: number | null
  delta_m2?: number | null
  yoy_m2_pct?: number | null
  obras_2024?: number | null
  obras_2025?: number | null
  valor_miles_2024?: number | null
  valor_miles_2025?: number | null
  valor_2025?: number | null
  colones_por_m2_2025?: number | null
  participacion_m2_2025?: number | null
}

export interface DestinoObraData {
  orden_area_m2?: number
  nivel?: string
  destino_grupo?: string
  destino_detalle?: string | null
  tipo_obra?: string
  obras?: number
  m2?: number
  valor_miles?: number
  valor?: number
  colones_por_m2?: number
  participacion_m2?: number
}

export interface PermisoClaseData {
  rank_valor_2025?: number
  permiso_tipo?: string
  clase_obra?: string
  obras?: number
  m2?: number
  valor_miles?: number
  valor?: number
  colones_por_m2?: number
}

export interface ProvDestData {
  provincia: string
  'Total provincia'?: number | null
  Viviendas?: number | null
  Comercio?: number | null
  Industria?: number | null
  Servicios?: number | null
  Agropecuario?: number | null
  'Otras obras'?: number | null
}

// Calculated / enriched types

export interface NichoTag {
  label: string
  color: string
  bg: string
}

export interface CantonNicho extends CantonData {
  opportunityScore: number
  nichoSugerido: string[]
  clienteIdeal: string
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
  nicho_tags: NichoTag[]
  etiquetas: string[]
  tipoObraDominante: string
}

export interface ScoreWeights {
  volumen: number       // m2
  crecimiento: number   // yoy%
  valorM2: number       // colones/m2
  numObras: number      // obras_2025
  nichoTipo: number     // bonus by nicho
}

export interface Lead {
  id: string
  nombre: string
  empresa?: string
  tipoLead: string
  ubicacion: string
  fuente: string
  telefono?: string
  email?: string
  instagram?: string
  etapa: string
  notas?: string
  nicho?: string
  createdAt: string
}

export interface Campaign {
  id: string
  provincia: string
  canton: string
  nicho: string
  tipoCliente: string
  tono: string
  headline: string
  subtitulo: string
  propuestaValor: string
  metaAds: string[]
  googleAds: string[]
  contenidoOrganico: string[]
  leadMagnet: string
  cta: string
  whatsappOpener: string
  createdAt: string
}

export interface FilterState {
  provincia: string
  canton: string
  destino: string
  yearFilter: string
  minM2: number
  maxM2: number
  minValorM2: number
  maxValorM2: number
}

export type NavPage = 'dashboard' | 'nichos' | 'score' | 'estrategia' | 'campanas' | 'prospectos' | 'ejecutivo'
