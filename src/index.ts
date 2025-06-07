import { readConfig } from './config.js';
import {
    type CommandRegistry,
    handlerAddFeed,
    handlerAgg,
    handlerFeeds,
    handlerLogin,
    handlerRegister,
    handlerReset,
    handlerUsers,
    registerCommand,
    runCommand,
} from './commandHandler.js';

async function main() {
    const config = await readConfig();
    const registry: CommandRegistry = {};
    registerCommand(registry, 'login', handlerLogin);
    registerCommand(registry, 'register', handlerRegister);
    registerCommand(registry, 'reset', handlerReset);
    registerCommand(registry, 'users', handlerUsers);
    registerCommand(registry, 'agg', handlerAgg);
    registerCommand(registry, 'addfeed', handlerAddFeed);
    registerCommand(registry, 'feeds', handlerFeeds);
    const args = process.argv.slice(2);
    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    try {
        await runCommand(registry, cmdName, ...cmdArgs);
        process.exit(0);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}

main();
