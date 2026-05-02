import { query } from '../config/database';

export interface Emprestimo {
  id?: number;
  id_aluno: number;
  id_livro: number;
  data_emprestimo?: string;
  data_prevista_devolucao: string;
  data_devolucao?: string | null;
  dias_atraso?: number;
  valor_multa?: number;
  criado_em?: string;
}

export interface EmprestimoDetalhado extends Emprestimo {
  aluno_nome: string;
  aluno_email: string;
  livro_titulo: string;
  livro_isbn: string;
  livro_autor: string;
}

export interface ConfiguracaoMulta {
  id?: number;
  valor_diario: number;
  teto_multa: number;
}

const SELECT_DETALHADO = `
  SELECT
    e.*,
    a.primeiro_nome || ' ' || a.sobrenome AS aluno_nome,
    a.email                                AS aluno_email,
    l.titulo                               AS livro_titulo,
    l.isbn                                 AS livro_isbn,
    l.autor                                AS livro_autor
  FROM emprestimos e
  JOIN alunos a ON a.id = e.id_aluno
  JOIN livros  l ON l.id = e.id_livro
`;

export class EmprestimoModel {
  static async criar(
    emp: Pick<Emprestimo, 'id_aluno' | 'id_livro' | 'data_prevista_devolucao'>
  ): Promise<EmprestimoDetalhado> {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO emprestimos (id_aluno, id_livro, data_prevista_devolucao)
       VALUES ($1, $2, $3) RETURNING id`,
      [emp.id_aluno, emp.id_livro, emp.data_prevista_devolucao]
    );
    return this.buscarPorId(rows[0].id) as Promise<EmprestimoDetalhado>;
  }

  static async buscarPorId(id: number): Promise<EmprestimoDetalhado | undefined> {
    const { rows } = await query<EmprestimoDetalhado>(
      `${SELECT_DETALHADO} WHERE e.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async listarPorAluno(id_aluno: number): Promise<EmprestimoDetalhado[]> {
    const { rows } = await query<EmprestimoDetalhado>(
      `${SELECT_DETALHADO} WHERE e.id_aluno = $1 ORDER BY e.data_emprestimo DESC`,
      [id_aluno]
    );
    return rows;
  }

  static async contarAtivosDoAluno(id_aluno: number): Promise<number> {
    const { rows } = await query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM emprestimos WHERE id_aluno = $1 AND data_devolucao IS NULL`,
      [id_aluno]
    );
    return Number(rows[0].total);
  }

  static async registrarDevolucao(id: number): Promise<EmprestimoDetalhado | undefined> {
    const emprestimo = await this.buscarPorId(id);
    if (!emprestimo) return undefined;

    const agora = new Date();
    const prevista = new Date(emprestimo.data_prevista_devolucao);
    const diasAtraso = Math.max(
      0,
      Math.floor((agora.getTime() - prevista.getTime()) / (1000 * 60 * 60 * 24))
    );

    const config = await this.buscarConfigMulta();
    const valorMulta = Math.min(
      diasAtraso * Number(config.valor_diario),
      Number(config.teto_multa)
    );

    await query(
      `UPDATE emprestimos
       SET data_devolucao = $1, dias_atraso = $2, valor_multa = $3
       WHERE id = $4`,
      [agora.toISOString(), diasAtraso, valorMulta, id]
    );

    return this.buscarPorId(id);
  }

  static async listarTodos(filtros?: {
    inicio?: string;
    fim?: string;
    apenas_ativos?: boolean;
  }): Promise<EmprestimoDetalhado[]> {
    const params: any[] = [];
    const conditions: string[] = [];

    if (filtros?.inicio) {
      params.push(filtros.inicio);
      conditions.push(`e.data_emprestimo >= $${params.length}`);
    }
    if (filtros?.fim) {
      params.push(filtros.fim + 'T23:59:59');
      conditions.push(`e.data_emprestimo <= $${params.length}`);
    }
    if (filtros?.apenas_ativos) {
      conditions.push(`e.data_devolucao IS NULL`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query<EmprestimoDetalhado>(
      `${SELECT_DETALHADO} ${where} ORDER BY e.data_emprestimo DESC`,
      params
    );
    return rows;
  }

  static async gerarRelatorio(inicio: string, fim: string) {
    const emprestimos = await this.listarTodos({ inicio, fim });
    const agora = new Date();
    const ativos     = emprestimos.filter(e => !e.data_devolucao).length;
    const devolvidos = emprestimos.filter(e =>  e.data_devolucao).length;
    const atrasados  = emprestimos.filter(e => {
      if (e.data_devolucao) return Number(e.dias_atraso) > 0;
      return new Date(e.data_prevista_devolucao) < agora;
    }).length;

    return {
      periodo: { inicio, fim },
      totais: { ativos, devolvidos, atrasados, total: emprestimos.length },
      emprestimos,
    };
  }

  static async buscarConfigMulta(): Promise<ConfiguracaoMulta> {
    const { rows } = await query<ConfiguracaoMulta>(
      'SELECT * FROM configuracoes_multa ORDER BY id DESC LIMIT 1'
    );
    return rows[0];
  }

  static async atualizarConfigMulta(
    config: Pick<ConfiguracaoMulta, 'valor_diario' | 'teto_multa'>
  ): Promise<ConfiguracaoMulta> {
    await query(
      'INSERT INTO configuracoes_multa (valor_diario, teto_multa) VALUES ($1, $2)',
      [config.valor_diario, config.teto_multa]
    );
    return this.buscarConfigMulta();
  }
}
