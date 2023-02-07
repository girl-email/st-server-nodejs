import {Inject} from '@midwayjs/decorator';
import {Context} from '@midwayjs/koa';

export default class BaseController {
    @Inject()
    ctx: Context;

    /**
     * 成功的返回
     */
    success(data={}, message = '') {
       return {
           code: 1,
           success: true,
           data,
           message,
           timeStamp: new Date().getTime()
       }
    }

    /**
     * 失败的返回
     */
    fail(code=0, message = '') {
        return {
            code,
            success: false,
            data: {},
            message,
            timeStamp: new Date().getTime()
        }
    }
}
