import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'src/app/[locale]/**',
        'src/app/not-found.tsx',
        'src/app/providers.tsx',
        'src/components/server/**',
        'src/proxy.ts',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/setupTests.{js,ts}',
        'src/**/*.d.ts',
      ],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      provider: 'v8',
      thresholds: {
        statements: 80,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
