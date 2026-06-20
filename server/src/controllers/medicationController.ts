import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as medicationModel from '../models/medicationModel';

export function getMedications(req: AuthRequest, res: Response): void {
  const items = medicationModel.findMedicationsByUser(req.userId!);
  res.json(items);
}

export function getMedicationById(req: AuthRequest, res: Response): void {
  const id = parseInt(req.params.id);
  const item = medicationModel.findMedicationById(id);
  if (!item || item.user_id !== req.userId) {
    res.status(404).json({ message: 'Médicament non trouvé' });
    return;
  }
  res.json(item);
}

export function createMedication(req: AuthRequest, res: Response): void {
  const { name, dosage, photo_url, time, start_date, end_date, notes } = req.body;
  if (!name || !time || !start_date) {
    res.status(400).json({ message: 'Champs requis: name, time, start_date' });
    return;
  }
  const item = medicationModel.createMedication(req.userId!, {
    name, dosage, photo_url, time, start_date, end_date, notes,
  });
  res.status(201).json(item);
}

export function updateMedication(req: AuthRequest, res: Response): void {
  const id = parseInt(req.params.id);
  const item = medicationModel.updateMedication(id, req.userId!, req.body);
  if (!item) {
    res.status(404).json({ message: 'Médicament non trouvé' });
    return;
  }
  res.json(item);
}

export function deleteMedication(req: AuthRequest, res: Response): void {
  const id = parseInt(req.params.id);
  const deleted = medicationModel.deleteMedication(id, req.userId!);
  if (!deleted) {
    res.status(404).json({ message: 'Médicament non trouvé' });
    return;
  }
  res.status(204).send();
}

export function getTodaysMedications(req: AuthRequest, res: Response): void {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const items = medicationModel.findTodaysMedications(req.userId!, date);
  res.json(items);
}
