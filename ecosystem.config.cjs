module.exports = {
  apps: [
    {
      name: 'abaya-app',
      script: 'src/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
