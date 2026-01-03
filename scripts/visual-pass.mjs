import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import net from 'node:net';

const shots = [
  { name: 'home-desktop', path: '/', viewport: { width: 1400, height: 900 } },
  { name: 'home-mobile', path: '/', viewport: { width: 430, height: 932 }, isMobile: true },
  { name: 'athletic-desktop', path: '/landing/athletic', viewport: { width: 1400, height: 900 } },
  { name: 'athletic-mobile', path: '/landing/athletic', viewport: { width: 430, height: 932 }, isMobile: true },
  { name: 'editorial-desktop', path: '/landing/editorial', viewport: { width: 1400, height: 900 } },
  { name: 'technical-desktop', path: '/landing/technical', viewport: { width: 1400, height: 900 } },
  { name: 'login-desktop', path: '/login', viewport: { width: 1200, height: 900 } },
  { name: 'signup-desktop', path: '/signup', viewport: { width: 1200, height: 900 } },
  { name: 'onboarding-desktop', path: '/onboarding', viewport: { width: 1200, height: 900 } },
];

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function isFlag(name) {
  return process.argv.includes(name);
}

async function waitForServer(url, timeoutMs = 40000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // ignore until server is ready
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function findOpenPort(ports) {
  for (const port of ports) {
    const available = await new Promise((resolve) => {
      const server = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => server.close(() => resolve(true)))
        .listen(port, '127.0.0.1');
    });
    if (available) return port;
  }
  return null;
}

let devProcess = null;

function stopServer() {
  if (devProcess && !devProcess.killed) {
    devProcess.kill('SIGTERM');
  }
}

process.on('exit', stopServer);
process.on('SIGINT', () => {
  stopServer();
  process.exit(1);
});
process.on('SIGTERM', () => {
  stopServer();
  process.exit(1);
});

async function main() {
  const requestedPort = Number(getArg('--port')) || null;
  const baseUrlArg = getArg('--base-url');
  const skipServer = isFlag('--no-server');

  let baseUrl = baseUrlArg;

  if (!skipServer) {
    const port = requestedPort || (await findOpenPort([3000, 3001, 3002, 3010, 3020]));
    if (!port) {
      console.error('No open port found for dev server.');
      process.exit(1);
    }

    baseUrl = baseUrl ?? `http://127.0.0.1:${port}`;
    devProcess = spawn('npm', ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', String(port)], {
      stdio: 'ignore',
      env: process.env,
    });

    const ready = await waitForServer(baseUrl);
    if (!ready) {
      console.error(`Dev server did not respond at ${baseUrl}`);
      stopServer();
      process.exit(1);
    }
  }

  if (!baseUrl) {
    console.error('Missing base URL. Provide --base-url or let the script start the server.');
    process.exit(1);
  }

  const { chromium } = await import('playwright');
  const outDir = join(process.cwd(), 'tmp', 'visual-pass');
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  for (const shot of shots) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: 2,
      isMobile: Boolean(shot.isMobile),
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${shot.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(outDir, `pw-${shot.name}.png`), fullPage: true });
    await context.close();
  }
  await browser.close();

  stopServer();
}

main().catch((err) => {
  console.error(err);
  stopServer();
  process.exit(1);
});
