"use client";
import { useState, ChangeEvent, useEffect } from "react";

interface Tag {
  id?: string;
  nome: string;
  classe: string;
}

interface Tarefa {
  id?: string;
  icon: string;
  desc: string;
}

interface Villa {
  id?: string;
  numero: string;
  tags: Tag[];
  tarefas: Tarefa[];
  nota?: string;
}

interface ActionLog {
  id: string;
  action: string;
  villaNumero: string;
  workerName: string;
  workerId: string;
  createdAt: string;
}

export default function Home() {
  const [villasData, setVillasData] = useState<Villa[]>([]);
  const [pesquisa, setPesquisa] = useState<string>("");
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [workerInfo, setWorkerInfo] = useState<{name: string, id: string} | null>(null);
  const [loginName, setLoginName] = useState("");
  const [loginId, setLoginId] = useState("");

  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Logs state
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("workerInfo");
    if (saved) setWorkerInfo(JSON.parse(saved));
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/villas');
      if (res.ok) {
        const data = await res.json();
        setVillasData(data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginName.trim() || !loginId.trim()) return alert("Preencha o Nome e o ID.");
    const info = { name: loginName.trim(), id: loginId.trim() };
    localStorage.setItem("workerInfo", JSON.stringify(info));
    setWorkerInfo(info);
  };

  const handleLogout = () => {
    localStorage.removeItem("workerInfo");
    setWorkerInfo(null);
    setIsAdmin(false);
  };

  const toggleVilla = (numero: string) => {
    setAbertas((prev) => ({ ...prev, [numero]: !prev[numero] }));
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setPesquisa(e.target.value);
  };

  const deleteVilla = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!workerInfo) return alert("Erro de autenticação.");
    if (!confirm("Tem a certeza que quer eliminar esta villa?")) return;
    
    await fetch(`/api/villas/${id}?workerName=${encodeURIComponent(workerInfo.name)}&workerId=${encodeURIComponent(workerInfo.id)}`, { method: 'DELETE' });
    fetchVillas();
  };

  const saveVilla = async (villa: Villa) => {
    if (!workerInfo) return alert("Erro de autenticação.");
    const isUpdate = !!villa.id;
    const url = isUpdate ? `/api/villas/${villa.id}` : '/api/villas';
    const method = isUpdate ? 'PUT' : 'POST';
    
    const payload = {
      ...villa,
      workerName: workerInfo.name,
      workerId: workerInfo.id
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setEditingVilla(null);
    setIsAdding(false);
    fetchVillas();
  };

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setShowLogs(false);
    } else {
      const pwd = prompt("Insira a palavra-passe para aceder ao Modo Admin:");
      if (pwd === "1298") {
        setIsAdmin(true);
      } else if (pwd !== null) {
        alert("Palavra-passe incorreta.");
      }
    }
  };

  const villasFiltradas = villasData.filter((v) => v.numero.includes(pesquisa.trim()));

  if (!workerInfo) {
    return (
      <div className="login-overlay">
        <div className="login-card">
          <div className="login-icon" style={{display: 'flex', justifyContent: 'center'}}>
            <img src="/images/lagofilia_green.png" alt="Lagofilia Logo" style={{ height: '80px', width: 'auto' }} />
          </div>
          <h2 style={{fontSize: '32px', marginBottom: '8px', color: 'var(--green-900)'}}>Bicas Villas</h2>
          <p style={{marginBottom: '32px'}}>Painel da Equipa de Manutenção</p>
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">O seu Nome</label>
              <input type="text" className="input-field" value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Ex: Vasco" autoFocus />
            </div>

            <div className="input-group">
              <label className="input-label">Número de ID</label>
              <input type="text" className="input-field" value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="Ex: 12345" />
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: '16px'}}>
              Entrar na Plataforma
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="user-info">
            <div className="user-avatar">{workerInfo.name.charAt(0).toUpperCase()}</div>
            <span>{workerInfo.name} <span style={{opacity: 0.6}}>({workerInfo.id})</span></span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{padding: '6px 12px'}}>Sair</button>
        </div>
      </div>

      <div className="container">
        <div className="header-hero">
          <div className="badge">⭐ Resort Area</div>
          <h1>Bicas Villas</h1>
          <p>Guia de tarefas e manutenções prioritárias.</p>
        </div>

        <div className="search-container">
          <div className="search-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <input
            className="search-input"
            type="search"
            placeholder="Pesquisar villa (ex: 102)..."
            value={pesquisa}
            onChange={handleSearch}
          />
        </div>

        <div className="aviso-widget">
          <div className="aviso-header">
            <div className="aviso-header-icon">✨</div>
            <h3>Tarefas Essenciais - Todas as Villas</h3>
          </div>
          <div className="aviso-grid">
            <div className="aviso-item">
              <div className="aviso-item-icon">🧹</div>
              <div className="aviso-item-text">Varrer e limpar toda a área exterior da villa</div>
            </div>
            <div className="aviso-item">
              <div className="aviso-item-icon">🌿</div>
              <div className="aviso-item-text">Arrancar ervas que crescem em caminhos, decks e vasos</div>
            </div>
            <div className="aviso-item">
              <div className="aviso-item-icon">🪵</div>
              <div className="aviso-item-text">Canteiros têm casca de pinheiro — a casca fica, não retirar</div>
            </div>
            <div className="aviso-item">
              <div className="aviso-item-icon">🪴</div>
              <div className="aviso-item-text">Limpar sempre a zona do deck traseiro e acesso à piscina</div>
            </div>
          </div>
        </div>

        <div className="list-header">
          <div className="list-count">
            {loading ? 'A carregar base de dados...' : (pesquisa.trim() === '' ? `A mostrar todas as ${villasData.length} villas` : `${villasFiltradas.length} villa(s) encontrada(s)`)}
          </div>
          <button onClick={toggleAdmin} className="btn btn-secondary" style={{padding: '8px 16px', fontSize: '13px'}}>
            {isAdmin ? 'Sair do Admin' : '🔒 Acesso Admin'}
          </button>
        </div>
        
        {isAdmin && showLogs && (
          <div className="logs-widget">
            <div className="logs-header">
              <h3><span>📋</span> Histórico de Atividades</h3>
              <button onClick={() => setShowLogs(false)} className="btn btn-ghost btn-icon">✕</button>
            </div>
            <div className="log-list">
              {logs.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Nenhuma atividade registada.</p> : null}
              {logs.map(log => (
                <div key={log.id} className="log-item">
                  <div className="log-meta">
                    <span><strong>{log.workerName}</strong> (ID: {log.workerId})</span>
                    <span>{new Date(log.createdAt).toLocaleString('pt-PT')}</span>
                  </div>
                  <div className="log-content">
                    Operador <span className={`log-action ${log.action}`}>
                      {log.action === 'CREATE' && 'CRIOU'}
                      {log.action === 'UPDATE' && 'EDITOU'}
                      {log.action === 'DELETE' && 'REMOVEU'}
                    </span>
                    a Villa <strong>{log.villaNumero}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="villas-list">
          {villasFiltradas.map((villa) => (
            <div className="villa-card" key={villa.id || villa.numero}>
              <div className="villa-header" onClick={() => toggleVilla(villa.numero)}>
                <div className="villa-header-main">
                  <div className="villa-number">{villa.numero}</div>
                  <div>
                    <div className="villa-title">Villa {villa.numero}</div>
                    <div className="villa-subtitle">
                      {villa.tarefas.length} tarefa{villa.tarefas.length !== 1 && 's'} específica{villa.tarefas.length !== 1 && 's'}
                    </div>
                  </div>
                </div>
                <div className="villa-actions">
                  {isAdmin && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setEditingVilla(villa); }} className="btn btn-secondary" style={{padding: '8px 16px', fontSize: '13px'}}>Editar</button>
                      <button onClick={(e) => deleteVilla(villa.id!, e)} className="btn btn-danger" style={{padding: '8px 16px', fontSize: '13px'}}>Remover</button>
                    </>
                  )}
                  <div className={`villa-chevron ${abertas[villa.numero] ? 'open' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className={`villa-body-wrapper ${abertas[villa.numero] ? 'open' : ''}`}>
                <div className="villa-body-inner">
                  <div className="villa-body-content">
                    <div className="villa-divider"></div>
                    <div className="section-title">Tarefas específicas desta villa</div>
                    
                    {villa.tarefas.length > 0 ? (
                      <div className="task-list">
                        {villa.tarefas.map((tarefa, idx) => (
                          <div className="task-item" key={idx}>
                            <div className="task-icon">{tarefa.icon}</div>
                            <div className="task-text">{tarefa.desc}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Nenhuma tarefa específica configurada.</p>
                    )}
                    
                    {villa.nota && (
                      <div className="villa-note">
                        <div className="note-icon">💡</div>
                        <div className="note-text">{villa.nota}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {!loading && villasFiltradas.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Nenhuma villa encontrada</h3>
              <p>Não existem villas correspondentes à sua pesquisa.</p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="admin-bar">
          <span className="admin-bar-title">Modo Admin Ativo</span>
          <button onClick={() => setIsAdding(true)} className="admin-btn primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Adicionar Villa
          </button>
          <button onClick={() => { if (!showLogs) fetchLogs(); setShowLogs(!showLogs); }} className="admin-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Logs
          </button>
        </div>
      )}

      {(isAdding || editingVilla) && (
        <VillaEditor 
          villa={editingVilla || { numero: "", tags: [], tarefas: [] }} 
          onSave={saveVilla} 
          onCancel={() => { setEditingVilla(null); setIsAdding(false); }} 
        />
      )}
    </>
  );
}

function VillaEditor({ villa, onSave, onCancel }: { villa: Villa, onSave: (v: Villa) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Villa>({ ...villa, tags: [], tarefas: [...villa.tarefas] });

  const handleSave = () => {
    if (!formData.numero) return alert("O número da villa é obrigatório!");
    onSave(formData);
  };

  return (
    <div className="editor-overlay">
      <div className="editor-card">
        <div className="editor-header">
          <h2 className="editor-title">{villa.id ? 'Editar Villa' : 'Nova Villa'}</h2>
          <button onClick={onCancel} className="btn btn-ghost btn-icon" style={{background: 'var(--green-50)', color: 'var(--green-900)'}}>✕</button>
        </div>
        
        <div className="input-group">
          <label className="input-label">Número da Villa</label>
          <input type="text" className="input-field" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} placeholder="Ex: 105" />
        </div>

        <div className="input-group">
          <label className="input-label">Nota / Aviso Especial (Opcional)</label>
          <input type="text" className="input-field" value={formData.nota || ''} onChange={e => setFormData({...formData, nota: e.target.value})} placeholder="Mensagem de aviso para destacar..." />
        </div>

        <div className="input-group" style={{marginTop: '30px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <label className="input-label" style={{margin: 0}}>Tarefas</label>
            <button onClick={() => setFormData({...formData, tarefas: [...formData.tarefas, {icon: '✅', desc: ''}]})} className="btn btn-secondary" style={{padding: '6px 14px', fontSize: '13px'}}>
              + Nova Tarefa
            </button>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {formData.tarefas.map((t, i) => (
              <div key={i} style={{display: 'flex', gap: '12px'}}>
                <input type="text" className="input-field" style={{width: '70px', textAlign: 'center'}} value={t.icon} onChange={e => {
                  const newT = [...formData.tarefas]; newT[i].icon = e.target.value; setFormData({...formData, tarefas: newT});
                }} placeholder="Icon" />
                <input type="text" className="input-field" value={t.desc} onChange={e => {
                  const newT = [...formData.tarefas]; newT[i].desc = e.target.value; setFormData({...formData, tarefas: newT});
                }} placeholder="Descrição da tarefa" />
                <button onClick={() => {
                  const newT = [...formData.tarefas]; newT.splice(i, 1); setFormData({...formData, tarefas: newT});
                }} className="btn btn-danger btn-icon" style={{width: '54px', height: 'auto', borderRadius: '16px'}}>✕</button>
              </div>
            ))}
            {formData.tarefas.length === 0 && (
              <div style={{padding: '20px', textAlign: 'center', background: 'var(--green-50)', borderRadius: '16px', color: 'var(--text-muted)', fontSize: '14px'}}>
                Nenhuma tarefa específica adicionada.
              </div>
            )}
          </div>
        </div>

        <div className="editor-actions">
          <button onClick={onCancel} className="btn btn-ghost">Cancelar</button>
          <button onClick={handleSave} className="btn btn-primary">
            {villa.id ? 'Guardar Alterações' : 'Criar Villa'}
          </button>
        </div>
      </div>
    </div>
  );
}