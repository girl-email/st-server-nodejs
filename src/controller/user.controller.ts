import {Inject, Controller, Get, Query} from '@midwayjs/decorator';
import {Context} from '@midwayjs/koa';
import {UserService} from '../service/user.service';
import {AliYunService} from '../service/aliyun.service';

@Controller('/api/user')
export class APIController {
    @Inject()
    ctx: Context;

    @Inject()
    userService: UserService;

    @Inject()
    AliYunService: AliYunService;

    @Get('/list')
    async userList() {
        // const data = this.userService.info();
        const result = await this.userService.getUserList();

        return {success: true, message: 'OK', data: result};
    }

    @Get('/info')
    async userInfo() {
        // const data = this.userService.info();
        const data = this.ctx.cookies.get('st_user', {
            encrypt: true
        })
        return {success: true, message: 'OK', data: JSON.parse(data)};
    }

    @Get('/login')
    async getUser(@Query('uid') uid) {
        const url = this.userService.dingTalkLogin();
        this.ctx.redirect(url)
        // return {success: true, message: 'OK', data: url};
    }

    /**
     * 用户授权回调
     * @param authCode
     */
    @Get('/auth')
    async auth(@Query('authCode') authCode) {
        const result = await this.userService.userAccessToken(authCode);
        if (!result.accessToken) {
            return {success: false, message: '', data: result};
        }
        const userInfo = await this.userService.getUserInfo(result.accessToken)
        let user: any = await this.userService.findUser({openId: userInfo.openId})
        if (!user) {
            user = {
                openId: userInfo.openId,
                avatarUrl: userInfo.avatarUrl,
                userName: userInfo.nick,
                mobile: userInfo.mobile,
                createTime: new Date()
            }
            await this.userService.saveUser(user)
        }

        this.ctx.cookies.set('st_user', JSON.stringify(user), {
            // domain: 'localhost', // 写cookie所在的域名
            path: '/', // 写cookie所在的路径
            maxAge: 10 * 60 * 1000, // cookie有效时长
            // expires: new Date('2017-02-15'), // cookie失效时间
            httpOnly: true, // 是否只用于http请求中获取
            overwrite: false, // 是否允许重写
            encrypt: true, // 加密传输
        });

        this.ctx.redirect('/')
        // return {success: true, message: 'OK', data: {result, user}};
    }

}
