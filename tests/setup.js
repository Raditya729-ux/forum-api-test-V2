/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

afterAll(async () => {
  await pool.end();
});
