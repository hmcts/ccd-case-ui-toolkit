module.exports = {
  "stories": [
    "../projects/ccd-case-ui-toolkit/src/**/*.stories.mdx",
    "../projects/ccd-case-ui-toolkit/src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/preset-scss'
  ],
  "framework": "@storybook/angular"
}