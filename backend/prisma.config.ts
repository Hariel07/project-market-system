import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  // No Railway, o DATABASE_URL já está no process.env.
  // Removendo o carregamento manual de .env para evitar conflitos no build.
});
