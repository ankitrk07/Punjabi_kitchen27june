const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

async function main() {
  // Load local sqlite dishes
  const dbDishes = await prisma.dish.findMany();
  
  // Load static menu.ts dishes
  const menuFilePath = path.join(__dirname, '..', 'src', 'data', 'menu.ts');
  const menuContent = fs.readFileSync(menuFilePath, 'utf8');
  
  console.log('--- Database vs static menu.ts Comparison ---');
  let diffCount = 0;
  
  dbDishes.forEach(dbDish => {
    // Find the dish in static menu content using regex or string check
    const regex = new RegExp(`id:\\s*"${dbDish.id}"[^]*?image:\\s*"([^"]+)"`);
    const match = menuContent.match(regex);
    
    if (match) {
      const staticImage = match[1];
      if (dbDish.image !== staticImage) {
        console.log(`Discrepancy for ID: ${dbDish.id}`);
        console.log(`  Database: ${dbDish.image}`);
        console.log(`  Static menu.ts: ${staticImage}`);
        diffCount++;
      }
    } else {
      console.log(`Dish ID: ${dbDish.id} not found in static menu.ts`);
      diffCount++;
    }
  });
  
  console.log(`Total discrepancies found: ${diffCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
