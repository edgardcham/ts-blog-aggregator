import { defineConfig } from 'drizzle-kit';
import path from 'path';
import fs from 'fs';
import { homedir } from 'os';

const configPath = path.join(homedir(), '.gatorconfig.json');
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

export default defineConfig({
    schema: './src/lib/schema.ts',
    out: './src/lib/db',
    dialect: 'postgresql',
    dbCredentials: {
        url: rawConfig.db_url,
    },
});
