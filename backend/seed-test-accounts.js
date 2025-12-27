const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestAccounts() {
  console.log('\n🌱 Creating test accounts...\n');

  try {
    // Account 1: DOKaA@GMAIL.COM
    console.log('[1/3] Creating DOKaA@GMAIL.COM...');
    const church1 = await prisma.church.create({
      data: {
        name: 'Test Church 1 - DOKaA',
        email: 'DOKaA@GMAIL.COM',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        admins: {
          create: {
            email: 'DOKaA@GMAIL.COM',
            firstName: 'Test',
            lastName: 'User1',
            role: 'admin',
            passwordHash: await bcrypt.hash('12!Michael', 10),
            welcomeCompleted: true,
            userRole: 'user',
          },
        },
        branches: {
          create: {
            name: 'Main Branch 1',
            description: 'Main branch for church 1',
            isActive: true,
          },
        },
      },
      include: { admins: true, branches: true },
    });
    console.log('✅ Created: DOKaA@GMAIL.COM');
    console.log('   Church ID: ' + church1.id);
    console.log('   Admin ID: ' + church1.admins[0].id);

    // Account 2: ab@gmail.com
    console.log('\n[2/3] Creating ab@gmail.com...');
    const church2 = await prisma.church.create({
      data: {
        name: 'Test Church 2 - ab',
        email: 'ab@gmail.com',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        admins: {
          create: {
            email: 'ab@gmail.com',
            firstName: 'Test',
            lastName: 'User2',
            role: 'admin',
            passwordHash: await bcrypt.hash('12!Michael', 10),
            welcomeCompleted: true,
            userRole: 'user',
          },
        },
        branches: {
          create: {
            name: 'Main Branch 2',
            description: 'Main branch for church 2',
            isActive: true,
          },
        },
      },
      include: { admins: true, branches: true },
    });
    console.log('✅ Created: ab@gmail.com');
    console.log('   Church ID: ' + church2.id);
    console.log('   Admin ID: ' + church2.admins[0].id);

    // Account 3: q@gmail.com
    console.log('\n[3/3] Creating q@gmail.com...');
    const church3 = await prisma.church.create({
      data: {
        name: 'Test Church 3 - q',
        email: 'q@gmail.com',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        admins: {
          create: {
            email: 'q@gmail.com',
            firstName: 'Test',
            lastName: 'User3',
            role: 'admin',
            passwordHash: await bcrypt.hash('12!Michael', 10),
            welcomeCompleted: true,
            userRole: 'user',
          },
        },
        branches: {
          create: {
            name: 'Main Branch 3',
            description: 'Main branch for church 3',
            isActive: true,
          },
        },
      },
      include: { admins: true, branches: true },
    });
    console.log('✅ Created: q@gmail.com');
    console.log('   Church ID: ' + church3.id);
    console.log('   Admin ID: ' + church3.admins[0].id);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ ALL TEST ACCOUNTS CREATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Login credentials (all accounts):');
    console.log('Password: 12!Michael\n');
    console.log('Account 1: DOKaA@GMAIL.COM');
    console.log('Account 2: ab@gmail.com');
    console.log('Account 3: q@gmail.com\n');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestAccounts();
