const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dishes = await prisma.dish.findMany();
  console.log('--- Dishes with Unsplash URLs ---');
  let count = 0;
  dishes.forEach(d => {
    if (d.image.includes('unsplash.com')) {
      console.log(`ID: ${d.id} | Name: ${d.name} | Image: ${d.image}`);
      count++;
    }
  });
  console.log(`Total dishes with Unsplash images: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
