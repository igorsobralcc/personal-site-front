export default {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write', 'vitest related --run'],
  '*.{css,html,json,md,yaml,yml}': 'prettier --write',
}
