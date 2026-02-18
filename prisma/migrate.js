const { execSync } = require("child_process");
const path = require("path");

try {
  console.log("Running Prisma migrate deploy...");

  const prismaPath = path.join(
    __dirname,
    "..",
    "node_modules",
    "prisma",
    "build",
    "index.js"
  );

  execSync(`node ${prismaPath} migrate deploy`, {
    stdio: "inherit",
  });

  console.log("Migration finished.");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
}
