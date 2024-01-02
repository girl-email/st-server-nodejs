import {Controller, Get, Post, Body, Inject, Config } from '@midwayjs/decorator';
import fetch from 'node-fetch'
import {Context} from "@midwayjs/koa";
// import fs from 'fs'
const fs = require('fs')
import { JwtService } from '@midwayjs/jwt';

@Controller('/')
export class HomeController {

    @Inject()
    ctx: Context;

    @Inject()
    jwtService: JwtService;

    @Config('jwt')
    jwtConfig;

    @Get('/')
    async home(): Promise<any> {
        const res = await fetch("https://porder.shop.jd.com/order/orderlist", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                "content-type": "application/json;charset=UTF-8",
                "pragma": "no-cache",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"macOS\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "sgm-context": "143508131414601060;143508131414601060",
              "cookie": "shshshfpa=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; shshshfpx=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; __jdu=1700109613209731139267; __jdv=76161171|direct|-|none|-|1703342303715; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; thor=6901B38FCABE2222F893FE4DA6A41AD2B7B0C890E50CD438CE70BC24E947BA5C74C62E09C0A0D0A20A7CCFE5D0A04A5D6A305B0189BF1DB012876E697BD7A9F1C25C33FB5C7D8232F7C988F93B071792F075969C4EB68244AC3D47514DB51535261E0DC5F6E20CE450E59D18E6E7A983493D50B5BE48D3413E1D73BC53BE64D061B8505DFCE5AC4C8A3CFD0D336BA931; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; pinId=Mk_A6Nbv7MenkDneLmJDcA; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; flash=2_ahn-HIMjFzg6gJaPiIiDr7fYvR5BkPzay-flyLklbZnw23kGkAPsX7sE7Bl-ZBivLG6zF5Hun6RMc6AtT6OQS5YudZiSpzZ7XNou97izdho*; ceshi3.com=000; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; TrackID=1eJakqOiiu7wAcmYygNZHWjPKiJPhQBiCiXDaFs6kzXOX_UMTTN1hvfe6V2MBgjxq; _vender_=TNK3O6PALVQGGMI642LJKJZPNN56IZEONGC7GL4VVDUXDFCCPPZQLPMTKJILMAPLG3OYXDZPC55WIFM2KMZTU5JUJAALDGQXK7G2A7QXSDNOYW6CAGCLDWEQCPKGC3KUGVRB646PDVLYUQI3BDJ566XYIWJK3BINEVNTZU4XPHS7MGPM3IRXP3KQCYUEFTMPHRWL6CUN7T6NJ73NKFWGRSQYITLV2HHO3WE5JGLOWXRT3TAPTQSGGNICGAJHKSRTNTSC54R6Q4CXGZB2XWZYYTWTKUI23OXFVXEK3PE6BHKXEXJ5ZBTE7AQ4DRO7SJ75N23E6IGHEDQCT72I5345J2I36SSU434I7P6CY7EB2AEQ7LYOCV7OPGUYC4YKELPF3MGRB5OZSQZPV5DBDCN2OVVT3WHFGAZIBXIZMBNTMAJCDBGXFURZJPHE5NZCGUSHOQQABJRWYI677CRIWDHHMRN4KSSUAJ753HZ5CVXRYBWLGGM5JRGBV4QYIYJWSBRWA7733MGAENNJ56QAMOWNZE6ZSSTAQTFHU37QBUJYDBEKWJYAA5WPGV6SWRTDLSI5CHEPVDR4UNBRRZSCXOYZJO7ATLK7RGPS5HRFAM5S7HXKTKG6NOB34BWWETDIYHXWWFHTO6LEZBXPNS3VOFOJJX767T7ELKOY4J5X326W5OSLBNGLDSIVWKEXWCXDLZI5OWDAMBXZDZNIDXXBMRK4DRDPSI; smb_track=68FA65B2AC0940C580281397D309CBF3; user-key=8d21ce0f-8695-4c7e-835e-a2fc50c50830; cn=0; language=zh_CN; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMTJL3GFYAAAAADNLQB5PBUZY27AX; shshshfpb=AAjDfXpqMEpILfXnDP1RQdOco4vsSWBcDNClSQQAAAAA; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFIC5X344XUJBUBS5J6KAZYTGZIKEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; _vender_new_=GI63BGTJFDBQ5VFYRAGXDIUTOUGBH4IELSA4HBAE7MB4S5HIL5QMHN2LMW7LKWD43YCKHJGXPJWTPRAEQ2QTFLJHKJUFHCXGGYIHCD7WSWY4PLU54NT3HGWB4MCDSKE4VJSCWBCJJ3C6Z2VI46TWP7ZJBWNTMPWIQ77NXK4VVKW6ABLW3LCTHZEYXQSC5L6SULQYZLAOLYQIKX2KPA4NEI5RHY4F2FAXI5CPTHP6BXFL757MRIFGERH2CQC2D3RAAFDYIVNI7B7NTLXWX5NEUT7IONYJQA2GVEUHKGHLAXO2JD6UI7C57LRQ4MAILLWECXYYZ2YLJ5HVL6HMAVKWPNRUQV7VQ4TJYKV2GUTU5DWKSDB7W444DPEJRVB364R67DONKSVFDJCTM5HI5SUQYP5XHHA3ZCMNIO7XEPTYCCF5H6RHZCCNDAPJ5WDJVY2XHWD7VVNICVT7PTKMSBW33L3BBSATV65XAXG72Z3QJ45MXA6IP2XQELXE7F47VC57UTM3EBWFRS7SWZCFQ5TPOT46JIQ6PNSYVA4453VSW4EAUWK6FRG3WAOQPSHG6BYFS7IG5ZCONS7EQAHSIUWPVDMBEDVBVCXW7ZSOG2U73QD4GGSJJ64QEOMY6A6GSGUVK26KEK5Y6RTC5PCHZK7X7DAB6Y; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BSEUEKS5OQFMIUO4A5L3SXBWWPFY; __jda=191429163.1700109613209731139267.1700109613.1703385126.1703396104.8; __jdc=191429163; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU; __jdb=191429163.32.1700109613209731139267|8.1703396104",
              "Referer": "https://porder.shop.jd.com/order/orderlist/suspend?t=1703397702927",
              "Referrer-Policy": "strict-origin-when-cross-origin"
          },
          "body": "{\"current\":1,\"pageSize\":10,\"selectedTabName\":\"suspend\",\"sortName\":\"desc\"}",
          "method": "POST"
      }).then(d => d.json());

      return  res
  }

    @Get('/getInfo')
    async 22(): Promise<any> {
        return  {
            code: 1
        }
    }

  @Post('/saveCookies')
  async save(@Body() body) {
      const stringData = fs.readFileSync('data.json', 'utf-8');
      const data = JSON.parse(stringData);
      if (body.thread) {
          fs.writeFileSync('data.json', JSON.stringify({
              ...data,
              [body.thread]: {
                  cookies: body.cookies,
                  time: Date.now()
              }
          }))
          return body
      } else {
          const len = Object.keys(data).length + 1
          return {
              thread: len
          }
      }
  }

    /**
     * 用户登陆
     * @description
     */
    @Post('/loginAccount')
    async loginAccount(@Body() body) {
        if(body.account && body.pwd) {
            if (body.account === 'jd' && body.pwd === 'encrypt&&#19#@!.') {
                const stringData = fs.readFileSync('data.json', 'utf-8');
                const data = JSON.parse(stringData);
                const kArr = Object.keys(data);
                if (kArr.length) {
                    const newK = kArr[kArr.length - 1] + 1
                    const token = await this.jwtService.sign({
                        thread: newK,
                        time:  Date.now()
                    });
                    return {
                        code: 1,
                        data: {
                            token: token,
                            thread: newK
                        }
                    }
                }
            }
            return {
                code: 0,
                data: [],
                message: "用户名或密码错误"
            }
        } else {
            return {
                code: 0,
                data: [],
                message: "用户名或密码错误"
            }
        }
    }
}
