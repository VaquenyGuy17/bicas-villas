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

  const handleLogin = () => {
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
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px'}}>
        <div style={{background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'}}>
          <h2 style={{color: '#14341b', marginBottom: '10px', textAlign: 'center'}}>Bicas Villas</h2>
          <p style={{color: '#5e7364', marginBottom: '30px', textAlign: 'center', fontSize: '14px'}}>Identifique-se para aceder ao sistema</p>
          
          <div style={{marginBottom: '15px'}}>
            <label style={{display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#5e7364'}}>O seu Nome</label>
            <input type="text" value={loginName} onChange={e => setLoginName(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #dff4e4', outline: 'none'}} placeholder="Ex: Vasco" />
          </div>

          <div style={{marginBottom: '25px'}}>
            <label style={{display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#5e7364'}}>Número de ID</label>
            <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #dff4e4', outline: 'none'}} placeholder="Ex: 12345" />
          </div>

          <button onClick={handleLogin} style={{width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#3b9b4f', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '16px'}}>Entrar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '20px'}}>
        <div style={{fontSize: '14px', color: '#5e7364'}}>👤 <strong>{workerInfo.name}</strong> (ID: {workerInfo.id})</div>
        <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: 600}}>Sair</button>
      </div>

      <div className="header">
        <div className="header-zona">Resort — Zona</div>
        <h1>Bicas Villas</h1>
        <div className="header-sub">Guia de tarefas para a equipa de manutenção</div>
        <button 
          onClick={toggleAdmin}
          style={{marginTop: '15px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#1a4323', padding: '6px 12px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', opacity: 0.5}}
        >
          {isAdmin ? 'Sair do Modo Admin' : 'Modo Admin'}
        </button>
      </div>

      <div className="search-wrap">
        <input
          className="search-box"
          type="search"
          placeholder="Pesquisar villa (ex: 102)..."
          value={pesquisa}
          onChange={handleSearch}
        />
      </div>

      <div className="aviso-geral">
        <div className="aviso-geral-titulo">
          <span style={{fontSize: "20px"}}>✨</span> Tarefas Essenciais - Todas as Villas
        </div>
        <div className="aviso-geral-item"><span className="icon">🧹</span><span>Varrer e limpar toda a área exterior da villa</span></div>
        <div className="aviso-geral-item"><span className="icon">🌿</span><span>Arrancar ervas que crescem em caminhos, entre tábuas, decks e vasos</span></div>
        <div className="aviso-geral-item"><span className="icon">🪵</span><span>Canteiros da frente têm casca de pinheiro — a casca fica no canteiro, não retirar</span></div>
        <div className="aviso-geral-item"><span className="icon">🪴</span><span>Limpar sempre a zona do deck na parte de trás e o caminho para a piscina</span></div>
      </div>

      <div className="contador" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{display: 'flex', gap: '10px'}}>
          {isAdmin && (
             <button onClick={() => setIsAdding(true)} style={{background: '#3b9b4f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600}}>
               + Adicionar Villa
             </button>
          )}
          {isAdmin && (
             <button onClick={() => {
               if (!showLogs) fetchLogs();
               setShowLogs(!showLogs);
             }} style={{background: '#e5e7eb', color: '#4b5563', border: 'none', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600}}>
               {showLogs ? 'Esconder Histórico' : 'Histórico de Atividades'}
             </button>
          )}
        </div>
        <div>
          {loading ? 'A carregar...' : (pesquisa.trim() === '' ? `A mostrar ${villasData.length} villas` : `${villasFiltradas.length} villa(s) encontrada(s)`)}
        </div>
      </div>
      
      {isAdmin && showLogs && (
        <div style={{background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginBottom: '15px', color: '#1a4323'}}>Últimas Modificações</h3>
          <div style={{maxHeight: '300px', overflowY: 'auto'}}>
            {logs.length === 0 ? <p style={{color: '#6b7280', fontSize: '14px'}}>Nenhuma atividade registada.</p> : null}
            {logs.map(log => (
              <div key={log.id} style={{padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px'}}>
                <strong>{log.workerName}</strong> (ID: {log.workerId}){' '}
                {log.action === 'CREATE' ? <span style={{color: '#059669'}}>criou</span> : null}
                {log.action === 'UPDATE' ? <span style={{color: '#d97706'}}>editou</span> : null}
                {log.action === 'DELETE' ? <span style={{color: '#dc2626'}}>removeu</span> : null}
                {' '}a Villa <strong>{log.villaNumero}</strong> em {new Date(log.createdAt).toLocaleString('pt-PT')}
              </div>
            ))}
          </div>
        </div>
      )}

      {(isAdding || editingVilla) && (
        <VillaEditor 
          villa={editingVilla || { numero: "", tags: [], tarefas: [] }} 
          onSave={saveVilla} 
          onCancel={() => { setEditingVilla(null); setIsAdding(false); }} 
        />
      )}

      {!isAdding && !editingVilla && (
        <div className="villas-lista">
          {villasFiltradas.map((villa) => (
            <div className="villa-card" key={villa.numero}>
              <div className="villa-header" onClick={() => toggleVilla(villa.numero)}>
                <div className="villa-header-left">
                  <div className="villa-numero">{villa.numero}</div>
                  <div>
                    <div className="villa-nome">Villa {villa.numero}</div>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  {isAdmin && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setEditingVilla(villa); }} style={{background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600}}>Editar</button>
                      <button onClick={(e) => deleteVilla(villa.id!, e)} style={{background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600}}>Remover</button>
                    </>
                  )}
                  <div className={`villa-chevron ${abertas[villa.numero] ? 'open' : ''}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className={`villa-body-wrapper ${abertas[villa.numero] ? 'open' : ''}`}>
                <div className="villa-body-inner">
                  <div className="villa-body">
                    <div className="secao">
                      <div className="secao-titulo">Tarefas específicas</div>
                      {villa.tarefas.length > 0 ? villa.tarefas.map((tarefa, idx) => (
                        <div className="tarefa-item" key={idx}>
                          <span className="tarefa-icon">{tarefa.icon}</span>
                          <span>{tarefa.desc}</span>
                        </div>
                      )) : (
                        <div style={{fontSize: '14px', color: '#6b7280', padding: '10px'}}>Nenhuma tarefa específica.</div>
                      )}
                    </div>
                    {villa.nota && <div className="nota">{villa.nota}</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VillaEditor({ villa, onSave, onCancel }: { villa: Villa, onSave: (v: Villa) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Villa>({ ...villa, tags: [], tarefas: [...villa.tarefas] });

  const handleSave = () => {
    if (!formData.numero) return alert("O número da villa é obrigatório!");
    onSave(formData);
  };

  return (
    <div style={{background: 'rgba(255,255,255,0.9)', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(45,90,39,0.15)', marginBottom: '20px'}}>
      <h2 style={{color: '#14341b', marginBottom: '20px'}}>{villa.id ? 'Editar Villa' : 'Nova Villa'}</h2>
      
      <div style={{marginBottom: '15px'}}>
        <label style={{display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#5e7364'}}>Número da Villa</label>
        <input type="text" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #dff4e4', outline: 'none'}} />
      </div>

      <div style={{marginBottom: '15px'}}>
        <label style={{display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#5e7364'}}>Nota / Aviso Específico</label>
        <input type="text" value={formData.nota || ''} onChange={e => setFormData({...formData, nota: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #dff4e4', outline: 'none'}} placeholder="Opcional..." />
      </div>

      <div style={{marginBottom: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
          <label style={{fontSize: '14px', fontWeight: 600, color: '#5e7364'}}>Tarefas</label>
          <button onClick={() => setFormData({...formData, tarefas: [...formData.tarefas, {icon: '✅', desc: ''}]})} style={{background: '#dff4e4', color: '#2d7a3e', border: 'none', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px'}}>+ Adicionar Tarefa</button>
        </div>
        {formData.tarefas.map((t, i) => (
          <div key={i} style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
            <input type="text" value={t.icon} onChange={e => {
              const newT = [...formData.tarefas]; newT[i].icon = e.target.value; setFormData({...formData, tarefas: newT});
            }} style={{width: '60px', padding: '10px', borderRadius: '10px', border: '1px solid #dff4e4', outline: 'none'}} placeholder="Icon" />
            <input type="text" value={t.desc} onChange={e => {
              const newT = [...formData.tarefas]; newT[i].desc = e.target.value; setFormData({...formData, tarefas: newT});
            }} style={{flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #dff4e4', outline: 'none'}} placeholder="Descrição" />
            <button onClick={() => {
              const newT = [...formData.tarefas]; newT.splice(i, 1); setFormData({...formData, tarefas: newT});
            }} style={{background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer'}}>X</button>
          </div>
        ))}
      </div>

      <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
        <button onClick={onCancel} style={{padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#f5f0e8', color: '#5e7364', cursor: 'pointer', fontWeight: 600}}>Cancelar</button>
        <button onClick={handleSave} style={{padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#3b9b4f', color: 'white', cursor: 'pointer', fontWeight: 600}}>Guardar Villa</button>
      </div>
    </div>
  );
}