const fs = require("fs");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

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
    console.log(`Angular environment.ts file generated.`);
  }
});

fs.writeFile(targetDevPath, envConfigDevFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(`Angular environment.development.ts file generated.`);
  }
});
