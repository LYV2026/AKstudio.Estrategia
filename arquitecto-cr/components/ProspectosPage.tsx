// components/ProspectosPage.tsx
import React, { useState, useRef } from 'react'
import { Lead } from '../types'
import { addLead, deleteLead, updateLead, getLeads, exportToCSV } from '../lib/store'
import { PageHeader } from './Layout'
import Papa from 'papaparse'

const ETAPAS = ['Nuevo', 'Contactado', 'En conversación', 'Propuesta enviada', 'Cerrado', 'Descartado']
const TIPOS_LEAD = ['Inversionista Airbnb', 'Dueño de lote', 'Desarrollador', 'Comerciante', 'Familia', 'Segunda residencia', 'Promotor']
const FUENTES = ['Referido', 'Instagram', 'Facebook', 'Google', 'WhatsApp', 'LinkedIn', 'Feria/Evento', 'Portal inmobiliario', 'Municipalidad', 'Otro']

const EMPTY_FORM = {
  nombre: '', empresa: '', tipoLead: TIPOS_LEAD[0], ubicacion: '',
  fuente: FUENTES[0], telefono: '', email: '', instagram: '', etapa: 'Nuevo', notas: '', nicho: '',
}

const ETAPA_COLORS: Record<string, string> = {
  'Nuevo': '#94a3b8',
  'Contactado': '#60a5fa',
  'En conversación': '#f59e0b',
  'Propuesta enviada': '#a78bfa',
  'Cerrado': '#34d399',
  'Descartado': '#f87171',
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

export default function ProspectosPage() {
  const [leads, setLeads] = useState<Lead[]>(() => getLeads())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editId, setEditId] = useState<string | null>(null)
  const [filterEtapa, setFilterEtapa] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'leads' | 'fuentes'>('leads')
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = () => setLeads(getLeads())

  function handleSubmit() {
    if (!form.nombre.trim()) return
    if (editId) {
      updateLead(editId, form)
    } else {
      addLead(form)
    }
    refresh()
    setForm({ ...EMPTY_FORM })
    setEditId(null)
    setShowForm(false)
  }

  function handleEdit(lead: Lead) {
    setForm({
      nombre: lead.nombre, empresa: lead.empresa || '', tipoLead: lead.tipoLead,
      ubicacion: lead.ubicacion, fuente: lead.fuente, telefono: lead.telefono || '',
      email: lead.email || '', instagram: lead.instagram || '', etapa: lead.etapa,
      notas: lead.notas || '', nicho: lead.nicho || '',
    })
    setEditId(lead.id)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (confirm('¿Eliminar este prospecto?')) { deleteLead(id); refresh() }
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        results.data.forEach((row: any) => {
          if (!row.nombre && !row.Nombre) return
          addLead({
            nombre: row.nombre || row.Nombre || '',
            empresa: row.empresa || row.Empresa || '',
            tipoLead: row.tipoLead || row.tipo_lead || TIPOS_LEAD[0],
            ubicacion: row.ubicacion || row.Ubicación || '',
            fuente: row.fuente || row.Fuente || FUENTES[0],
            telefono: row.telefono || row.Teléfono || '',
            email: row.email || row.Email || '',
            instagram: row.instagram || row.Instagram || '',
            etapa: row.etapa || row.Etapa || 'Nuevo',
            notas: row.notas || row.Notas || '',
            nicho: row.nicho || row.Nicho || '',
          })
        })
        refresh()
      }
    })
  }

  const filtered = leads.filter(l => {
    if (filterEtapa && l.etapa !== filterEtapa) return false
    if (filterTipo && l.tipoLead !== filterTipo) return false
    if (search && !l.nombre.toLowerCase().includes(search.toLowerCase()) && !l.ubicacion.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ padding: '32px 36px' }} className="animate-fade-in">
      <PageHeader
        title="Gestión de Prospectos"
        subtitle="Organizá tus leads de forma ética y práctica · Sin scraping automático"
        badge="CRM Básico"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'leads', label: `Mis Leads (${leads.length})` },
          { id: 'fuentes', label: '🔍 Dónde buscar prospectos' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: '10px 18px', background: 'transparent', border: 'none',
            borderBottom: `2px solid ${tab === t.id ? 'var(--accent-green)' : 'transparent'}`,
            color: tab === t.id ? 'var(--accent-green)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'leads' ? (
        <>
          {/* Actions bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Buscar</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre o ubicación..." className="input-field" style={{ padding: '7px 10px', fontSize: 13, width: 180 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Etapa</label>
              <select value={filterEtapa} onChange={e => setFilterEtapa(e.target.value)} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
                <option value="">Todas</option>
                {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tipo</label>
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="input-field" style={{ padding: '7px 10px', fontSize: 13 }}>
                <option value="">Todos</option>
                {TIPOS_LEAD.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <input type="file" accept=".csv" ref={fileRef} onChange={handleCSV} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                ↑ Importar CSV
              </button>
              <button onClick={() => exportToCSV(filtered.map(l => ({ Nombre: l.nombre, Empresa: l.empresa, Tipo: l.tipoLead, Ubicación: l.ubicacion, Fuente: l.fuente, Teléfono: l.telefono, Email: l.email, Instagram: l.instagram, Etapa: l.etapa, Notas: l.notas })), 'prospectos_cr.csv')} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                ↓ Exportar CSV
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
                {editId ? 'Editar prospecto' : 'Nuevo prospecto'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { key: 'nombre', label: 'Nombre *', type: 'text' },
                  { key: 'empresa', label: 'Empresa', type: 'text' },
                  { key: 'ubicacion', label: 'Ubicación', type: 'text' },
                  { key: 'telefono', label: 'Teléfono', type: 'text' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'instagram', label: 'Instagram', type: 'text' },
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={(form as any)[field.key]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="input-field"
                      style={{ padding: '7px 10px', fontSize: 13 }}
                    />
                  </div>
                ))}
                {[
                  { key: 'tipoLead', label: 'Tipo de lead', options: TIPOS_LEAD },
                  { key: 'fuente', label: 'Fuente', options: FUENTES },
                  { key: 'etapa', label: 'Etapa', options: ETAPAS },
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
                  <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="input-field" style={{ padding: '7px 10px', fontSize: 13, minHeight: 64, resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={handleSubmit} style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--accent-green)', border: 'none', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {editId ? 'Guardar cambios' : 'Agregar lead'}
                </button>
                <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '9px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Leads table */}
          <div className="card" style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Empresa</th>
                  <th>Tipo</th>
                  <th>Ubicación</th>
                  <th>Fuente</th>
                  <th>Contacto</th>
                  <th>Etapa</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      {leads.length === 0 ? 'Todavía no hay prospectos. Agregá el primero →' : 'No hay resultados con los filtros aplicados.'}
                    </td>
                  </tr>
                ) : filtered.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.nombre}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.empresa || '—'}</td>
                    <td>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                        {l.tipoLead}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.ubicacion}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.fuente}</td>
                    <td style={{ fontSize: 12 }}>
                      {l.telefono && <div>{l.telefono}</div>}
                      {l.email && <div style={{ color: 'var(--text-muted)' }}>{l.email}</div>}
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                        background: `${ETAPA_COLORS[l.etapa]}18`,
                        color: ETAPA_COLORS[l.etapa] || '#94a3b8',
                      }}>
                        {l.etapa}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.notas || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleEdit(l)} style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => handleDelete(l.id)} style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', cursor: 'pointer' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Fuentes de prospección */
        <div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            Estas son fuentes éticas para encontrar prospectos manualmente. La app <strong style={{ color: 'var(--text-primary)' }}>no realiza scraping ni recolección automática</strong> de datos personales.
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
