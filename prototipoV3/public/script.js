/* ============================================================
   SELic - Protótipo V3
   Front-end: máscaras, localStorage, navegação (3 telas),
   formulários dinâmicos da Tela 3 e geração de .docx
   ============================================================ */

// ============================================================
// 1. DADOS DO ALUNO (Tela 1) — localStorage
// ============================================================
const STORAGE_KEY = "selic_aluno_v3";

let alunoAtual = {};
try {
  alunoAtual = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
} catch (e) {
  alunoAtual = {};
}

function salvarDadosAluno() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alunoAtual));
}

// ============================================================
// 2. DEFINIÇÃO DOS CAMPOS DA TELA 1
// ============================================================
const CAMPOS_TELA1 = [
  { id: "nome",       label: "Nome completo",           grupo: "Identificação",              tipo: "text",   span: 2, mask: null,      placeholder: "Nome completo do(a) aluno(a)" },
  { id: "nascimento", label: "Data de nascimento",      grupo: "Identificação",              tipo: "text",   span: 1, mask: "data",     placeholder: "dd/mm/aaaa" },
  { id: "cpf",        label: "CPF",                     grupo: "Identificação",              tipo: "text",   span: 1, mask: "cpf",      placeholder: "000.000.000-00" },
  { id: "rg",         label: "RG",                      grupo: "Identificação",              tipo: "text",   span: 1, mask: "rg",       placeholder: "00.000.000-0" },
  { id: "email",      label: "E-mail",                  grupo: "Contato",                    tipo: "email",  span: 2, mask: null,       placeholder: "aluno@email.com" },
  { id: "telefone",   label: "Telefone",                grupo: "Contato",                    tipo: "text",   span: 1, mask: "telefone", placeholder: "(00) 0000-0000" },
  { id: "celular",    label: "Celular",                 grupo: "Contato",                    tipo: "text",   span: 1, mask: "celular",  placeholder: "(00) 9 0000-0000" },
  { id: "endereco",   label: "Endereço",                grupo: "Localização",                tipo: "text",   span: 2, mask: null,        placeholder: "Rua, número, bairro, cidade" },
  { id: "cep",        label: "CEP",                     grupo: "Localização",                tipo: "text",   span: 1, mask: "cep",      placeholder: "00000-000" },
  { id: "curso",      label: "Curso",                   grupo: "Informações Acadêmicas",     tipo: "select", span: 1, mask: null,        opcoes: ["Ciências Biológicas", "Computação"] },
  { id: "turma",      label: "Turma",                   grupo: "Informações Acadêmicas",     tipo: "text",   span: 1, mask: null,        placeholder: "Ex.: 6A" },
  { id: "semestre",   label: "Semestre",                grupo: "Informações Acadêmicas",     tipo: "text",   span: 1, mask: null,        placeholder: "Ex.: 1º, 2º, 3º..." },
  { id: "ano",        label: "Ano",                     grupo: "Informações Acadêmicas",     tipo: "text",   span: 1, mask: null,        placeholder: "Ex.: 2026" }
];

// ============================================================
// 3. MÁSCARAS DE ENTRADA
// ============================================================
function apenasDigitos(v) {
  return (v || "").replace(/\D/g, "");
}

function mascaraCPF(v) {
  let d = apenasDigitos(v).slice(0, 11);
  if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
  return d;
}

function mascaraRG(v) {
  let d = apenasDigitos(v).slice(0, 9);
  if (d.length > 7) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}-${d.slice(8)}`;
  if (d.length > 4) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`;
  if (d.length > 2) return `${d.slice(0,2)}.${d.slice(2)}`;
  return d;
}

function mascaraCEP(v) {
  let d = apenasDigitos(v).slice(0, 8);
  if (d.length > 5) return `${d.slice(0,5)}-${d.slice(5)}`;
  return d;
}

function mascaraTelefone(v) {
  let d = apenasDigitos(v).slice(0, 10);
  if (d.length > 6) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return d;
}

function mascaraCelular(v) {
  let d = apenasDigitos(v).slice(0, 11);
  if (d.length > 9) return `(${d.slice(0,2)}) ${d.slice(2,3)} ${d.slice(3,7)}-${d.slice(7,11)}`;
  if (d.length > 6) return `(${d.slice(0,2)}) ${d.slice(2,3)} ${d.slice(3,7)}`;
  if (d.length > 2) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return d;
}

