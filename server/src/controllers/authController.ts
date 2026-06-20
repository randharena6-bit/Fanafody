import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest, generateToken } from '../middleware/auth';
import * as userModel from '../models/userModel';
import * as resetTokenModel from '../models/resetTokenModel';

export function register(req: AuthRequest, res: Response): void {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ message: 'Champs requis: email, password, name' });
    return;
  }
  if (userModel.findUserByEmail(email)) {
    res.status(409).json({ message: 'Email déjà utilisé' });
    return;
  }
  const hash = bcrypt.hashSync(password, 10);
  const user = userModel.createUser(email, hash, name, phone);
  const token = generateToken(user.id);
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone } });
}

export function login(req: AuthRequest, res: Response): void {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Champs requis: email, password' });
    return;
  }
  const user = userModel.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    return;
  }
  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone } });
}

export function getMe(req: AuthRequest, res: Response): void {
  const user = userModel.findUserById(req.userId!);
  if (!user) { res.status(404).json({ message: 'Utilisateur non trouvé' }); return; }
  res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
}

export function updateProfile(req: AuthRequest, res: Response): void {
  const { name, phone } = req.body;
  const user = userModel.updateUser(req.userId!, name, phone);
  if (!user) { res.status(404).json({ message: 'Utilisateur non trouvé' }); return; }
  res.json({ id: user.id, email: user.email, name: user.name, phone: user.phone });
}

export function forgotPassword(req: AuthRequest, res: Response): void {
  const { email } = req.body;
  const user = userModel.findUserByEmail(email);
  if (!user) {
    res.status(404).json({ message: 'Email non trouvé' });
    return;
  }
  const token = resetTokenModel.createResetToken(user.id);
  // En production: envoyer le token par email
  console.log(`Password reset token for ${email}: ${token}`);
  res.json({ message: 'Email de réinitialisation envoyé', token });
}

export function resetPassword(req: AuthRequest, res: Response): void {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ message: 'Champs requis: token, newPassword' });
    return;
  }
  const data = resetTokenModel.verifyResetToken(token);
  if (!data) {
    res.status(400).json({ message: 'Token invalide ou expiré' });
    return;
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  userModel.updatePassword(data.userId, hash);
  resetTokenModel.markTokenUsed(token);
  res.json({ message: 'Mot de passe réinitialisé avec succès' });
}
