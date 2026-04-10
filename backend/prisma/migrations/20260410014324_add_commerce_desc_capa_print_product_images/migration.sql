-- AlterTable
ALTER TABLE "Commerce" ADD COLUMN     "capaUrl" TEXT,
ADD COLUMN     "copiasImpressao" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "impressaoAutomatica" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imagens" TEXT[];
