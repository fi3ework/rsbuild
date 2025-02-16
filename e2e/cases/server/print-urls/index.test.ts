import { test, expect } from '@playwright/test';
import { dev } from '@scripts/shared';
import { proxyConsole } from '@scripts/helper';

const cwd = __dirname;

test('should print server urls correctly when printUrls is true', async ({
  page,
}) => {
  const { logs, restore } = proxyConsole('log');

  const rsbuild = await dev({
    cwd,
    rsbuildConfig: {
      server: {
        printUrls: true,
      },
    },
  });

  await page.goto(`http://localhost:${rsbuild.port}`);

  const localLog = logs.find(
    (log) => log.includes('Local:') && log.includes('http://localhost'),
  );
  const networkLog = logs.find(
    (log) => log.includes('Network:') && log.includes('http://'),
  );

  expect(localLog).toBeTruthy();
  expect(networkLog).toBeTruthy();

  await rsbuild.server.close();
  restore();
});

test('should not print server urls when printUrls is false', async ({
  page,
}) => {
  const { logs, restore } = proxyConsole('log');

  const rsbuild = await dev({
    cwd,
    rsbuildConfig: {
      server: {
        printUrls: false,
      },
    },
  });

  await page.goto(`http://localhost:${rsbuild.port}`);

  const localLog = logs.find(
    (log) => log.includes('Local:') && log.includes('http://localhost'),
  );
  const networkLog = logs.find(
    (log) => log.includes('Network:') && log.includes('http://'),
  );

  expect(localLog).toBeFalsy();
  expect(networkLog).toBeFalsy();

  await rsbuild.server.close();
  restore();
});

test('should allow to custom urls', async ({ page }) => {
  const { logs, restore } = proxyConsole('log');

  const rsbuild = await dev({
    cwd,
    rsbuildConfig: {
      server: {
        printUrls: ({ urls, protocol, port }) => {
          expect(typeof port).toEqual('number');
          expect(protocol).toEqual('http');
          expect(urls.includes(`http://localhost:${port}`)).toBeTruthy();
        },
      },
    },
  });

  await page.goto(`http://localhost:${rsbuild.port}`);

  const localLog = logs.find(
    (log) => log.includes('Local:') && log.includes('http://localhost'),
  );
  const networkLog = logs.find(
    (log) => log.includes('Network:') && log.includes('http://'),
  );

  expect(localLog).toBeFalsy();
  expect(networkLog).toBeFalsy();

  await rsbuild.server.close();
  restore();
});

test('should allow to modify and return new urls', async ({ page }) => {
  const { logs, restore } = proxyConsole('log');

  const rsbuild = await dev({
    cwd,
    rsbuildConfig: {
      server: {
        printUrls: ({ urls }) => urls.map((url) => `${url}/test`),
      },
    },
  });

  await page.goto(`http://localhost:${rsbuild.port}`);

  const localLog = logs.find(
    (log) =>
      log.includes('Local:') &&
      log.includes(`http://localhost:${rsbuild.port}/test/`),
  );
  const networkLog = logs.find(
    (log) =>
      log.includes('Network:') &&
      log.includes('http://') &&
      log.endsWith('/test/'),
  );

  expect(localLog).toBeFalsy();
  expect(networkLog).toBeFalsy();

  await rsbuild.server.close();
  restore();
});
