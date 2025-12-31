const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.REGISTRY_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function checkEINs() {
  try {
    const churches = await prisma.church.findMany({
      where: { ein: { not: null } },
      select: { id: true, name: true, ein: true, einEncryptedAt: true }
    });

    console.log('='.repeat(70));
    console.log('EIN ENCRYPTION STATUS CHECK');
    console.log('='.repeat(70));
    console.log('');
    console.log('Total churches with EIN:', churches.length);
    console.log('');

    if (churches.length === 0) {
      console.log('✅ NO EINS IN DATABASE');
      console.log('   Safe to use either encryption key');
      console.log('');
    } else {
      for (const church of churches) {
        const ein = church.ein;
        // Check if encrypted (format: iv:salt:encrypted:tag - 4 parts)
        const parts = ein.split(':');
        const isEncrypted = parts.length === 4;

        console.log('Church:', church.name);
        console.log('  ID:', church.id);
        console.log('  EIN encrypted:', isEncrypted ? '✅ YES' : '❌ NO (plain text)');
        console.log('  EIN format:', isEncrypted ? 'iv:salt:encrypted:tag (4 parts)' : `${parts.length} part(s)`);
        console.log('  First 30 chars:', ein.substring(0, 30) + '...');
        console.log('  Encrypted at:', church.einEncryptedAt || 'Not set');
        console.log('');
      }
    }

    console.log('='.repeat(70));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkEINs();
