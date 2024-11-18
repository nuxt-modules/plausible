import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import perfectionist from 'eslint-plugin-perfectionist'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: true,
  },
  dirs: {
    src: ['./playground'],
  },
})
  // Workaround for https://github.com/eslint/eslint/issues/19134
  .append({
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  })
  .append({
    plugins: {
      perfectionist,
    },
    rules: {
      'import/order': 'off',
      'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-imports': ['error', {
        groups: [
          'type',
          ['parent-type', 'sibling-type', 'index-type'],
          'builtin',
          'external',
          ['internal', 'internal-type'],
          ['parent', 'sibling', 'index'],
          'side-effect',
          'object',
          'unknown',
        ],
        newlinesBetween: 'ignore',
        order: 'asc',
        type: 'natural',
      }],
      'perfectionist/sort-named-exports': ['error', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-named-imports': ['error', { order: 'asc', type: 'natural' }],
    },
  })
