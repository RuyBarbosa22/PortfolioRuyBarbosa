module.exports = {
  apps: [
    {
      name: 'portfolio-backend',
      cwd: '/var/www/html/PortfolioRuyBarbosa/backend/server',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/portfolio-backend-error.log',
      out_file: '/var/log/pm2/portfolio-backend-out.log',
      log_file: '/var/log/pm2/portfolio-backend-combined.log',
      time: true,
      merge_logs: true
    },
    {
      name: 'portfolio-frontend',
      cwd: '/var/www/html/PortfolioRuyBarbosa/frontend',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/pm2/portfolio-frontend-error.log',
      out_file: '/var/log/pm2/portfolio-frontend-out.log',
      log_file: '/var/log/pm2/portfolio-frontend-combined.log',
      time: true,
      merge_logs: true
    }
  ]
};
