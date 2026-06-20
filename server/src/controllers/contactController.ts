import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as contactModel from '../models/contactModel';

export function getContacts(req: AuthRequest, res: Response): void {
  const contacts = contactModel.findContactsByUser(req.userId!);
  res.json(contacts);
}

export function getContactById(req: AuthRequest, res: Response): void {
  const id = parseInt(req.params.id as string);
  const contact = contactModel.findContactById(id);
  if (!contact || contact.user_id !== req.userId) {
    res.status(404).json({ message: 'Contact non trouvé' });
    return;
  }
  res.json(contact);
}

export function createContact(req: AuthRequest, res: Response): void {
  const { name, phone, email, notify_after_missed } = req.body;
  if (!name) {
    res.status(400).json({ message: 'Champ requis: name' });
    return;
  }
  const contact = contactModel.createContact(
    req.userId!,
    name,
    phone || '',
    email || '',
    notify_after_missed || 3
  );
  res.status(201).json(contact);
}

export function updateContact(req: AuthRequest, res: Response): void {
  const id = parseInt(req.params.id as string);
  const contact = contactModel.updateContact(id, req.userId!, req.body);
  if (!contact) {
    res.status(404).json({ message: 'Contact non trouvé' });
    return;
  }
  res.json(contact);
}

export function deleteContact(req: AuthRequest, res: Response): void {
  const id = parseInt(req.params.id as string);
  const deleted = contactModel.deleteContact(id, req.userId!);
  if (!deleted) {
    res.status(404).json({ message: 'Contact non trouvé' });
    return;
  }
  res.status(204).send();
}
