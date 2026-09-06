import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const DB_NAME = process.env.DB_NAME || 'fashionhub';
const DB_USER = process.env.DB_USER || 'fashionhub';
const DB_PASS = process.env.DB_PASS || 'fashionhub';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_HOST = process.env.DB_HOST || 'localhost';

const sqlDir = join(__dirname, '..', '..', 'sql');

async function setup() {
  // Step 1: connect to postgres DB to create fashionhub if not exists
  const adminClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: 'postgres',
  });

  await adminClient.connect();
  try {
    const result = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_NAME]
    );
    if (result.rows.length === 0) {
      await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`Created database ${DB_NAME}`);
    } else {
      console.log(`Database ${DB_NAME} already exists`);
    }
  } finally {
    await adminClient.end();
  }

  // Step 2: connect to fashionhub and run schema + seed
  const appClient = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  });

  await appClient.connect();
  try {
    const schema = readFileSync(join(sqlDir, 'schema.sql'), 'utf-8');
    const seed = readFileSync(join(sqlDir, 'seed.sql'), 'utf-8');

    await appClient.query(schema);
    console.log('Schema created');

    await appClient.query(seed);
    console.log('Seed data inserted');

    // Count rows
    const users = await appClient.query('SELECT count(*) FROM users');
    const products = await appClient.query('SELECT count(*) FROM products');
    const reviews = await appClient.query('SELECT count(*) FROM reviews');

    console.log(`seeded ${users.rows[0].count} users, ${products.rows[0].count} products, ${reviews.rows[0].count} reviews`);
  } finally {
    await appClient.end();
  }
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});
