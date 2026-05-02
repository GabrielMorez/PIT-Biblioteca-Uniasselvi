import { Request, Response } from 'express';
import { z } from 'zod';
import { EmprestimoModel } from '../models/EmprestimoModel';
import { LivroModel } from '../models/LivroModel';
import { AlunoModel } from '../models/AlunoModel';

const LIMITE_EMPRESTIMOS = 3;

const emprestimoSchema = z.object({
  id_aluno:               z.number().int().positive(),
  id_livro:               z.number().int().positive(),
  data_prevista_devolucao: z.string().refine(d => !isNaN(Date.parse(d)), 'Data inválida'),
});

export class EmprestimoController {
  static async registrar(req: Request, res: Response): Promise<void> {
    const parsed = emprestimoSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ erro: parsed.error.flatten().fieldErrors }); return; }

    const { id_aluno, id_livro, data_prevista_devolucao } = parsed.data;

    if (req.user?.role === 'aluno' && req.user.id !== id_aluno) {
      res.status(403).json({ erro: 'Aluno só pode registrar empréstimos para si mesmo.' }); return;
    }
    if (!(await AlunoModel.buscarPorId(id_aluno))) {
      res.status(404).json({ erro: 'Aluno não encontrado.' }); return;
    }
    if (!(await LivroModel.buscarPorId(id_livro))) {
      res.status(404).json({ erro: 'Livro não encontrado.' }); return;
    }
    if (new Date(data_prevista_devolucao) <= new Date()) {
      res.status(400).json({ erro: 'Data prevista de devolução deve ser futura.' }); return;
    }

    const ativos = await EmprestimoModel.contarAtivosDoAluno(id_aluno);
    if (ativos >= LIMITE_EMPRESTIMOS) {
      res.status(422).json({ erro: `Aluno atingiu o limite de ${LIMITE_EMPRESTIMOS} empréstimos simultâneos.` }); return;
    }

    const disponiveis = await LivroModel.exemplaresDiponiveisPorId(id_livro);
    if (disponiveis <= 0) {
      res.status(422).json({ erro: 'Nenhum exemplar disponível para empréstimo.' }); return;
    }

    res.status(201).json(await EmprestimoModel.criar({ id_aluno, id_livro, data_prevista_devolucao }));
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const { inicio, fim, apenas_ativos } = req.query as Record<string, string>;
    res.json(await EmprestimoModel.listarTodos({ inicio, fim, apenas_ativos: apenas_ativos === 'true' }));
  }

  static async historico(req: Request, res: Response): Promise<void> {
    const id_aluno = req.user!.role === 'aluno' ? req.user!.id : Number(req.params.id_aluno);
    res.json(await EmprestimoModel.listarPorAluno(id_aluno));
  }

  static async devolver(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const emprestimo = await EmprestimoModel.buscarPorId(id);
    if (!emprestimo) { res.status(404).json({ erro: 'Empréstimo não encontrado.' }); return; }
    if (emprestimo.data_devolucao) { res.status(409).json({ erro: 'Livro já foi devolvido.' }); return; }
    if (req.user?.role === 'aluno' && req.user.id !== emprestimo.id_aluno) {
      res.status(403).json({ erro: 'Sem permissão.' }); return;
    }
    res.json(await EmprestimoModel.registrarDevolucao(id));
  }

  static async relatorio(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      inicio: z.string().refine(d => !isNaN(Date.parse(d))),
      fim:    z.string().refine(d => !isNaN(Date.parse(d))),
    });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ erro: parsed.error.flatten().fieldErrors }); return; }
    if (new Date(parsed.data.inicio) > new Date(parsed.data.fim)) {
      res.status(400).json({ erro: 'Data início deve ser anterior à data fim.' }); return;
    }
    res.json(await EmprestimoModel.gerarRelatorio(parsed.data.inicio, parsed.data.fim));
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    const emp = await EmprestimoModel.buscarPorId(Number(req.params.id));
    if (!emp) { res.status(404).json({ erro: 'Empréstimo não encontrado.' }); return; }
    res.json(emp);
  }

  static async configMulta(req: Request, res: Response): Promise<void> {
    res.json(await EmprestimoModel.buscarConfigMulta());
  }

  static async atualizarConfigMulta(req: Request, res: Response): Promise<void> {
    const schema = z.object({ valor_diario: z.number().positive(), teto_multa: z.number().positive() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ erro: parsed.error.flatten().fieldErrors }); return; }
    res.json(await EmprestimoModel.atualizarConfigMulta(parsed.data));
  }
}
