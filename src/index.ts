import { readConfig, setUser } from './config.js';

function main() {
    let config = readConfig();
    const userName = 'Ed';
    setUser(userName);
    config = readConfig();
    console.log(`currentUserName: ${config.currentUserName}`);
    console.log(`dbUrl: ${config.dbUrl}`);
}

main();
