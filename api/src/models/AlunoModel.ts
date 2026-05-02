import { query } from '../config/database';

export interface Aluno {
  id?: number;
  primeiro_nome: string;
  sobrenome: string;
  documento: string;
  telefone?: string;
  email: string;
  senha: string;
  criado_em?: string;
}

export type AlunoPublico = Omit<Aluno, 'senha'>;

export class AlunoModel {
  static async criar(aluno: Omit<Aluno, 'id' | 'criado_em'>): Promise<AlunoPublico> {
    const { rows } = await query<AlunoPublico>(
      `INSERT INTO alunos (primeiro_nome, sobrenome, documento, telefone, email, senha)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, primeiro_nome, sobrenome, documento, telefone, email, criado_em`,
      [aluno.primeiro_nome, aluno.sobrenome, aluno.documento, aluno.telefone ?? null, aluno.email, aluno.senha]
    );
    return rows[0];
  }

  static async buscarPorId(id: number): Promise<AlunoPublico | undefined> {
    const { rows } = await query<AlunoPublico>(
      'SELECT id, primeiro_nome, sobrenome, documento, telefone, email, criado_em FROM alunos WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  static async buscarPorEmail(email: string): Promise<Aluno | undefined> {
    const { rows } = await query<Aluno>('SELECT * FROM alunos WHERE email = $1', [email]);
    return rows[0];
  }

  static async buscarPorDocumento(documento: string): Promise<Aluno | undefined> {
    const { rows } = await query<Aluno>('SELECT * FROM alunos WHERE documento = $1', [documento]);
    return rows[0];
  }

  static async listar(): Promise<AlunoPublico[]> {
    const { rows } = await query<AlunoPublico>(
      'SELECT id, primeiro_nome, sobrenome, documento, telefone, email, criado_em FROM alunos ORDER BY primeiro_nome'
    );
    return rows;
  }
}
