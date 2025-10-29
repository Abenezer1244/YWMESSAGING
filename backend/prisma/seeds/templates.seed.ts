import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDefaultTemplates(churchId: string) {
  const defaultTemplates = [
    {
      name: 'Service Reminder',
      content:
        'Join us Sunday at 10am for worship service! We look forward to seeing you there. 🙏',
      category: 'service_reminder',
    },
    {
      name: 'Event Announcement',
      content:
        "You're invited to a special event! Join us for fellowship, food, and fun. Details: {date} at {time}. RSVP by replying to this message.",
      category: 'event',
    },
    {
      name: 'Prayer Request',
      content:
        'Prayer request: Please pray for {person}. Your prayers make a difference. Please reply with your prayers of support.',
      category: 'prayer',
    },
    {
      name: 'Thank You',
      content:
        'Thank you so much for your support and generosity! Your contributions help us serve our community. God bless you!',
      category: 'thank_you',
    },
    {
      name: 'Welcome',
      content:
        "Welcome to our church family! We're so glad you're here. Please reach out if you have any questions.",
      category: 'welcome',
    },
    {
      name: 'Offering Reminder',
      content:
        'Give generously to support our ministry! You can give online at {website} or in person on Sunday. Every gift matters!',
      category: 'offering',
    },
  ];

  for (const template of defaultTemplates) {
    await prisma.messageTemplate.upsert({
      where: { id: `${churchId}-${template.category}` },
      update: {},
      create: {
        id: `${churchId}-${template.category}`,
        churchId,
        name: template.name,
        content: template.content,
        category: template.category,
        isDefault: true,
        usageCount: 0,
      },
    });
  }

  console.log('Default templates seeded successfully');
}
