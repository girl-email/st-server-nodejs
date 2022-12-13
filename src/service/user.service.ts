import {Provide} from '@midwayjs/decorator';
import {Config} from "@midwayjs/core";
import {makeHttpRequest} from '@midwayjs/core';
import {InjectEntityModel} from "@midwayjs/typegoose";
import {User} from "../entity/user";
import {ReturnModelType} from "@typegoose/typegoose";

@Provide()
export class UserService {

    @Config('dingTalk')
    DingTalkConfig: any;

    @InjectEntityModel(User)
    UserModel: ReturnModelType<typeof User>;


    getAssessTokenByCode() {


    }

    /**
     * 根据授权回调的authCode获取用户信息
     * 钉钉文档地址 https://open.dingtalk.com/document/isvapp-server/obtain-user-token#topic-2042816
     */
    async userAccessToken(code) {
        const apiUrl = "https://api.dingtalk.com/v1.0/oauth2/userAccessToken";

        const result = await makeHttpRequest(apiUrl, {
            data:{
                clientId: this.DingTalkConfig.appKey,
                clientSecret: this.DingTalkConfig.appSecret,
                code: code,
                grantType: 'authorization_code'
            },
            dataType: 'json', // 返回的数据格式
            method: 'POST',
            contentType:'json',
        });

        return result.data
    }

    async getUserInfo(accessToken) {
        const apiUrl = "https://api.dingtalk.com/v1.0/contact/users/me";

        const result = await makeHttpRequest(apiUrl, {
            headers: {
              'x-acs-dingtalk-access-token': accessToken
            },
            dataType: 'json', // 返回的数据格式
            method: 'GET',
            contentType:'json',
        });

        return result.data
    }


    public dingTalkLogin() {
        const url = `https://login.dingtalk.com/oauth2/auth?redirect_uri=${this.DingTalkConfig.redirect_uri}&response_type=code&client_id=${this.DingTalkConfig.appKey}&scope=openid&state=dddd&prompt=consent`
        return url

    }


    public info() {
        return {}
    }

    /**
     *
     */
    wechatLogin() {
        const url = `https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect`
        return url
    }



    findUser(where) {
        return this.UserModel.findOne().where(where).exec();
    }



    saveUser(data) {
        return this.UserModel.create(data)
    }
}
