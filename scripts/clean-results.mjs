import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

// Preserve generated reports/history; remove only raw results from the last execution.
rmSync(resolve(process.env.OUTPUT_DIR ?? '.', 'allure-results'), { recursive: true, force: true });
