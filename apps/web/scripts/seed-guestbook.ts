import { createClerkClient } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inArray } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { guestbookEntries } from "@/lib/schema";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_IDS_FILE = resolve(__dirname, ".seed-guestbook-ids.json");

function getClerk() {
    const key = process.env.CLERK_SECRET_KEY;
    if (!key) throw new Error("CLERK_SECRET_KEY not set");
    return createClerkClient({ secretKey: key });
}

function getDb() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    return drizzle({ client: neon(url) });
}

function fakeMessage() {
    const templates = [
        () => faker.hacker.phrase(),
        () => faker.lorem.sentence(faker.number.int({ min: 6, max: 14 })),
        () => `Just found this through ${faker.internet.domainWord()}. ${faker.hacker.phrase()}`,
        () => faker.lorem.sentences(2),
        () => `${faker.company.catchPhrase()}. ${faker.lorem.sentence()}`,
        () => faker.lorem.sentence(faker.number.int({ min: 8, max: 18 })),
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
}

async function seed(count: number) {
    const clerk = getClerk();
    const db = getDb();

    console.log(`Creating ${count} Clerk users...\n`);

    const createdIds: string[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        try {
            const user = await clerk.users.createUser({
                firstName,
                lastName,
                publicMetadata: { isSeeded: true },
            });
            createdIds.push(user.id);
            process.stdout.write(`  [${i + 1}/${count}] ${firstName} ${lastName} → ${user.id}\n`);
        } catch (err: unknown) {
            const detail = err && typeof err === "object" && "errors" in err
                ? JSON.stringify((err as { errors: unknown }).errors)
                : err instanceof Error ? err.message : String(err);
            console.warn(`  [${i + 1}/${count}] Failed: ${detail}`);
        }
    }

    if (createdIds.length === 0) {
        console.error("No users created. Aborting.");
        process.exit(1);
    }

    console.log(`\nInserting ${createdIds.length} guestbook entries...`);

    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    await db.insert(guestbookEntries).values(
        createdIds.map((clerkUserId) => ({
            clerkUserId,
            message: fakeMessage(),
            isPinned: false,
            isDeleted: false,
            createdAt: new Date(faker.number.int({ min: oneYearAgo, max: now })),
        })),
    );

    const existing: string[] = existsSync(SEED_IDS_FILE)
        ? JSON.parse(readFileSync(SEED_IDS_FILE, "utf8"))
        : [];
    writeFileSync(SEED_IDS_FILE, JSON.stringify([...existing, ...createdIds], null, 2));

    console.log(`\nSeeded ${createdIds.length} entries.`);
}

async function cleanup() {
    if (!existsSync(SEED_IDS_FILE)) {
        console.log("No seed ID file found.");
        process.exit(0);
    }

    const ids: string[] = JSON.parse(readFileSync(SEED_IDS_FILE, "utf8"));
    if (ids.length === 0) {
        console.log("Nothing to clean up.");
        process.exit(0);
    }

    const clerk = getClerk();
    const db = getDb();

    console.log(`Deleting ${ids.length} entries from DB...`);
    await db.delete(guestbookEntries).where(inArray(guestbookEntries.clerkUserId, ids));

    console.log(`Deleting ${ids.length} Clerk users...`);
    let deleted = 0;
    for (const id of ids) {
        try {
            await clerk.users.deleteUser(id);
            deleted++;
            process.stdout.write(`  Deleted ${id}\n`);
        } catch {
            console.warn(`  Could not delete ${id}`);
        }
    }

    writeFileSync(SEED_IDS_FILE, JSON.stringify([]));
    console.log(`\nCleaned up ${deleted} users.`);
}

const args = process.argv.slice(2);

if (args.includes("--cleanup")) {
    cleanup().catch((e) => { console.error(e); process.exit(1); });
} else {
    const countFlag = args.indexOf("--count");
    const count = countFlag !== -1 ? parseInt(args[countFlag + 1] ?? "15") : 15;
    if (isNaN(count) || count < 1) {
        console.error("--count must be a positive integer");
        process.exit(1);
    }
    seed(count).catch((e) => { console.error(e); process.exit(1); });
}
