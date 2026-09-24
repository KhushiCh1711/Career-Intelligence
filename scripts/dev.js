import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const services = [
  ["backend", "run", "dev", "--prefix", "backend"],
  ["frontend", "run", "dev", "--prefix", "frontend"],
];

const children = services.map(([name, ...args]) => {
  const command = process.platform === "win32" ? "cmd.exe" : npmCommand;
  const commandArgs = process.platform === "win32"
    ? ["/d", "/s", "/c", [npmCommand, ...args].join(" ")]
    : args;
  const child = spawn(command, commandArgs, {
    stdio: "inherit",
    shell: false,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
  });

  return child;
});

function stopServices() {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", stopServices);
process.on("SIGTERM", stopServices);
