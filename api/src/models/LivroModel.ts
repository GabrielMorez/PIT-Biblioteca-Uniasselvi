import { query } from '../config/database';

export interface Livro {
  id?: number;
  isbn: string;
  titulo: string;
  autor: string;
  editora?: string;
  ano: number;
  quantidade_exemplares: number;
  criado_em?: string;
}

export interface LivroComDisponibilidade extends Livro {
  exemplares_disponiveis: number;
}

export class LivroModel {
  static async criar(livro: Omit<Livro, 'id' | 'criado_em'>): Promise<Livro> {
    const { rows } = await query<Livro>(
      `INSERT INTO livros (isbn, titulo, autor, editora, ano, quantidade_exemplares)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [livro.isbn, livro.titulo, livro.autor, livro.editora ?? null, livro.ano, livro.quantidade_exemplares]
    );
    return rows[0];
  }

  static async buscarPorId(id: number): Promise<Livro | undefined> {
    const { rows } = await query<Livro>('SELECT * FROM livros WHERE id = $1', [id]);
    return rows[0];
  }

  static async buscarPorIsbn(isbn: string): Promise<Livro | undefined> {
    const { rows } = await query<Livro>('SELECT * FROM livros WHERE isbn = $1', [isbn]);
    return rows[0];
  }

  static async listarComDisponibilidade(
    filtros?: { titulo?: string; autor?: string; isbn?: string }
  ): Promise<LivroComDisponibilidade[]> {
    const params: any[] = [];
    const conditions: string[] = [];

    if (filtros?.titulo) {
      params.push(`%${filtros.titulo}%`);
      conditions.push(`l.titulo ILIKE $${params.length}`);
    }
    if (filtros?.autor) {
      params.push(`%${filtros.autor}%`);
      conditions.push(`l.autor ILIKE $${params.length}`);
    }
    if (filtros?.isbn) {
      params.push(`%${filtros.isbn}%`);
      conditions.push(`l.isbn ILIKE $${params.length}`);
    }

    const where = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

    const { rows } = await query<LivroComDisponibilidade>(
      `SELECT
         l.*,
         l.quantidade_exemplares
           - COUNT(e.id) FILTER (WHERE e.data_devolucao IS NULL) AS exemplares_disponiveis
       FROM livros l
       LEFT JOIN emprestimos e ON e.id_livro = l.id
       WHERE 1=1 ${where}
       GROUP BY l.id
       ORDER BY l.titulo`,
      params
    );
    return rows;
  }

  static async atualizar(
    id: number,
    dados: Partial<Omit<Livro, 'id' | 'criado_em'>>
  ): Promise<Livro | undefined> {
    const keys = Object.keys(dados) as (keyof typeof dados)[];
    if (!keys.length) return this.buscarPorId(id);

    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map(k => dados[k]);

    const { rows } = await query<Livro>(
      `UPDATE livros SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return rows[0];
  }

  static async excluir(id: number): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM livros WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }

  static async exemplaresDiponiveisPorId(id: number): Promise<number> {
    const { rows } = await query<{ disponiveis: string }>(
      `SELECT
         l.quantidade_exemplares
           - COUNT(e.id) FILTER (WHERE e.data_devolucao IS NULL) AS disponiveis
       FROM livros l
       LEFT JOIN emprestimos e ON e.id_livro = l.id
       WHERE l.id = $1
       GROUP BY l.id`,
      [id]
    );
    return rows[0] ? Number(rows[0].disponiveis) : 0;
  }
}
