const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "10mb" }));

// Servir arquivos estáticos da pasta public (front-end Bootstrap)
app.use(express.static(path.join(__dirname, "public")));

// ===== MAPEAMENTO DE ARQUIVOS =====
// Mapeia os IDs numéricos dos documentos para os arquivos em /templates
const TEMPLATES = {
  "04": "04 - Formulario de Liberacao Licenciatura.docx",
  "06": "06 - Ficha de Acompanhamento de Estagio.docx",
  "07": "07 - Relatorio Semestral de Estagio 2019.docx",
  "09": "09 - Ficha de Frequencia e Avaliacao do Estagiário.docx",
  "10": "10 - Requerimento para Aproveitamento de horas Licenciatura.docx",
  "12": "12 - Proposta de Atuação Pedagógica_note_ago24.docx"
};

// Documentos de download direto (arquivos prontos - Lei, Regulamento, etc.)
const DOWNLOADS = {
  "01": "01 - Lei de Estágio 11788.pdf",
  "02": "02 - Regulamento_de_estagio_dos_cursos_de_licenciatura_novo (2).pdf",
  "03": "03 - Convenio de estagio - Campus Pinheiral.doc",
  "05": "05 - Termo de compromisso. Licenciatura.doc",
  "08": "08- Ficha de Avaliação do Estagio.pdf",
  "11": "11 - Termo Aditivo.pdf"
};

const NOMES_AMIGAVEIS = {
  "01": "Lei de Estágio - 11.788/2008",
  "02": "Regulamento de Estágio das Licenciaturas",
  "03": "Convênio de Estágio - Campus Pinheiral",
  "05": "Termo de Compromisso de Estágio",
  "08": "Ficha de Avaliação do Estágio",
  "11": "Termo Aditivo"
};

// ===== FUNÇÕES AUXILIARES =====

