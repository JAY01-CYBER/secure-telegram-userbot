const { spawn } = require('child_process');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

console.log("🔐 Secure Telegram Userbot - Session Generator\n");

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    const apiId = await ask("📋 Enter API ID: ");
    const apiHash = await ask("🔑 Enter API Hash: ");
    const phoneNumber = await ask("📱 Enter phone number (with country code): ");
    
    console.log("\n🚀 Generating session... This may take a moment.\n");
    
    // Use Python script to generate session
    const pythonScript = `
import asyncio
from telethon.sessions import StringSession
from telethon import TelegramClient

async def main():
    api_id = ${apiId}
    api_hash = "${apiHash}"
    phone = "${phoneNumber}"
    
    client = TelegramClient(StringSession(), api_id, api_hash)
    await client.start(phone=phone)
    
    print("=== SESSION_START ===")
    print(client.session.save())
    print("=== SESSION_END ===")
    
    await client.disconnect()

asyncio.run(main())
`;

    // Run Python script
    const pythonProcess = spawn('python3', ['-c', pythonScript]);
    
    let sessionString = '';
    let capturing = false;
    
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      if (output.includes('=== SESSION_START ===')) {
        capturing = true;
      } else if (output.includes('=== SESSION_END ===')) {
        capturing = false;
      } else if (capturing) {
        sessionString += output.trim();
      }
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error('Error:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0 && sessionString) {
        console.log("\n" + "=".repeat(70));
        console.log("🎉 STRING SESSION GENERATED SUCCESSFULLY!");
        console.log("=".repeat(70));
        console.log(sessionString);
        console.log("=".repeat(70));
        console.log("\n💡 Copy this to your .env file as: STRING_SESSION=" + sessionString);
      } else {
        console.log("❌ Session generation failed");
      }
      rl.close();
    });
    
    // Handle user input
    pythonProcess.stdin.on('error', (err) => {});
    
    rl.on('line', (input) => {
      pythonProcess.stdin.write(input + '\n');
    });
    
  } catch (error) {
    console.log("❌ Error:", error.message);
    rl.close();
  }
}

main();
