// pages/prospectos.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Prospect = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  landing: string;
  source: string;
  location: string;
  project_type: string;
  budget_range: string;
  has_land: string;
  interest_type: string;
  plano_number: string;
  stage: string;
  notes: string;
  utm_source: string;
  utm_campaign: string;
};

const STAGES = ['Nuevo', 'Contactado', 'Calificado', 'Propuesta', 'Ganado', 'Perdido'];
const LANDINGS = ['Todos', 'catastro', 'roi', 'proyecto'];

export default function Prospectos() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('Todos');
  const [filterLanding, setFilterLanding] = useState('Todos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStage, setEditStage] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProspects();
  }, []);

  async function fetchProspects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProspects(data);
    setLoading(false);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    await supabase
      .from('prospects')
      .update({ stage: editStage, notes: editNotes })
      .eq('id', id);
    setEditingId(null);
    setSaving(false);
    fetchProspects();
  }

  function exportCSV() {
    const filtered = getFiltered();
    const headers = ['Nombre', 'Email', 'Teléfono', 'Landing', 'Etapa', 'Ubicación', 'Tipo proyecto', 'Presupuesto', 'Lote', 'Fuente', 'Notas', 'Fecha'];
    const rows = filtered.map(p => [
      p.name, p.email, p.phone, p.landing, p.stage,
      p.location, p.project_type, p.budget_range,
      p.has_land, p.source, p.notes,
      new Date(p.created_at).toLocaleDateString('es-CR')
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospectos-akstudio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  function getFiltered() {
    return prospects.filter(p => {
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search);
      const matchStage = filterStage === 'Todos' || p.stage === filterStage;
      const matchLanding = filterLanding === 'Todos' || p.landing === filterLanding;
      return matchSearch && matchStage && matchLanding;
    });
  }

  const filtered = getFiltered();

  const stageColors: Record<string, string> = {
    'Nuevo': 'bg-blue-100 text-blue-800',
    'Contactado': 'bg-yellow-100 text-yellow-800',
    'Calificado': 'bg-purple-100 text-purple-800',
    'Propuesta': 'bg-orange-100 text-orange-800',
    'Ganado': 'bg-green-100 text-green-800',
    'Perdido': 'bg-red-100 text-red-800',
  };

  const landingColors: Record<string, string> = {
    'catastro': 'bg-slate-100 text-slate-700',
    'roi': 'bg-amber-100 text-amber-700',
    'proyecto': 'bg-teal-100 text-teal-700',
  };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#F7F7F5', minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ background: '#06225F', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#fff', fontWeight: 600 }}>
            AK <span style={{ color: '#CCBC7C', fontWeight: 400 }}>STUDIO</span>
          </div>
          <div style={{ fontSize: 11, color: '#C3CAD4', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>
            Panel interno · Prospectos
          </div>
        </div>
        <button
          onClick={exportCSV}
          style={{ background: '#CCBC7C', color: '#06225F', border: 'none', padding: '10px 22px', borderRadius: 4, fontWeight: 500, cursor: 'pointer', fontSize: 14 }}
        >
          Exportar CSV
        </button>
      </div>

      <div style={{ padding: '32px 40px' }}>
        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total prospectos', value: prospects.length },
            { label: 'Nuevos', value: prospects.filter(p => p.stage === 'Nuevo').length },
            { label: 'Calificados', value: prospects.filter(p => p.stage === 'Calificado').length },
            { label: 'Ganados', value: prospects.filter(p => p.stage === 'Ganado').length },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #e2e4e8', borderRadius: 8, padding: '20px 24px' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: '#06225F', fontWeight: 500, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 240, padding: '10px 16px', border: '1px solid #e2e4e8', borderRadius: 4, fontSize: 14, outline: 'none', background: '#fff' }}
          />
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #e2e4e8', borderRadius: 4, fontSize: 14, background: '#fff', cursor: 'pointer' }}
          >
            {['Todos', ...STAGES].map(s => <option key={s}>{s}</option>)}
          </select>
          <select
            value={filterLanding}
            onChange={e => setFilterLanding(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #e2e4e8', borderRadius: 4, fontSize: 14, background: '#fff', cursor: 'pointer' }}
          >
            {LANDINGS.map(l => <option key={l}>{l}</option>)}
          </select>
          <button
            onClick={fetchProspects}
            style={{ padding: '10px 20px', background: '#06225F', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer' }}
          >
            Actualizar
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Cargando prospectos...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280', background: '#fff', borderRadius: 8, border: '1px solid #e2e4e8' }}>
            No hay prospectos que coincidan con los filtros.
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e4e8', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F7F7F5', borderBottom: '1px solid #e2e4e8' }}>
                  {['Nombre', 'Email', 'Teléfono', 'Landing', 'Ubicación', 'Etapa', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 500, color: '#1E2430', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <>
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafaf8' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: '#1E2430' }}>{p.name}</td>
                      <td style={{ padding: '14px 16px', color: '#4C5F86' }}>{p.email}</td>
                      <td style={{ padding: '14px 16px', color: '#6b7280' }}>{p.phone}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 2, fontSize: 12, fontWeight: 500 }}
                          className={landingColors[p.landing] || 'bg-gray-100 text-gray-700'}>
                          {p.landing || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6b7280' }}>{p.location || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 2, fontSize: 12, fontWeight: 500 }}
                          className={stageColors[p.stage] || 'bg-gray-100'}>
                          {p.stage}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>
                        {new Date(p.created_at).toLocaleDateString('es-CR')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => { setEditingId(editingId === p.id ? null : p.id); setEditStage(p.stage); setEditNotes(p.notes || ''); }}
                          style={{ background: 'transparent', border: '1px solid #e2e4e8', padding: '5px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', color: '#06225F' }}
                        >
                          {editingId === p.id ? 'Cerrar' : 'Editar'}
                        </button>
                      </td>
                    </tr>
                    {editingId === p.id && (
                      <tr key={`edit-${p.id}`} style={{ background: '#f0f4ff', borderBottom: '1px solid #e2e4e8' }}>
                        <td colSpan={8} style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 16, alignItems: 'end' }}>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1E2430', display: 'block', marginBottom: 6 }}>Etapa</label>
                              <select
                                value={editStage}
                                onChange={e => setEditStage(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e4e8', borderRadius: 4, fontSize: 14, background: '#fff' }}
                              >
                                {STAGES.map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1E2430', display: 'block', marginBottom: 6 }}>Notas</label>
                              <input
                                type="text"
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                                placeholder="Agregá notas sobre este prospecto..."
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e4e8', borderRadius: 4, fontSize: 14, background: '#fff' }}
                              />
                            </div>
                            <button
                              onClick={() => saveEdit(p.id)}
                              disabled={saving}
                              style={{ background: '#06225F', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 4, fontSize: 14, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}
                            >
                              {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                          {/* Extra info */}
                          <div style={{ marginTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: '#6b7280' }}>
                            {p.project_type && <span><strong>Tipo:</strong> {p.project_type}</span>}
                            {p.budget_range && <span><strong>Presupuesto:</strong> {p.budget_range}</span>}
                            {p.has_land && <span><strong>Lote:</strong> {p.has_land}</span>}
                            {p.plano_number && <span><strong>Plano:</strong> {p.plano_number}</span>}
                            {p.interest_type && <span><strong>Interés:</strong> {p.interest_type}</span>}
                            {p.utm_source && <span><strong>UTM:</strong> {p.utm_source}</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e4e8', fontSize: 13, color: '#6b7280' }}>
              Mostrando {filtered.length} de {prospects.length} prospectos
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
