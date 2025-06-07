import path from 'path';
import fs from 'fs';
import os from 'os';

export type Config = {
    dbUrl: string;
    currentUserName: string | null;
};

export async function setUser(currentUserName: string): Promise<void> {
    const config = await readConfig();
    config.currentUserName = currentUserName;
    await writeConfig(config);
}

export async function readConfig(): Promise<Config> {
    const configPath = path.join(os.homedir(), '.gatorconfig.json');
    const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return await validateConfig(rawConfig);
}

async function writeConfig(cfg: Config): Promise<void> {
    const configPath = path.join(os.homedir(), '.gatorconfig.json');
    const fileConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };
    fs.writeFileSync(configPath, JSON.stringify(fileConfig, null, 2));
}

async function validateConfig(rawConfig: any): Promise<Config> {
    if (!rawConfig.db_url) {
        throw new Error('dbUrl is required');
    }
    if (!rawConfig.current_user_name) {
        console.log('No user set');
    }
    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name || null,
    };
}
