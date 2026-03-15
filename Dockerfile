# ============================================================
# Dockerfile — Backend Node.js + Express + gRPC
# ============================================================

# Imagem base — Node.js 20 versão enxuta (alpine)
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia só os arquivos de dependência primeiro
# (Docker cacheia essa camada — rebuild mais rápido)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Porta da API REST
EXPOSE 4000

# Porta do servidor gRPC
EXPOSE 50051

# Comando para iniciar em modo desenvolvimento com hot reload
CMD ["npm", "run", "dev"]
