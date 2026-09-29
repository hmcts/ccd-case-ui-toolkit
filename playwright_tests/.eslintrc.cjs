module.exports = {
  extends: ['../.eslintrc.cjs'],
  parserOptions: {
    project: ['./tsconfig.json', './host/tsconfig.json'],
    tsconfigRootDir: __dirname
  }
};
