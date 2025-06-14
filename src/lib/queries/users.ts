import { db } from '../index.js';
import { users } from '../schema.js';
import { eq } from 'drizzle-orm';

export async function createUser(name: string) {
    const existingUser = await getUserByName(name);
    if (existingUser) {
        throw new Error('User already exists');
    }
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}

export async function getUserByName(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    return result;
}

export async function resetUsersTable() {
    await db.delete(users);
}

export async function getUsers() {
    const results = await db.select().from(users);
    return results;
}

export async function getUserById(id: string) {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
}
