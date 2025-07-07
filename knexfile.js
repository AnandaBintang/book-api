import 'dotenv/config';

const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
};

if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  connectionConfig.password = process.env.DB_PASSWORD;
}

export default {
  development: {
    client: 'pg',
    connection: {
      ...connectionConfig,
      ssl: false
    },
    migrations: {
      directory: './migrations'
    }
  }
};
