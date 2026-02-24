import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
  return db.query.users.findFirst({
    where: eq(users.name, name),
  });
}

export async function getAllUsers(){
  return db.query.users.findMany();
}

export async function deleteAllUsers(){
  await db.delete(users).execute();

}