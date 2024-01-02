import {MidwayConfig} from '@midwayjs/core';
import { Console } from '../entity/console';
import {AppKey} from "../entity/appKey";
import {User} from "../entity/user";
import {Project} from "../entity/project";

export default {
    // use for cookie sign key, should change to your own and keep security
    keys: '1668416657483_2560',
    koa: {
        port: 7001,
    },

    httpProxy: {
        match: /\/popRecording\//,
        host: 'https://shop-hk.jd.com',
    },

    redis: {
        client: {
            port: 6379, // Redis port
            host: "127.0.0.1", // Redis host
            password: "",
            db: 0,
        },
    },

    socketIO: {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    },

    mongoose: {
        dataSource: {
            default: {
                uri: 'mongodb+srv://1751170889:199901zb@cluster0.ylehkz8.mongodb.net/?retryWrites=true&w=majority',
                options: {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    user: '',
                    pass: ''
                },
                // 关联实体
                entities: [ Console, AppKey, User, Project ]
            }
        }
    },

    dingTalk: {
        appKey: 'dingzhpule0quaxn8iak',
        appSecret: 'I6J6n7eg5Iq56kcR0r1CZ6KEAUR9V6zHVeN_Gzbd8VUGiUx3EeaFPgYjaZSS4ytz',
        redirect_uri: 'http://st.mawenqing.net/api/user/auth'
    },

    // 默认配置
    security: {
        csrf: {
            enable: false,
            type: 'ctoken',
            useSession: true,
            cookieName: 'csrfToken',
            sessionName: 'csrfToken',
            headerName: 'x-csrf-token',
            bodyName: '_csrf',
            queryName: '_csrf',
            refererWhiteList: [],
        },
        xframe: {
            enable: true,
            value: 'SAMEORIGIN',
        },
        csp: {
            enable: false,
        },
        hsts: {
            enable: false,
            maxAge: 365 * 24 * 3600,
            includeSubdomains: false,
        },
        noopen: {
            enable: false,
        },
        nosniff: {
            enable: false,
        },
        xssProtection: {
            enable: true,
            value: '1; mode=block',
        },
    },

    cors: {
        credentials: true,
        // origin: 'https://porder.shop.jd.com',
    },
    jwt: {
        secret: 'xxxxxxxxx22222111xxxxx', // fs.readFileSync('xxxxx.key')
        sign: {
            // signOptions
            expiresIn: '100d', // https://github.com/vercel/ms
        },
        verify: {
            // verifyOptions
        },
        decode: {
            // decodeOptions
        }
    }
} as MidwayConfig;
