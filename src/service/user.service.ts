import {Provide} from '@midwayjs/decorator';
import {IUserOptions} from '../interface';

@Provide()
export class UserService {




    getAssessTokenByCode() {




    }




    /**
     *
     */
    wechatLogin()  {
        const url =  `https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect`
        return url
    }


    async getUser(options: IUserOptions) {
        return {
            uid: options.uid,
            username: 'mockedName',
            phone: '12345678901',
            email: 'xxx.xxx@xxx.com',
        };
    }
}
