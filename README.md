# 📚 Sistema de Controle de Empréstimos de Biblioteca

Sistema completo para gerenciamento de empréstimos de livros, com API REST em Node.js/TypeScript + PostgreSQL e frontend em HTML/CSS puro.

---

## 🗂 Estrutura do Projeto

```
biblioteca/
├── docker-compose.yml            
├── api/
│   ├── src/
│   │   ├── config/database.ts     
│   │   ├── models/
│   │   │   ├── LivroModel.ts
│   │   │   ├── AlunoModel.ts
│   │   │   └── EmprestimoModel.ts
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── LivroController.ts
│   │   │   └── EmprestimoController.ts
│   │   ├── middlewares/auth.ts   
│   │   ├── routes/index.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── index.html                 
    ├── pages/
    │   ├── admin.html             
    │   └── aluno.html             
    ├── css/style.css
    └── js/api.js
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

---

### 1. Subir o banco de dados

Na raiz do projeto (onde está o `docker-compose.yml`):

```bash
docker compose up -d
```

Para verificar se o container está saudável:

```bash
docker compose ps
```

Para acompanhar os logs do banco:

```bash
docker compose logs -f postgres
```

---

### 2. Configurar variáveis de ambiente da API

```bash
cd api
cp .env.example .env
```

Os valores padrão do `.env.example` já são compatíveis com o `docker-compose.yml`, então nenhuma alteração é necessária para rodar localmente.

---

### 3. Instalar dependências e iniciar a API

```bash
cd api
npm install
npm run dev
```

> As tabelas do banco são criadas automaticamente na primeira execução.

A API estará disponível em: **http://localhost:3000**

---

### 4. Servir o Frontend

Em outro terminal, a partir da pasta `frontend`:

```bash
cd frontend
npx serve .
```

O frontend estará disponível em: **http://localhost:3000** (porta indicada pelo `serve`).

---

### Parar o banco de dados

```bash
docker compose down
```

Para remover também o volume com os dados:

```bash
docker compose down -v
```

---

## 🔑 Acesso Padrão

| Perfil        | E-mail               | Senha    |
|---------------|----------------------|----------|
| Bibliotecário | admin@biblioteca.com | admin123 |
| Aluno         | (cadastre-se na tela)| —        |

> Altere as credenciais em produção via variáveis de ambiente no `.env`.

---

## 📡 Endpoints da API

| Método | Rota                           | Auth    |
|--------|--------------------------------|---------|
| POST   | /api/auth/cadastro             | Público |
| POST   | /api/auth/login                | Público |
| GET    | /api/auth/perfil               | ✅      |
| GET    | /api/livros                    | Público |
| POST   | /api/livros                    | Admin   |
| PUT    | /api/livros/:id                | Admin   |
| DELETE | /api/livros/:id                | Admin   |
| GET    | /api/emprestimos               | Admin   |
| GET    | /api/emprestimos/relatorio     | Admin   |
| GET    | /api/emprestimos/meu-historico | Aluno   |
| POST   | /api/emprestimos               | ✅      |
| PATCH  | /api/emprestimos/:id/devolver  | ✅      |
| GET    | /api/config/multa              | ✅      |
| PUT    | /api/config/multa              | Admin   |
| GET    | /api/alunos                    | Admin   |

---

## ✅ Requisitos Atendidos

| RF    | Descrição                           | ✅ |
|-------|-------------------------------------|----|
| RF01  | Cadastro de livros com validação    | ✅ |
| RF02  | Login e cadastro de alunos          | ✅ |
| RF03  | Registro de empréstimos             | ✅ |
| RF04  | Cálculo automático de atraso        | ✅ |
| RF05  | Limite de 3 empréstimos simultâneos | ✅ |
| RF06  | Relatório por período               | ✅ |
| RF07  | Multa configurável com teto         | ✅ |
| RNF01 | Senhas criptografadas (bcrypt)      | ✅ |
| RNF03 | Loading indicator                   | ✅ |
| RNF04 | Integridade via FK e constraints    | ✅ |