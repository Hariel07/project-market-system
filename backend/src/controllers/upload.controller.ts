import { Request, Response } from 'express';

/**
 * POST /api/upload
 * Recebe um arquivo via multipart/form-data (campo "file")
 * e retorna a URL pública.
 */
export async function uploadFile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    // URL pública: /uploads/<filename>
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload.' });
  }
}
