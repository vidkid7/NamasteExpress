import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });
  console.log("Articles in database:");
  for (const a of articles) {
    console.log(`- ${a.slug}: ${a.title}`);
    console.log(`  Char Codes: ${Array.from(a.title).map(c => `${c} (${c.charCodeAt(0).toString(16)})`).join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
