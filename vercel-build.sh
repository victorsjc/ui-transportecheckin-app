#!/bin/bash

# Tornar o script executável
chmod +x ./vercel-build.sh

# Build do frontend 
echo "Construindo o frontend..."
npx vite build

# Prepara ambiente para build do serverless
echo "Configurando ambiente serverless..."
mkdir -p api
mkdir -p dist

# Construir API para formato serverless
echo "Construindo serverless functions..."
cp -r server api/server
cp -r shared api/shared
cp -r dist/assets dist/client-assets

# Adiciona informação de ambiente
echo "NODE_ENV=production" > .env.production

echo "Build concluída com sucesso!"