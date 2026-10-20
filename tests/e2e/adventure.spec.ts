import { expect, test, type Locator } from '@playwright/test';

async function expectInside(inner: Locator, outer: Locator) {
  const [innerBox, outerBox] = await Promise.all([inner.boundingBox(), outer.boundingBox()]);
  expect(innerBox).not.toBeNull();
  expect(outerBox).not.toBeNull();
  if (!innerBox || !outerBox) return;
  expect(innerBox.x).toBeGreaterThanOrEqual(outerBox.x - 1);
  expect(innerBox.y).toBeGreaterThanOrEqual(outerBox.y - 1);
  expect(innerBox.x + innerBox.width).toBeLessThanOrEqual(outerBox.x + outerBox.width + 1);
  expect(innerBox.y + innerBox.height).toBeLessThanOrEqual(outerBox.y + outerBox.height + 1);
}

async function completeActThree(
  page: import('@playwright/test').Page,
  owners: readonly number[] = [1, 2, 0, 1, 0, 2],
  expectedSlot = 'cs-09',
  verifyArchiveGating = false,
  challengeOwners: readonly number[] = owners,
  deferHiddenEnding = false,
) {
  await expect(page.getByRole('heading', { name: /Act III: Winter/ })).toBeVisible();
  await page.getByRole('button', { name: 'Begin Act III · CS-07' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  for (const clue of [
    /Zhang Juzheng.*valuations/,
    /Qi Jiguang.*valuations/,
    /Feng Bao.*valuations/,
    /Emperor.*instruction/,
  ]) await page.getByRole('button', { name: clue }).last().click();
  await expect(page.getByRole('heading', { name: 'Six-Writ Allocation Workbench', level: 2 })).toBeVisible();
  await expect(page.getByText(/EF1|EFX|NSW|Harmony Score/)).toHaveCount(0);
  const setOwners = async (owners: readonly number[]) => {
    const fields = page.locator('fieldset');
    for (let index = 0; index < owners.length; index += 1) await fields.nth(index).getByRole('radio').nth(owners[index]).check();
  };
  await setOwners(owners);
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Intuition rating 3' }).click();
  await page.getByRole('button', { name: 'Submit intuition rating' }).click();
  await expect(page.getByRole('heading', { name: /Case Scroll Debrief/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Remove-One Test' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await page.getByRole('button', { name: 'Revise once' }).click();
  await setOwners(owners);
  await page.getByRole('button', { name: 'Lock Final Verdict' }).click();
  await expect(page.getByRole('heading', { name: 'Act III Final Verdict' })).toBeVisible();
  await page.getByRole('button', { name: 'Act III Master Challenge' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await setOwners(challengeOwners);
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await expect(page.getByText(/Harmony Score \(product of utilities\)/)).toBeVisible();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).last().click();
  await expect(page.getByRole('heading', { name: 'Act III Performance Ledger' })).toBeVisible();
  if (verifyArchiveGating) {
    await page.getByRole('button', { name: 'Open Recall Archive' }).click();
    await expect(page.locator('li').filter({ hasText: 'cs-13' })).toHaveCount(0);
    await expect(page.locator('li').filter({ hasText: 'cs-14' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Open Recall Archive' }).click();
  }
  await page.getByRole('button', { name: 'Continue to the Act III ending boundary' }).click();
  await expect(page.getByRole('heading', { name: 'Paper story scroll' })).toBeVisible();
  await expect(page.getByRole('img', { name: `Paper fallback / transcript for ${expectedSlot.toUpperCase()}` })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  if (deferHiddenEnding) {
    await expect(page.getByRole('heading', { name: 'Paper story scroll' })).toBeVisible();
    return;
  }
  const expectedEnding = expectedSlot === 'cs-09'
    ? 'Three legs standing'
    : expectedSlot === 'cs-10'
      ? 'Jiangling’s grievance'
      : expectedSlot === 'cs-11'
        ? 'Jizhen’s grievance'
        : expectedSlot === 'cs-12'
          ? 'The Grand Companion’s grievance'
          : 'Held in the palace';
  await expect(page.getByRole('heading', { name: expectedEnding })).toBeVisible();
  await expect(page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).recall.watchedCutsceneSlots)).resolves.toEqual(expect.arrayContaining(['cs-07', 'cs-08', expectedSlot]));
}

async function openFirstCaseAndCompleteInvestigation(page: import('@playwright/test').Page, proceedToAllocation = true) {
  await page.getByRole('button', { name: 'Open the first case' }).click();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  const people = page.locator('[aria-label="People in the case"]');
  for (const name of ['Chen Shouye', 'Chen Congzheng', 'Chen Elder']) {
    await people.getByRole('button', { name: new RegExp(`^${name}`) }).click();
  }
  await page.getByRole('button', { name: 'The original Yiwu ruling', exact: true }).click();
  if (proceedToAllocation) await page.getByRole('button', { name: 'Continue to allocation' }).click();
}

async function reachFinalVerdict(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Begin campaign' }).click();
  const prologueSkip = page.getByRole('button', { name: 'Skip cutscene' });
  const prologueContinue = page.getByRole('button', { name: 'Continue' });
  await expect(prologueSkip.or(prologueContinue)).toBeVisible();
  if (await prologueSkip.isVisible()) await prologueSkip.click();
  else await prologueContinue.click();
  await openFirstCaseAndCompleteInvestigation(page);
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Show the whole scroll' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await expect(page.getByRole('heading', { name: 'Final Verdict' })).toBeVisible();
}

async function completeActOneMasterSeal(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Cut, then let the younger brother choose' }).click();
  await page.getByRole('slider', { name: /Paddy fields:/ }).fill('10');
  await page.getByRole('slider', { name: /Oil-tea hills:/ }).fill('5');
  await page.getByRole('slider', { name: /Silver:/ }).fill('0');
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await expect(page.getByText('Master Seal awarded.')).toBeVisible();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await expect(page.getByRole('heading', { name: 'Act I record' })).toBeVisible();
  await expect(page.getByText('Earned', { exact: true })).toBeVisible();
}

async function continueToActThreeAfterActTwoMasterSeal(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Close the Act I record' }).click();
  await expect(page.getByRole('img', { name: /oil lamp/i })).toBeVisible();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await expect(page.getByRole('heading', { name: 'Five years later' })).toBeVisible();
  await page.getByRole('button', { name: 'Begin Act II · Hangzhou' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /Act II: Winter/ })).toBeVisible();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  await page.getByRole('button', { name: 'The loom workshop model', exact: true }).click();
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Intuition rating 3' }).click();
  await page.getByRole('button', { name: 'Submit intuition rating' }).click();
  await page.getByRole('button', { name: 'Continue to the verdict choice' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Act II Master Challenge' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: 'Xue Shoucheng' }).check();
  await page.locator('#act-two-mulberry-fields-0').fill('10');
  await page.locator('#act-two-mulberry-fields-1').fill('0');
  await page.locator('#act-two-mulberry-fields-2').fill('0');
  await page.locator('#act-two-cash-silver-0').fill('0');
  await page.locator('#act-two-cash-silver-1').fill('10');
  await page.locator('#act-two-cash-silver-2').fill('0');
  await page.locator('#act-two-raw-silk-0').fill('2');
  await page.locator('#act-two-raw-silk-1').fill('2');
  await page.locator('#act-two-raw-silk-2').fill('6');
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await expect(page.getByText('The compensation challenge is complete.')).toBeVisible();
  await expect(page.getByText('Master Seal awarded for the 131648 frontier.')).toBeVisible();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await expect(page.getByRole('heading', { name: 'Act II Performance Ledger' })).toBeVisible();
  await expect(page.getByText('Earned', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Continue to the Act III boundary' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function reachActThreeIntro(page: import('@playwright/test').Page) {
  await reachFinalVerdict(page);
  await page.getByRole('button', { name: 'Skip Master Challenge' }).click();
  await page.getByRole('button', { name: 'Close the Act I record' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await page.getByRole('button', { name: 'Begin Act II · Hangzhou' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('heading', { name: /Act II: Winter/ }).waitFor();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  await page.getByRole('button', { name: 'The loom workshop model', exact: true }).click();
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Intuition rating 3' }).click();
  await page.getByRole('button', { name: 'Submit intuition rating' }).click();
  await page.getByRole('button', { name: 'Continue to the verdict choice' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Act II Master Challenge' }).click();
  await page.getByRole('heading', { name: /Paper story scroll/ }).waitFor();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await page.getByRole('button', { name: 'Continue to the Act III boundary' }).click();
  await page.getByRole('heading', { name: /Paper story scroll/ }).waitFor();
  await page.getByRole('button', { name: 'Continue' }).click();
}

test('Act I Case Desk guides the player from evidence to allocation before locking an Initial Verdict', async ({ page }) => {
  const clientDiagnostics: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      clientDiagnostics.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => clientDiagnostics.push(`pageerror: ${error.message}`));
  await page.setViewportSize({ width: 667, height: 375 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await openFirstCaseAndCompleteInvestigation(page, false);
  const dossier = page.locator('[data-investigation-dossier]');
  await expect(dossier).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue to allocation' })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(667);

  const caseDesk = page.locator('[data-case-desk]');
  await page.getByRole('button', { name: 'Continue to allocation' }).click();
  const workbench = caseDesk.locator('[data-allocation-workbench]');
  await expect(page.locator('[data-adventure-v2]')).toHaveAttribute('data-phase', 'allocation');
  await expect(workbench.getByRole('table', { name: 'What each brother values' })).toBeVisible();
  await expect(caseDesk).toContainText('Chen Shouye');
  await expect(caseDesk).toContainText('Paddy fields');
  await expect(page.getByRole('button', { name: 'Enter allocation workbench' })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(667);
  const paddy = caseDesk.getByRole('slider', { name: /Paddy fields:/ });
  const paddyBefore = await paddy.inputValue();
  await paddy.focus();
  await paddy.press('ArrowRight');
  await expect(paddy).not.toHaveValue(paddyBefore);
  const lockInitialVerdict = caseDesk.getByRole('button', { name: 'Lock Initial Verdict' });
  await lockInitialVerdict.scrollIntoViewIfNeeded();
  await expect.poll(() => caseDesk.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(lockInitialVerdict).toBeVisible();
  await lockInitialVerdict.click();

  await expect(page.getByRole('heading', { name: 'Read the judgment in four steps' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Intuition rating 1' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Show the whole scroll' }).click();
  await expect(page.getByRole('button', { name: 'Accept Initial Verdict' })).toBeVisible();
  await page.getByRole('button', { name: 'Revise once' }).click();
  await expect(page.getByRole('heading', { name: '得其分 · Proportionality' })).toBeVisible();
  await expect(page.getByText(/Chen Shouye: own outcome/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lock Final Verdict' })).toBeVisible();
  await page.getByRole('button', { name: 'Increase Paddy fields share for Chen Shouye' }).click();
  await page.getByRole('button', { name: 'Lock Final Verdict' }).click();
  await expect(page.getByRole('heading', { name: 'Final Verdict' })).toBeVisible();
  await expect(page.getByText(/Game Over/i)).toHaveCount(0);
  expect(clientDiagnostics).toEqual([]);
});

test('keyboard controls can complete the first-act path without pointer input', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  async function activate(locator: Locator) {
    await locator.focus();
    await locator.press('Enter');
  }

  await activate(page.getByRole('button', { name: 'Begin campaign' }));
  await activate(page.getByRole('button', { name: 'Skip cutscene' }));
  await activate(page.getByRole('button', { name: 'Open the first case' }));
  await activate(page.getByRole('button', { name: 'Begin investigation' }));
  const people = page.locator('[aria-label="People in the case"]');
  for (const name of ['Chen Shouye', 'Chen Congzheng', 'Chen Elder']) {
    await activate(people.getByRole('button', { name: new RegExp(`^${name}`) }));
  }
  await activate(page.getByRole('button', { name: 'The original Yiwu ruling', exact: true }));
  await activate(page.getByRole('button', { name: 'Continue to allocation' }));
  await activate(page.getByRole('button', { name: 'Lock Initial Verdict' }));
  await activate(page.getByRole('button', { name: 'Show the whole scroll' }));
  await activate(page.getByRole('button', { name: 'Accept Initial Verdict' }));
  await expect(page.getByRole('heading', { name: 'Final Verdict' })).toBeVisible();
  await activate(page.getByRole('button', { name: 'Skip Master Challenge' }));
  await expect(page.getByRole('heading', { name: 'Act I record' })).toBeVisible();
});

test('the canonical path reaches Act III, challenge, Ledger, CS-09, and the National Ending', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await openFirstCaseAndCompleteInvestigation(page);
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Show the whole scroll' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await page.getByRole('heading', { name: 'Final Verdict' }).waitFor();
  await page.getByRole('button', { name: 'Skip Master Challenge' }).click();
  await expect(page.getByRole('heading', { name: 'Act I record' })).toBeVisible();
  await expect(page.getByText('Initial Verdict')).toBeVisible();
  await page.getByRole('button', { name: 'Close the Act I record' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await expect(page.getByRole('heading', { name: 'Five years later' })).toBeVisible();
  await page.getByRole('button', { name: 'Begin Act II · Hangzhou' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: /Act II: Winter/ })).toBeVisible();
  await page.getByRole('button', { name: 'Begin investigation' }).click();
  await page.getByRole('button', { name: 'The loom workshop model', exact: true }).click();
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Intuition rating 3' }).click();
  await page.getByRole('button', { name: 'Submit intuition rating' }).click();
  await page.getByRole('button', { name: 'Continue to the verdict choice' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Act II Master Challenge' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await page.getByRole('button', { name: 'Continue to the Act III boundary' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await completeActThree(page);
});

test('severe grievance route reaches CS-12 and survives completed re-entry', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/en/adventure');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await reachActThreeIntro(page);
  await completeActThree(page, [1, 0, 1, 2, 0, 0], 'cs-12');
  await expect(page.getByRole('heading', { name: 'The Grand Companion’s grievance' })).toBeVisible();
  await page.getByRole('button', { name: 'Complete epilogue' }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).campaign.phase)).toBe('completed');
  await page.reload();
  await page.getByRole('button', { name: 'Continue campaign' }).click();
  await expect(page.getByText('Epilogue complete', { exact: true })).toBeVisible();
});

test('zero-product route reaches CS-13 and keeps CS-13/14 locked in the archive until delivered', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/en/adventure');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await reachActThreeIntro(page);
  await completeActThree(page, [0, 0, 0, 0, 0, 0], 'cs-13', true);
  await expect(page.getByRole('heading', { name: 'Held in the palace' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Complete epilogue' })).toBeVisible();
  await page.getByRole('button', { name: 'Complete epilogue' }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).campaign.phase)).toBe('completed');
  await page.reload();
  await page.getByRole('button', { name: 'Continue campaign' }).click();
  await expect(page.getByText('Epilogue complete', { exact: true })).toBeVisible();
  await expect(page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).recall.watchedCutsceneSlots)).resolves.toEqual(expect.arrayContaining(['cs-13']));
});

test('all three Master Seals unlock CS-14 and persist through completion', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/en/adventure');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await openFirstCaseAndCompleteInvestigation(page);
  await page.getByRole('button', { name: 'Lock Initial Verdict' }).click();
  await page.getByRole('button', { name: 'Show the whole scroll' }).click();
  await page.getByRole('button', { name: 'Accept Initial Verdict' }).click();
  await expect(page.getByRole('heading', { name: 'Final Verdict' })).toBeVisible();

  await completeActOneMasterSeal(page);
  await continueToActThreeAfterActTwoMasterSeal(page);
  await completeActThree(page, [1, 2, 0, 1, 0, 2], 'cs-09', true, [1, 2, 1, 0, 0, 2], true);
  await expect(page.getByRole('heading', { name: 'Paper story scroll' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Three legs standing' })).toBeVisible();
  await expect(page.getByText('All three Master Seals held: the hidden ending is unlocked.')).toBeVisible();
  await expect(page.getByText('Things that can be divided can usually be arranged so that no one envies.')).toBeVisible();
  await page.getByRole('button', { name: 'Complete epilogue' }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).campaign.phase)).toBe('completed');

  await page.reload();
  await page.getByRole('button', { name: 'Continue campaign' }).click();
  await expect(page.getByText('Epilogue complete', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open pause menu' }).click();
  await page.getByRole('button', { name: 'Recall Archive' }).click();
  const archive = page.getByRole('heading', { name: 'Recall Archive' }).locator('..');
  await expect(archive.getByRole('listitem').filter({ hasText: 'cs-14' })).toBeVisible();
});

test('frontier challenge awards the Master Seal and survives completed re-entry', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  await reachFinalVerdict(page);
  await page.getByRole('button', { name: 'Cut, then let the younger brother choose' }).click();
  await page.getByRole('slider', { name: /Paddy fields:/ }).fill('10');
  await page.getByRole('slider', { name: /Oil-tea hills:/ }).fill('5');
  await page.getByRole('slider', { name: /Silver:/ }).fill('0');
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await expect(page.getByText('Master Seal awarded.')).toBeVisible();
  await page.getByRole('button', { name: 'Return to Performance Ledger' }).click();
  await expect(page.getByText('Earned')).toBeVisible();
  await page.getByRole('button', { name: 'Return to Master Challenge' }).click();
  await expect(page.getByRole('heading', { name: 'Cut, then let the younger brother choose' })).toBeVisible();
  await expect(page.getByText('Master Seal awarded.')).toBeVisible();
  await expect(page.getByText('Check edited allocation')).toBeVisible();
});

test('stage-three hint permanently disqualifies the Master Seal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  await reachFinalVerdict(page);
  await page.getByRole('button', { name: 'Cut, then let the younger brother choose' }).click();
  await page.getByRole('button', { name: 'View hint 3' }).click();
  await page.getByRole('slider', { name: /Paddy fields:/ }).fill('10');
  await page.getByRole('slider', { name: /Oil-tea hills:/ }).fill('5');
  await page.getByRole('slider', { name: /Silver:/ }).fill('0');
  await page.getByRole('button', { name: 'Check allocation' }).click();
  await expect(page.getByText('No Master Seal is awarded for this attempt.')).toBeVisible();
  await expect(page.getByText('You found the authored solution to this case.')).toBeVisible();
});

test('Recall Archive replay does not change the Ledger campaign record', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  await reachFinalVerdict(page);
  await page.getByRole('button', { name: 'Skip Master Challenge' }).click();
  await expect(page.getByRole('heading', { name: 'Act I record' })).toBeVisible();
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).campaign);
  await page.getByRole('button', { name: 'Open Recall Archive' }).click();
  const cs00 = page.getByRole('listitem').filter({ hasText: 'cs-00' });
  await cs00.getByRole('button', { name: 'Replay' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  const during = await page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).campaign);
  expect(during).toEqual(before);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Act I record' })).toBeVisible();
});

test('pause controls remain interactive while the underlying phase is inert', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Open pause menu' }).click();
  const pause = page.getByRole('dialog', { name: 'Campaign paused' });
  await expect(pause).toBeVisible();
  await pause.getByRole('checkbox', { name: 'Subtitles' }).click();
  await pause.getByRole('slider', { name: 'Volume' }).fill('0.4');
  await pause.getByRole('button', { name: 'Replay current cutscene' }).click();
  await expect(page.getByRole('heading', { name: /Paper story scroll/ })).toBeVisible();
  await page.getByRole('button', { name: 'Open pause menu' }).click();
  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(page.getByRole('heading', { name: 'Restart the campaign?' })).toBeVisible();
});

test('landscape journey can skip CS-00 and reach the v2 title', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();

  await expect(page.getByRole('heading', { name: 'The Art of Settled Shares' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open the first case' })).toBeVisible();
  await expect(page.getByText('EF1', { exact: true })).toHaveCount(0);
  await expect(page.getByText('EFX', { exact: true })).toHaveCount(0);
});

test('1440x900 and small-phone landscape keep critical controls inside the 16:9 stage', async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');

  const desktopStage = page.getByRole('main');
  await expectInside(page.getByRole('button', { name: 'Begin campaign' }), desktopStage);
  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await expectInside(page.getByRole('button', { name: 'Skip cutscene' }), desktopStage);

  const context = await browser.newContext({
    viewport: { width: 667, height: 375 },
    isMobile: true,
    hasTouch: true,
  });
  const phone = await context.newPage();
  await phone.goto('/en/adventure');
  await expect(phone.getByRole('dialog', { name: 'Rotate your phone' })).toHaveCount(0);
  await phone.getByRole('button', { name: 'Begin campaign' }).click();
  await expectInside(phone.getByRole('button', { name: 'Skip cutscene' }), phone.getByRole('main'));
  await expectInside(phone.getByLabel('Prologue: The Keeper of the Steelyard').first(), phone.getByRole('main'));
  await context.close();
});

test('portrait phone shows the rotate gate and cannot operate the underlying campaign', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/en/adventure');

  await expect(page.getByRole('dialog', { name: 'Rotate your phone' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Begin campaign' })).toHaveCount(0);
  await expect(page.locator('button', { hasText: 'Begin campaign' })).toBeHidden();

  await context.close();
});

test('rotating portrait and back preserves cutscene state without silently advancing', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('/en/adventure');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await expect(page.getByRole('button', { name: 'Skip cutscene' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('dialog', { name: 'Rotate your phone' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip cutscene' })).toHaveCount(0);

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('button', { name: 'Skip cutscene' })).toBeVisible();
  const phase = await page.evaluate(() => JSON.parse(localStorage.getItem('settled-shares-campaign-v2')!).campaign.phase);
  expect(phase).toBe('cutscene');
  await context.close();
});

test('reload retains Campaign v2 progress', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/en/adventure');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await expect(page.getByRole('heading', { name: 'The Art of Settled Shares' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Continue campaign' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue campaign' }).click();
  await expect(page.getByRole('button', { name: 'Open the first case' })).toBeVisible();
});

test('fullscreen rejection reports feedback without blocking play', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => {
    localStorage.clear();
    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      configurable: true,
      value: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')),
    });
  });
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Play fullscreen' }).click();
  await expect(page.getByRole('status')).toContainText('Fullscreen could not start');
  await expect(page.getByRole('button', { name: 'Begin campaign' })).toBeEnabled();
});

test('orientation-lock rejection keeps the in-stage rotate gate authoritative', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.clear();
    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      configurable: true,
      value: () => Promise.resolve(),
    });
    Object.defineProperty(screen, 'orientation', {
      configurable: true,
      value: { lock: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) },
    });
  });
  await page.goto('/en/adventure');

  await page.getByRole('button', { name: 'Play fullscreen' }).click();
  await expect(page.getByRole('status')).toContainText('Landscape lock was declined');
  await page.setViewportSize({ width: 390, height: 844 });
  const gate = page.getByRole('dialog', { name: 'Rotate your phone' });
  await expect(gate).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fullscreen active' })).toHaveCount(0);
  expect(await gate.evaluate((node) => Boolean(node.closest('[aria-label="The Art of Settled Shares game stage"]')))).toBe(true);
  await context.close();
});

test('media error can use the complete static fallback and still reach title', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  await page.getByRole('button', { name: 'Begin campaign' }).click();

  await page.locator('video').dispatchEvent('error');
  await expect(page.getByRole('heading', { name: 'The video could not be played' })).toBeVisible();
  await page.getByRole('button', { name: 'Read the story scroll' }).click();
  await expect(page.getByRole('heading', { name: 'Complete cutscene transcript' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'The Art of Settled Shares' })).toBeFocused();
});

test('locale navigation preserves v2 progress and settings', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('adventure-test-started')) {
      localStorage.clear();
      sessionStorage.setItem('adventure-test-started', 'yes');
    }
  });
  await page.goto('/en/adventure');
  await page.getByRole('button', { name: 'Begin campaign' }).click();
  await page.getByRole('button', { name: 'Skip cutscene' }).click();
  await page.getByRole('link', { name: '繁中' }).click();

  await expect(page).toHaveURL(/\/zh-TW\/adventure$/);
  await expect(page.getByRole('button', { name: '繼續篇章' })).toBeVisible();
  await page.getByRole('button', { name: '繼續篇章' }).click();
  await expect(page.getByRole('heading', { name: '定分止爭錄' })).toBeFocused();
});

test('campaign remains operable with 200 percent root text sizing', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/en/adventure');
  const start = page.getByRole('button', { name: 'Begin campaign' });
  await expect(start).toBeVisible();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });

  await expect(start).toBeVisible();
  await start.click();
  const skip = page.getByRole('button', { name: 'Skip cutscene' });
  await skip.scrollIntoViewIfNeeded();
  await expect(skip).toBeVisible();
  await skip.click();
  const openCase = page.getByRole('button', { name: 'Open the first case' });
  await openCase.scrollIntoViewIfNeeded();
  await expect(openCase).toBeVisible();
});
