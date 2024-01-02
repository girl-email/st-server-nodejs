import {Configuration, App} from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import {join} from 'path';
import {DefaultErrorFilter} from './filter/default.filter';
import {NotFoundFilter} from './filter/notfound.filter';
import {ReportMiddleware} from './middleware/report.middleware';
import {AuthMiddleware} from './middleware/auth.middleware';
// import { HttpProxyMiddleware } from './middleware/proxy.middleware';
import * as proxy from '@midwayjs/http-proxy';
// import * as socketio from '@midwayjs/socketio';
// import * as redis from '@midwayjs/redis';
// import * as typegoose from '@midwayjs/typegoose';
// import * as security from '@midwayjs/security';
// import cors from '@koa/cors';
import * as crossDomain from '@midwayjs/cross-domain';
import * as jwt from '@midwayjs/jwt';

import {JDMainService}  from './service/jd.service'

@Configuration({
    imports: [
        crossDomain,
        koa,
        validate,
        {
            component: info,
            enabledEnvironment: ['local'],
        },
        // socketio,
        // redis,
        // typegoose,
        // security,
        proxy,
        jwt

    ],
    importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
    @App()
    app: koa.Application;

    onReady() {
        // add middleware
        this.app.useMiddleware([ReportMiddleware, AuthMiddleware]);
        // this.app.useMiddleware([ReportMiddleware]);
        // add filter
        this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
        // new JDService()
        new JDMainService()
    }
}
