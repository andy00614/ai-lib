import pino from "pino";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";

const logsDir = join(process.cwd(), "logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" ? {
    targets: [
      {
        target: "pino-pretty",
        level: "info",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname"
        }
      },
      {
        target: "pino/file",
        level: "info", 
        options: {
          destination: join(logsDir, "app.log"),
          mkdir: true
        }
      }
    ]
  } : {
    target: "pino/file",
    options: {
      destination: join(logsDir, "app.log"),
      mkdir: true
    }
  }
});