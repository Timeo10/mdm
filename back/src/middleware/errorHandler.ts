import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiError {
  message: string;
  details?: any;
}

/**
 * Formatte les erreurs Zod pour les rendre plus lisibles
 */
export function formatZodError(error: ZodError): ApiError {
  const errors = error.errors.map((err) => {
    const field = err.path.join('.');

    switch (err.code) {
      case 'too_small':
        if (err.type === 'string') {
          if (err.minimum === 1) {
            return `Le champ "${field}" est obligatoire`;
          }
          return `Le champ "${field}" doit contenir au moins ${err.minimum} caractères`;
        }
        if (err.type === 'array') {
          return `Le champ "${field}" doit contenir au moins ${err.minimum} éléments`;
        }
        return `Le champ "${field}" est trop petit`;

      case 'too_big':
        if (err.type === 'string') {
          return `Le champ "${field}" doit contenir au maximum ${err.maximum} caractères`;
        }
        if (err.type === 'array') {
          return `Le champ "${field}" doit contenir au maximum ${err.maximum} éléments`;
        }
        return `Le champ "${field}" est trop grand`;

      case 'invalid_string':
        if (err.validation === 'email') {
          return `Le champ "${field}" doit être une adresse email valide`;
        }
        if (err.validation === 'url') {
          return `Le champ "${field}" doit être une URL valide`;
        }
        if (err.validation === 'uuid') {
          return `Le champ "${field}" doit être un UUID valide`;
        }
        return `Le champ "${field}" n'est pas au bon format`;

      case 'invalid_type':
        const expectedType = err.expected === 'string' ? 'texte' :
                           err.expected === 'number' ? 'nombre' :
                           err.expected === 'boolean' ? 'valeur booléenne' :
                           err.expected === 'array' ? 'liste' :
                           err.expected;
        return `Le champ "${field}" doit être de type ${expectedType}`;

      case 'invalid_enum_value':
        return `Le champ "${field}" doit être l'une des valeurs suivantes : ${err.options.join(', ')}`;

      case 'invalid_literal':
        return `Le champ "${field}" doit avoir la valeur "${err.expected}"`;

      default:
        return `Le champ "${field}" : ${err.message}`;
    }
  });

  return {
    message: 'Erreur de validation des données',
    details: errors,
  };
}

/**
 * Middleware global de gestion des erreurs
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Erreurs de validation Zod
  if (err instanceof ZodError) {
    const formattedError = formatZodError(err);
    return res.status(400).json(formattedError);
  }

  // Erreurs métier avec code HTTP
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  // Erreurs génériques
  console.error('Erreur non gérée:', err);
  return res.status(500).json({
    message: 'Une erreur interne est survenue',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

/**
 * Wrapper pour gérer les erreurs async dans les controllers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Classe pour les erreurs métier personnalisées
 */
export class BusinessError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}
