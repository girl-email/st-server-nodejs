import {IMiddleware} from '@midwayjs/core';
import {Middleware, Inject} from '@midwayjs/decorator';
import {Context, NextFunction} from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
    @Inject()
    jwtService: JwtService;

    ignore(ctx: Context): boolean {
        // 下面的路由将忽略此中间件
        return ctx.path === '/api/user/auth'
            || ctx.path === '/api/user/login'
            || ctx.path === '/login'
            || ctx.path === '/loginAccount'
            || ctx.path === '/api'
            || ctx.path === '/';
    }
    resolve() {
        return async (ctx: Context, next: NextFunction) => {
            const token = ctx.headers['token'] || ''
            try {
                //jwt.verify方法验证token是否有效
                if (typeof token === "string") {
                    const res = await this.jwtService.verify(token, {
                        complete: true,
                    });
                    console.log(res)
                    return await next();
                }
            } catch (error) {
                return {code: 401, success: false,  message: '未登陆'};
            }
            // 返回给上一个中间件的结果
            return await next();
        };
    }

    static getName(): string {
        return 'auth';
    }
}
