module.exports = {
  apps : [{
    script: 'src/print-server.mjs',
    watch: '.',
    max_memory_restart: '200M',
    env_dev: {
      NODE_ENV: 'dev',
      PORT: 3000,
    },
    env_prod: {
      NODE_ENV: 'prod',
      PORT: 443
    }
  }],
};
