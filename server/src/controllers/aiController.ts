import { Request, Response } from 'express';
import * as openrouter from '../services/openrouter';

export async function chat(req: Request, res: Response): Promise<void> {
  const { messages, model, temperature, max_tokens } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ message: 'Champs requis: messages (non-empty array)' });
    return;
  }

  try {
    const result = await openrouter.createChatCompletion({
      messages,
      model,
      temperature,
      max_tokens,
    });

    res.json({
      id: result.id,
      message: result.choices[0].message,
      usage: result.usage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(502).json({ message });
  }
}
