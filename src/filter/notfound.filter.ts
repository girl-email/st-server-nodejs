import { Catch } from '@midwayjs/decorator';
import { httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // // 404 错误会到这里
    // ctx.redirect('/404.html');
    // 或者直接返回一个内容
    return {
        code: 0,
        message: '404, ' + ctx.path
    }
  }
}
