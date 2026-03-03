const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// ── Validate .env exists ────────────────────────────────────────────────────
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, ".env.example");

if (!fs.existsSync(envPath)) {
  console.error("\n" + "=".repeat(70));
  console.error("❌ ERROR: Missing .env file in frontend/");
  console.error("=".repeat(70));
  console.error("");
  console.error("  The frontend requires a .env file to generate environment config.");
  console.error("  Create one by copying the example:");
  console.error("");
  if (process.platform === "win32") {
    console.error("    copy .env.example .env");
  } else {
    console.error("    cp .env.example .env");
  }
  console.error("");
  console.error("  Then edit .env with your local configuration.");
  console.error("=".repeat(70) + "\n");
  process.exit(1);
}

// Load env vars
dotenv.config();

// Warn if API_URL is empty
if (!process.env.API_URL) {
  console.warn("\n" + "-".repeat(70));
  console.warn("⚠️  WARNING: API_URL is not set in .env. Defaulting to empty string.");
  console.warn("   This will likely break API calls. Set API_URL=/api in your .env");
  console.warn("-".repeat(70) + "\n");
}

const targetPath = "./src/environments/environment.ts";
const targetDevPath = "./src/environments/environment.development.ts";

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || ""}',
};
`;

const envConfigDevFile = `export const environment = {
  production: false,
  apiUrl: '${process.env.API_URL || ""}',
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(`✅ Angular environment.ts file generated.`);
  }
});

fs.writeFile(targetDevPath, envConfigDevFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(`✅ Angular environment.development.ts file generated.`);
  }
});
