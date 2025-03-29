# Configuração de Banco de Dados na Vercel para TripCheck

Este guia contém instruções para configurar um banco de dados PostgreSQL para a aplicação TripCheck na Vercel.

## Opções de Banco de Dados

Para um ambiente de produção, você tem algumas opções:

1. **Neon Database** (Recomendado): PostgreSQL serverless, ideal para Vercel
2. **Supabase**: Oferece PostgreSQL com autenticação e outros serviços
3. **Railway**: PostgreSQL completo, fácil de configurar
4. **ElephantSQL**: Oferece planos gratuitos para PostgreSQL

## Configuração com Neon Database

Neon Database é uma excelente opção para Vercel por ser serverless.

### Passo a Passo:

1. Crie uma conta no [Neon](https://neon.tech)
2. Crie um novo projeto
3. Na página do projeto, copie a string de conexão completa
4. Adicione as variáveis de ambiente no seu projeto Vercel:
   - `DATABASE_URL`: A string de conexão completa

## Adaptação do Código para Banco de Dados

### 1. Migrar da solução MemStorage para DatabaseStorage

Em `server/storage.ts`, você precisa implementar a classe `DatabaseStorage`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import connectPg from 'connect-pg-simple';
import session from 'express-session';

const PostgresSessionStore = connectPg(session);
const connectionString = process.env.DATABASE_URL;

// Cliente SQL para queries gerais
const client = postgres(connectionString);
// Cliente SQL para Drizzle
const db = drizzle(client, { schema });

export class DatabaseStorage implements IStorage {
  private pool;
  sessionStore: session.Store;

  constructor() {
    this.pool = {
      connect: () => client,
      query: (text, params) => client.unsafe(text, params)
    };
    
    this.sessionStore = new PostgresSessionStore({ 
      pool: this.pool, 
      createTableIfMissing: true 
    });
    
    // Execute migrations automaticamente em produção
    if (process.env.NODE_ENV === 'production') {
      this.runMigrations();
    }
  }

  async runMigrations() {
    try {
      // Executa migrações
      await migrate(db, { migrationsFolder: 'drizzle' });
      console.log('Migrações aplicadas com sucesso!');
    } catch (error) {
      console.error('Erro ao aplicar migrações:', error);
    }
  }

  // Implementações dos métodos IStorage usando Drizzle ORM
  // ...
}

// Exporta a instância de armazenamento apropriada baseada no ambiente
export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
```

### 2. Gerar Migrações com Drizzle

Para gerar migrações a partir do seu schema:

```bash
# Instale o drizzle-kit se ainda não tiver
npm install -g drizzle-kit

# Gere migrações
npx drizzle-kit generate:pg

# Aplique migrações (em desenvolvimento)
npx drizzle-kit push:pg
```

### 3. Implementar os Métodos do IStorage

Implemente cada método da interface `IStorage` usando Drizzle ORM:

```typescript
// Exemplo de implementação de getUser
async getUser(id: number): Promise<User | undefined> {
  const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return result[0];
}

// Exemplo de implementação de createUser
async createUser(user: InsertUser): Promise<User> {
  const result = await db.insert(schema.users).values(user).returning();
  return result[0];
}
```

## Configurando Sessões Persistentes

Para sessões persistentes no ambiente serverless:

1. Configure o store de sessão para usar o PostgreSQL
2. Defina o tempo de vida adequado das sessões
3. Verifique outras opções de cookies necessárias para produção

## Inicialização e Uso

A solução verifica automaticamente se `DATABASE_URL` está presente no ambiente e usa DatabaseStorage ou MemStorage conforme necessário. Não é preciso modificar o código cliente.