function mascaraData(v) {
  let d = apenasDigitos(v).slice(0, 8);
  if (d.length > 4) return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0,2)}/${d.slice(2)}`;
  return d;
}

const MASCARAS = {
  cpf: mascaraCPF,
  rg: mascaraRG,
  cep: mascaraCEP,
  telefone: mascaraTelefone,
  celular: mascaraCelular,
  data: mascaraData
};

function aplicarMascara(input) {
  const mask = input.dataset.mask;
  if (!mask || !MASCARAS[mask]) return;
  input.value = MASCARAS[mask](input.value);
}

// Converte dd/mm/aaaa ou retorna como está se já for ISO
function dataToISO(str) {
  if (!str) return "";
  if (str.includes("-")) return str;
  const p = str.split("/");
  if (p.length !== 3) return str;
  const [d, m, a] = p;
  if (d && m && a) return `${a}-${m}-${d}`;
  return str;
}

function esc(str) {
  // Escapa caracteres especiais usando String.fromCharCode(38) para evitar
  // problemas com entidades HTML no código-fonte.
  var amp = String.fromCharCode(38);
  return String(str || "")
    .replace(new RegExp(amp, "g"), amp + "amp;")
    .replace(/"/g, amp + "quot;")
    .replace(/</g, amp + "lt;")
    .replace(/>/g, amp + "gt;");
}

// ============================================================
// 4. TELA 1 — FORMULÁRIO DO ALUNO
// ============================================================
function renderTela1() {
  const container = document.getElementById("formAluno");
  container.innerHTML = "";

  let grupoAtual = null;
  let gridAtual = null;

  CAMPOS_TELA1.forEach(campo => {
    if (campo.grupo !== grupoAtual) {
      grupoAtual = campo.grupo;

      const title = document.createElement("h2");
      title.className = "section-title";
      title.textContent = campo.grupo;
      container.appendChild(title);

      gridAtual = document.createElement("div");
      gridAtual.className = "row g-3";
      container.appendChild(gridAtual);
    }

    const col = document.createElement("div");
    col.className = `col-12 ${campo.span === 2 ? "" : "col-md-6"}`;

    let inputHtml = "";
    if (campo.tipo === "select") {
      inputHtml = `<select class="form-select" id="alu_${campo.id}" data-campo="${campo.id}">`;
      inputHtml += `<option value="">Selecione…</option>`;
      campo.opcoes.forEach(op => {
        inputHtml += `<option value="${op}" ${alunoAtual[campo.id] === op ? "selected" : ""}>${op}</option>`;
      });
      inputHtml += `</select>`;
    } else {
      const maskAttr = campo.mask ? `data-mask="${campo.mask}"` : "";
      const inputmode = campo.mask ? "numeric" : "text";
      inputHtml = `<input type="${campo.tipo || "text"}" class="form-control" id="alu_${campo.id}" data-campo="${campo.id}" placeholder="${campo.placeholder || ""}" value="${esc(alunoAtual[campo.id] || "")}" ${maskAttr} inputmode="${inputmode}">`;
    }

    col.innerHTML = `<label class="form-label" for="alu_${campo.id}">${campo.label}</label>${inputHtml}`;
    gridAtual.appendChild(col);
  });

  // Aplicar máscaras nos campos
  container.querySelectorAll("input[data-mask]").forEach(inp => {
    aplicarMascara(inp);
    inp.addEventListener("input", () => {
      aplicarMascara(inp);
    });
  });

  // Salvar automaticamente conforme o usuário digita
  container.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", () => {
      alunoAtual[el.dataset.campo] = el.value;
      salvarDadosAluno();
    });
    el.addEventListener("change", () => {
      alunoAtual[el.dataset.campo] = el.value;
      salvarDadosAluno();
    });
  });
}

// ============================================================
// 5. TELA 2 — MENU DE DOCUMENTOS
// ============================================================
const DOC_CATALOGO = {
  geraveis: [
    { id: "04", nome: "Formulário de Liberação para Estágio", descricao: "Autorização da coordenação e plano de atividades", icone: "📋" },
    { id: "06", nome: "Ficha de Acompanhamento de Estagiário", descricao: "Registro de frequência diária no local de estágio", icone: "🗓️" },
    { id: "07", nome: "Relatório Semestral de Estágio", descricao: "Relatório com descrição das atividades e autoavaliação", icone: "📄" },
    { id: "09", nome: "Ficha de Frequência e Avaliação do Estagiário", descricao: "Frequência e avaliação pelo supervisor", icone: "✅" },
    { id: "10", nome: "Requerimento para Aproveitamento de Horas", descricao: "Solicitação de aproveitamento de carga horária", icone: "⭐" },
    { id: "12", nome: "Proposta de Atuação Pedagógica", descricao: "Plano de intervenção pedagógica para a licenciatura", icone: "🎯" }
  ],
  download: [
    { id: "01", nome: "Lei de Estágio - 11.788/2008", icone: "📜" },
    { id: "02", nome: "Regulamento de Estágio das Licenciaturas", icone: "📘" },
    { id: "03", nome: "Convênio de Estágio - Campus Pinheiral", icone: "🤝" },
    { id: "05", nome: "Termo de Compromisso de Estágio", icone: "📝" },
    { id: "08", nome: "Ficha de Avaliação do Estágio", icone: "📋" },
    { id: "11", nome: "Termo Aditivo", icone: "➕" }
  ]
};

function renderTela2() {
  const container = document.getElementById("listaDocumentos");
  container.innerHTML = "";

  // Título seção geráveis
  const titleGeraveis = document.createElement("h2");
  titleGeraveis.className = "section-title";
  titleGeraveis.textContent = "📄 Documentos para preencher";
  container.appendChild(titleGeraveis);

  const rowGeraveis = document.createElement("div");
  rowGeraveis.className = "row g-3";
  container.appendChild(rowGeraveis);

  DOC_CATALOGO.geraveis.forEach(doc => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";

    col.innerHTML = `
      <div class="doc-card">
        <div class="doc-icon">${doc.icone}</div>
        <div class="doc-num">Doc ${doc.id}</div>
        <div class="doc-name">${doc.nome}</div>
        <div class="doc-desc">${doc.descricao}</div>
        <div class="doc-actions">
          <button class="btn btn-outline-primary" onclick="visualizarDoc('${doc.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Ver
          </button>
          <button class="btn btn-primary" onclick="abrirDocumento('${doc.id}')">
            Preencher
          </button>
        </div>
      </div>`;
    rowGeraveis.appendChild(col);
  });

  // Título "download direto"
  const titleDownload = document.createElement("h2");
  titleDownload.className = "section-title mt-5";
  titleDownload.textContent = "📥 Documentos para download direto";
  container.appendChild(titleDownload);

  const rowDownload = document.createElement("div");
  rowDownload.className = "row g-3";
  container.appendChild(rowDownload);

  DOC_CATALOGO.download.forEach(doc => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";

    col.innerHTML = `
      <div class="doc-card">
        <div class="doc-icon">${doc.icone}</div>
        <div class="doc-num">Doc ${doc.id}</div>
        <div class="doc-name">${doc.nome}</div>
        <div class="doc-desc">Arquivo pronto para download (PDF/DOC).</div>
        <div class="doc-actions">
          <button class="btn btn-outline-primary" onclick="baixarDireto('${doc.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar
          </button>
        </div>
      </div>`;
    rowDownload.appendChild(col);
  });
}

function baixarDireto(id) {
  window.location.href = `/api/download/${id}`;
}

// ============================================================
// 6. DEFINIÇÃO DOS DOCUMENTOS (Tela 3)
//    Apenas os campos que NÃO foram pedidos na Tela 1
// ============================================================
const DOC_DEFS = {
  "04": {
    titulo: "Formulário de Liberação para Estágio",
    descricao: "Dados do estágio e plano de atividades.",
    campos: [
      { grupo: "Local de Estágio", campos: [
        { id: "escola", label: "Escola / Empresa", tipo: "text", obrigatorio: true, span: 2 },
        { id: "end_escola", label: "Endereço do local de estágio", tipo: "text", span: 2 },
        { id: "supervisor", label: "Supervisor(a) de Estágio", tipo: "text", obrigatorio: true, span: 2 },
        { id: "tel_supervisor", label: "Telefone do supervisor", tipo: "text", mask: "telefone" },
        { id: "orientador", label: "Professor(a) Orientador(a) / IFRJ", tipo: "text", obrigatorio: true, span: 2 }
      ]},
      { grupo: "Plano de Atividades", campos: [
        { id: "inicio", label: "Data prevista de início", tipo: "date", obrigatorio: true },
        { id: "termino", label: "Data prevista de término", tipo: "date", obrigatorio: true },
        { id: "tipo", label: "Tipo de atividade", tipo: "select", opcoes: [["estagio","Estágio"],["projeto","Projeto / Monitoria / Prática Profissional"]] },
        { id: "atividades", label: "Atividades a serem desenvolvidas", tipo: "textarea", obrigatorio: true, span: 2, rows: 5 }
      ]}
    ]
  },
  "06": {
    titulo: "Ficha de Acompanhamento de Estagiário",
    descricao: "Registro de frequência diária no local de estágio.",
    campos: [
      { grupo: "Identificação do Estágio", campos: [
        { id: "local", label: "Local de estágio (escola/empresa)", tipo: "text", obrigatorio: true, span: 2 },
        { id: "supervisor", label: "Supervisor(a) do local", tipo: "text", obrigatorio: true, span: 2 },
        { id: "inicio", label: "Data de início", tipo: "date", obrigatorio: true },
        { id: "termino", label: "Data de término", tipo: "date" }
      ]},
      { grupo: "Registros de Frequência", registros: true }
    ]
  },
  "07": {
    titulo: "Relatório Semestral de Estágio",
    descricao: "Relatório completo das atividades desenvolvidas.",
    campos: [
      { grupo: "Empresa / Instituição", campos: [
        { id: "empresa", label: "Nome da empresa / instituição", tipo: "text", obrigatorio: true, span: 2 },
        { id: "end_empresa", label: "Endereço da empresa", tipo: "text", span: 2 },
        { id: "tel_empresa", label: "Telefone da empresa", tipo: "text", mask: "telefone" },
        { id: "email_empresa", label: "E-mail da empresa", tipo: "email" },
        { id: "responsavel", label: "Responsável pelo estagiário", tipo: "text", span: 2 }
      ]},
      { grupo: "Conteúdo do Relatório", campos: [
        { id: "supervisor", label: "Supervisor do estágio (nome e formação)", tipo: "text", span: 2 },
        { id: "orientador", label: "Professor(a) orientador(a) / IFRJ", tipo: "text", span: 2 },
        { id: "empresa_decr", label: "Descrição da empresa", tipo: "textarea", rows: 3, span: 2 },
        { id: "objetivos", label: "Objetivos do estágio", tipo: "textarea", obrigatorio: true, rows: 4, span: 2 },
        { id: "atividades", label: "Desenvolvimento das atividades", tipo: "textarea", obrigatorio: true, rows: 5, span: 2 },
        { id: "dificuldades", label: "Dificuldades encontradas", tipo: "textarea", rows: 3, span: 2 },
        { id: "consideracoes", label: "Considerações finais", tipo: "textarea", obrigatorio: true, rows: 4, span: 2 }
      ]}
    ]
  },
  "09": {
    titulo: "Ficha de Frequência e Avaliação do Estagiário",
    descricao: "Controle de frequência e avaliação do estagiário.",
    campos: [
      { grupo: "Identificação do Estágio", campos: [
        { id: "local", label: "Local de estágio (escola/empresa)", tipo: "text", obrigatorio: true, span: 2 },
        { id: "supervisor", label: "Supervisor(a) do local", tipo: "text", obrigatorio: true, span: 2 },
        { id: "inicio", label: "Data de início", tipo: "date", obrigatorio: true },
        { id: "termino", label: "Data de término", tipo: "date" }
      ]},
      { grupo: "Registros de Frequência", registros: true }
    ]
  },
  "10": {
    titulo: "Requerimento para Aproveitamento de Carga Horária",
    descricao: "Solicitação de aproveitamento de horas por prática profissional.",
    campos: [
      { grupo: "Solicitação", campos: [
        { id: "periodo", label: "Período", tipo: "select", obrigatorio: true,
          opcoes: ["1º","2º","3º","4º","5º","6º","7º","8º"].map(p => [p, p + " período"]) },
        { id: "data", label: "Data do requerimento", tipo: "date", obrigatorio: true }
      ]},
      { grupo: "Documentação em anexo", checkboxes: [
        { id: "ctps", label: "Cópia da Carteira de Trabalho (frente e verso)" },
        { id: "declaracao", label: "Declaração do supervisor informando a atividade" },
        { id: "programa", label: "Programa de atividades desenvolvidas (assinado e carimbado)" },
        { id: "ficha", label: "Ficha de avaliação e frequência (assinada e carimbada)" },
        { id: "formulario", label: "Formulário para escolha do professor orientador" }
      ]}
    ]
  },
  "12": {
    titulo: "Proposta de Atuação Pedagógica",
    descricao: "Plano de intervenção pedagógica.",
    campos: [
      { grupo: "Orientação", campos: [
        { id: "orientador", label: "Nome do(a) professor(a) orientador(a)", tipo: "text", obrigatorio: true, span: 2 }
      ]},
      { grupo: "Conteúdo da Proposta", campos: [
        { id: "titulo", label: "1. Título da intervenção", tipo: "text", obrigatorio: true, span: 2 },
        { id: "intro", label: "2. Introdução", tipo: "textarea", obrigatorio: true, rows: 5, span: 2 },
        { id: "objetivos", label: "3. Objetivos", tipo: "textarea", obrigatorio: true, rows: 4, span: 2 },
        { id: "teoria", label: "4. Fundamentação Teórica", tipo: "textarea", rows: 4, span: 2 },
        { id: "metodologia", label: "5. Metodologia", tipo: "textarea", obrigatorio: true, rows: 4, span: 2 },
        { id: "recursos", label: "6. Recursos Necessários", tipo: "textarea", rows: 3, span: 2 },
        { id: "avaliacao", label: "7. Avaliação", tipo: "textarea", rows: 3, span: 2 },
        { id: "resultados", label: "8. Resultados Esperados", tipo: "textarea", rows: 3, span: 2 },
        { id: "consideracoes", label: "9. Considerações Finais", tipo: "textarea", rows: 4, span: 2 },
        { id: "referencias", label: "10. Referências", tipo: "textarea", rows: 4, span: 2 },
        { id: "local_data", label: "Local e data", tipo: "text", placeholder: "Ex.: Pinheiral, 15 de março de 2026", span: 2 }
      ]}
    ]
  }
};

// Quais dados da Tela 1 aparecem no resumo de cada documento
const ALUNO_NO_DOC = {
  "04": ["nome", "curso", "turma", "endereco", "telefone", "celular", "email", "rg", "cpf", "nascimento", "ano"],
  "06": ["nome", "curso", "turma", "ano"],
  "07": ["nome", "curso", "turma", "endereco", "telefone", "email", "ano"],
  "09": ["nome", "curso", "turma", "ano"],
  "10": ["nome", "curso", "ano"],
  "12": ["nome", "curso", "ano"]
};

// Aliases de chaves de aluno conforme o documento
const ALUNO_ALIAS = {
  "06": { "nome": "aluno" },
  "09": { "nome": "aluno" },
  "12": { "nome": "aluno" }
};

const PREVIEW_TITULOS = {
  "04": "Formulário de Liberação para Estágio",
  "06": "Ficha de Acompanhamento de Estagiário",
  "07": "Relatório Semestral de Estágio",
  "09": "Ficha de Frequência e Avaliação",
  "10": "Requerimento para Aproveitamento",
  "12": "Proposta de Atuação Pedagógica"
};

let docAtivo = null;
let numDoc = {};  // valores digitados nos campos do doc ativo (persiste na navegação)
let numRegistros = 0;

// ============================================================
// 7. TELA 3 — ABRIR/PRENCHER DOCUMENTO
// ============================================================
function abrirDocumento(id) {
  docAtivo = id;
  document.getElementById("docTitulo").textContent = DOC_DEFS[id].titulo;
  document.getElementById("docDescricao").textContent = DOC_DEFS[id].descricao || "";
  document.getElementById("docBadge").innerHTML = `Documento <b>${id}</b> — Preenchimento`;

  const container = document.getElementById("camposDoc");
  container.innerHTML = "";

  // Resumo dos dados do aluno preenchidos automaticamente
  const resumo = document.createElement("div");
  resumo.className = "aluno-summary";
  resumo.innerHTML = `
    <div class="title">✅ Dados do aluno (Tela 1) — preenchidos automaticamente</div>
    <div class="grid" id="sumarioAluno"></div>`;
  container.appendChild(resumo);

  const sumario = resumo.querySelector("#sumarioAluno");
  const itens = ALUNO_NO_DOC[id] || [];
  let temDados = false;
  itens.forEach(campoId => {
    const conf = CAMPOS_TELA1.find(c => c.id === campoId);
    if (!conf) return;
    const valor = alunoAtual[campoId];
    if (!valor) return;
    temDados = true;
    sumario.innerHTML += `<div><b>${conf.label}:</b> ${esc(valor)}</div>`;
  });
  if (!temDados) {
    sumario.innerHTML = `<div>Nenhum dado cadastrado na Tela 1. <a href="#" onclick="irParaTela(1);return false;">Preencher agora</a></div>`;
  }

  // Campos do documento
  (DOC_DEFS[id].campos || []).forEach(grupo => {
    // Grupo com registros dinâmicos
    if (grupo.registros) {
      const title = document.createElement("h3");
      title.className = "section-title";
      title.textContent = grupo.grupo;
      container.appendChild(title);

      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div id="listaRegistros" class="mt-2"></div>
        <button class="btn btn-sm btn-outline-primary mt-2" onclick="adicionarRegistro()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar linha de registro
        </button>`;
      container.appendChild(wrap);

      if (numRegistros === 0) {
        for (let i = 0; i < 5; i++) adicionarRegistro();
      }
      return;
    }

    // Grupo com checkboxes
    if (grupo.checkboxes) {
      const title = document.createElement("h3");
      title.className = "section-title";
      title.textContent = grupo.grupo;
      container.appendChild(title);

      grupo.checkboxes.forEach(cb => {
        const id = `f_${docAtivo}_${cb.id}`;
        const div = document.createElement("div");
        div.className = "form-check";
        const checked = numDoc[id] ? "checked" : "";
        div.innerHTML = `
          <input class="form-check-input" type="checkbox" id="${id}" ${checked} data-doc="${docAtivo}" data-campo="${cb.id}">
          <label class="form-check-label" for="${id}">${cb.label}</label>`;
        container.appendChild(div);
      });
      return;
    }

    // Grupo normal de campos
    const title = document.createElement("h3");
    title.className = "section-title";
    title.textContent = grupo.grupo;
    container.appendChild(title);

    const row = document.createElement("div");
    row.className = "row g-3";

    grupo.campos.forEach(campo => {
      const id = `f_${docAtivo}_${campo.id}`;
      const col = document.createElement("div");
      col.className = `col-12 ${campo.span === 2 ? "" : "col-md-6"}`;

      let valorSalvo = "";
      try { valorSalvo = numDoc[id] !== undefined ? numDoc[id] : (alunoAtual[campo.campoAluno] || ""); } catch (e) { valorSalvo = ""; }

      let inputHtml = "";
      if (campo.tipo === "select") {
        inputHtml = `<select class="form-select" id="${id}" data-doc="${docAtivo}" data-campo="${campo.id}"><option value="">Selecione…</option>`;
        campo.opcoes.forEach(op => {
          const [val, label] = Array.isArray(op) ? op : [op, op];
          inputHtml += `<option value="${val}" ${valorSalvo === val ? "selected" : ""}>${label}</option>`;
        });
        inputHtml += `</select>`;
      } else if (campo.tipo === "textarea") {
        inputHtml = `<textarea class="form-control" id="${id}" rows="${campo.rows || 3}" placeholder="${campo.placeholder || ""}" data-doc="${docAtivo}" data-campo="${campo.id}">${esc(valorSalvo)}</textarea>`;
      } else {
        const maskAttr = campo.mask ? `data-mask="${campo.mask}"` : "";
        inputHtml = `<input type="${campo.tipo || "text"}" class="form-control" id="${id}" placeholder="${campo.placeholder || ""}" value="${esc(valorSalvo)}" ${maskAttr} data-doc="${docAtivo}" data-campo="${campo.id}">`;
      }

      col.innerHTML = `<label class="form-label" for="${id}">${campo.label}${campo.obrigatorio ? ' <span class="req">*</span>' : ""}</label>${inputHtml}`;
      row.appendChild(col);
    });

    container.appendChild(row);
  });

  // Aplica máscaras nos inputs da Tela 3
  container.querySelectorAll("input[data-mask]").forEach(inp => {
    aplicarMascara(inp);
    inp.addEventListener("input", () => aplicarMascara(inp));
  });

  // Persiste valores em memória conforme digita
  container.addEventListener("input", (e) => {
    const alvo = e.target.tagName === "SELECT" || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";
    if (!alvo) return;
    const campo = e.target.dataset.campo;
    if (!campo) return;
    if (e.target.type === "checkbox") {
      numDoc[e.target.id] = e.target.checked;
    } else {
      numDoc[e.target.id] = e.target.value;
    }
  });
  container.addEventListener("change", (e) => {
    const campo = e.target.dataset.campo;
    if (!campo) return;
    if (e.target.type === "checkbox") {
      numDoc[e.target.id] = e.target.checked;
    } else {
      numDoc[e.target.id] = e.target.value;
    }
  });

  // Mostra botões e navega para a tela 3
  document.getElementById("docFormActions").style.display = "flex";
  irParaTela(3);
}

