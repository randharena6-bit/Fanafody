export function errorHandler(err: Error, _req: any, res: any, _next: any): void {
  console.error('Error:', err.message);
  res.status(500).json({
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

export function notFoundHandler(_req: any, res: any): void {
  res.status(404).json({ message: 'Route non trouvée' });
}
