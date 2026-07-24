const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

//teste

const fs = require("fs");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const content = fs.readFileSync(
    "templates/teste.docx",
    "binary"
);

const zip = new PizZip(content);

const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true
});

doc.render({
    nome: "Maria da Silva",
    curso: "Licenciatura em Computação",
    supervisor: "João Pereira",
    inicio: "01/08/2026",
    termino: "30/11/2026",
    atividades: "Observação de aulas e apoio pedagógico."
});

const buffer = doc.getZip().generate({
    type: "nodebuffer"
});

fs.writeFileSync(
    "output/teste_preenchido.docx",
    buffer
);

console.log("Documento gerado.");