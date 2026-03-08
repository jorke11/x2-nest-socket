module.exports = {
  apps: [
    {
      name: 'x2-nest-socket',
      script: 'dist/main.js',
      // Si usas TypeScript directamente, cambia a: script: 'src/main.ts'
      // y agrega 'interpreter: "ts-node"' si tienes ts-node instalado
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
