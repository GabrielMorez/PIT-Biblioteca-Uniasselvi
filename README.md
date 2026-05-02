# 📚 Sistema de Controle de Empréstimos de Biblioteca

Sistema completo para gerenciamento de empréstimos de livros, com API REST em Node.js/TypeScript + PostgreSQL e frontend em HTML/CSS puro.

---

## 🗂 Estrutura do Projeto

```
biblioteca/
├── api/
│   ├── src/
│   │   ├── config/database.ts        # Pool PostgreSQL + inicialização das tabelas
│   │   ├── models/
│   │   │   ├── LivroModel.ts
│   │   │   ├── AlunoModel.ts
│   │   │   └── EmprestimoModel.ts
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── LivroController.ts
│   │   │   └── EmprestimoController.ts
│   │   ├── middlewares/auth.ts       # JWT + roles
│   │   ├── routes/index.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── index.html         # Login / Cadastro
    ├── pages/
    │   ├── admin.html     # Painel Bibliotecário
    │   └── aluno.html     # Área do Aluno
    ├── css/style.css
    └── js/api.js
```

---

## 🚀 Como Executar

### 1. Subir o PostgreSQL (via Docker)

```bash
docker run -d \
  --name biblioteca-pg \
  -e POSTGRES_DB=biblioteca \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

### 2. Configurar variáveis de ambiente

```bash
cd api
cp .env.example .env
# Edite o .env com suas configurações se necessário
```

### 3. Instalar dependências e iniciar a API

```bash
cd api
npm install
npm run dev       # desenvolvimento (hot reload)
# ou
npm run build && npm start   # produção
```

A API sobe em: `http://localhost:3000`  
As tabelas são criadas automaticamente na primeira execução.

### 4. Servir o Frontend

```bash
cd frontend
npx serve .
# ou: python3 -m http.server 8080
```

---

## 🔑 Acesso Padrão

| Perfil        | E-mail                  | Senha    |
|---------------|-------------------------|----------|
| Bibliotecário | admin@biblioteca.com    | admin123 |
| Aluno         | (cadastre-se na tela)   | —        |

Altere as credenciais em produção via variáveis de ambiente no `.env`.

---

## 📡 Endpoints da API

| Método | Rota                            | Auth      |
|--------|---------------------------------|-----------|
| POST   | /api/auth/cadastro              | Público   |
| POST   | /api/auth/login                 | Público   |
| GET    | /api/auth/perfil                | ✅        |
| GET    | /api/livros                     | Público   |
| POST   | /api/livros                     | Admin     |
| PUT    | /api/livros/:id                 | Admin     |
| DELETE | /api/livros/:id                 | Admin     |
| GET    | /api/emprestimos                | Admin     |
| GET    | /api/emprestimos/relatorio      | Admin     |
| GET    | /api/emprestimos/meu-historico  | Aluno     |
| POST   | /api/emprestimos                | ✅        |
| PATCH  | /api/emprestimos/:id/devolver   | ✅        |
| GET    | /api/config/multa               | ✅        |
| PUT    | /api/config/multa               | Admin     |
| GET    | /api/alunos                     | Admin     |

---

## ✅ Requisitos Atendidos

| RF    | Descrição                              | ✅ |
|-------|----------------------------------------|----|
| RF01  | Cadastro de livros com validação       | ✅ |
| RF02  | Login e cadastro de alunos             | ✅ |
| RF03  | Registro de empréstimos                | ✅ |
| RF04  | Cálculo automático de atraso           | ✅ |
| RF05  | Limite de 3 empréstimos simultâneos    | ✅ |
| RF06  | Relatório por período                  | ✅ |
| RF07  | Multa configurável com teto            | ✅ |
| RNF01 | Senhas criptografadas (bcrypt)         | ✅ |
| RNF03 | Loading indicator                      | ✅ |
| RNF04 | Integridade via FK e constraints       | ✅ |
