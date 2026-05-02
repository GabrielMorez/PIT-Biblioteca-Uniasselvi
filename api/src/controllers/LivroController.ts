import { Request, Response } from 'express';
import { z } from 'zod';
import { LivroModel } from '../models/LivroModel';

const anoAtual = new Date().getFullYear();

const livroSchema = z.object({
  isbn:                 z.string().min(1, 'ISBN obrigatório'),
  titulo:               z.string().min(1, 'Título obrigatório'),
  autor:                z.string().min(1, 'Autor obrigatório'),
  editora:              z.string().optional(),
  ano:                  z.number().int().min(1500).max(anoAtual),
  quantidade_exemplares: z.number().int().min(1),
});

export class LivroController {
  static async cadastrar(req: Request, res: Response): Promise<void> {
    const parsed = livroSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ erro: parsed.error.flatten().fieldErrors }); return; }

    if (await LivroModel.buscarPorIsbn(parsed.data.isbn)) {
      res.status(409).json({ erro: 'ISBN já cadastrado.' }); return;
    }
    res.status(201).json(await LivroModel.criar(parsed.data));
  }

  static async listar(req: Request, res: Response): Promise<void> {
    const { titulo, autor, isbn } = req.query as Record<string, string>;
    res.json(await LivroModel.listarComDisponibilidade({ titulo, autor, isbn }));
  }

  static async buscarPorId(req: Request, res: Response): Promise<void> {
    const livro = await LivroModel.buscarPorId(Number(req.params.id));
    if (!livro) { res.status(404).json({ erro: 'Livro não encontrado.' }); return; }
    const disponiveis = await LivroModel.exemplaresDiponiveisPorId(livro.id!);
    res.json({ ...livro, exemplares_disponiveis: disponiveis });
  }

  static async atualizar(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const parsed = livroSchema.partial().safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ erro: parsed.error.flatten().fieldErrors }); return; }

    if (parsed.data.isbn) {
      const existente = await LivroModel.buscarPorIsbn(parsed.data.isbn);
      if (existente && existente.id !== id) {
        res.status(409).json({ erro: 'ISBN já pertence a outro livro.' }); return;
      }
    }
    const livro = await LivroModel.atualizar(id, parsed.data);
    if (!livro) { res.status(404).json({ erro: 'Livro não encontrado.' }); return; }
    res.json(livro);
  }

  static async excluir(req: Request, res: Response): Promise<void> {
    const removido = await LivroModel.excluir(Number(req.params.id));
    if (!removido) { res.status(404).json({ erro: 'Livro não encontrado.' }); return; }
    res.status(204).send();
  }
}
