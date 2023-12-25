// import {Provide} from '@midwayjs/decorator';
// const crypto = require('crypto');
// import { HttpsProxyAgent } from "https-proxy-agent";
// import { Telegraf } from 'telegraf';
// import { message } from 'telegraf/filters';
// // @ts-ignore
// import Youdao from '@opentranslate/youdao'
// // import {makeHttpRequest} from "@midwayjs/core";
// // @ts-ignore
// const Youdao = require('youdao-fanyi');
// @Provide()
// export class TelegramService {
//     // Telegram key
//     private token: string = '6528997410:AAGJ6zVoAx_LdjBlMF5ZofTnN3TM-13punc'
//     // 有道 appid
//     private YOU_DAO_APP_KEY: string = '072f0aceb09ad0a9'
//     // 有道api key
//     private YOU_DAO_KEY: string = 'vGPOiCwtLyTnBOi3HMHwRRlQXco7eXSd'
//
//     private bot = null
//
//     constructor() {
//         // 代理
//         // @ts-ignore
//         const agent = new HttpsProxyAgent({
//             "host": '127.0.0.1',
//             "port": '1087',
//         });
//
//         this.bot = new Telegraf(this.token, { telegram: { agent } });
//
//         // 监听文本消息
//         this.bot.on(message('text'), async (ctx) => {
//             // 收到的文本
//             const receiveText: string = ctx.update.message.text;
//             // 翻译文本
//             const text: string = await this.translate(receiveText)
//             // Explicit usage
//             await ctx.telegram.sendMessage(ctx.message.chat.id, `${text}`);
//             console.log(receiveText, text)
//             // await ctx.reply(`Hello ${text}`);
//         });
//         // 启动
//         this.bot.launch();
//     }
//
//
//     /**
//      * 有道翻译
//      * @param text
//      */
//     async translate(text = '测试'): Promise<string> {
//         const fanyi = Youdao({
//             secret: 'vGPOiCwtLyTnBOi3HMHwRRlQXco7eXSd',
//             appkey: '072f0aceb09ad0a9',
//         });
//         const output = await fanyi(text, { to: 'en' });
//         return output.translation[0]
//         // const apiUrl = "https://openapi.youdao.com/api";
//         // const salt = new Date().getTime() + 2;
//         // const curTime = Math.round(new Date().getTime() / 1000);
//         // const sign = this.getSign(text, salt, curTime)
//         // console.log(sign)
//         // const result = await makeHttpRequest(apiUrl, {
//         //     headers: {
//         //         'Content-Type': 'application/x-www-form-urlencoded'
//         //     },
//         //     dataType: 'json', // 返回的数据格式
//         //     method: 'POST',
//         //     contentType: 'text',
//         //     data: {
//         //         q: text,
//         //         appKey: this.YOU_DAO_APP_KEY,
//         //         salt: salt,
//         //         from: 'zh-CHS',
//         //         to: 'en',
//         //         sign: sign,
//         //         signType: "v3",
//         //         curtime: curTime,
//         //     }
//         // });
//         // console.log(result.data)
//         // return result
//     }
//
//     // 生成签名
//     getSign(text, salt, curTime): string {
//         const str = this.YOU_DAO_APP_KEY + this.truncate(text)+ salt + curTime + this.YOU_DAO_KEY;
//         const sha256 = crypto.createHash('sha256');
//         const sign = sha256.update(str).digest('hex');
//         return sign
//     }
//
//     truncate(q: string): string {
//         const len = q.length;
//         if (len <= 20) return q;
//         return q.substring(0, 10) + len + q.substring(len - 10, len);
//     }
//
// }
