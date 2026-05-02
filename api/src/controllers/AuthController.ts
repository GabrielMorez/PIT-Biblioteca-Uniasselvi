import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AlunoModel } from '../models/AlunoModel';
import { gerarToken } from '../middlewares/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@biblioteca.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

const cadastroSchema = z.object({
  primeiro_nome: z.string().min(1),
  sobrenome:     z.string().min(1),
  documento:     z.string().min(1),
  telefone:      z.string().optional(),
  email:         z.string().email('E-mail inválido'),
  senha:         z.string().min(6, 'Senha mínima 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export class AuthController {
  static async cadastrar(req: Request, res: Response): Promise<void> {
    const parsed = cadastroSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ erro: parsed.error.flatten().fieldErrors }); return; }

    if (await AlunoModel.buscarPorEmail(parsed.data.email)) {
      res.status(409).json({ erro: 'E-mail já cadastrado.' }); return;
    }
    if (await AlunoModel.buscarPorDocumento(parsed.data.documento)) {
      res.status(409).json({ erro: 'Documento já cadastrado.' }); return;
    }

    const senhaCrypt = await bcrypt.hash(parsed.data.senha, 12);
    const aluno = await AlunoModel.criar({ ...parsed.data, senha: senhaCrypt });
    const token = gerarToken({ id: aluno.id!, email: aluno.email, role: 'aluno' });
    res.status(201).json({ aluno, token });
  }

  static async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ erro: parsed.error.flatten().fieldErrors }); return; }

    if (parsed.data.email === ADMIN_EMAIL && parsed.data.senha === ADMIN_SENHA) {
      const token = gerarToken({ id: 0, email: ADMIN_EMAIL, role: 'bibliotecario' });
      res.json({ token, role: 'bibliotecario', nome: 'Bibliotecário' }); return;
    }

    const aluno = await AlunoModel.buscarPorEmail(parsed.data.email);
    if (!aluno || !(await bcrypt.compare(parsed.data.senha, aluno.senha))) {
      res.status(401).json({ erro: 'Credenciais inválidas.' }); return;
    }

    const { senha, ...alunoPublico } = aluno;
    const token = gerarToken({ id: aluno.id!, email: aluno.email, role: 'aluno' });
    res.json({ token, role: 'aluno', aluno: alunoPublico });
  }

  static async perfil(req: Request, res: Response): Promise<void> {
    if (req.user?.role === 'bibliotecario') {
      res.json({ id: 0, email: ADMIN_EMAIL, role: 'bibliotecario', nome: 'Bibliotecário' }); return;
    }
    const aluno = await AlunoModel.buscarPorId(req.user!.id);
    if (!aluno) { res.status(404).json({ erro: 'Usuário não encontrado.' }); return; }
    res.json({ ...aluno, role: 'aluno' });
  }
}
