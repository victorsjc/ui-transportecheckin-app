#!/bin/bash

# Build do frontend
echo "Construindo o frontend..."
npx vite build

# Prepara ambiente para build do serverless
echo "Configurando ambiente serverless..."
mkdir -p api

# Construir API
echo "Construindo serverless functions..."
cp -r server api/server
cp -r shared api/shared

echo "Build concluída com sucesso!"