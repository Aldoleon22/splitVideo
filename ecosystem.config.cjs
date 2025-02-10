module.exports = {
    apps: [
      {
        name: 'queue-worker',
        script: 'npm',
        args: 'run queue-worker',
        env: {
          NODE_ENV: 'production',
        },
      }
    ],
};
/*
{
  name: 'video-worker',
  script: './workers/queue-worker.js',
  cwd: '/var/www/vhosts/yopyo.com/split-video-pro.yopyo.com',
  env: {
    NODE_ENV: 'production'
  }
}
*/
  
  