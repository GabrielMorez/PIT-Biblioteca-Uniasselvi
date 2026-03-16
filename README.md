## Projeto - Controle de Empréstimo de Livros da Biblioteca

**Objetivo:**  
Automatizar o controle de empréstimos e devoluções de livros da biblioteca acadêmica.

**Atores:** Bibliotecário, Aluno

**Requisitos Funcionais:**

- RF01: O sistema deve permitir ao bibliotecário cadastrar livros com ISBN, título, autor e quantidade de exemplares. (cadastrar livro) Campos: ISBN, título, autor, editora, ano, quantidade_exemplares. Regras: ISBN obrigatório e único por obra; quantidade >= 1; ano entre 1500 e ano atual.
- RF02: O sistema deve ter uma tela de login onde será possível o aluno se cadastrar e após o cadastro realizar login. Campos: primeiro nome, sobrenome, documento, telefone, e-mail, senha. Regras: o e-mai e documento deverão ser únicos, a senha deve ser armazenada criptografada.
- RF03: O sistema deve registrar empréstimo vinculando aluno, exemplar, data de empréstimo e data prevista de devolução. (registrar empréstimo) Campos: id_aluno, id_exemplar, data_emprestimo, data_prevista_devolução. Regras: aluno e exemplar obrigatórios; data_prevista > data_emprestimo; exemplar deve estar disponível.
- RF04: O sistema deve calcular automaticamente dias de atraso no momento da devolução. (calcular atraso) Campos: data_prevista_devolução, data_devolução, dias_atraso. Regras: dias_atraso = max(0, devolução - prevista); cálculo automático e imutável após fechamento; caso a data_devolução esteja preenchida entende-se que o livro foi devolvido.
- RF05: O sistema deve bloquear novo empréstimo quando o aluno atingir o limite fixo de 3 itens simultâneos (limite de itens). Regras: bloquear novo empréstimo quando o aluno já possuir 3 livros sob sua posse; regra deve considerar apenas empréstimos com data_devolucao "is null".
- RF06: O sistema deve gerar relatório de empréstimos por período com totais de ativos, devolvidos e atrasados. (relatório) Campos: período_início, período_fim, totais_ativos, totais_devolvidos, totais_atrasados. Regras: período obrigatório e válido; relatório deve considerar timezone institucional e filtros auditáveis.
- RF07: O sistema deve calcular e registrar multa por atraso conforme tabela de regras configurada. (multa por atraso) Campos: dias_atraso, valor_diário, teto_multa, valor_total_multa. Regras: cálculo automático conforme tabela vigente; valor_total = min(dias_atraso * valor_diário, teto_multa).

**Requisitos Não Funcionais:**

- RNF01: O sistema deve armazenar as senhas dos usuários utilizando criptografia segura (hash), garantindo que não sejam armazenadas em texto puro.
- RNF02: O sistema deve responder às operações comuns (login, cadastro, consulta de livros e registro de empréstimo) em até 3 segundos em condições normais de uso.
- RNF03: O sistema deve apresentar um indicador visual de carregamento (loading) sempre que uma operação demorada estiver sendo executada, garantindo feedback ao usuário.
- RNF04: O sistema deve garantir integridade dos dados, impedindo inconsistências como empréstimos duplicados ou exemplares emprestados simultaneamente para mais de um aluno.

**Requisitos Não Funcionais Gerais:**

- RNG01: O sistema deve ser executado on premise, sendo instalado e mantido na infraestrutura da instituição.
- RNG02: O sistema deve ser desenvolvido utilizando Typescript e Node.js para a API e HTML, CSS e Tailwind CSS para o frontend.
- RNF03: O sistema deve possuir interface responsiva, permitindo utilização adequada em dispositivos desktop e mobile.

**Casos de uso / Funcionalidades:**
- F01 – Busca de livros
   - Permite ao aluno pesquisar livros disponíveis na biblioteca utilizando filtros como título, autor ou ISBN.
   --> Relacionamento: RF01
- F02 – Reserva de livros
   - Permite que alunos reservem livros quando não houver exemplares disponíveis.
   --> Relacionamento: RF03
- F03 – Histórico de empréstimos
   - Permite ao aluno visualizar todos os seus empréstimos realizados.
   --> Relacionamento: RF03, RF04
- F04 – Dashboard administrativo
   - Permite ao bibliotecário visualizar estatísticas de empréstimos e atrasos.
   --> Relacionamento: RF06
- F05 – Notificação de devolução
   - O sistema envia lembretes sobre datas de devolução próximas.
   --> Relacionamento: RF04

**DoR (Definition of Ready):**

- Requisito funcional relacionado identificado (RF)
- Critérios de aceitação definidos e testáveis
- Dependências e dados necessários mapeados

**DoD (Definition of Done):**

- Funcionalidade implementada conforme os RFs vinculados
- Critérios de aceitação atendidos
- Testes funcionais executados com sucesso
- Evidências registradas (prints/logs/resultados)

- Cadastrar livros (RF01)
- Login / Cadastro de alunos (RF02)
- Registrar empréstimos com regras de disponibilidade e limite fixo (RF03, RF05)
- Registrar devoluções com cálculo automático de atraso e multa (RF04, RF07)
- Emitir relatórios de empréstimos por período (RF06)

**Plano de Testes:**

- Testar cadastro de livros com dados válidos e inválidos
- Validar consulta de livros disponíveis (data_devolucao nula)
- Verificar registro de empréstimo e atualização de disponibilidade
- Testar devolução e liberação do exemplar
- Validar cálculo correto de dias de atraso
- Verificar limite máximo de empréstimos por aluno
- Testar bloqueio de novo empréstimo quando limite atingido
- Validar empréstimos simultâneos de exemplares diferentes

---

