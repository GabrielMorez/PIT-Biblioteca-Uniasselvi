import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.POSTGRES_DB     || 'biblioteca',
  user:     process.env.POSTGRES_USER     || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

export async function query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T extends QueryResultRow ? T : any>> {
  return pool.query<T extends QueryResultRow ? T : any>(sql, params);
}

export function getPool(): Pool {
  return pool;
}

export async function initializeDatabase(): Promise<void> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS livros (
        id                    SERIAL PRIMARY KEY,
        isbn                  TEXT          NOT NULL UNIQUE,
        titulo                TEXT          NOT NULL,
        autor                 TEXT          NOT NULL,
        editora               TEXT,
        ano                   INTEGER       NOT NULL,
        quantidade_exemplares INTEGER       NOT NULL DEFAULT 1,
        criado_em             TIMESTAMPTZ   DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS alunos (
        id            SERIAL PRIMARY KEY,
        primeiro_nome TEXT        NOT NULL,
        sobrenome     TEXT        NOT NULL,
        documento     TEXT        NOT NULL UNIQUE,
        telefone      TEXT,
        email         TEXT        NOT NULL UNIQUE,
        senha         TEXT        NOT NULL,
        criado_em     TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS emprestimos (
        id                      SERIAL        PRIMARY KEY,
        id_aluno                INTEGER       NOT NULL REFERENCES alunos(id),
        id_livro                INTEGER       NOT NULL REFERENCES livros(id),
        data_emprestimo         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        data_prevista_devolucao TIMESTAMPTZ   NOT NULL,
        data_devolucao          TIMESTAMPTZ,
        dias_atraso             INTEGER       NOT NULL DEFAULT 0,
        valor_multa             NUMERIC(10,2) NOT NULL DEFAULT 0,
        criado_em               TIMESTAMPTZ   DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS configuracoes_multa (
        id            SERIAL        PRIMARY KEY,
        valor_diario  NUMERIC(10,2) NOT NULL DEFAULT 1.00,
        teto_multa    NUMERIC(10,2) NOT NULL DEFAULT 50.00,
        vigente_desde TIMESTAMPTZ   DEFAULT NOW()
      );

      INSERT INTO configuracoes_multa (valor_diario, teto_multa)
      SELECT 1.00, 50.00
      WHERE NOT EXISTS (SELECT 1 FROM configuracoes_multa);
    `);
    console.log('✅ Banco de dados PostgreSQL inicializado.');
  } finally {
    client.release();
  }
}
