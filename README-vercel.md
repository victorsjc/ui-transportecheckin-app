# Deploy na Vercel

Este documento contém instruções específicas para fazer deploy deste aplicativo na Vercel.

## Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com)
2. Seu código em um repositório Git (GitHub, GitLab, Bitbucket)

## Configuração

A Vercel oferece um ambiente serverless que funciona bem para este tipo de aplicação, mas requer algumas adaptações específicas que já foram incluídas no código:

1. **Arquivos de configuração**:
   - `vercel.json` - Configuração principal da Vercel
   - `api/index.js` - API Express adaptada para serverless
   - `api/_serverless.js` - Adaptador para ambiente serverless

2. **Script de build personalizado**:
   - `vercel-build.sh` - Compila frontend e backend para o formato correto

## Variáveis de ambiente

Configure as seguintes variáveis de ambiente no dashboard da Vercel:

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `SESSION_SECRET` | Chave para criptografar sessões | Sim |
| `NODE_ENV` | Deve ser definido como "production" | Sim |
| `DATABASE_URL` | String de conexão do banco de dados (opcional) | Não |

## IMPORTANTE: Portas na Vercel

A Vercel não permite especificar portas personalizadas como 5000 em ambientes serverless. Por isso:

1. **Não se preocupe com a porta 5000** - Na Vercel, as funções serverless não precisam de uma porta específica, isso é gerenciado automaticamente pela plataforma
2. As configurações específicas para Vercel já foram adaptadas nos arquivos `api/_serverless.js` e `vercel.json`
3. O frontend e as APIs funcionarão automaticamente na URL fornecida pela Vercel

## Passos para Deploy

### Via dashboard Vercel

1. Faça login no [dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe seu repositório
4. Configure o projeto:
   - Framework Preset: Outros (não Node.js)
   - Build Command: `./vercel-build.sh`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Adicione as variáveis de ambiente
6. Clique em "Deploy"

### Via CLI Vercel

```bash
# Instalar CLI se necessário
npm i -g vercel

# Login na Vercel
vercel login

# Deploy para desenvolvimento
vercel

# Deploy para produção
vercel --prod
```

## Verificação do Deploy

1. Após o deploy, a Vercel fornecerá uma URL para seu aplicativo
2. Verifique se todas as rotas estão funcionando corretamente
3. Se encontrar problemas, verifique os logs no dashboard da Vercel