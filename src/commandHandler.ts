import { setUser } from './config.js';
import { createUser, getUserByName } from './lib/queries/users.js';

export type CommandHandler = (
    cmdName: string,
    ...args: string[]
) => Promise<void>;
export type CommandRegistry = Record<string, CommandHandler>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No username provided');
    }
    const userName = args[0];
    const user = await getUserByName(userName);
    if (!user) {
        throw new Error('User not found');
    }
    await setUser(userName);
    console.log(`Logged in as ${userName}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error('No username provided');
    }
    const userName = args[0];
    try {
        await createUser(userName);
    } catch (error) {
        throw new Error('User already exists');
    }
    await setUser(userName);
    console.log(`Registered user ${userName} and logged in`);
}

export async function registerCommand(
    registry: CommandRegistry,
    cmdName: string,
    handler: CommandHandler,
): Promise<void> {
    registry[cmdName] = handler;
}

export async function runCommand(
    registry: CommandRegistry,
    cmdName: string,
    ...args: string[]
): Promise<void> {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Command ${cmdName} not found`);
    }
    await handler(cmdName, ...args);
}
