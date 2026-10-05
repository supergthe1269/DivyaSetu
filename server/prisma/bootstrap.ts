import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function runBootstrap() {
  console.log('Running DivyaSetu PostGIS & DBMS Bootstrap...');
  const sqlPath = path.join(__dirname, 'bootstrap.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split SQL statements while preserving PL/pgSQL dollar-quoted ($$) function bodies
  const statements: string[] = [];
  let current = '';
  let inDollarQuote = false;

  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip full-line comments
    if (trimmed.startsWith('--')) continue;

    current += line + '\n';

    // Toggle dollar quote mode
    const dollarMatches = line.match(/\$\$/g);
    if (dollarMatches && dollarMatches.length % 2 === 1) {
      inDollarQuote = !inDollarQuote;
    }

    if (!inDollarQuote && trimmed.endsWith(';')) {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = '';
    }
  }
  if (current.trim()) {
    statements.push(current.trim());
  }

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`  ✔ Executed statement ${i + 1}/${statements.length}`);
    } catch (err: any) {
      console.warn(`  ⚠️ Statement ${i + 1} notice:`, err.message);
    }
  }

  console.log('✅ Bootstrap completed successfully!');
}

runBootstrap()
  .catch((e) => {
    console.error('Bootstrap failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
