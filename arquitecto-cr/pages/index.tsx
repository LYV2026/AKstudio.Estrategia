// pages/index.tsx
// ArqIntel CR — Plataforma de Inteligencia de Mercado para Arquitectos en Costa Rica
// Datos: INEC CR 2024–2025 (oficiales) + métricas derivadas marcadas

import React, { useState, useMemo } from 'react'
import { NavPage, CantonData, ScoreWeights } from '../types'
import { INEC_DATA } from '../data/inec_embedded'
import { calculateScores, DEFAULT_WEIGHTS } from '../lib/scoring'
import { getWeights } from '../lib/store'
import Layout from '../components/Layout'
import DashboardPage from '../components/DashboardPage'
import NichosPage from '../components/NichosPage'
import ScorePage from '../components/ScorePage'
import EstrategiaPage from '../components/EstrategiaPage'
import CampanasPage from '../components/CampanasPage'
import ProspectosPage from '../components/ProspectosPage'
import EjecutivoPage from '../components/EjecutivoPage'

export default function Home() {
  const [activePage, setActivePage] = useState<NavPage>('ejecutivo')
  const [weights, setWeights] = useState<ScoreWeights>(() => {
    if (typeof window !== 'undefined') return getWeights()
    return DEFAULT_WEIGHTS
  })

  // Load data from embedded INEC
  const rawCantones: CantonData[] = useMemo(() => {
    return (INEC_DATA.ranking_cantones_m2 as any[]).map((d: any) => ({
      rank: d.rank,
      provincia: d.provincia,
      canton: d.canton,
      m2_2024: d.m2_2024,
      m2_2025: d.m2_2025,
      delta_m2: d.delta_m2,
      yoy_m2_pct: d.yoy_m2_pct,
      obras_2024: d.obras_2024,
      obras_2025: d.obras_2025,
      valor_miles_2024: d.valor_miles_2024,
      valor_miles_2025: d.valor_miles_2025,
      valor_2025: d.valor_2025,
      colones_por_m2_2025: d.colones_por_m2_2025,
      participacion_m2_2025: d.participacion_m2_2025,
    }))
  }, [])

  // Scored cantones — recalculates when weights change
  const scoredCantones = useMemo(() => calculateScores(rawCantones, weights), [rawCantones, weights])

  const provincias = useMemo(() => {
    return (INEC_DATA.ranking_provincias_m2 as any[]).map((d: any) => ({
      rank: d.rank, provincia: d.provincia,
      m2_2024: d.m2_2024, m2_2025: d.m2_2025,
      delta_m2: d.delta_m2, yoy_m2_pct: d.yoy_m2_pct,
      obras_2024: d.obras_2024, obras_2025: d.obras_2025,
      valor_miles_2024: d.valor_miles_2024, valor_miles_2025: d.valor_miles_2025,
      valor_2025: d.valor_2025, colones_por_m2_2025: d.colones_por_m2_2025,
      participacion_m2_2025: d.participacion_m2_2025,
    }))
  }, [])

  const destinos = useMemo(() => {
    return (INEC_DATA.ranking_destino_obra_2025 as any[]).map((d: any) => ({
      orden_area_m2: d.orden_area_m2, nivel: d.nivel,
      destino_grupo: d.destino_grupo, destino_detalle: d.destino_detalle,
      tipo_obra: d.tipo_obra, obras: d.obras, m2: d.m2,
      valor_miles: d.valor_miles, valor: d.valor,
      colones_por_m2: d.colones_por_m2, participacion_m2: d.participacion_m2,
    }))
  }, [])

  const provDest = useMemo(() => INEC_DATA.td_area_prov_dest_2025 as any[], [])

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage cantones={rawCantones} provincias={provincias} destinos={destinos} provDest={provDest} />
      case 'nichos':
        return <NichosPage cantones={scoredCantones} />
      case 'score':
        return <ScorePage cantones={scoredCantones} weights={weights} onWeightsChange={w => setWeights(w)} />
      case 'estrategia':
        return <EstrategiaPage cantones={scoredCantones} />
      case 'campanas':
        return <CampanasPage cantones={scoredCantones} />
      case 'prospectos':
        return <ProspectosPage />
      case 'ejecutivo':
        return <EjecutivoPage cantones={scoredCantones} />
      default:
        return <EjecutivoPage cantones={scoredCantones} />
    }
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </Layout>
  )
}
