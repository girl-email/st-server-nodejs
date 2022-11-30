import {Inject, Controller, Get, Query} from '@midwayjs/decorator';
import {Context} from '@midwayjs/koa';
import {UserService} from '../service/user.service';
import {AliYunService} from '../service/aliyun.service';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  AliYunService: AliYunService;

  @Get('/get_user')
  async getUser(@Query('uid') uid) {
    const user = await this.userService.getUser({uid});
    return {success: true, message: 'OK', data: user};
  }

  @Get('/test')
  async getTest(@Query('uid') uid) {
    // @ts-ignore
    const {body: {credentials}} = await this.AliYunService.test();

    const url = `http://signin.aliyun.com/federation?Action=Login
      &LoginUrl=${encodeURIComponent('http://localhost:3000')}
      &Destination=${2}
      &SigninToken=${encodeURIComponent(credentials.securityToken)}`
    return {
      success: true, message: 'OK', data: {
        url,
        credentials,

      }
    };
  }
}
