import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { cache } from "react";

export interface Config {
  name?: string;
  shortName?: string;
  links?: Link[];
}

export interface Link {
  name: string;
  target: string;
  iconName?: string;
}

export const getConfig = cache(async (): Promise<Config> => {
  const configPath = path.join(process.cwd(), "config.yml");
  const fileContent = await fs.readFile(configPath, "utf8");
  return (yaml.load(fileContent) as Config) ?? {};
});
