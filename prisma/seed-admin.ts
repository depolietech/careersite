import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@biasfree.local";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@123456";

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin account created: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Change this password immediately after first login!`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
