// lib/campaigns.ts
// Generador de campañas de marketing basado en datos INEC

import { CantonNicho } from '../types'
import { fmt_pct, fmt_num, colones_to_usd, fmt_usd } from './scoring'

interface CampaignInput {
  canton: CantonNicho
  nicho: string
  tipoCliente: string
  tono: string
}

export interface GeneratedCampaign {
  headline: string
  subtitulo: string
  propuestaValor: string
  metaAds: string[]
  googleAds: string[]
  contenidoOrganico: string[]
  leadMagnet: string
  cta: string
  whatsappOpener: string
}

function pct(n: number | null | undefined): string {
  if (n == null) return 'significativo'
  const v = n * 100
  if (v > 0) return `+${v.toFixed(0)}%`
  return `${v.toFixed(0)}%`
}

function usdm2(n: number | null | undefined): string {
  const u = colones_to_usd(n)
  if (u == null) return 'alto valor'
  return `~$${u.toFixed(0)}/m²`
}

export function generateCampaign(input: CampaignInput): GeneratedCampaign {
  const { canton, nicho, tipoCliente, tono } = input
  const cant = canton.canton
  const prov = canton.provincia
  const yoy = pct(canton.yoy_m2_pct)
  const m2total = fmt_num(canton.m2_2025)
  const valm2 = usdm2(canton.colones_por_m2_2025)
  const obras = fmt_num(canton.obras_2025)

  // --- PREMIUM / LUJO ---
  if (nicho === 'Nicho Premium' || tono === 'Exclusivo y aspiracional') {
    return {
      headline: `Arquitectura de lujo en ${cant}: donde el diseño tiene valor real`,
      subtitulo: `Con ${valm2} de valor declarado por m², ${cant} es uno de los mercados más exigentes de ${prov}. Tu próximo proyecto merece un arquitecto a la altura.`,
      propuestaValor: `Diseñamos espacios que maximizan el valor de tu inversión en ${cant}, con materiales de primer nivel, permisos ágiles y acompañamiento completo.`,
      metaAds: [
        `🏛️ ${cant} registra ${valm2} por m² en construcción. Si vas a invertir, que sea con diseño que lo respalde. Hablemos. [Ver portafolio →]`,
        `¿Construyendo en ${cant}? El mercado premium de ${prov} exige proyectos bien pensados. Nosotros los diseñamos. [Consulta gratuita →]`,
        `${m2total} m² de construcción en ${cant} en 2025. Los proyectos más rentables empiezan con el arquitecto correcto. ¿Cuándo hablamos?`,
      ],
      googleAds: [
        `Arquitecto en ${cant} | Proyectos premium | Diseño y permisos incluidos`,
        `Construcción de lujo ${prov} | Arquitecto certificado | Consulta sin costo`,
        `Diseño arquitectónico ${cant} | Proyectos residenciales premium | Contáctanos`,
      ],
      contenidoOrganico: [
        `"3 errores costosos antes de construir en ${cant}" — Post educativo con datos reales del mercado`,
        `Recorrido de proyecto terminado en ${cant}: desde el plano hasta la entrega — Reel de Instagram`,
        `¿Por qué ${cant} es uno de los mejores cantones para invertir en construcción? — Carrusel con datos INEC`,
      ],
      leadMagnet: `Guía PDF: "Cómo maximizar el valor de tu proyecto en ${cant}" con análisis de mercado real`,
      cta: `Agenda tu consulta de diseño personalizada — sin costo`,
      whatsappOpener: `Hola, estoy interesado en construir un proyecto en ${cant}. Vi que tienen experiencia en proyectos premium en ${prov}. ¿Podríamos hablar sobre mi idea?`,
    }
  }

  // --- TURÍSTICO / AIRBNB ---
  if (nicho === 'Turístico / Vacacional') {
    return {
      headline: `Construye tu Airbnb en ${cant} y hazlo rentar desde el primer año`,
      subtitulo: `La construcción en ${cant} creció ${yoy} en 2025. Los inversionistas están llegando — ¿ya tienes tu arquitecto?`,
      propuestaValor: `Diseñamos casas vacacionales en ${cant} pensadas para rentar: acceso perfecto, distribución atractiva para huéspedes y materiales de bajo mantenimiento.`,
      metaAds: [
        `🌴 ¿Tienes un lote en ${cant}? La construcción creció ${yoy} este año. Te diseñamos una casa vacacional lista para Airbnb. [Ver ejemplos →]`,
        `El turismo en ${prov === 'Guanacaste' ? 'Guanacaste' : cant} no para. Y los Airbnb bien diseñados se llenan solos. Nosotros hacemos el plano, los permisos y el diseño. [Hablemos →]`,
        `Proyectos para rentar en ${cant}: ${obras} obras nuevas en 2025. Sé parte del mercado con un diseño que destaque en Airbnb. [Consulta →]`,
      ],
      googleAds: [
        `Arquitecto para Airbnb ${cant} | Diseño + permisos | Empieza ya`,
        `Casa vacacional ${prov} | Diseño para rentar | Arquitecto certificado CR`,
        `Construir Airbnb ${cant} Costa Rica | Planos y permisos | Consulta gratis`,
      ],
      contenidoOrganico: [
        `"¿Cuánto puedes ganar con un Airbnb en ${cant}?" — Carrusel con estimados de mercado`,
        `Proceso completo: de lote a Airbnb listo en ${cant} — Reel de proyecto real`,
        `5 características que hacen que un Airbnb en ${prov === 'Guanacaste' ? 'Guanacaste' : cant} se llene siempre — Post educativo`,
      ],
      leadMagnet: `Guía PDF: "Cómo construir un Airbnb rentable en ${cant}" — con checklist de permisos y estimado de costos`,
      cta: `Calcula la rentabilidad de tu proyecto vacacional — gratis`,
      whatsappOpener: `Hola, tengo un lote en ${cant} y quiero construir algo para rentar por Airbnb. Vi que tienen experiencia en proyectos vacacionales en la zona. ¿Me pueden asesorar?`,
    }
  }

  // --- COMERCIAL ---
  if (nicho === 'Comercial / Servicios') {
    return {
      headline: `Diseñamos tu local o edificio comercial en ${cant} — rápido y con permisos`,
      subtitulo: `${cant} concentra uno de los mercados más activos de ${prov} con ${obras} proyectos nuevos en 2025. Tu negocio necesita el espacio correcto.`,
      propuestaValor: `Somos arquitectos especializados en proyectos comerciales en ${prov}. Diseño funcional, permisos municipales y gestión completa para que abras a tiempo.`,
      metaAds: [
        `🏢 ¿Vas a abrir o remodelar un local en ${cant}? Somos arquitectos con experiencia en permisos comerciales en ${prov}. [Solicita planos →]`,
        `El sector comercial en ${cant} registró ${yoy} de cambio en 2025. Buena señal para tu negocio. Nosotros hacemos el diseño y los permisos. [Hablemos →]`,
        `Diseño de locales y oficinas en ${cant}: funcionalidad + estética + permisos incluidos. Todo con un solo contacto. [Consulta gratis →]`,
      ],
      googleAds: [
        `Arquitecto comercial ${cant} | Planos y permisos | Entrega rápida`,
        `Diseño de locales ${prov} | Arquitecto certificado | Sin complicaciones`,
        `Remodelación comercial ${cant} | Permisos municipales incluidos | Contáctanos`,
      ],
      contenidoOrganico: [
        `"Checklist: lo que necesitás antes de remodelar tu local en ${cant}" — Post educativo`,
        `Proceso de permiso comercial en ${prov}: ¿cuánto tarda y qué documentos necesitás? — Video corto`,
        `Antes y después: local comercial rediseñado en ${cant} — Carrusel de fotos`,
      ],
      leadMagnet: `Checklist PDF: "Requisitos para permiso comercial en ${cant}" — ahorra tiempo y evita rechazos`,
      cta: `Solicita los planos de tu local — entrega en 48h`,
      whatsappOpener: `Hola, quiero remodelar o construir un local comercial en ${cant}. ¿Pueden ayudarme con los planos y los permisos? ¿Cuánto tiempo tarda normalmente?`,
    }
  }

  // --- CRECIMIENTO / EMERGENTE ---
  if (nicho === 'Crecimiento Acelerado' || nicho === 'Mercado Emergente') {
    return {
      headline: `${cant} está creciendo ${yoy} — ¿ya tenés tu arquitecto?`,
      subtitulo: `Con ${obras} nuevas obras en 2025, ${cant} es una zona en expansión. Los que actúan primero consiguen los mejores lotes y los mejores proyectos.`,
      propuestaValor: `Te acompañamos desde la selección del lote hasta la entrega de llaves en ${cant}. Diseño eficiente, permisos gestionados y costos transparentes.`,
      metaAds: [
        `📈 ${cant} creció ${yoy} en construcción en 2025. Si tenés un lote o estás buscando uno, este es el momento de diseñar tu casa. [Hablemos →]`,
        `${obras} nuevas obras en ${cant} este año. El mercado está activo. ¿Ya tenés los planos de tu proyecto? Nosotros los hacemos. [Solicita tu estimado →]`,
        `Construir en ${cant} nunca fue tan conveniente. Te diseñamos tu casa con presupuesto claro y acompañamiento completo. [Consulta gratis →]`,
      ],
      googleAds: [
        `Construir casa en ${cant} | Arquitecto + permisos | Estimado gratis`,
        `Planos de casa ${cant} Costa Rica | Arquitecto certificado | Sin complicaciones`,
        `Diseño de vivienda ${prov} | Presupuesto claro | Contáctanos hoy`,
      ],
      contenidoOrganico: [
        `"¿Cuánto cuesta construir una casa en ${cant} en 2025?" — Post con datos reales INEC`,
        `De lote vacío a casa terminada en ${cant}: así es el proceso paso a paso — Carrusel`,
        `5 razones para construir en ${cant} este año — Video corto o Reel`,
      ],
      leadMagnet: `Estimador gratuito de presupuesto de construcción en ${cant} — descargalo y calculá tu proyecto`,
      cta: `Recibí tu estimado de presupuesto gratis en 24h`,
      whatsappOpener: `Hola, tengo un lote en ${cant} y quiero saber cuánto me costaría construir una casa de 3 habitaciones. ¿Me pueden dar un estimado?`,
    }
  }

  // --- DEFAULT: Residencial general ---
  return {
    headline: `Tu proyecto de construcción en ${cant} empieza con el arquitecto correcto`,
    subtitulo: `${cant} registró ${m2total} m² de construcción en 2025 con ${obras} obras nuevas. El mercado está activo y nosotros conocemos la zona.`,
    propuestaValor: `Diseñamos y gestionamos tu proyecto en ${cant} de principio a fin: planos, permisos, materiales y dirección técnica. Transparente, eficiente y sin sorpresas.`,
    metaAds: [
      `🏗️ ${obras} proyectos nuevos en ${cant} en 2025. Si estás pensando en construir, es el momento. Te ayudamos desde el primer plano. [Consulta gratis →]`,
      `Construir en ${cant}: ${valm2} de valor declarado por m². Con un buen diseño, tu inversión se multiplica. Hablemos. [Ver portafolio →]`,
      `De idea a proyecto en ${cant}: nosotros hacemos los planos, gestionamos los permisos y coordinamos la obra. Todo con un solo contacto. [Empezar →]`,
    ],
    googleAds: [
      `Arquitecto en ${cant} | Diseño + permisos | Consulta sin costo`,
      `Planos de construcción ${prov} | Arquitecto certificado CR | Empieza hoy`,
      `Servicios de arquitectura ${cant} | Residencial y comercial | Contáctanos`,
    ],
    contenidoOrganico: [
      `"Guía completa para construir en ${cant} en 2025" — Blog post o carrusel de Instagram`,
      `¿Cuánto tarda un permiso de construcción en ${cant}? — Video educativo`,
      `Errores comunes al construir en ${prov} y cómo evitarlos — Post de valor`,
    ],
    leadMagnet: `Guía PDF: "Lo que necesitás saber antes de construir en ${cant}" con checklist de permisos`,
    cta: `Solicita tu consulta inicial gratuita`,
    whatsappOpener: `Hola, estoy interesado en construir en ${cant}. ¿Pueden ayudarme con los planos y los permisos? Me gustaría saber por dónde empezar.`,
  }
}
