import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import legacyConfig from './.eslintrc.cjs';

const baseDirectory = fileURLToPath(new URL('.', import.meta.url));
const compat = new FlatCompat({
  baseDirectory,
  recommendedConfig: js.configs.recommended
});
const rules = Object.fromEntries(
  Object.entries(legacyConfig.rules).map(([ruleName, options]) => [
    Object.hasOwn(stylistic.rules, ruleName) ? `@stylistic/${ruleName}` : ruleName,
    options
  ])
);

export default [
  { ignores: ['**/node_modules/**', 'dist/**', 'tmp/**', 'coverage/**'] },
  ...compat.config({ ...legacyConfig, rules }).map((config) => ({
    ...config,
    files: config.files ?? ['**/*.ts']
  })),
  {
    files: ['**/*.ts'],
    plugins: { '@stylistic': stylistic }
  },
  {
    files: ['playwright_tests/**/*.ts', 'packaged-consumer/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './host/tsconfig.json'],
        tsconfigRootDir: fileURLToPath(new URL('./playwright_tests/', import.meta.url))
      }
    }
  }
];