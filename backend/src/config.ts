import { resolve } from 'node:path';

export const config = {
  port: 8080,
  databasePath: resolve(__dirname, '../data/forma.sqlite'),
};
