## Descrição da atividade

- Criar uma aplicação Web com Node, Express, Prisma e PostgreSQL (similar ao que já fizemos);
- Criar uma imagem docker;
- Rodar dentro do Github Actions e testar o migrations (estrutura e dados do banco)
- No github o container do banco só fica disponível por alguns minutos.
- Cadastrar variáveis de ambiente no Github

## Implementação

API de livros com Node.js, Express, Prisma e PostgreSQL. Mantém o CRUD em `/books`, a busca por `?search=`, o health check em `/health` e a documentação em `/api-docs`. Os IDs agora são números inteiros.

O histórico de migrações contém duas etapas: a primeira cria a tabela `Book`; a segunda acrescenta `category` e preenche `tecnologia` nos livros anteriores com título `Clean Code`. O teste de migrações cria esse registro entre as duas etapas para comprovar que a alteração de dados funciona.

## Executar localmente

Requisitos: Node.js 22, npm e Docker com Compose. Na pasta `book-prisma`:

```bash
docker compose up -d db
npm ci
cp .env.example .env
npm run db:generate
npm run db:deploy
npm run dev
```

Se já existir `.env`, edite-o para definir `DATABASE_URL` conforme `.env.example` em vez de substituir suas configurações. A API ficará em `http://localhost:3333`, e o Swagger em `http://localhost:3333/api-docs`.

Para testar a migração de estrutura e dados, use **um banco vazio**. Por exemplo, antes de criar qualquer dado local, execute `npm run test:migrations` no lugar de `npm run db:deploy`. O script aplica a primeira migração, insere um livro antigo, aplica a segunda e verifica a coluna, o valor atualizado e o histórico de migrações. O script não apaga nem recria bancos existentes.

Para executar a imagem local, aplique as migrações como acima e rode:

```bash
docker compose --profile app up --build -d
curl http://localhost:3333/health
curl http://localhost:3333/books
```

O Compose usa credenciais locais de exemplo. Não reutilize essa senha em outro ambiente. Os volumes do PostgreSQL são persistentes; para recomeçar o teste com banco vazio, remova o volume apenas se os dados de desenvolvimento puderem ser descartados.

## GitHub Actions

O workflow `.github/workflows/ci.yml` executa build e testes com um PostgreSQL temporário, valida as duas migrações e testa a API na imagem Docker. O banco fica disponível somente durante o job; todas as verificações ocorrem nele.

Antes do primeiro envio, em **Settings → Secrets and variables → Actions → Repository secrets**, crie `CI_POSTGRES_PASSWORD` com uma senha alfanumérica forte. O workflow usa esse segredo para o serviço PostgreSQL e para montar `DATABASE_URL`. A senha alfanumérica evita a necessidade de codificar caracteres especiais na URL. Não envie `.env` ao GitHub.

Depois, envie os arquivos ao repositório e abra a aba **Actions** para acompanhar `Testar API, migrações e imagem`. O workflow constrói a imagem para teste; não a publica em um registry.

## Exemplo de API

```bash
curl -X POST http://localhost:3333/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"Dom Casmurro","author":"Machado de Assis","publishedYear":1899,"available":true}'
curl http://localhost:3333/books
```
