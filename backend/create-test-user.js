import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  try {
    // Generate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Hash password
    const hashedPassword = await bcrypt.hash('TestPassword123', SALT_ROUNDS);

    // Find or create church
    let church = await prisma.church.findUnique({
      where: { email: 'testchurch@example.com' },
    });

    if (!church) {
      church = await prisma.church.create({
        data: {
          name: 'Grace Community Church',
          email: 'testchurch@example.com',
          trialEndsAt: trialEndsAt,
          subscriptionStatus: 'trial',
        },
      });
      console.log('✅ Church created:', church);
    } else {
      console.log('✅ Church found:', church);
    }

    // Find or create admin
    let admin = await prisma.admin.findUnique({
      where: { email: 'pastor@church.com' },
    });

    if (!admin) {
      admin = await prisma.admin.create({
        data: {
          churchId: church.id,
          email: 'pastor@church.com',
          passwordHash: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          role: 'PRIMARY',
        },
      });
      console.log('✅ Admin created:', admin);
    } else {
      console.log('✅ Admin found:', admin);
    }

    // Create test branch
    const branch = await prisma.branch.create({
      data: {
        churchId: church.id,
        name: 'Main Campus',
        address: '123 Church Street',
        phone: '555-0100',
        description: 'Our main campus location',
        isActive: true,
      },
    });

    console.log('✅ Branch created:', branch);

    // Create test group
    const group = await prisma.group.create({
      data: {
        churchId: church.id,
        branchId: branch.id,
        name: 'Sunday School',
        description: 'Children and youth Sunday School',
        welcomeMessageEnabled: true,
        welcomeMessageText: 'Welcome to our Sunday School program!',
      },
    });

    console.log('✅ Group created:', group);

    console.log('\n✅ Test data successfully created!');
    console.log('\nLogin credentials:');
    console.log('Email: pastor@church.com');
    console.log('Password: TestPassword123');
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
