import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as historyModel from '../models/historyModel';

export function logMedication(req: AuthRequest, res: Response): void {
  const { medication_id, status, taken_at } = req.body;
  if (!medication_id || !status) {
    res.status(400).json({ message: 'Champs requis: medication_id, status' });
    return;
  }
  if (!['taken', 'skipped'].includes(status)) {
    res.status(400).json({ message: 'Status doit être "taken" ou "skipped"' });
    return;
  }
  const log = historyModel.logMedication(medication_id, req.userId!, status, taken_at);
  res.status(201).json(log);
}

export function getMedicationLogs(req: AuthRequest, res: Response): void {
  const medicationId = parseInt(req.params.medicationId as string);
  const logs = historyModel.getMedicationLogs(medicationId, req.userId!);
  res.json(logs);
}

export function getHistoryByDateRange(req: AuthRequest, res: Response): void {
  const { from, to } = req.query;
  if (!from || !to) {
    res.status(400).json({ message: 'Paramètres requis: from, to (dates)' });
    return;
  }
  const data = historyModel.getHistoryByDateRange(req.userId!, from as string, to as string);
  res.json(data);
}

export function getDailySummary(req: AuthRequest, res: Response): void {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const summary = historyModel.getDailySummary(req.userId!, date);
  res.json(summary);
}
