import { expect, test } from '@playwright/test';
import { build, getHrefByEntryName } from '@scripts/shared';

test('should import svg with SVGR plugin and query URL correctly', async ({
  page,
}) => {
  const rsbuild = await build({
    cwd: __dirname,
    runServer: true,
  });

  await page.goto(getHrefByEntryName('index', rsbuild.port));

  // test svg asset
  await expect(
    page.evaluate(
      `document.getElementById('test-img').src.includes('static/svg/app')`,
    ),
  ).resolves.toBeTruthy();

  // test svg asset in css
  await expect(
    page.evaluate(
      `getComputedStyle(document.getElementById('test-css')).backgroundImage.includes('static/svg/app')`,
    ),
  ).resolves.toBeTruthy();

  await rsbuild.close();
});
