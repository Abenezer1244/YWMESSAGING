const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Get Samsom's details
    const samsom = await prisma.member.findUnique({
      where: { id: 'cmi03pgmo0014jr25lpf4h1wg' }
    });

    console.log('=== Samsom Details ===');
    console.log('Name: ' + samsom.firstName + ' ' + samsom.lastName);
    console.log('ID: ' + samsom.id);
    console.log('Phone (encrypted): ' + samsom.phone);
    console.log('Phone Hash: ' + samsom.phoneHash);
    console.log('Opt In SMS: ' + samsom.optInSms);
    console.log('');

    // Get conversations for Samsom
    const conversations = await prisma.conversation.findMany({
      where: { memberId: samsom.id },
      include: {
        church: true,
        messages: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    console.log('=== Conversations ===');
    console.log('Total conversations: ' + conversations.length);
    conversations.forEach(conv => {
      console.log('');
      console.log('Church: ' + conv.church.name);
      console.log('Conversation ID: ' + conv.id);
      console.log('Status: ' + conv.status);
      console.log('Unread: ' + conv.unreadCount);
      console.log('Last Message: ' + conv.lastMessageAt);
      console.log('Messages: ' + conv.messages.length);
      conv.messages.slice(0, 3).forEach(msg => {
        console.log('  - ' + msg.direction + ' [' + msg.createdAt + ']: ' + msg.content);
      });
    });

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
