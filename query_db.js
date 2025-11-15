const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const members = await prisma.member.findMany({});
    console.log('Total members: ' + members.length + '\n');
    console.log('=== All Members ===\n');
    members.slice(0, 25).forEach(m => {
      console.log('Name: ' + m.firstName + ' ' + m.lastName);
      console.log('ID: ' + m.id);
      console.log('');
    });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
