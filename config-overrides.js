const path = require('path');

module.exports = function override(config, env) {
  // 添加路径别名解析
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@store': path.resolve(__dirname, 'src/store/index.ts'),
      '@assets': path.resolve(__dirname, 'src/assets')
    },
    extensions: [...(config.resolve.extensions || []), '.ts', '.tsx']
  };

  return config;
};
