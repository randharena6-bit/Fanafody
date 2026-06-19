import { Request, Response } from 'express';
import * as itemModel from '../models/itemModel';

export function getItems(req: Request, res: Response): void {
  const userId = parseInt(req.query.user_id as string) || 1;
  const items = itemModel.findItemsByUser(userId);
  res.json(items);
}

export function getItemById(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const item = itemModel.findItemById(id);
  if (!item) {
    res.status(404).json({ message: 'Élément non trouvé' });
    return;
  }
  res.json(item);
}

export function createItem(req: Request, res: Response): void {
  const { user_id, title, description } = req.body;
  if (!user_id || !title) {
    res.status(400).json({ message: 'Champs requis : user_id, title' });
    return;
  }
  const item = itemModel.createItem(user_id, title, description);
  res.status(201).json(item);
}

export function updateItem(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const { title, description, status } = req.body;
  if (!title || !status) {
    res.status(400).json({ message: 'Champs requis : title, status' });
    return;
  }
  const item = itemModel.updateItem(id, title, description || null, status);
  if (!item) {
    res.status(404).json({ message: 'Élément non trouvé' });
    return;
  }
  res.json(item);
}

export function deleteItem(req: Request, res: Response): void {
  const id = parseInt(req.params.id);
  const deleted = itemModel.deleteItem(id);
  if (!deleted) {
    res.status(404).json({ message: 'Élément non trouvé' });
    return;
  }
  res.status(204).send();
}
