import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateSession() {
  console.log('🔑 Telegram Session Generator\n');
  
  const apiId = await askQuestion('Enter API ID: ');
  const apiHash = await question('Enter API Hash: ');

  console.log('\n📱 Login Process Starting...\n');

  const client = new TelegramClient(new StringSession(''), parseInt(apiId), apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await askQuestion('Enter phone number (+91...): '),
    password: async () => await askQuestion('Enter 2FA password (if any): '),
    phoneCode: async () => await askQuestion('Enter verification code: '),
    onError: (err) => console.error('Error:', err),
  });

  const sessionString = client.session.save();
  
  console.log('\n✅ **SESSION GENERATED SUCCESSFULLY!**\n');
  console.log('📋 Add this to Render Environment Variables:\n');
  console.log(`SESSION_STRING=${sessionString}\n`);
  console.log('⚠️  Keep this secret! Do not share with anyone.\n');
  
  await client.disconnect();
  rl.close();
}

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

generateSession().catch(console.error);
