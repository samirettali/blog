import fs from "fs";
import yaml from "js-yaml";
import path from "path";

export interface Config {
  name?: string;
  shortName?: string;
  links?: Link[]
}

export interface Link {
  name: string;
  href: string;
  iconName?: string;
}

export const getConfig = async (): Promise<Config> => {
  const configPath = path.join(process.cwd(), "config.yml");
  const fileContent = fs.readFileSync(configPath, "utf8");
  const config = yaml.load(fileContent);
  return config;
}
