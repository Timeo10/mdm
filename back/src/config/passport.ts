import fs from 'fs';
import passport from 'passport';
import { Strategy } from 'passport-saml';
import env from './environment';

passport.use(
    new Strategy(
        {
            callbackUrl: `${env.SERVER_URL}:${env.SERVER_PORT}/v1/auth/callback`,
            entryPoint: env.ENTRY_ID_URL,
            issuer: env.ENTRY_ID_ISSUER,
            cert: fs.readFileSync(env.SAML_CERT_PATH, 'utf-8'),
            validateInResponseTo: false,
            disableRequestedAuthnContext: true,
        },
        /**
         * Handles the authenticated user's profile returned by Azure AD.
         *
         * @param profile - The user's SAML profile information returned by Azure AD.
         * @param done - A callback to signal completion of the authentication process.
         */
        (profile, done) => {
            // @ts-expect-error done is a function
            return done(null, profile);
        },
    ),
);

/**
 * Serializes the user object into the session.
 *
 * @param user - The authenticated user object.
 * @param done - A callback to signal completion of serialization.
 */
passport.serializeUser((user, done) => {
    done(null, user);
});

/**
 * Deserializes the user object from the session.
 *
 * @param user - The serialized user object.
 * @param done - A callback to signal completion of deserialization.
 */
passport.deserializeUser((user, done) => {
    done(null, user as any);
});

export default passport;
