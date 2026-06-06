"use client";
import { useState, ChangeEvent } from "react";

// 1. DEFINIÇÃO DE TIPOS (A grande vantagem do TypeScript)
interface Tag {
  nome: string;
  classe: string;
}

interface Tarefa {
  icon: string;
  desc: string;
}

interface Villa {
  numero: string;
  tags: Tag[];
  tarefas: Tarefa[];
  nota?: string; // O ponto de interrogação significa que esta propriedade é opcional
}

// 2. DADOS (Agora tipados com a interface "Villa")
const villasData: Villa[] = [
  {
    numero: "102",
    tags: [
      { nome: "🌿 Jardim", classe: "tag-jardim" },
      { nome: "🧹 Limpeza", classe: "tag-limpeza" }
    ],
    tarefas: [
      { icon: "🌿", desc: "Retirar plantas que crescem nos caminhos entre tábuas e nas pedras à volta da villa" },
      { icon: "🪵", desc: "Canteiros da frente têm casca de pinheiro — deixar a casca no canteiro" },
      { icon: "🪴", desc: "Limpar a zona do deck na parte de trás e o caminho para a piscina" }
    ],
    nota: "💡 As tarefas desta villa estão incluídas nas tarefas comuns a todas as villas."
  },
  {
    numero: "103",
    tags: [
      { nome: "🌿 Jardim", classe: "tag-jardim" },
      { nome: "💧 Lago", classe: "tag-piscina" },
      { nome: "🔧 Manutenção", classe: "tag-manutencao" }
    ],
    tarefas: [
      { icon: "✂️", desc: "Cortar a relva" },
      { icon: "🪣", desc: "Limpar o skimmer do lago (retirar folhas e detritos do cesto)" },
      { icon: "💧", desc: "Fazer fertirega — aguardar formação da coordenadora" },
      { icon: "🌊", desc: "Verificar que a cascata de água está a cair normalmente — se não tiver água a cair, avisar coordenadora" },
      { icon: "🧹", desc: "Limpar a frente da casa e o canteiro ao lado do lago" },
      { icon: "🍋", desc: "Verificar as árvores de fruta que ficam depois do lago — reportar qualquer anomalia" }
    ],
    nota: "⚠️ A fertirega requer formação específica. Não realizar sem ter sido ensinado pela coordenadora."
  },
  {
    numero: "104",
    tags: [
      { nome: "🌿 Jardim", classe: "tag-jardim" },
      { nome: "🧹 Limpeza", classe: "tag-limpeza" }
    ],
    tarefas: [
      { icon: "🌿", desc: "Tirar ervas que crescem no deck entre as tábuas e nas pedras à volta da casa" },
      { icon: "🧹", desc: "Limpeza geral do jardim — varrer folhas, limpar caminhos e áreas exteriores" }
    ]
  }
];

export default function Home() {
  // 3. ESTADOS TIPADOS
  const [pesquisa, setPesquisa] = useState<string>("");
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});

  const toggleVilla = (numero: string) => {
    setAbertas((prev) => ({ ...prev, [numero]: !prev[numero] }));
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setPesquisa(e.target.value);
  };

  const villasFiltradas = villasData.filter((v) => v.numero.includes(pesquisa.trim()));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div className="header">
        <div className="header-zona">Resort — Zona</div>
        <h1>Bicas Villas</h1>
        <div className="header-sub">Guia de tarefas para a equipa</div>
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
        <div className="aviso-geral-titulo">⚠️ Todas as villas — sempre que necessário</div>
        <div className="aviso-geral-item"><span className="icon">🧹</span><span>Varrer e limpar toda a área exterior da villa</span></div>
        <div className="aviso-geral-item"><span className="icon">🌿</span><span>Arrancar ervas que crescem em caminhos, entre tábuas, decks e vasos</span></div>
        <div className="aviso-geral-item"><span className="icon">🪵</span><span>Canteiros da frente têm casca de pinheiro — a casca fica no canteiro, não retirar</span></div>
        <div className="aviso-geral-item"><span className="icon">🪴</span><span>Limpar sempre a zona do deck na parte de trás e o caminho para a piscina</span></div>
      </div>

      <div className="contador">
        {pesquisa.trim() === '' ? `A mostrar ${villasData.length} villas` : `${villasFiltradas.length} villa(s) encontrada(s)`}
      </div>

      <div className="villas-lista">
        {villasFiltradas.map((villa) => (
          <div className="villa-card" key={villa.numero}>
            <div className="villa-header" onClick={() => toggleVilla(villa.numero)}>
              <div className="villa-header-left">
                <div className="villa-numero">{villa.numero}</div>
                <div>
                  <div className="villa-nome">Villa {villa.numero}</div>
                  <div className="villa-tags">
                    {villa.tags.map((tag, index) => (
                      <span key={index} className={`tag ${tag.classe}`}>{tag.nome}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={`villa-chevron ${abertas[villa.numero] ? 'open' : ''}`}>▾</div>
            </div>

            {abertas[villa.numero] && (
              <div className="villa-body">
                <div className="secao">
                  <div className="secao-titulo">Tarefas específicas</div>
                  {villa.tarefas.map((tarefa, idx) => (
                    <div className="tarefa-item" key={idx}>
                      <span className="tarefa-icon">{tarefa.icon}</span>
                      <span>{tarefa.desc}</span>
                    </div>
                  ))}
                </div>
                {villa.nota && <div className="nota">{villa.nota}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}