// Converte data ISO (AAAA-MM-DD) para PT-BR (DD/MM/AAAA)
function formatarData(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-");
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Monta o objeto de dados que o template .docx irá consumir.
// Aqui definimos TODAS as tags possíveis que os seus modelos podem conter.
// Você pode editar os templates .docx adicionando tags como {nome}, {cpf}, etc.
function montarDadosDocumento(docId, payload) {
  const d = { ...payload };

  // Formata datas que chegam como AAAA-MM-DD (input type=date) para DD/MM/AAAA
  ["nascimento", "data", "inicio", "termino", "dataInicio", "dataTermino"].forEach(
    (campo) => {
      if (d[campo]) d[campo] = formatarData(d[campo]);
    }
  );

  // Se não houver valor, usa um espaço em branco para não deixar a tag visível
  const camposAluno = [
    "nome", "nascimento", "cpf", "rg", "email", "telefone", "celular",
    "endereco", "cep", "curso", "turma", "semestre", "ano"
  ];
  camposAluno.forEach((c) => {
    if (d[c] === undefined) d[c] = "";
  });

  // Dados do Doc 04 - Formulário de Liberação
  if (docId === "04") {
    d.nascimento = formatarData(d.nascimento);
    d.inicio = formatarData(d.inicio);
    d.termino = formatarData(d.termino);
    d.tipoEstagio = d.tipo === "estagio" ? "X" : " ";
    d.tipoProjeto = d.tipo === "projeto" ? "X" : " ";
    d.cursoCompleto = d.curso ? "Licenciatura em " + d.curso : "";
  }

  // Doc 06 - Ficha de Acompanhamento (tabela de registros)
  if (docId === "06" && Array.isArray(d.registros)) {
    d.registros = d.registros.map((reg, index) => {
      let calculoHoras = "";
      if (reg.entrada && reg.saida) {
        const [eh, em] = reg.entrada.split(":").map(Number);
        const [sh, sm] = reg.saida.split(":").map(Number);
        const diff = (sh * 60 + sm) - (eh * 60 + em);
        if (diff > 0) {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          calculoHoras = `${h}h${m ? String(m).padStart(2, "0") + "min" : ""}`;
        }
      }
      return {
        num: i + 1,
        data: formatarData(reg.data),
        entrada: reg.entrada || "",
        saida: reg.saida || "",
        horas: calculoHoras
      };
    });
  }

  // Doc 10 - Requerimento de Aproveitamento (checkboxes [X] / [ ])
  if (docId === "10") {
    d.data = formatarData(d.data);
    d.ctps = d.ctps ? "[X]" : "[ ]";
    d.declaracao = d.declaracao ? "[X]" : "[ ]";
    d.programa = d.programa ? "[X]" : "[ ]";
    d.ficha = d.ficha ? "[X]" : "[ ]";
    d.formulario = d.formulario ? "[X]" : "[ ]";
  }

  return d;
}

// ===== ROTA: LISTA DE DOCUMENTOS (menu da Tela 2) =====
app.get("/api/documentos", (req, res) => {
  const geraveis = Object.keys(TEMPLATES).map((id) => ({
    id,
    nome: TEMPLATES[id].replace(/^\d+\s*-\s*/, "").replace(/\.docx$/i, "")
  }));

  const download = Object.keys(DOWNLOADS).map((id) => ({
    id,
    nome: NOMES_AMIGAVEIS[id],
    arquivo: DOWNLOADS[id]
  }));

  res.json({ geraveis, download });
});

// ===== ROTA: DOWNLOAD DE ARQUIVO PRONTO (PDF/DOC) =====
app.get("/api/download/:id", (req, res) => {
  const { id } = req.params;
  const arquivo = DOWNLOADS[id];
  if (!arquivo) {
    return res.status(404).json({ erro: "Documento não encontrado." });
  }

  const caminho = path.join(__dirname, "templates", arquivo);
  if (!fs.existsSync(caminho)) {
    return res.status(404).json({ erro: `Arquivo ${arquivo} não existe na pasta /templates.` });
  }

  res.download(caminho, arquivo);
});

// ===== ROTA: DOWNLOAD DO TEMPLATE ORIGINAL (.docx) PARA EDIÇÃO =====
// Permite que o usuário baixe o modelo original e edite no Word.
app.get("/api/modelos/:id", (req, res) => {
  const { id } = req.params;
  const arquivo = TEMPLATES[id];
  if (!arquivo) {
    return res.status(404).json({ erro: "Modelo não encontrado." });
  }

  const caminho = path.join(__dirname, "templates", arquivo);
  if (!fs.existsSync(caminho)) {
    return res.status(404).json({ erro: `Arquivo ${arquivo} não existe na pasta /templates.` });
  }

  res.download(caminho, arquivo);
});

// ===== ROTA: GERAR DOCUMENTO (.docx) =====
app.post("/api/gerar-documento", (req, res) => {
  const { docId, payload } = req.body;

  const templateName = TEMPLATES[docId];
  if (!templateName) {
    return res.status(404).json({ erro: `Não há modelo de documento para o id "${docId}".` });
  }

  const templatePath = path.join(__dirname, "templates", templateName);

  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({
      erro: `Modelo "${templateName}" não encontrado na pasta /templates.`
    });
  }

  try {
    // 1. Ler o modelo DOCX a partir do disco (sempre lê a versão atualizada)
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "" // evita que tags vazias quebrem o documento
    });

    // 2. Preparar os dados (datas, checkboxes, registros)
    const dados = montarDadosDocumento(docId, payload);

    // 3. Preencher (renderizar) o documento
    doc.render(dados);

    // 4. Gerar o Buffer do arquivo final
    const buffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE"
    });

    // Nome do arquivo de saída
    const baseNome = templateName
      .replace(/\.[^.]+$/, "")
      .replace(/\s+/g, "_")
      .replace(/[^\w\d\-_]+/g, "")
      .replace(/^\d+_/, "");
    const nomeArquivo = `${baseNome}_preenchido_${Date.now()}.docx`;

    // 5. Enviar o arquivo
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
    return res.send(buffer);
  } catch (error) {
    console.error("Erro ao gerar documento DOCX:", error);
    const msg = error && error.properties && error.properties.explanation
      ? error.properties.explanation
      : error.message;
    return res.status(500).json({ erro: `Erro ao gerar o .docx: ${msg}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SELic V3 rodando em http://localhost:${PORT}`);
});