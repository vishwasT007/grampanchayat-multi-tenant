import { normalizeFirebaseHostingSubdomainToTenantId } from '../src/utils/tenant.js';

const cases = [
  // plain
  ['pindkeparlodha', 'pindkeparlodha'],

  // gpmulti marker
  ['pindkeparlodha-gpmulti', 'pindkeparlodha'],
  ['pindkepar-lodha-gpmulti', 'pindkepar-lodha'],

  // gpmulti marker + suffix
  ['pindkeparlodha-gpmulti-y757r4', 'pindkeparlodha'],
  ['pindkepar-lodha-gpmulti-y757r4', 'pindkepar-lodha'],

  // weird trailing dashes
  ['pindkepar-lodha-gpmulti-', 'pindkepar-lodha'],
];

let failed = 0;
for (const [input, expected] of cases) {
  const actual = normalizeFirebaseHostingSubdomainToTenantId(input);
  const ok = actual === expected;
  if (!ok) failed++;
  // eslint-disable-next-line no-console
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${input} -> ${actual} (expected ${expected})`);
}

if (failed) {
  // eslint-disable-next-line no-console
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log('\nAll tenant parsing tests passed.');
