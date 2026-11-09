import 'dotenv/config';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

const root = resolve('prisma');
const firstMigration = '20261109000100_create_books';
const temp = mkdtempSync(join(tmpdir(), 'book-prisma-migrations-'));
const schema = join(temp, 'schema.prisma');
const prisma = new PrismaClient();

function deploy(schemaPath: string) {
  execFileSync(resolve('node_modules/.bin/prisma'), ['migrate', 'deploy', '--schema', schemaPath], {
    stdio: 'inherit',
    env: process.env,
  });
}

async function main() {
  assert.ok(process.env.DATABASE_URL, 'Defina DATABASE_URL para um banco PostgreSQL de teste vazio.');
  const existing = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Book'
    ) AS "exists"
  `;
  assert.equal(existing[0].exists, false, 'O banco de teste precisa estar vazio.');

  cpSync(join(root, 'schema.prisma'), schema);
  mkdirSync(join(temp, 'migrations', firstMigration), { recursive: true });
  cpSync(join(root, 'migrations', 'migration_lock.toml'), join(temp, 'migrations', 'migration_lock.toml'));
  cpSync(
    join(root, 'migrations', firstMigration, 'migration.sql'),
    join(temp, 'migrations', firstMigration, 'migration.sql'),
  );

  deploy(schema);
  await prisma.$executeRaw`
    INSERT INTO "Book" ("title", "author", "publishedYear", "available", "updatedAt")
    VALUES ('Clean Code', 'Robert C. Martin', 2008, true, CURRENT_TIMESTAMP)
  `;

  deploy(join(root, 'schema.prisma'));
  const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Book'
  `;
  assert.ok(columns.some(column => column.column_name === 'category'), 'A coluna category não foi criada.');

  const book = await prisma.book.findFirstOrThrow({ where: { title: 'Clean Code' } });
  assert.equal(book.category, 'tecnologia', 'A migração de dados não atualizou o livro anterior.');
  assert.equal(book.publishedYear, 2008);

  const migrations = await prisma.$queryRaw<Array<{ migration_name: string }>>`
    SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL
  `;
  assert.equal(migrations.length, 2, 'As duas migrações devem estar aplicadas.');
  console.log('Estrutura e dados migrados com sucesso.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
  rmSync(temp, { recursive: true, force: true });
});
