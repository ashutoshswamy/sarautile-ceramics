// Deletes EVERY Clerk user (admins and staff included). Irreversible.
// Run: node --env-file=.env.local scripts/delete-users.mjs
// Uses the Clerk REST API directly - no extra deps.
import { createInterface } from "node:readline/promises";

const key = process.env.CLERK_SECRET_KEY;
if (!key) throw new Error("CLERK_SECRET_KEY missing - run with --env-file=.env.local");

const api = (path, init) =>
  fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}` },
  }).then(async (res) => {
    if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  });

// Collect all ids first so deleting doesn't shift the pagination.
const ids = [];
for (let offset = 0; ; offset += 500) {
  const page = await api(`/users?limit=500&offset=${offset}&order_by=created_at`);
  ids.push(...page.map((u) => u.id));
  if (page.length < 500) break;
}

const instance = key.startsWith("sk_live") ? "PRODUCTION" : "development";
console.log(`${ids.length} user(s) in the ${instance} Clerk instance.`);
if (!ids.length) process.exit(0);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question(`Type DELETE to remove all ${ids.length}: `);
rl.close();
if (answer !== "DELETE") {
  console.log("Aborted.");
  process.exit(1);
}

let done = 0;
for (const id of ids) {
  await api(`/users/${id}`, { method: "DELETE" });
  console.log(`deleted ${id} (${++done}/${ids.length})`);
}
