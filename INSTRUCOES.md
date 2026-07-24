# Objetivo
Trabalho de conclusão do curso técnico em Informática. Desenvolver um sistema para gerenciamento dos documentos de estágio para os cursos de Licenciatura do IFRJ Campus Pinheiral.

## Contexto
O IFRJ Campus Pinheiral é uma universidade pública brasileira, que oferece cursos de Licenciatura em Ciências Biológicas e de Licenciatura em Computação, cujos alunos devem estagiar obrigatoriamente. O sistema foi solicitado pela coordenadora do curso de Licenciatura em Ciências Biológicas, que a partir de agora será referida como cliente, e por isso sempre deve atender às suas necessidades.

## Detalhamento
O sistema será acessado por coordenadores e alunos e, para que seja acessível, será um *website*. A cliente está de acordo com as seguintes funcionalidades:
- Cadastro de convênios para estágios: há um livro físico em que estão listados os convênios. O site vai conter as informações desse livro. Também haverá possibilidade de cadastrar novos convênios. Os convênios serão classificados em ativos ou expirados.
- Cadastro de alunos: as informações dos alunos ficam salvas no site.
- Preenchimento de documentos para estágios: ao invés de preencher as informações no Word, o aluno ou o coordenador preenche as informações no site, que vai gerar um PDF para impressão. Com os dados do aluno cadastrado, algumas informações são preenchidas automaticamente.
- Sistema de cargos: o cargo de coordenador cadastra os estágios e pode alterar os dados dos alunos. Os alunos cadastram seus dados.
- Disponibilização de documentos importantes: documentos importantes para os alunos ou coordenadores serão disponibilizados para download.
- Assinatura digital: integração com o .gov para assinar os documentos de estágio.

# Regulamentação
O sistema sempre deve estar de acordo com a seguinte **regulamentação**:

- [Resolução CNE nº 1/ 2002](http://portal.mec.gov.br/index.php?option=com_docman&view=download&alias=159261-rcp001-02&category_slug=outubro-2020-pdf&Itemid=30192)
- [Lei nº 11.788/ 2008, a Lei de Estágio](http://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11788.htm)
- [Resolução CONSUP/IFRJ nº 3/ 2015, Regulamento de Ensino de Graduação do IFRJ](https://portal.ifrj.edu.br/ckfinder/userfiles/files/PROGRAD/IFRJ%20Regulamento%20aprovado%20em%202014-2015%20-%20Assinado.pdf)
- [Resolução CONSUP/IFRJ nº 27/ 2018, Regulamento do Estágio Obrigatório dos Cursos de Licenciatura do IFRJ](https://portal.ifrj.edu.br/sites/default/files/IFRJ/PROGRAD/regulamento_de_estagio_dos_cursos_de_licenciatura_novo.pdf)

# Método
Todo o sistema será desenvolvido com auxílio de Inteligência Artificial. Por isso, a principal etapa será o levantamento de requisitos, para gerar prompts eficazes e receber melhores respostas das IA's.

## Observação para os modelos de IA
Não fazer nenhuma suposição sobre o projeto. Sempre perguntar antes de tomar uma decisão que não foi explicada.
