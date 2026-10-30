import { Router } from 'express';
import passport from '../config/passport';
import env from '../config/environment';
import { UserRoleService } from '../services/userRole.service';

const router = Router();
const userRoleService = new UserRoleService();

router.get(
  '/login',
  passport.authenticate('saml', {
    failureRedirect: '/v1/auth/login/fail',
  }),
);

router.post(
  '/callback',
  passport.authenticate('saml', {
    failureRedirect: '/v1/auth/login/fail',
    failureMessage: true,
  }),
  (_req, res) => {
    res.redirect(`${env.CLIENT_URL}/home`);
  },
);

router.get('/me', async (req, res) => {
  console.log('=== /me endpoint ===');
  console.log('req.isAuthenticated:', req.isAuthenticated ? req.isAuthenticated() : 'undefined');
  console.log('req.user:', req.user);
  console.log('req.session:', req.session);

  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'pas connecte' });
  }

  // Extraire les informations utilisateur du profil SAML
  const profile = req.user as any;
  console.log('Raw SAML profile:', JSON.stringify(profile, null, 2));

  const email = profile.email || profile.nameID || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

  // Récupérer le rôle de l'utilisateur depuis la base de données
  const role = await userRoleService.getUserRole(email);

  // Parser le nom complet pour extraire prénom et nom
  let firstName: string | undefined;
  let lastName: string | undefined;
  let displayName: string | undefined;

  // Essayer d'abord les champs standards
  firstName = profile.givenName || profile.firstName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
  lastName = profile.surname || profile.lastName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];
  displayName = profile.displayName || profile['http://schemas.microsoft.com/identity/claims/displayname'];

  // Si pas de prénom/nom mais un champ "name", le parser
  if (!firstName && !lastName && profile.name) {
    const nameParts = profile.name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }
    displayName = displayName || profile.name;
  }

  const user = {
    email,
    displayName,
    firstName,
    lastName,
    role,
  };

  console.log('Processed user:', user);

  return res.json({
    message: 'connexion reussi ✅',
    user,
  });
});

router.get('/login/fail', (_req, res) => {
  res.status(401).json({ message: 'saml failed' });
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Erreur lors de la destruction de la session' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Déconnexion réussie' });
    });
  });
});

export default router;
