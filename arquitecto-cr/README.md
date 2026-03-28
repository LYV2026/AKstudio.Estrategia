# ArqIntel CR — Plataforma de Inteligencia de Mercado para Arquitectos

Herramienta de análisis de mercado de construcción en Costa Rica basada en datos oficiales del INEC (2024–2025).

## Características

- 📊 Dashboard con KPIs, rankings y gráficos de mercado
- 🔍 Detector automático de nichos (premium, turístico, emergente, etc.)
- 🏆 Opportunity Score configurable (0–100) con pesos ajustables
- 🎯 Recomendador de estrategia de marketing por cantón
- 📢 Campaign Studio: generador de campañas Meta Ads, Google Ads y contenido orgánico
- 👥 Gestión de prospectos con CRM básico
- 📋 Recomendación ejecutiva top 5 + Plan de acción 30 días
- 📤 Exportación a CSV

## Tecnologías

- **Next.js 14** con TypeScript
- **Tailwind CSS**
- **Recharts** para visualizaciones
- **PapaParse** para importar CSV de prospectos
- **localStorage** para persistencia de leads y campañas
- Datos INEC embebidos en la app (no requiere backend)

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en modo desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000
```

## Despliegue en Netlify

### Opción A: Netlify UI (recomendada)

1. Subí el código a un repositorio GitHub
2. Entrá a [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project"
3. Seleccioná tu repositorio
4. Configurá:
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
5. Hacé click en "Deploy site"

### Opción B: Netlify CLI

```bash
# Instalar CLI
npm install -g netlify-cli

# Build
npm run build

# Desplegar
netlify deploy --prod --dir=out
```

## Estructura del proyecto

```
arquitecto-cr/
├── components/
│   ├── Layout.tsx          # Sidebar, PageHeader, KPICard, etc.
│   ├── DashboardPage.tsx   # Dashboard general con KPIs y gráficos
│   ├── NichosPage.tsx      # Detector de nichos
│   ├── ScorePage.tsx       # Opportunity Score con pesos configurables
│   ├── EstrategiaPage.tsx  # Recomendador de estrategia
│   ├── CampanasPage.tsx    # Campaign Studio
│   ├── ProspectosPage.tsx  # Gestión de leads + fuentes
│   └── EjecutivoPage.tsx   # Top 5 + Plan 30 días
├── data/
│   └── inec_embedded.ts    # Datos INEC 2024–2025 (oficiales)
├── lib/
│   ├── scoring.ts          # Motor de scoring y detección de nichos
│   ├── campaigns.ts        # Generador de campañas de marketing
│   └── store.ts            # Persistencia en localStorage
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx           # Entry point principal
├── styles/
│   └── globals.css         # Estilos globales (dark theme)
├── types/
│   └── index.ts            # TypeScript types
├── next.config.js          # Configurado para export estático
├── netlify.toml            # Config de Netlify
└── tailwind.config.js
```

## Nota metodológica sobre los datos

Los datos de **m²**, **número de obras** y **crecimiento interanual** son datos oficiales directos del INEC CR.

La métrica **"valor declarado por m²"** (marcada con ⚠ en la UI) es DERIVADA: se calcula dividiendo el valor declarado en los permisos de construcción entre el área. Este valor **no equivale al precio de mercado real** — es el valor declarado por el solicitante del permiso. Se usa como referencia relativa entre cantones, no como precio absoluto.

## Fuentes de datos

- [INEC CR — Estadísticas de Construcción 2024](https://admin.inec.cr/sites/default/files/2025-11/reCONSTRU-DEOBRA-anual2024.xlsx)
- [INEC CR — Estadísticas de Construcción 2025 (Preliminar)](https://admin.inec.cr/sites/default/files/2026-03/reCONSTRU-VARIOS-anual2025-Preliminar_0.xlsx)

## Licencia

Proyecto privado para uso del arquitecto titular. Datos INEC bajo uso permitido por política de datos abiertos del INEC CR.
