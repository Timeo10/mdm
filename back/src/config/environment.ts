import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env' });

const environment = {
    NODE_ENV: process.env.NODE_ENV,
    SERVER_URL: process.env.SERVER_URL,
    SERVER_PORT: process.env.SERVER_PORT,
    ENTRY_ID_URL: process.env.ENTRY_ID_URL,
    ENTRY_ID_ISSUER: process.env.ENTRY_ID_ISSUER,
    CLIENT_URL: process.env.CLIENT_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    SECRET_KEY: process.env.SECRET_KEY,
    SAML_CERT_PATH: process.env.SAML_CERT_PATH,
    DB_SSL_CA: process.env.DB_SSL_CA,
};


const validator = z.object({
    /** Application environment */
    NODE_ENV: z.enum(['development', 'production', 'testing']),

    /** The public server URL used in the SAML callback */
    SERVER_URL: z.string().url(),

    /** The server port (must be a number) */
    SERVER_PORT: z.string().regex(/^\d+$/).transform(Number),

    /** The Azure AD SAML entry point URL */
    ENTRY_ID_URL: z.string().url(),

    /** The Azure AD SAML issuer string */
    ENTRY_ID_ISSUER: z.string(),
    CLIENT_URL: z.string().url(),

    /** Database configuration */
    DB_HOST: z.string(),
    DB_PORT: z.string().regex(/^\d+$/).transform(Number),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),

    /** Session secret key (minimum 32 characters) */
    SECRET_KEY: z.string().min(32, 'SECRET_KEY must be at least 32 characters'),

    /** Path to SAML certificate file */
    SAML_CERT_PATH: z.string(),

    /** Optional: Path to database SSL CA certificate */
    DB_SSL_CA: z.string().optional(),
});

let env: z.infer<typeof validator>;

try {
    env = validator.parse(environment);
} catch (e) {
    const error = e as Error;
    console.error(`\x1b[31m❌ Error validating environment variables:\n${error.toString()}\x1b[0m`);
    process.exit(1);
}

export default env;
