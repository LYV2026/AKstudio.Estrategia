// lib/store.ts
// Estado global simple con localStorage

import { Lead, Campaign, ScoreWeights } from '../types'
import { DEFAULT_WEIGHTS } from './scoring'

const KEYS = {
  leads: 'arq_cr_leads',
  campaigns: 'arq_cr_campaigns',
  weights: 'arq_cr_weights',
}

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn() } catch { return fallback }
}

// LEADS
export function getLeads(): Lead[] {
  return safe(() => JSON.parse(localStorage.getItem(KEYS.leads) || '[]'), [])
}
export function saveLeads(leads: Lead[]) {
  safe(() => localStorage.setItem(KEYS.leads, JSON.stringify(leads)), undefined)
}
export function addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Lead {
  const leads = getLeads()
  const newLead: Lead = { ...lead, id: Date.now().toString(), createdAt: new Date().toISOString() }
  leads.unshift(newLead)
  saveLeads(leads)
  return newLead
}
export function deleteLead(id: string) {
  saveLeads(getLeads().filter(l => l.id !== id))
}
export function updateLead(id: string, updates: Partial<Lead>) {
  saveLeads(getLeads().map(l => l.id === id ? { ...l, ...updates } : l))
}

// CAMPAIGNS
export function getCampaigns(): Campaign[] {
  return safe(() => JSON.parse(localStorage.getItem(KEYS.campaigns) || '[]'), [])
}
export function saveCampaign(c: Campaign) {
  const campaigns = getCampaigns()
  campaigns.unshift(c)
  safe(() => localStorage.setItem(KEYS.campaigns, JSON.stringify(campaigns)), undefined)
}
export function deleteCampaign(id: string) {
  const campaigns = getCampaigns().filter(c => c.id !== id)
  safe(() => localStorage.setItem(KEYS.campaigns, JSON.stringify(campaigns)), undefined)
}

// WEIGHTS
export function getWeights(): ScoreWeights {
  return safe(() => {
    const stored = localStorage.getItem(KEYS.weights)
    return stored ? JSON.parse(stored) : DEFAULT_WEIGHTS
  }, DEFAULT_WEIGHTS)
}
export function saveWeights(w: ScoreWeights) {
  safe(() => localStorage.setItem(KEYS.weights, JSON.stringify(w)), undefined)
}

// EXPORT helpers
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(h => {
    const v = row[h]
    if (v == null) return ''
    const s = String(v)
    return s.includes(',') ? `"${s}"` : s
  }).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function exportToJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
