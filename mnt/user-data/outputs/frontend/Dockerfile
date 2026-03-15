# ============================================================
# Dockerfile — Frontend React
# ============================================================

# Imagem base — Node.js 20 versão enxuta (alpine)
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia só os arquivos de dependência primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Porta padrão do React
EXPOSE 3000

# Inicia o servidor de desenvolvimento
CMD ["npm", "start"]
