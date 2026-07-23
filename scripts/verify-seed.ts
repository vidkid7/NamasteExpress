import { PrismaClient } from "@prisma/client";
import { createSeedClock } from "../prisma/seed-data/seed-date";
import { verifySeed } from "../prisma/seed-data/seed-runner";

const prisma = new PrismaClient();

verifySeed(prisma, createSeedClock(process.env.SEED_DATE))
  .then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
