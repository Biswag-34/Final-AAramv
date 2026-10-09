import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";

const HOST = "127.0.0.1";
const PORT = 3000;

const command = process.argv[2];
const supportedCommands = new Set(["dev", "start"]);

if (!supportedCommands.has(command)) {
  console.error("Usage: node scripts/run-next.mjs <dev|start>");
  process.exit(1);
}

async function assertPortAvailable() {
  await new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(
          new Error(
            `Fixed port ${HOST}:${PORT} is already in use. Stop the existing project server before running npm run ${command}.`,
          ),
        );
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(resolve);
    });

    server.listen(PORT, HOST);
  });
}

try {
  await assertPortAvailable();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const args = [
  nextBin,
  command,
  "--port",
  String(PORT),
  "--hostname",
  HOST,
];

if (command === "dev") {
  args.push("--webpack");
}

const child = spawn(process.execPath, args, {
  env: {
    ...process.env,
    HOSTNAME: HOST,
    PORT: String(PORT),
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
