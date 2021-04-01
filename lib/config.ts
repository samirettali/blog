import fs from "fs";
import yaml from "js-yaml";
import path from "path";

export async function getConfig() {
  const configPath = path.join(process.cwd(), "config.yml");
  const fileContent = fs.readFileSync(configPath, "utf8");
  const config = yaml.load(fileContent);
  return config;
}
