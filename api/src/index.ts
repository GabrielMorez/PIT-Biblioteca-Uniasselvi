import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/database';
import routes from './routes';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api', routes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 API rodando em http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Falha ao conectar ao banco de dados:', err.message);
    process.exit(1);
  });

export default app;
