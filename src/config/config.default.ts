import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1668416657483_2560',
  koa: {
    port: 7001,
  },

  httpProxy: {
    match: /\/api\//,
    host: 'http://daily-performance.sunmeta.top',
  },
} as MidwayConfig;
