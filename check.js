const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log("Checking connection...");
  try {
    // This command only checks if the server responds to the credentials
    await prisma.$connect();
    console.log("✅ AUTHENTICATION SUCCESSFUL: The credentials are correct.");

    // This command checks if the 'user' table actually exists
    const userCount = await prisma.user.count();
    console.log(`✅ DATA CHECK: Found ${userCount} users in the table.`);

  } catch (e) {
    console.error("❌ ERROR DETECTED:");
    console.error("- Message:", e.message);
    console.error("- Error Code:", e.code); 
  } finally {
    await prisma.$disconnect();
  }
}

check();