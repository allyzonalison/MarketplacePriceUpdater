import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({
  input,
  output,
});

const main = async () => {
  try {
    console.log("=== Change Password ===\n");

    const username = await rl.question("Username: ");
    const newPassword = await rl.question("New password: ");

    if (!username.trim() || !newPassword.trim()) {
      console.log("\nUsername and password are required.");
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        username: username.trim(),
      },
    });

    if (!user) {
      console.log(`\nUser "${username}" was not found.`);
      return;
    }

    console.log(`\nUser found: ${user.username}`);

    const confirmation = await rl.question(
      "Are you sure you want to change this password? (yes/no): "
    );

    if (confirmation.trim().toLowerCase() !== "yes") {
      console.log("\nPassword change cancelled.");
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log("\nPassword changed successfully.");
    console.log("Existing logged-in sessions are NOT affected.");
  } catch (error) {
    console.error("\nFailed to change password:", error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
};

main();
