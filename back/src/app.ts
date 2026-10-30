import express from 'express';
import cors from 'cors';
import session from 'express-session';
import helmet from 'helmet';
import passport from './config/passport';
import authRouter from './routes/auth.routes';
import societeRouter from './routes/societe.routes';
import tiersRouter from './routes/tiers.routes';
import customAttributeRouter from './routes/customAttribute.routes';
import tierPendingApprovalRouter from './routes/tierPendingApproval.routes';
import tiersRoleRouter from './routes/tiersRole.routes';
import valueListRouter from './routes/valueList.routes';
import ribRouter from './routes/rib.routes';
import userRoleRouter from './routes/userRole.routes';
import env from './config/environment';
import { AppDataSource } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { enrichUserWithRole } from './middleware/authentication.middleware';


const app = express();

// Security headers
app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

/**
 * Middleware de gestion des sessions.
 */
app.use(
  session({
    secret: env.SECRET_KEY, // Utilise la variable validée, pas de fallback
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renouvelle le cookie à chaque requête pour maintenir la session active
    cookie: {
      secure: env.NODE_ENV === 'production', // Sécurisé en production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 heures d'inactivité avant expiration
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax', // Strict en production
    },
    name: 'sessionId',
  }),
);

/**
 * Middleware d'initialisation de l'authentification SAML avec Passport.
 */
  app.use(passport.initialize());
  app.use(passport.session());

  // Middleware pour enrichir les requêtes avec le rôle utilisateur
  app.use(enrichUserWithRole);

  app.get('/', (_req, res) => {
    res.json({ message: 'Serveur opérationnel 🚀' });
  });

  // Gestion des routes

  app.use('/v1/auth', authRouter);
  app.use('/v1/societes', societeRouter);
  app.use('/v1/tiers', tiersRouter);
  app.use('/v1/custom-attributes', customAttributeRouter);
  app.use('/v1/tiers-pending', tierPendingApprovalRouter);
  app.use('/v1', tiersRoleRouter);
  app.use('/v1/value-lists', valueListRouter);
  app.use('/v1/ribs', ribRouter);
  app.use('/v1/user-roles', userRoleRouter);

  // Middleware de gestion d'erreurs (doit être après les routes)
  app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Base de données connectée');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à la base de données:', error);
  });

export default app

