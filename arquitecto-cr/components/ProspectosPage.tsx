// components/ProspectosPage.tsx
import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import { PageHeader } from './Layout'

const ETAPAS = ['Nuevo', 'Contactado', 'En conversación', 'Propuesta enviada', 'Cerrado', 'Descartado']
const FUENTES = [
  'Referido', 'Instagram', 'Facebook', 'Google', 'WhatsApp', 'LinkedIn',
  'Feria/Evento', 'Portal inmobiliario', 'Municipalidad', 'Otro',
  'Catastro Landing', 'ROI Landing', 'Proyecto Landing',
]

const ETAPA_COLORS: Record<string, string> = {
  'Nuevo': '#94a3b8',
  'Contactado': '#60a5fa',
  'En conversación': '#f59e0b',
  'Propuesta enviada': '#a78bfa',
  'Cerrado': '#34d399',
  'Descartado': '#f87171',
}

const ETAPA_FILL: Record<string, string> = {
  'Nuevo': 'DBEAFE',
  'Contactado': 'FEF3C7',
  'En conversación': 'EDE9FE',
  'Propuesta enviada': 'FFEDD5',
  'Cerrado': 'D1FAE5',
  'Descartado': 'FEE2E2',
}

const LANDING_COLORS: Record<string, string> = {
  'catastro': '#60a5fa',
  'roi': '#f59e0b',
  'proyecto': '#34d399',
}

const PROSP_SOURCES = [
  { icon: '🗺', name: 'Google Maps', desc: 'Buscar desarrolladoras, constructoras y arquitectos en el cantón objetivo' },
  { icon: '🏛', name: 'Municipalidades', desc: 'Consultar registros públicos de permisos de construcción recientes' },
  { icon: '📋', name: 'CFIA (Colegio Federado)', desc: 'Directorio de profesionales en ingeniería y arquitectura' },
  { icon: '🏢', name: 'Cámara Costarricense de la Construcción', desc: 'Directorio de empresas constructoras asociadas' },
  { icon: '🏠', name: 'Portales inmobiliarios', desc: 'CRPropiedad, Encuentra24, OLX — buscar proyectos en desarrollo' },
  { icon: '📘', name: 'Facebook Groups', desc: 'Grupos de: Construcción CR, Inversiones Inmobiliarias, Airbnb Costa Rica Hosts' },
  { icon: '📸', name: 'Instagram', desc: 'Hashtags: #construccioncostarica #inmobiliariaCR #proyectosCR' },
  { icon: '💼', name: 'LinkedIn', desc: 'Buscar: promotores, desarrolladores, inversionistas inmobiliarios en CR' },
  { icon: '📞', name: 'Cámara de Turismo', desc: 'Para nichos vacacionales / Airbnb en Guanacaste y zonas costeras' },
  { icon: '🤝', name: 'Referidos', desc: 'Red de notarios, abogados, ferreterías y proveedores de materiales' },
]

type Prospect = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  landing: string
  source: string
  location: string
  project_type: string
  budget_range: string
  has_land: string
  interest_type: string
  plano_number: string
  stage: string
  notes: string
}

const EMPTY_FORM = {
  name: '', email: '', phone: '', location: '',
  source: FUENTES[0], stage: 'Nuevo', notes: '',
  project_type: '', landing: 'manual',
}

function buildEmail(l: Prospect) {
  const nombre = l.name?.split(' ')[0] || l.name
  const tipo = l.landing === 'roi'
    ? 'proyecto de inversión o renta'
    : l.landing === 'catastro'
    ? 'consulta de catastro'
    : l.project_type || 'proyecto de construcción o diseño'
  const asunto = `Seguimiento de su proyecto con AK Studio${l.location ? ' en ' + l.location : ''}`
  const cuerpo = `Hola ${nombre},

Fue un gusto conectar con usted. Le escribo para dar seguimiento a su ${tipo}${l.location ? ', ubicado en ' + l.location : ''}.

En AK Studio podemos apoyarle desde el diseño arquitectónico y los permisos hasta la construcción completa.

Nos encantaría apoyarle con una propuesta bien aterrizada, cuidando diseño, funcionalidad, presupuesto y viabilidad constructiva.

Además, le comparto nuestras herramientas digitales:
• akstudio.es: para que conozca mejor nuestro trabajo, proyectos y servicios.
• Consulta de Catastro: permite revisar municipio, enlaces de trámite y checklist básico a partir del número de plano.
  https://akstudio-consulta-catastro.netlify.app/
• Calculadora de Proyectos: sirve para estimar presupuesto, honorarios CFIA y cronograma de obra.
  https://akstudio-calculadora.netlify.app/
• ROI Airbnb: si en algún momento desea evaluar rentabilidad de alquiler o inversión, esta herramienta puede serle útil.
  https://akstudioroi.netlify.app/

Si le parece, podemos coordinar una llamada para conversar sobre el proyecto y definir los siguientes pasos.

Quedo atento y con mucho gusto podemos coordinar por este medio o por llamada.

Saludos,
Leonardo Sánchez
AK Studio
akstudio.es`
  return { asunto, cuerpo }
}

