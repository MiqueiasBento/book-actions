import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './database/prisma.js';

const port = Number(process.env.PORT) || 3333;
const host = '0.0.0.0';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não configurada. Consulte .env.example.');
  process.exit(1);
}

prisma.$connect()
  .then(() => app.listen(port, host, () => console.log(`API disponível na porta ${port}`)))
  .catch((error) => {
    console.error('Não foi possível conectar ao PostgreSQL:', error);
    process.exit(1);
  });

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
