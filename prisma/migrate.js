const { execSync } = require("child_process");

try {
  console.log("Running Prisma migrate deploy...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("Migration finished.");
} catch (err) {
  console.error("Migration failed:", err);
  process.exit(1);
}
