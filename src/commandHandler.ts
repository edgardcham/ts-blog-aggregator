import { setUser } from './config.js';

export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandRegistry = Record<string, CommandHandler>;

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No username provided');
    }
    const userName = args[0];
    setUser(userName);
    console.log(`Logged in as ${userName}`);
}

export function registerCommand(
    registry: CommandRegistry,
    cmdName: string,
    handler: CommandHandler,
): void {
    registry[cmdName] = handler;
}

export function runCommand(
    registry: CommandRegistry,
    cmdName: string,
    ...args: string[]
): void {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Command ${cmdName} not found`);
    }
    handler(cmdName, ...args);
}
