import { validateEnvVariables } from '../src/config/env';

const result = validateEnvVariables();

if (!result.valid) {
  console.error(result.message ?? 'Invalid environment configuration.');
  process.exit(1);
}

console.log('Environment configuration is valid.');
