export default () => ({
  port: parseInt(process.env.PORT ?? '3002', 10),
  jwtSecret: process.env.JWT_SECRET ?? '',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'x2',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
  },
});
