import path from 'path';
import fs from 'fs';

export type Config = {
    dbUrl: string;
    currentUserName: string | null;
};

export function setUser(currentUserName: string): void {
    const config = readConfig();
    config.currentUserName = currentUserName;
    writeConfig(config);
}

export function readConfig(): Config {
    const configPath = path.join(process.cwd(), '/config/.gatorconfig.json');
    const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return validateConfig(rawConfig);
}

function writeConfig(cfg: Config): void {
    const configPath = path.join(process.cwd(), '/config/.gatorconfig.json');
    const fileConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };
    fs.writeFileSync(configPath, JSON.stringify(fileConfig, null, 2));
}

function validateConfig(rawConfig: any): Config {
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
