import { test as teardown } from '@playwright/test';
import fs from 'fs';
import { STORAGE_STATE } from '../utils/constants';

/** Runs after every project that depends on "setup" has finished. */
teardown('remove saved login session', async () => {
  fs.rmSync(STORAGE_STATE, { force: true });
});
