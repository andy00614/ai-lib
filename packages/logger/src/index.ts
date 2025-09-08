import pino from "pino";

const isProd = (process.env.NODE_ENV ?? "").toLowerCase() === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  // Pretty print in non-production for readability
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
            ignore: "pid,hostname",
          },
        },
      }),
});

export type Logger = typeof logger;
