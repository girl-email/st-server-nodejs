import {MidwayConfig} from '@midwayjs/core';
import { Console } from '../entity/console';
import {AppKey} from "../entity/appKey";

export default {
    // use for cookie sign key, should change to your own and keep security
    keys: '1668416657483_2560',
    koa: {
        port: 7001,
    },

    httpProxy: {
        match: /\/api\//,
        host: 'http://daily-performance.sunmeta.top',
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
                uri: 'mongodb://localhost:27017/st',
                options: {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    user: '',
                    pass: ''
                },
                // 关联实体
                entities: [ Console, AppKey ]
            }
        }
    },
} as MidwayConfig;
