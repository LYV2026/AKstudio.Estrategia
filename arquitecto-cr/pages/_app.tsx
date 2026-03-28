import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>ArqIntel CR — Inteligencia de Mercado en Construcción</title>
        <meta name="description" content="Plataforma de análisis de mercado para arquitectos en Costa Rica. Datos INEC, detección de nichos y campañas de marketing." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
