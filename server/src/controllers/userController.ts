import { Request, Response } from 'express';
import * as userModel from '../models/userModel';

export function getAllUsers(req: Request, res: Response): void {
  const users = userModel.findAllUsers();
  res.json(users);
}

export function getUserById(req: Request, res: Response): void {
  const id = parseInt(req.params.id as string);
  const user = userModel.findUserById(id);
  if (!user) {
    res.status(404).json({ message: 'Utilisateur non trouvé' });
    return;
  }
  res.json(user);
}

export function createUser(req: Request, res: Response): void {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ message: 'Champs requis : email, name, password' });
    return;
  }
  const user = userModel.createUser(email, name, password);
  res.status(201).json(user);
}

export function updateUser(req: Request, res: Response): void {
  const id = parseInt(req.params.id as string);
  const { email, name } = req.body;
  if (!email || !name) {
    res.status(400).json({ message: 'Champs requis : email, name' });
    return;
  }
  const user = userModel.updateUser(id, email, name);
  if (!user) {
    res.status(404).json({ message: 'Utilisateur non trouvé' });
    return;
  }
  res.json(user);
}

export function deleteUser(req: Request, res: Response): void {
  const id = parseInt(req.params.id as string);
  const deleted = userModel.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ message: 'Utilisateur non trouvé' });
    return;
  }
  res.status(204).send();
}
