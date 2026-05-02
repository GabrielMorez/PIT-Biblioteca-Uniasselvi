import { Router } from 'express';
import { LivroController } from '../controllers/LivroController';
import { AuthController } from '../controllers/AuthController';
import { EmprestimoController } from '../controllers/EmprestimoController';
import { autenticar, apenasAdmin } from '../middlewares/auth';
import { AlunoModel } from '../models/AlunoModel';

const router = Router();

// Auth
router.post('/auth/cadastro', AuthController.cadastrar);
router.post('/auth/login',    AuthController.login);
router.get ('/auth/perfil',   autenticar, AuthController.perfil);

// Livros
router.get   ('/livros',     LivroController.listar);
router.get   ('/livros/:id', LivroController.buscarPorId);
router.post  ('/livros',     autenticar, apenasAdmin, LivroController.cadastrar);
router.put   ('/livros/:id', autenticar, apenasAdmin, LivroController.atualizar);
router.delete('/livros/:id', autenticar, apenasAdmin, LivroController.excluir);

// Empréstimos
router.get  ('/emprestimos',                   autenticar, apenasAdmin, EmprestimoController.listar);
router.get  ('/emprestimos/relatorio',          autenticar, apenasAdmin, EmprestimoController.relatorio);
router.get  ('/emprestimos/meu-historico',      autenticar, EmprestimoController.historico);
router.get  ('/emprestimos/aluno/:id_aluno',    autenticar, apenasAdmin, EmprestimoController.historico);
router.get  ('/emprestimos/:id',                autenticar, EmprestimoController.buscarPorId);
router.post ('/emprestimos',                    autenticar, EmprestimoController.registrar);
router.patch('/emprestimos/:id/devolver',       autenticar, EmprestimoController.devolver);

// Config multa
router.get('/config/multa', autenticar,              EmprestimoController.configMulta);
router.put('/config/multa', autenticar, apenasAdmin, EmprestimoController.atualizarConfigMulta);

// Alunos
router.get('/alunos', autenticar, apenasAdmin, async (_req, res) => {
  res.json(await AlunoModel.listar());
});

export default router;