function adicionarRegistro() {
  numRegistros++;
  const div = document.createElement("div");
  div.className = "reg-linha";

  const estado = numDoc[`f_${docAtivo}_reg_${numRegistros}`] || {};
  const numAtual = numRegistros;

  div.innerHTML = `
    <span class="reg-num">${numAtual}</span>
    <input type="date" class="form-control form-control-sm reg-data" value="${estado.data || ""}">
    <input type="time" class="form-control form-control-sm reg-entrada" value="${estado.entrada || ""}">
    <input type="time" class="form-control form-control-sm reg-saida" value="${estado.saida || ""}">`;

  const lista = document.getElementById("listaRegistros");
  if (lista) lista.appendChild(div);

  div.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => {
      numDoc[`${docAtivo}_reg_${numAtual}`] = {
        data: div.querySelector(".reg-data").value,
        entrada: div.querySelector(".reg-entrada").value,
        saida: div.querySelector(".reg-saida").value
      };
    });
  });
}

// ============================================================
// 8. COLETA DE DADOS (payload)
// ============================================================
function coletarPayload(id) {
  const payload = {};

  // Dados do aluno vindo da Tela 1
  ["nome", "nascimento", "cpf", "rg", "email", "telefone", "celular", "endereco", "cep", "curso", "turma", "semestre", "ano"].forEach(k => {
    payload[k] = alunoAtual[k] || "";
  });
  if (payload.nascimento) payload.nascimento = dataToISO(payload.nascimento);

  // Campos do documento
  const def = DOC_DEFS[id];
  (def.campos || []).forEach(grupo => {
    if (grupo.registros) {
      const regs = [];
      document.querySelectorAll("#camposDoc #listaRegistros .reg-linha").forEach(ln => {
        const data = ln.querySelector(".reg-data").value;
        const entrada = ln.querySelector(".reg-entrada").value;
        const saida = ln.querySelector(".reg-saida").value;
        if (data || entrada || saida) {
          regs.push({ data: dataToISO(data), entrada, saida });
        }
      });
      payload.registros = regs;
    }
    if (grupo.checkboxes) {
      grupo.checkboxes.forEach(cb => {
        const el = document.getElementById(`f_${id}_${cb.id}`);
        payload[cb.id] = el ? el.checked : false;
      });
    }
    (grupo.campos || []).forEach(campo => {
      const el = document.getElementById(`f_${id}_${campo.id}`);
      if (el) {
        let val = "";
        if (campo.tipo === "checkbox") {
          val = el.checked;
        } else {
          val = el.value;
        }
        if (campo.tipo === "date" && val) val = dataToISO(val);
        payload[campo.id] = val;
      }
    });
  });

  // Aliases de aluno para alguns docs (ex.: nome -> aluno no doc 06)
  if (ALUNO_ALIAS[id]) {
    Object.entries(ALUNO_ALIAS[id]).forEach(([alunoKey, docKey]) => {
      payload[docKey] = payload[alunoKey] || "";
    });
  }

  return payload;
}

