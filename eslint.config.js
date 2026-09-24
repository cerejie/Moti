import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Files written by `npx shadcn@latest add`. They are never hand-edited so the
// registry can regenerate them, so they are linted loosely rather than fixed.
const GENERATED = [
  'src/components/ui/**/*.{ts,tsx}',
  'src/hook/use-mobile.ts',
]

// shadcn is on the aria-vega style: every component is built on React Aria.
// The other bases, and the libraries their components wrap, are banned in the
// generated layer too, so a registry item that pulls one in fails lint.
const ARIA_ONLY = 'The shadcn base is React Aria (aria-vega); compose from react-aria-components.'
const RETIRED_BASES = [
  { name: 'radix-ui', message: ARIA_ONLY },
  { name: '@base-ui/react', message: ARIA_ONLY },
  { name: 'vaul', message: 'Phone modals are the aria sheet with side="bottom" (see AppModal).' },
  { name: 'cmdk', message: 'The aria command and combobox are built on react-aria-components.' },
  { name: 'react-day-picker', message: 'The aria calendar is built on react-aria-components.' },
]
const RETIRED_BASE_PATTERNS = [{ group: ['@radix-ui/*', '@base-ui/react/*'], message: ARIA_ONLY }]

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', '.history', 'graphify-out']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Architecture guardrails (CLAUDE.md: folder law and state rules).
    files: ['src/**/*.{ts,tsx}'],
    ignores: GENERATED,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: RETIRED_BASES,
          patterns: [
            {
              group: ['@/components/ui/*'],
              message:
                'Import the app primitive from src/components/common/ instead. Only src/components/common/ may reach into the generated shadcn layer.',
            },
            ...RETIRED_BASE_PATTERNS,
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='useState']",
          message: 'State belongs in a zustand store under src/store/.',
        },
        {
          selector: "CallExpression[callee.name='useReducer']",
          message: 'State belongs in a zustand store under src/store/.',
        },
      ],
    },
  },
  {
    // src/components/common/ is the only layer allowed to compose the generated
    // shadcn primitives directly. The non-aria bases stay banned there too.
    files: ['src/components/common/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: RETIRED_BASES, patterns: RETIRED_BASE_PATTERNS },
      ],
    },
  },
  {
    files: GENERATED,
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: RETIRED_BASES, patterns: RETIRED_BASE_PATTERNS },
      ],
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
])
