import { Configuration, App } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { HttpProxyMiddleware } from './middleware/proxy.middleware';
// import * as proxy from '@midwayjs/http-proxy';
import * as socketio from '@midwayjs/socketio';
import * as redis from '@midwayjs/redis';
import * as typegoose from '@midwayjs/typegoose';

@Configuration({
  imports: [
    koa,
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    socketio,
      redis,
      typegoose
    // proxy
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  onReady() {
    // add middleware
    this.app.useMiddleware([HttpProxyMiddleware, ReportMiddleware]);
    // this.app.useMiddleware([ReportMiddleware]);
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
