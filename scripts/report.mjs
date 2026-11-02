import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(process.env.OUTPUT_DIR ?? '.');
const results = resolve(root, 'allure-results');
const previous = resolve(process.env.HISTORY_DIR ?? '.tmp/previous-report', 'history');
if (!existsSync(results) || !readdirSync(results).some(name => name.endsWith('-result.json'))) {
  throw new Error(`No Allure test results found in ${results}; refusing to generate an empty report.`);
}
if (process.env.HISTORY_DIR && !existsSync(previous)) {
  throw new Error(`Requested Allure history does not exist: ${previous}`);
}
if (existsSync(previous)) {
  for (const file of ['history.json', 'history-trend.json']) {
    JSON.parse(readFileSync(resolve(previous, file), 'utf8'));
  }
  cpSync(previous, resolve(results, 'history'), { recursive: true });
}
if (process.env.GITHUB_RUN_ID) {
  writeFileSync(resolve(results, 'executor.json'), JSON.stringify({
    name: 'GitHub Actions', type: 'github',
    buildOrder: Number(process.env.GITHUB_RUN_NUMBER),
    buildName: `Run ${process.env.GITHUB_RUN_NUMBER}`,
    buildUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
  }));
}
const cli = resolve('node_modules/allure-commandline/bin/allure');
const generated = spawnSync(process.execPath, [cli, 'generate', results, '--clean', '-o', resolve(root, 'allure-report')], {
  stdio: 'inherit',
});
if (generated.error) throw generated.error;
process.exit(generated.status ?? 1);
