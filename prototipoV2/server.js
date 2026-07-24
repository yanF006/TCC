const express = require("express");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON e servir arquivos estáticos da pasta "public"
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Função utilitária para converter data ISO (AAAA-MM-DD) para PT-BR (DD/MM/AAAA)
function formatarData(dataISO) {
    if (!dataISO) return "____/____/________";
    const partes = dataISO.split("-");
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Rota genérica para criação de documentos
app.post("/api/gerar-documento", (req, res) => {
    const { docId, payload } = req.body;

    const templatePath = path.join(__dirname, "templates", `doc${docId}.docx`);

    // Validação se o template existe
    if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ 
            erro: `Modelo para o documento ${docId} não encontrado no servidor.` 
        });
    }

    try {
        // 1. Ler o modelo DOCX
        const content = fs.readFileSync(templatePath, "binary");
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true
        });

        // 2. Pré-processamento de variáveis específicas para os templates do Word
        const dadosTratados = tratarDadosDocumento(docId, payload);

        // 3. Renderizar (Preencher) os campos dinâmicos
        doc.render(dadosTratados);

        // 4. Gerar o Buffer do documento preenchido
        const buffer = doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE"
        });

        // Nome do arquivo de saída sugerido ao cliente no download
        const nomeArquivo = `doc${docId}_preenchido_${Date.now()}.docx`;

        // 5. Enviar arquivo como download binário
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename=${nomeArquivo}`);
        return res.send(buffer);

    } catch (error) {
        console.error("Erro ao gerar o documento DOCX:", error);
        return res.status(500).json({ 
            erro: "Ocorreu um erro no servidor ao gerar o arquivo .docx." 
        });
    }
});

// Tratamentos específicos por tipo de documento antes de renderizar no Word
function tratarDadosDocumento(docId, payload) {
    const dados = { ...payload };

    // Tratamentos para o Doc 04
    if (docId === "04") {
        dados.nascimento = formatarData(dados.nascimento);
        dados.inicio = formatarData(dados.inicio);
        dados.termino = formatarData(dados.termino);
        dados.tipoEstagio = dados.tipo === "estagio" ? "X" : " ";
        dados.tipoProjeto = dados.tipo === "projeto" ? "X" : " ";
    }

    // Tratamentos para o Doc 06 (Lista de frequência)
    if (docId === "06") {
        dados.inicio = formatarData(dados.inicio);
        dados.termino = formatarData(dados.termino);
        
        // Formatar as datas individuais da tabela de registros
        if (Array.isArray(dados.registros)) {
            dados.registros = dados.registros.map((reg, index) => {
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
                    num: index + 1,
                    data: formatarData(reg.data),
                    entrada: reg.entrada || "",
                    saida: reg.saida || "",
                    horas: calculoHoras
                };
            });
        }
    }

    // Tratamentos para o Doc 10 (Aproveitamento de carga horária / Caixas de seleção)
    if (docId === "10") {
        dados.data = formatarData(dados.data);
        // Transforma valores booleanos das checkboxes em texto "[X]" ou "[ ]" para o Word
        dados.ctps = dados.ctps ? "[X]" : "[ ]";
        dados.declaracao = dados.declaracao ? "[X]" : "[ ]";
        dados.programa = dados.programa ? "[X]" : "[ ]";
        dados.ficha = dados.ficha ? "[X]" : "[ ]";
        dados.formulario = dados.formulario ? "[X]" : "[ ]";
    }

    return dados;
}

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});