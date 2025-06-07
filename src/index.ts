import { readConfig } from './config.js';
import {
    type CommandRegistry,
    handlerLogin,
    registerCommand,
    runCommand,
} from './commandHandler.js';

function main() {
    readConfig();
    const registry: CommandRegistry = {};
    registerCommand(registry, 'login', handlerLogin);

    const args = process.argv.slice(2);
    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    if (cmdArgs.length === 0) {
        console.error('No command provided');
        process.exit(1);
    }

    runCommand(registry, cmdName, ...cmdArgs);
}

main();
