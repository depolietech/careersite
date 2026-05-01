/**
 * Updates all job locations to North American locations (USA, Canada, Mexico, Remote).
 * Run with: node prisma/fix-locations.js
 */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const NA_LOCATIONS = [
  "Remote",
  "New York, USA",
  "San Francisco, CA",
  "Austin, Texas, USA",
  "Chicago, USA",
  "Los Angeles, CA",
  "Seattle, WA, USA",
  "Boston, MA, USA",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Montreal, Canada",
  "Calgary, Canada",
  "Mexico City, Mexico",
  "Guadalajara, Mexico",
  "Remote",
  "New York, USA",
  "Toronto, Canada",
  "Remote",
  "San Francisco, CA",
  "Austin, Texas, USA",
  "Vancouver, Canada",
  "Mexico City, Mexico",
  "Remote",
  "Chicago, USA",
  "Montreal, Canada",
];

async function main() {
  const jobs = await db.job.findMany({ select: { id: true, title: true, location: true }, orderBy: { createdAt: "asc" } });

  console.log(`Found ${jobs.length} jobs. Updating locations to North America...`);

  for (let i = 0; i < jobs.length; i++) {
    const newLocation = NA_LOCATIONS[i % NA_LOCATIONS.length];
    await db.job.update({ where: { id: jobs[i].id }, data: { location: newLocation } });
    console.log(`  [${i + 1}] "${jobs[i].title}" → ${newLocation}`);
  }

  console.log("\n✅ All job locations updated to North America.");
}

main().catch(console.error).finally(() => db.$disconnect());
