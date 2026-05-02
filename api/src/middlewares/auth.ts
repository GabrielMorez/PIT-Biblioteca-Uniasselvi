import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'biblioteca_secret_2024';

export interface JwtPayload {
  id: number;
  email: string;
  role: 'aluno' | 'bibliotecario';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token não fornecido.' });
    return;
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

export function apenasAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'bibliotecario') {
    res.status(403).json({ erro: 'Acesso restrito ao bibliotecário.' });
    return;
  }
  next();
}

export function gerarToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}
