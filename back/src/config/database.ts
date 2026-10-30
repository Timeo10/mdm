import { DataSource } from 'typeorm';
import * as fs from 'fs';
import env from './environment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [__dirname + '/../entities/*.{js,ts}'],
  synchronize: false, 
  logging: env.NODE_ENV === 'development'
});
