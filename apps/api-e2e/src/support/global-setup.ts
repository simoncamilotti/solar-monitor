import { killPort, waitForPortOpen } from '@nx/node/utils';

const apiPort = (): number => (process.env.PORT ? Number(process.env.PORT) : 3000);

export async function setup(): Promise<void> {
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  await waitForPortOpen(apiPort(), { host });
}

export async function teardown(): Promise<void> {
  await killPort(apiPort());
  console.log('\nTearing down...\n');
}