// ============================================================
// 9. GERAÇÃO DO .DOCX
// ============================================================
async function gerarDocx(id) {
  const payload = coletarPayload(id);

  // Validação de obrigatórios da Tela 3
  const obrigatorios = [];
  (DOC_DEFS[id].campos || []).forEach(grupo => {
    (grupo.campos || []).forEach(campo => {
      if (campo.obrigatorio && !payload[campo.id]) obrigatorios.push(campo.label);
    });
  });
  if (obrigatorios.length > 0) {
    alert("Preencha os campos obrigatórios:\n• " + obrigatorios.join("\n• "));
    return;
  }

  const btn = document.getElementById("btnGerar");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "⏳ Gerando…";
  }

  try {
    const resp = await fetch("/api/gerar-documento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId: id, payload })
    });

    if (!resp.ok) {
      let errMsg = "Erro desconhecido.";
      try {
        const e = await resp.json();
        errMsg = e.erro || errMsg;
      } catch (ign) {}
      throw new Error(errMsg);
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Doc${id}_preenchido.docx`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar o documento: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "⬇️ Gerar Word (.docx)";
    }
  }
}

// ============================================================
// 10. PRÉ-VISUALIZAÇÃO HTML (modal)
// ============================================================
function hdrPreview(p) {
  return `<div class="inst-header"><div class="nome-inst">Instituto Federal de Educação, Ciência e Tecnologia do Rio de Janeiro – IFRJ</div><div class="subtitulo">Campus Pinheiral | Licenciatura em ${esc(p.curso) || "..."}</div></div><hr>`;
}

function gerarPreviewHTML(id) {
  const p = coletarPayload(id);
  const lin = (label, valor) => `<div class="campo-linha"><span class="campo-label">${label}</span><span class="campo-valor">${esc(valor)}</span></div>`;
  const sec = titulo => `<div class="secao-titulo">${titulo}</div>`;
  const fmtData = v => {
    if (!v) return "____/____/________";
    if (v.includes("/")) return v;
    const [a, m, d] = v.split("-");
    return d ? `${d}/${m}/${a}` : v;
  };

  let html = "";

  if (id === "04") {
    html += `<div class="doc-titulo">Formulário de Liberação<br>Curso de Licenciatura em ${esc(p.curso) || "___________"}</div><hr>` +
      lin("Nome do(a) Aluno(a):", p.nome) +
      lin("Endereço:", p.endereco) +
      lin("Telefone/Celular:", [p.telefone, p.celular].filter(Boolean).join(" • ")) +
      lin("E-mail:", p.email) +
      lin("Local de Estágio:", p.escola) +
      lin("Supervisor(a):", p.supervisor) +
      lin("Professor(a) Orientador(a) / IFRJ:", p.orientador) +
      `<hr><div class="doc-titulo" style="font-size:11pt">Plano de Atividades</div>` +
      `<div>[ ${p.tipo === "projeto" ? "&nbsp;" : "X"} ] Estágio &nbsp;&nbsp; [ ${p.tipo === "projeto" ? "X" : "&nbsp;"} ] Projeto/Monitoria</div>` +
      lin("Nome do(a) Aluno(a):", p.nome) +
      lin("Data de Nascimento:", fmtData(p.nascimento)) +
      lin("RG:", p.rg) +
      lin("CPF:", p.cpf) +
      `<div class="campo-linha"><span class="campo-label">Período:</span><span class="campo-valor">${fmtData(p.inicio)} a ${fmtData(p.termino)}</span></div>` +
      sec("Atividades a serem desenvolvidas:") +
      `<div class="obs-box">${esc(p.atividades).replace(/\n/g, "<br>")}</div>` +
      `<div class="linha-assinatura"><div class="assinatura-bloco"><div class="assinatura-linha"></div><div class="assinatura-texto">Assinatura do(a) Supervisor(a)</div></div></div>`;
  } else if (id === "06" || id === "09") {
    html += `<div class="doc-titulo">${id === "06" ? "Ficha de Acompanhamento de Estagiário" : "Ficha de Frequência e Avaliação do Estagiário"}</div>` +
      lin("Local de Estágio:", p.local) +
      lin("Supervisor(a):", p.supervisor) +
      lin("Aluno(a):", p.aluno || p.nome) +
      lin("Curso:", p.curso) +
      lin("Início / Término:", `${fmtData(p.inicio)} a ${fmtData(p.termino)}`) +
      `<table class="freq-table"><thead><tr><th>Nº</th><th>Data</th><th>Entrada</th><th>Saída</th><th>Horas</th><th>Rubrica</th></tr></thead><tbody>`;
    (p.registros || []).forEach((r, i) => {
      let horas = "";
      if (r.entrada && r.saida) {
        const [eh, em] = r.entrada.split(":").map(Number);
        const [sh, sm] = r.saida.split(":").map(Number);
        const diff = (sh * 60 + sm) - (eh * 60 + em);
        if (diff > 0) {
          horas = `${Math.floor(diff / 60)}h${String(diff % 60).padStart(2, "0")}min`;
        }
      }
      html += `<tr><td>${i + 1}</td><td>${fmtData(r.data)}</td><td>${esc(r.entrada)}</td><td>${esc(r.saida)}</td><td>${horas}</td><td></td></tr>`;
    });
    html += `</tbody></table>` +
      `<div class="linha-assinatura"><div class="assinatura-bloco"><div class="assinatura-linha"></div><div class="assinatura-texto">Aluno(a)</div></div><div class="assinatura-bloco"><div class="assinatura-linha"></div><div class="assinatura-texto">Supervisor(a)</div></div></div>`;
  } else if (id === "07") {
    html += `<div class="doc-titulo">Relatório Semestral de Estágio</div>` +
      sec("1. Identificação") +
      lin("Nome:", p.nome) +
      lin("Telefone:", p.telefone) +
      lin("E-mail:", p.email) +
      lin("Endereço:", p.endereco) +
      lin("Curso:", p.curso) +
      lin("Empresa:", p.empresa) +
      lin("Endereço da empresa:", p.end_empresa) +
      lin("Responsável:", p.responsavel) +
      sec("2. Supervisor do Estágio:") +
      `<div class="obs-box">${esc(p.supervisor)}</div>` +
      sec("3. Professor Orientador do Estágio:") +
      `<div class="obs-box">${esc(p.orientador)}</div>` +
      sec("4. Descrição da Empresa:") +
      `<div class="obs-box">${esc(p.empresa_decr).replace(/\n/g, "<br>")}</div>` +
      sec("5. Objetivos do Estágio:") +
      `<div class="obs-box">${esc(p.objetivos).replace(/\n/g, "<br>")}</div>` +
      sec("6. Desenvolvimento das Atividades:") +
      `<div class="obs-box">${esc(p.atividades).replace(/\n/g, "<br>")}</div>` +
      sec("7. Dificuldades Encontradas:") +
      `<div class="obs-box">${esc(p.dificuldades).replace(/\n/g, "<br>")}</div>` +
      sec("8. Considerações Finais:") +
      `<div class="obs-box">${esc(p.consideracoes).replace(/\n/g, "<br>")}</div>` +
      `<div class="linha-assinatura"><div class="assinatura-bloco"><div class="assinatura-linha"></div><div class="assinatura-texto">Assinatura do(a) Aluno(a)</div></div></div>`;
  } else if (id === "10") {
    const listaAnexos = [
      ["ctps", "Cópia da Carteira de Trabalho (frente e verso)"],
      ["declaracao", "Declaração do supervisor informando a atividade"],
      ["programa", "Programa de atividades desenvolvidas (assinado e carimbado)"],
      ["ficha", "Ficha de avaliação e frequência (assinada e carimbada)"],
      ["formulario", "Formulário de escolha do professor orientador"]
    ];
    html += `<div class="doc-titulo">Requerimento para Aproveitamento de Carga Horária</div>` +
      `<p style="font-size:10pt;text-align:justify">Eu, <b>${esc(p.nome) || "________________"}</b>, regularmente matriculado(a) no <b>${esc(p.periodo) || "___"}</b> do Curso de Licenciatura em <b>${esc(p.curso) || "________"}</b> do IFRJ Campus Pinheiral, venho requerer o aproveitamento da carga horária total das atividades de prática profissional...</p>` +
      sec("Documentação comprobatória em anexo:") +
      listaAnexos.map(([key, label]) => `<div>[ ${p[key] ? "X" : "&nbsp;"} ] ${label}</div>`).join("") +
      `<p style="text-align:right">Pinheiral, ${fmtData(p.data)}</p>` +
      `<div class="linha-assinatura"><div class="assinatura-bloco"><div class="assinatura-linha"></div><div class="assinatura-texto">Assinatura do(a) Aluno(a)</div></div></div>`;
  } else if (id === "12") {
    const secNum = (n, t, c) => `<div class="secao-titulo">${n}. ${t}</div><div class="obs-box">${esc(c).replace(/\n/g, "<br>")}</div>`;
    html += `<div class="doc-titulo">Proposta de Atuação Pedagógica</div>` +
      `<p style="text-align:center">Curso de ${esc(p.curso) || "Licenciatura"} – IFRJ Campus Pinheiral<br><b>${esc(p.aluno || p.nome)}</b><br>${esc(p.orientador)}</p><hr>` +
      `<div style="text-align:center;font-weight:bold">${esc(p.ano) || "2026"}</div>` +
      `<div class="secao-titulo">Título: ${esc(p.titulo) || "[Inserir título]"}</div>` +
      secNum(2, "Introdução", p.intro) +
      secNum(3, "Objetivos", p.objetivos) +
      secNum(4, "Fundamentação Teórica", p.teoria) +
      secNum(5, "Metodologia", p.metodologia) +
      secNum(6, "Recursos Necessários", p.recursos) +
      secNum(7, "Avaliação", p.avaliacao) +
      secNum(8, "Resultados Esperados", p.resultados) +
      secNum(9, "Considerações Finais", p.consideracoes) +
      secNum(10, "Referências", p.referencias) +
      `<p style="text-align:right">${esc(p.local_data) || "Pinheiral, ____/____/____"}</p>` +
      `<div class="linha-assinatura"><div class="assinatura-bloco"><div class="assinatura-linha"></div><div class="assinatura-texto">Assinatura do(a) Aluno(a)</div></div><div class="assinatura-bloco"><div class="assinatura-linha"></div><div class="assinatura-texto">Professor(a) Orientador(a)</div></div></div>`;
  }

  return hdrPreview(p) + html;
}

function visualizarDoc(id) {
  const modalEl = document.getElementById("modalPreview");
  const modal = new bootstrap.Modal(modalEl);
  document.getElementById("previewTitle").textContent = PREVIEW_TITULOS[id] || "Pré-visualização";
  document.getElementById("previewContent").innerHTML = gerarPreviewHTML(id);
  modal.show();
}

// ============================================================
// 11. NAVEGAÇÃO ENTRE TELAS
// ============================================================
function irParaTela(n) {
  ["tela1", "tela2", "tela3"].forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.toggle("active", i + 1 === n);
  });

  document.querySelectorAll(".step-item").forEach((el, i) => {
    const num = i + 1;
    el.classList.toggle("active", num === n);
    el.classList.toggle("done", num < n);
  });

  if (n === 2) renderTela2();
  if (n === 3 && !docAtivo) {
    irParaTela(2);
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function voltarMenu() {
  irParaTela(2);
}

document.querySelectorAll(".step-item").forEach(el => {
  el.addEventListener("click", () => {
    const n = Number(el.dataset.step);
    if (n === 3 && !docAtivo) {
      alert("Selecione um documento primeiro.");
      return;
    }
    irParaTela(n);
  });
});

// ============================================================
// 12. INICIALIZAÇÃO
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderTela1();
  irParaTela(1);
});