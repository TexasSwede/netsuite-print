module.exports = {
  apps : [{
    script: 'src/print-server.js',
    watch: '.',
    max_memory_restart: '200M',
    env_dev: {
      NODE_ENV: 'dev',
      PORT: 3000,
    },
    env_dev: {
      NODE_ENV: 'prod',
      PORT: 443
    }
  }],
};
