import {Inject} from '@midwayjs/decorator';
import {Context} from '@midwayjs/koa';

export default class BaseController {
    @Inject()
    ctx: Context;

    /**
     *
     */
    success(data={}, message = '') {
       return {
           success: true,
           data,
           message
       }
    }
}
