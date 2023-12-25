import {IMiddleware} from '@midwayjs/core';
import {Middleware} from '@midwayjs/decorator';
import {Context, NextFunction} from '@midwayjs/koa';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
    ignore(ctx: Context): boolean {
        // 下面的路由将忽略此中间件
        return ctx.path === '/api/user/auth'
            || ctx.path === '/api/user/login'
            || ctx.path === '/api/user/loginAccount'
            || ctx.path === '/api'
            || ctx.path === '/';
    }
    resolve() {
        return async (ctx: Context, next: NextFunction) => {
            // const data = ctx.cookies.get('st_user', {
            //     encrypt: true
            // })

            // if (!data) {
            //     return {code: 401, success: false,  message: '未登陆'};
            // }
            //
            // ctx.user = JSON.parse(data)
            // 返回给上一个中间件的结果
            return await next();
        };
    }

    static getName(): string {
        return 'auth';
    }
}
