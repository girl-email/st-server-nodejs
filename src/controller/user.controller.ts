import {Inject, Controller, Get, Query, Post} from '@midwayjs/decorator';
import {Context} from '@midwayjs/koa';
import {UserService} from '../service/user.service';
import {AliYunService} from '../service/aliyun.service';
import BaseController from "../core/baseController";
import {Body} from "@midwayjs/core";

/**
 * 闪调用户控制器
 */
@Controller('/api/user')
export class UserController extends BaseController {
    @Inject()
    ctx: Context;

    @Inject()
    userService: UserService;

    @Inject()
    AliYunService: AliYunService;

    /**
     * 用户列表
     */
    @Get('/list')
    async userList() {
        const result = await this.userService.getUserList();
        return this.success(result)
    }

    /**
     * 当前用户信息
     */
    @Get('/info')
    async userInfo() {
        const data = this.ctx.cookies.get('st_user', {
            encrypt: true
        })
        return {success: true, message: 'OK', code: 1, data: JSON.parse(data)};
    }

    /**
     * 用户登陆
     * @description 当前仅限钉钉登陆
     */
    @Get('/login')
    async getUser() {
        const url = this.userService.dingTalkLogin();
        this.ctx.redirect(url)
    }

    /**
     * 登出
     */
    @Post('/logOut')
    async logOut() {
        this.ctx.cookies.set('st_user', null);
        return this.success()
    }

    /**
     * 用户登陆
     * @description
     */
    @Post('/loginAccount')
    async loginAccount(@Body() body) {
        const user = await this.userService.loginAccount(body);
        if (!user) {
            return this.fail(0, '账号或密码错误')
        }
        this.ctx.cookies.set('st_user', JSON.stringify(user), {
            path: '/', // 写cookie所在的路径
            maxAge: 60 * 60 * 1000, // cookie有效时长
            // expires: new Date('2017-02-15'), // cookie失效时间
            httpOnly: true, // 是否只用于http请求中获取
            overwrite: false, // 是否允许重写
            encrypt: true, // 加密传输
        });

        return this.success(user)
    }

    /**
     * 用户授权回调
     * @param authCode
     */
    @Get('/auth')
    async auth(@Query('authCode') authCode) {
        const result: any = await this.userService.userAccessToken(authCode);
        if (!result.accessToken) {
            return this.fail()
        }
        const userInfo: any = await this.userService.getUserInfo(result.accessToken)
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
            path: '/', // 写cookie所在的路径
            maxAge: 12 * 60 * 60 * 1000, // cookie有效时长
            // expires: new Date('2017-02-15'), // cookie失效时间
            httpOnly: true, // 是否只用于http请求中获取
            overwrite: false, // 是否允许重写
            encrypt: true, // 加密传输
        });

        this.ctx.redirect('/')
    }
}
