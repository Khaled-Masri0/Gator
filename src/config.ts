import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
    dbUrl: URL;
    currentUserName?: string;
};
export function setUser(config: Config, userName: string): void {
  const updatedConfig: Config = {
    ...config,
    currentUserName: userName,
  };

  writeConfig(updatedConfig);
}

export function readConfig(): Config {
    const configPath = getConfigFilePath();
    const configContent = fs.readFileSync(configPath, "utf-8");
    const rawConfig = JSON.parse(configContent);
    return validateConfig(rawConfig);
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(cfg: Config): void {
  const configPath = getConfigFilePath();

  const serialized = {
    db_url: cfg.dbUrl.toString(),
    current_user_name: cfg.currentUserName,
  };

  fs.writeFileSync(configPath, JSON.stringify(serialized, null, 2));
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig !== "object" || rawConfig === null) {
    throw new Error("Invalid config format: expected an object.");
  }

  if (typeof rawConfig.db_url !== "string") {
    throw new Error("Invalid config: 'db_url' must be a string.");
  }

  if (
    rawConfig.current_user_name !== undefined &&
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error(
      "Invalid config: 'current_user_name' must be a string if provided."
    );
  }

  return {
    dbUrl: new URL(rawConfig.db_url),
    currentUserName: rawConfig.current_user_name, 
  };
}
