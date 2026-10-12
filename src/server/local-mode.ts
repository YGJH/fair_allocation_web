export function isLocalDevelopment(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV === 'development' && !env.DATABASE_URL && !env.TEST_DATABASE_URL;
}