export default function ProspectosPage() {
  const [leads, setLeads] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [newLeadAlert, setNewLeadAlert] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editId, setEditId] = useState<string | null>(null)
  const [filterEtapa, setFilterEtapa] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'leads' | 'fuentes'>('leads')
  const [saving, setSaving] = useState(false)
  const [emailModal, setEmailModal] = useState<Prospect | null>(null)

  useEffect(() => {
    fetchLeads()
    const channel = supabase
      .channel('prospects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prospects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNewLeadAlert(true)
          setTimeout(() => setNewLeadAlert(false), 5000)
        }
        fetchLeads()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchLeads() {
    setLoading(true)
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setLeads(data)
    setLoading(false)
  }

  async function handleSubmit() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editId) {
      await supabase.from('prospects').update({
        stage: form.stage, notes: form.notes, source: form.source,
        location: form.location, project_type: form.project_type,
      }).eq('id', editId)
    } else {
      await supabase.from('prospects').insert([{
        name: form.name, email: form.email, phone: form.phone,
        location: form.location, source: form.source, landing: form.landing,
        stage: form.stage, notes: form.notes, project_type: form.project_type,
      }])
    }
    setSaving(false)
    setForm({ ...EMPTY_FORM })
    setEditId(null)
    setShowForm(false)
  }

  function handleEdit(lead: Prospect) {
    setForm({
      name: lead.name, email: lead.email || '', phone: lead.phone || '',
      location: lead.location || '', source: lead.source || FUENTES[0],
      stage: lead.stage, notes: lead.notes || '',
      project_type: lead.project_type || '', landing: lead.landing || 'manual',
    })
    setEditId(lead.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este prospecto?')) return
    await supabase.from('prospects').delete().eq('id', id)
  }

  function openMailto(l: Prospect) {
    const { asunto, cuerpo } = buildEmail(l)
    const url = `mailto:${l.email}?cc=info@akstudio.es&subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
    window.open(url)
    // Auto-update stage to Contactado
    supabase.from('prospects').update({ stage: 'Contactado' }).eq('id', l.id).then(() => fetchLeads())
    setEmailModal(null)
  }

  function exportExcel() {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Etapa', 'Landing', 'Fuente', 'Tipo proyecto', 'Ubicación', 'Notas', 'Fecha']
    const rows = [...filtered].sort((a, b) => a.stage.localeCompare(b.stage)).map(l => [
      l.name || '', l.email || '', l.phone || '', l.stage || '', l.landing || '',
      l.source || '', l.project_type || '', l.location || '', l.notes || '',
      new Date(l.created_at).toLocaleDateString('es-CR'),
    ])
    const wb = XLSX.utils.book_new()
    const wsData = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 28 }, { wch: 32 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 28 }, { wch: 20 }, { wch: 22 }, { wch: 50 }, { wch: 12 }]
    headers.forEach((_, i) => {
      const ref = XLSX.utils.encode_cell({ r: 0, c: i })
      if (ws[ref]) ws[ref].s = { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Calibri' }, fill: { patternType: 'solid', fgColor: { rgb: '06225F' } }, alignment: { horizontal: 'center', vertical: 'center' } }
    })
    rows.forEach((row, rowIdx) => {
      const fillColor = ETAPA_FILL[row[3]] || 'F7F7F5'
      headers.forEach((_, colIdx) => {
        const ref = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx })
        if (ws[ref]) ws[ref].s = { fill: { patternType: 'solid', fgColor: { rgb: fillColor } }, font: { name: 'Calibri', sz: 10, bold: colIdx === 0 }, alignment: { vertical: 'center', wrapText: colIdx === 8 } }
      })
    })
    const summaryData = [['Etapa', 'Total', '% del total'], ...ETAPAS.map(s => { const count = leads.filter(l => l.stage === s).length; return [s, count, leads.length > 0 ? `${(count / leads.length * 100).toFixed(1)}%` : '0%'] }), [], [`Total prospectos: ${leads.length}`, '', '']]
    const ws2 = XLSX.utils.aoa_to_sheet(summaryData)
    ws2['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Prospectos AK Studio')
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen por Etapa')
    XLSX.writeFile(wb, `prospectos-akstudio-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const filtered = leads.filter(l => {
    if (filterEtapa && l.stage !== filterEtapa) return false
    if (filterTipo && l.landing !== filterTipo) return false
    if (search && !l.name?.toLowerCase().includes(search.toLowerCase()) && !l.email?.toLowerCase().includes(search.toLowerCase()) && !l.location?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const emailPreview = emailModal ? buildEmail(emailModal) : null

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Gestión de Prospectos"
        subtitle="Leads captados automáticamente desde las landing pages · AK Studio"
        badge="CRM · Tiempo Real"
      />

      {/* Email Preview Modal */}
      {emailModal && emailPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-card, #1e293b)', border: '1px solid var(--border)', borderRadius: 12, width: '100%', maxWidth: 620, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Vista previa del correo</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Para: {emailModal.name} &lt;{emailModal.email}&gt; · CC: info@akstudio.es</div>
              </div>
              <button onClick={() => setEmailModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            {/* Subject */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Asunto: </span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{emailPreview.asunto}</span>
            </div>
            {/* Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <pre style={{ fontFamily: 'inherit', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                {emailPreview.cuerpo}
              </pre>
            </div>
            {/* Actions */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEmailModal(null)}
                style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => openMailto(emailModal)}
                style={{ padding: '8px 20px', borderRadius: 8, background: '#0ea5e9', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                ✉ Abrir en correo y marcar Contactado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de nuevo lead */}
      {newLeadAlert && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 8, padding: '12px 20px', marginBottom: 20, fontSize: 14, color: '#34d399', fontWeight: 500 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          ¡Nuevo prospecto recibido! La lista se actualizó automáticamente.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'leads', label: `Mis Leads (${leads.length})` },
          { id: 'fuentes', label: '🔍 Dónde buscar prospectos' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            style={{ padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--accent-green)' : 'transparent'}`, color: tab === t.id ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'leads' ? (
        <>
          {/* Actions bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Buscar</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre, email o ubicación..." className="input-field" style={{ padding: '7px 10px', fontSize: 13, width: 200 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Etapa</label>
              <select value={filterEtapa} onChange={e => setFilterEtapa(e.target.value)} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
                <option value="">Todas</option>
                {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Landing</label>
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
                <option value="">Todas</option>
                <option value="catastro">Catastro</option>
                <option value="roi">ROI Airbnb</option>
                <option value="proyecto">Proyecto</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', padding: '8px 12px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 0 2px rgba(52,211,153,0.2)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                En vivo
              </div>
              <button onClick={exportExcel} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                ↓ Exportar Excel
              </button>
              <button onClick={() => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(!showForm) }} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent-green)', border: 'none', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                + Nuevo lead
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card animate-slide-up" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                {editId ? 'Editar prospecto' : 'Nuevo prospecto manual'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { key: 'name', label: 'Nombre *', type: 'text' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'phone', label: 'Teléfono', type: 'text' },
                  { key: 'location', label: 'Ubicación', type: 'text' },
                  { key: 'project_type', label: 'Tipo de proyecto', type: 'text' },
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{field.label}</label>
                    <input type={field.type} value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }} />
                  </div>
                ))}
                {[
                  { key: 'source', label: 'Fuente', options: FUENTES },
                  { key: 'stage', label: 'Etapa', options: ETAPAS },
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{field.label}</label>
                    <select value={(form as any)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Notas</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" style={{ padding: '7px 10px', fontSize: 13, minHeight: 64, resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={handleSubmit} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--accent-green)', border: 'none', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Agregar lead'}
                </button>
                <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '9px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card" style={{ overflow: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: 14 }}>Cargando prospectos...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Landing</th>
                    <th>Ubicación</th>
                    <th>Etapa</th>
                    <th>Notas</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        {leads.length === 0 ? 'Los leads de las landing pages aparecerán aquí automáticamente en tiempo real.' : 'No hay resultados con los filtros aplicados.'}
                      </td>
                    </tr>
                  ) : filtered.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600 }}>{l.name}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.email || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.phone || '—'}</td>
                      <td>
                        {l.landing ? (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: `${LANDING_COLORS[l.landing] || '#94a3b8'}18`, color: LANDING_COLORS[l.landing] || '#94a3b8' }}>
                            {l.landing}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.location || '—'}</td>
                      <td>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: `${ETAPA_COLORS[l.stage] || '#94a3b8'}18`, color: ETAPA_COLORS[l.stage] || '#94a3b8' }}>
                          {l.stage}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.notes || '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(l.created_at).toLocaleDateString('es-CR')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {l.email && (
                            <button
                              onClick={() => setEmailModal(l)}
                              style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'transparent', border: '1px solid rgba(14,165,233,0.4)', color: '#0ea5e9', cursor: 'pointer', fontWeight: 600 }}
                            >
                              ✉ Correo
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(l)}
                            style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(l.id)}
                            style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filtered.length > 0 && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
                Mostrando {filtered.length} de {leads.length} prospectos
              </div>
            )}
          </div>

          <style>{`
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
          `}</style>
        </>
      ) : (
        <div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            Estas son fuentes éticas para encontrar prospectos manualmente. La app{' '}
            <strong style={{ color: 'var(--text-primary)' }}>no realiza scraping ni recolección automática</strong>{' '}
            de datos personales.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {PROSP_SOURCES.map(s => (
              <div key={s.name} className="card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 24, flexShrink: 0, width: 36, textAlign: 'center' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
