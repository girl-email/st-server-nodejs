// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {App, Inject} from '@midwayjs/decorator';
import { Provide} from '@midwayjs/core';
// import { ILogger } from '@midwayjs/logger';
const rp = require('request-promise');
const schedule = require('node-schedule');
// @ts-ignore
import Youdao from '@opentranslate/youdao'
// @ts-ignore
const Youdao = require('youdao-fanyi');
import nfetch from 'node-fetch'
import * as koa from "@midwayjs/koa";
const fs = require('fs')
import { MidwayLoggerService } from '@midwayjs/core';
const dayjs = require('dayjs')
import security from '../utils/security'

function  fetch(url, options, timeout = 60000) {
    return Promise.race([
        nfetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        )
    ]);
}


let onLineNotifyFn = null;

@Provide()
export class JDService {
    constructor(cookies) {
        // this.JDCookies = cookies
        setTimeout(() => {
            this.init()
        }, 2000)

        setInterval(() => {
            this.getShopInfo()
        }, 60000)
    }
    @Inject()
    loggerService: MidwayLoggerService;

    @App()
    app: koa.Application;
    // @Logger()
    // logger: ILogger;
    thread = null

    shopInfo = {}

    jdlLogin = false
    
    // 缓存的配送信息
    cachedDeliveryInfo = null

    lastErrorNotifyTime: number

    fistErrorTime: number

    die = false

    private errorNotifyUrl = 'https://open.feishu.cn/open-apis/bot/v2/hook/79e4aded-fdf2-411c-ac25-0156e975a072'

    logger = {
        info: function (...args) {
            console.log( dayjs().format('YYYY-MM-DD HH:mm:ss'),'-', ...args)
        }
    }
    // JD用户登录凭证
    JDCookies = ""
    JDLCookies = ""
    // public JDCookies  =  "1language=zh_CN; __jdv=56585130|direct|-|none|-|1703600265575; pinId=Mk_A6Nbv7MenkDneLmJDcA; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; ceshi3.com=000; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; __jdu=17036002655721718781778; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; flash=2_gIf-6hV0n-3D-owJHuVRpoG10QbYhFqtf8iq_PAPhP_zARQSoNehkDTUKX2bRosNurZi5lwdeYPjJ6lyjjCj6DfYmyPcMhCrz4uSJ8Kexsq*; TrackID=1ZSq5cEcVwiknpIRBT-fNmlAXfS_Vw6wS43RS8OYzM1HL5lsU9ffdVyq7YqBUIo-a; thor=6901B38FCABE2222F893FE4DA6A41AD2E3C483C9683B39E7396B71698DCB11C14EC8CD85133AC917234988D59EE06B23F7FEF3328DD8ADAFC4EAB61C5186AE21E4701CF1263EB28EDD024710F49B0ECD72FD38E9917280EDE8E802A8F5CDEC75B3A323ADC1B43DFB4FB87AB43993FE1C74AFBCBF673834D99FD3094B90C3789565784C8BCE4E664302CF9229EC53115B; _vender_=TNK3O6PALVQGGMI642LJKJZPNN56IZEONGC7GL4VVDUXDFCCPPZQLPMTKJILMAPLE66HGX6H6FTDBCGJT2CHIQVGBEALDGQXK7G2A7QXSDNOYW6CAGCLDWEQCPKGC3KUGVRB646PDVLYUQI3BDJ566XYIWJK3BINEVNTZU4XPHS7MGPM3IRXP3KQCYUEFTMPHRWL6CUN7T6NJ73NKFWGRSQYITLV2HHO3WE5JGLOWXRT3TAPTQSGGNICGAJHKSRTNTSC54R6Q4CXGZB2XWZYYTWTKUI23OXFVXEK3PE6BHKXEXJ5ZBTE7AQ4DRO7SJ75N23E6IGHEDQCT72I5345J2I36SSU434I7P6CY7EB2AEQ7LYOCV7OPGUYC4YKELPF3MGRB5OZSQZPV5DBDCN2OVVT3WHFGAZIBXIZMBNTMAJCDBGXFURYZVWQPSCD3VDH4ZBLXMMUXPQJVVPYTHZOTYSQGOZPT3VJVDPGXA56A3LCJRUMD33LCTZXPFSMQ3XWZN2XCXEU377PYBSOJ5KDPWYFTXBCW4XVKE32CJKDJPI6QP6QVQYT5GF65B3DWLM6EW57FJQBO6Q762KFYJFVOUQ3HS27ZJL7T2BV2L72ABR2ZXET3GKM3JAUMD6LEL6M7JBTCI4GVDBYSZ7BSSE6PVI7NJIBQV5MVVI6CUJN7K7J2L4XHGOBDC35OONJCFTROGKKKV2WQVCB4JRYRBOMWGBWLI54R5PAXPC62DI; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIHCOAOXSWXVJGQ6BOBAGYGTIVDEJSOPSWOPURFK5; _vender_new_=GI63BGTJFDBQ5VFYRAGXDIUTOUGBH4IELSA4HBAE7MB4S5HIL5QMHN2LMW7LKWD43YCKHJGXPJWTPRAEQ2QTFLJHKJUFHCXGGYIHCD7WSWY4PLU54NT3HGWB4MCDSKE4VJSCWBCJJ3C6Z2VI46TWP7ZJBWNTMPWIQ77NXK4VVKW6ABLW3LCTHZEYXQSC5L6SULQYZLAOLYQIKX2KPA4NEI5RHY4F2FAXI5CPTHP6BXFL757MRIFGERH2CQC2D3RAAFDYIVNI7B7NTLXWX5NEUT7IONYJQA2GVEUHKGHLAXO2JD6UI7C57LRQ4MAILLWECXYYZ2YLJ5HVL6HMAVKWPNRUQV7VQ4TJYKV2GUWP66XJIZDXBYZKDAO54T5BBWUA7DONKSVFDJCTNT7XV2KGI5YOGKQYDXPE7IINVADYCCF5H6RHZCCNDAPJ5WDJVY2XHWD7VVNICVT7PTKMSBW33L3BBSATV65XAXG72Z3QJ45MXA6IP2XQELXE7F47VC57UTM3EBWFRS7SWZCFQ5TPOT46JIQ6PNSYVA4453VSW4EAUWK6FRG3WAOQPSHG6BYFS7IG5ZCONS7EQAHSIUWPVDMBEDVBVCXW7ZSOG2U73QD4GGSJJ64QEOMY6A6GSGUVQ3LK46TGOU55INQYNJ63G3NK4M; universityLanguage=zh_CN; xue_userTypeCookieName50b60fba08fddfff319d0b5acc9d6eee=\"{\\\"1\\\":\\\"POP\\\"}\"; xue_userTypePageCookieName50b60fba08fddfff319d0b5acc9d6eee=1; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFNRRRQCPZ7EBOWHANCWVFJHFVSTEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; __jda=191429163.17036002655721718781778.1703600266.1703729497.1703749795.11; __jdc=191429163; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BSMLEHDIVX2QBZKIZSDNVQVV6ZDQ; __jdb=191429163.18.17036002655721718781778|11.1703749795; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU"
    // public JDLCookies = "1QRCodeKey=AAEAIFhFRYdtqIVB8msq--4GGCM92VtmVDHggy1PsxBqDiBY; wlfstk_smdl=t1egvdm4c2v736l9ibe8rjme281cgww9; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; unick=h2guneluxuqs47; __jdc=64963501; __jdv=64963501|wl.jdl.com|-|referral|-|1764748672981; 3AB9D23F7A4B3C9B=JVLFOXORR5NVQ4GHUTZLVPMLPICW7GN74RQQ44FXELCHOV72POLF2SXJBMALBPAOYSCTFMDED577O3GQHMFVXPMQTQ; flash=3_3iLx1aNt2opS3vP6fZonxlt5xNCJGrW8wyviL6PZ2zLdLmmdlMcFuoAkMAubdOZDQSGlkoOpEmXZfHB-DOCS9PHA-MNgm92uA7HVvXV_kmDvFQYraqeh4oamLGE3XiOIaWVnMyfFU792BWIvCLziXDNDeBlckZ_c6m9z9s6HIfK-Lc_g3nr0tyL*; thor=6901B38FCABE2222F893FE4DA6A41AD2F94CB10CA2AED843E94F80396CBE56F8EB699B8064B0A0A88D7F6879B2F79D99AA81A2EDEE58C0C1D290C24E02A3EF899D3304C733709B20C5E126DF20CAA7B57260874C281BA8017DDC76B2F38B58391DBD02AE27A99D2866676302A977B38D9017CD7AAAFB1F7D7FEFB73B176D6FE018D6047FD1348F4F03B37734C6A947C9; light_key=AASBKE7rOxgWQziEhC_QY6yahpo8WBWXDPHj_qUWDGr4MpHYAWI36f7o4pHYRiUhS9sU6MXZ; __jda=64963501.1764748672981885664758.1764748673.1764757261.1764927905.3; __jdb=64963501.2.1764748672981885664758|3.1764927905"
    private beiAnList = [];
    // 暂停订单列表
    public stopList = [];
    // 上一次查询的暂停订单列表
    public stopListBak = []
    public orderList = []
    // 发生错误的订单号MAP
    public errOrderMap = {}
    // 检查频次
    CHECK_TIME = 1000 * 30
    init() {
        this.logger.info('初始化');
        this.getStopOrderList()
        // this.getBeiAnList()
        this.getShopInfo()
        this.querySendOrder()
        setTimeout(() => {
            this.querySendOrder()
        }, 1000 * 60 * 2)
        
        // 启动待境外出库订单自动出库任务
        this.startAutoOutboundTask()
    }
    
    // 启动自动出库定时任务
    startAutoOutboundTask() {
        this.logger.info('启动待境外出库订单自动出库任务');
        this.checkAndOutboundOrders()
    }
    
    // 查询待境外出库订单并执行出库
    async checkAndOutboundOrders() {
        try {
            const orderList = await this.findWaitOverseasOutOrders()
            
            if (orderList && orderList.length > 0) {
                this.logger.info(`发现 ${orderList.length} 个待境外出库订单`, this.shopInfo.name)
                
                for (const order of orderList) {
                    try {
                        // 执行出库操作
                        const success = await this.executeOutbound(order)
                        
                        if (success) {
                            // 出库成功，发送飞书通知
                            await this.outboundSuccessNotify(order)
                            this.logger.info(`订单 ${order.orderId} 出库成功`, this.shopInfo.name)
                        } else {
                            // 出库失败，发送失败通知
                            await this.outboundFailNotify(order, '出库操作返回失败')
                            this.logger.info(`订单 ${order.orderId} 出库失败`, this.shopInfo.name)
                        }
                    } catch (e) {
                        this.logger.info(`订单 ${order.orderId} 出库异常:`, e, this.shopInfo.name)
                        await this.outboundFailNotify(order, e.message || '出库异常')
                    }
                }
            }
        } catch (e) {
            this.logger.info('查询待境外出库订单异常:', e, this.shopInfo.name)
        }
        
        // 30秒后再次执行
        setTimeout(() => {
            this.checkAndOutboundOrders()
        }, 30000)
    }
    
    // 查询待境外出库订单列表
    async findWaitOverseasOutOrders() {
        try {
            const body = {
                "body": "9F34F7916A540DAC947F8914ECF9DB4C4AA7C5D7C8255A98CFFBFFAFBFAB218A",
                "appId": "COCX0HBWR4BA7RDVDBIQ",
                "api": "dsm.order.bff.orderListBffService.queryOrderTabs",
                "v": "1.0"
            }

            const signer = new security.ParamsSign({
                appId: "0248a",
                preRequest: !1,
                debug: !1,
                onSign: function(t) {}
            })

            const signerRes = await signer.sign(body)
            const h5st = signerRes.h5st;

            const res = await fetch("https://sff.jd.com/api?v=1.0&appId=COCX0HBWR4BA7RDVDBIQ&api=dsm.order.bff.orderListBffService.queryOrderPage", {
                "headers": {
                    "cookie": this.JDCookies,
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "content-type": "application/json;charset=UTF-8",
                    "dsm-file-path": "lineation-price",
                    "dsm-lang": "zh_CN",
                    "dsm-platform": "pc",
                    "dsm-site": "",
                    "dsm-trace-id": "916c9587-b77e-4bcf-8002-3528f433deef",
                    "h5st": h5st,
                    "Referer": "https://shop.jd.com/jdm/trade/orders/order-list?tabType=waitOverseasOut"
                },
                "body": JSON.stringify({
                    "request": {
                        "source": "2000",
                        "versionNo": 20240830,
                        "data": {
                            "purchaseId": null,
                            "consumerName": null,
                            "consumerMobilePhone": null,
                            "logiNo": null,
                            "venderRemarkLevels": [],
                            "remarkFlag": null,
                            "userPin": null,
                            "itemNum": null,
                            "storeId": null,
                            "orderTags": [],
                            "orderStatusTypes": ["2"],  // 待境外出库状态
                            "idSopShipmentType": null,
                            "carrierCompany": null,
                            "paymentType": null,
                            "jdiOrderSignStatus": null,
                            "orderSalType": null,
                            "orderBusinessType": null,
                            "ouId": null,
                            "purchaseOrderNo": null,
                            "firstOrderId": null,
                            "tradeVendorId": null,
                            "supplierId": null,
                            "govSubActId": null,
                            "companyId": null,
                            "govSubsidyStatus": null,
                            "orderId": null,
                            "orderIds": null,
                            "orderTab": "waitOverseasOut",  // 待境外出库Tab
                            "sortMode": "orderDateAsc",
                            "current": 1,
                            "pageSize": 50,
                            "monthsFlag": "within6months"
                        }
                    },
                    "accessContext": {
                        "source": "web"
                    }
                }),
                "method": "POST"
            }).then(d => d.json());

            return res.data?.results || []
        } catch (e) {
            console.log('findWaitOverseasOutOrders error:', e)
            return []
        }
    }
    
    // 生成 traceId
    generateTraceId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    // 获取签名
    async getSign() {
        const body = {
            "body": "9F34F7916A540DAC947F8914ECF9DB4C4AA7C5D7C8255A98CFFBFFAFBFAB218A",
            "appId": "COCX0HBWR4BA7RDVDBIQ",
            "api": "dsm.order.bff.orderListBffService.queryOrderTabs",
            "v": "1.0"
        }

        const signer = new security.ParamsSign({
            appId: "0248a",
            preRequest: !1,
            debug: !1,
            onSign: function(t) {}
        })

        return await signer.sign(body)
    }
    
    // 获取京东快递配送信息
    async getJdDeliveryInfo() {
        // 如果已有缓存，直接返回
        if (this.cachedDeliveryInfo) {
            this.logger.info('使用缓存的配送信息:', this.cachedDeliveryInfo);
            return this.cachedDeliveryInfo;
        }

        try {
            const sign = await this.getSign();
            
            const params = {
                "dsmRequest": {
                    "request": {
                        "componentBase": {
                            "buid": "301",
                            "language": "ZH_CN",
                            "appId": "1214303",
                            "appName": "seller-delivery-fe"
                        }
                    }
                },
                "accessContext": { "source": "web" }
            };

            const res = await fetch("https://sff.jd.com/api?v=1.0&appId=JJZ621CAGWRTEBI2Q0FH&api=dsm.seller.delivery.center.ElectronicService.appDeliveryInfoList", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "content-type": "application/json;charset=UTF-8",
                    "cookie": this.JDCookies,
                    "dsm-file-path": "lineation-price",
                    "dsm-lang": "zh-CN",
                    "dsm-platform": "pc",
                    "dsm-site": "",
                    "dsm-trace-id": this.generateTraceId(),
                    "h5st": sign.h5st || '',
                    "x-requested-with": "XMLHttpRequest",
                    "origin": "https://shop.jd.com",
                    "Referer": "https://shop.jd.com/jdm/trade/deliveries/electronicWaybill?type=2"
                },
                "body": JSON.stringify(params),
                "method": "POST"
            }).then(d => d.json());

            this.logger.info('获取配送信息结果:', res);

            if (res.code === 200 && res.data && Array.isArray(res.data)) {
                // 找到京东快递 (providerNo === 2087)
                const jdExpress = res.data.find(item => item.providerNo === 2087);
                
                if (jdExpress && jdExpress.epsHasApplySite && jdExpress.epsHasApplySite.length > 0) {
                    const siteInfo = jdExpress.epsHasApplySite[0];
                    this.cachedDeliveryInfo = {
                        jdBranchCode: siteInfo.settlementCode,
                        addressId: siteInfo.venderTakeId,
                        deliveryId: siteInfo.deliveryNo || 2087
                    };
                    this.logger.info('获取到京东快递配送信息:', this.cachedDeliveryInfo);
                    return this.cachedDeliveryInfo;
                } else {
                    this.logger.info('未找到京东快递配送信息');
                    return null;
                }
            } else {
                this.logger.info('获取配送信息失败:', res.msg || res.message);
                return null;
            }
        } catch (error) {
            this.logger.info('获取配送信息异常:', error);
            return null;
        }
    }
    
    // 创建单号接口
    async createOrderWaybill(orderId: string, deliveryInfo): Promise<{success: boolean, message?: string}> {
        try {
            const { addressId, deliveryId, jdBranchCode } = deliveryInfo;
            
            // 默认使用 ed-m-0001
            const jdDeliveryWay = 'ed-m-0001';
            
            const params = {
                "request": {
                    "data": [{
                        "venderTaskAddressId": addressId,
                        "deliveryType": 202,
                        "orderIds": [orderId],
                        "deliveryNumber": {
                            "addressId": addressId,
                            "deliveryId": deliveryId,
                            "jdDeliveryWay": jdDeliveryWay,
                            "guaranteeValue": "0",
                            "addedServiceCodes": [],
                            "jdBranchCode": jdBranchCode,
                            "epsOutShip": { "operationType": 1, "insureValue": "0" },
                            "packageNum": 1,
                            "epsOutShipVo": { "operationType": 1, "insureValue": "0" }
                        },
                        "coverOriginalFlag": false
                    }], 
                    "source": "2000", 
                    "versionNo": 20240830
                }, 
                "accessContext": { "source": "web" }
            };

            const sign = await this.getSign();
            
            const res = await fetch("https://sff.jd.com/api?v=1.0&appId=COCX0HBWR4BA7RDVDBIQ&api=dsm.order.manage.OrderPrintOutboundService.createOrderWaybill", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "content-type": "application/json;charset=UTF-8",
                    "cookie": this.JDCookies,
                    "dsm-lang": "zh_CN",
                    "dsm-platform": "pc",
                    "dsm-site": "",
                    "dsm-trace-id": this.generateTraceId(),
                    "h5st": sign.h5st || '',
                    "pragma": "no-cache",
                    "Referer": "https://trade-order-jdm.jd.com/seller-order/orderPrint?_JDMOMID_=1509&tab=waitOutPrinted"
                },
                "body": JSON.stringify(params),
                "method": "POST"
            }).then(d => d.json());

            this.logger.info(`订单 ${orderId} 创建单号结果:`, res);
            
            // 检查是否有失败列表
            if (res.data && res.data.failList && res.data.failList.length > 0) {
                const failMsg = res.data.failList.map(f => f.failReason || f.message || f.msg).join('; ');
                return { success: false, message: failMsg };
            }
            
            // 检查是否有成功列表
            if (res.success || res.code === '0' || res.code === 0 || 
                (res.data && (res.data.successLis?.length > 0 || res.data.successList?.length > 0))) {
                return { success: true };
            } else {
                return { success: false, message: res.message || res.msg || '未知错误' };
            }
        } catch (error) {
            this.logger.info(`订单 ${orderId} 创建单号失败:`, error);
            return { success: false, message: error.message };
        }
    }
    
    // 仅出库接口
    async onlyOutbound(orderId: string, deliveryInfo): Promise<{success: boolean, message?: string}> {
        try {
            const { addressId, deliveryId, jdBranchCode } = deliveryInfo;
            
            const jdDeliveryWay = 'ed-m-0059';
            
            const params = {
                "request": {
                    "data": [{
                        "venderTaskAddressId": addressId,
                        "deliveryType": 202,
                        "orderIds": [orderId],
                        "deliveryNumber": {
                            "addressId": addressId,
                            "deliveryId": deliveryId,
                            "jdDeliveryWay": jdDeliveryWay,
                            "guaranteeValue": "0",
                            "addedServiceCodes": [],
                            "jdBranchCode": jdBranchCode,
                            "epsOutShip": { "operationType": 1, "insureValue": "0" },
                            "packageNum": 1
                        },
                        "coverOriginalFlag": false
                    }], 
                    "source": "2000"
                }, 
                "accessContext": { "source": "web" }
            };

            const sign = await this.getSign();

            const res = await fetch("https://sff.jd.com/api?v=1.0&appId=COCX0HBWR4BA7RDVDBIQ&api=dsm.order.manage.OrderPrintOutboundService.onlyOutbound", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "content-type": "application/json;charset=UTF-8",
                    "cookie": this.JDCookies,
                    "dsm-lang": "zh_CN",
                    "dsm-platform": "pc",
                    "dsm-site": "",
                    "dsm-trace-id": this.generateTraceId(),
                    "h5st": sign.h5st || '',
                    "pragma": "no-cache",
                    "Referer": "https://trade-order-jdm.jd.com/seller-order/orderPrint?_JDMOMID_=1509&tab=waitOutPrinted"
                },
                "body": JSON.stringify(params),
                "method": "POST"
            }).then(d => d.json());

            this.logger.info(`订单 ${orderId} 出库结果:`, res);
            
            // 检查是否有失败列表
            if (res.data && res.data.failList && res.data.failList.length > 0) {
                const failMsg = res.data.failList.map(f => f.message || f.msg || f.failReason).join('; ');
                return { success: false, message: failMsg };
            }
            
            // 检查是否有成功列表
            if (res.success || res.code === '0' || res.code === 0 || 
                (res.data && (res.data.successLis?.length > 0 || res.data.successList?.length > 0))) {
                return { success: true };
            } else {
                return { success: false, message: res.message || res.msg || '未知错误' };
            }
        } catch (error) {
            this.logger.info(`订单 ${orderId} 出库失败:`, error);
            return { success: false, message: error.message };
        }
    }
    
    // 执行出库操作（组合调用：获取配送信息 -> 创建单号 -> 出库）
    async executeOutbound(order): Promise<boolean> {
        const orderId = order.orderId;
        
        try {
            this.logger.info(`准备出库订单: ${orderId}`, this.shopInfo.name)
            
            // 1. 获取配送信息
            const deliveryInfo = await this.getJdDeliveryInfo();
            if (!deliveryInfo) {
                this.logger.info(`订单 ${orderId} 获取配送信息失败`, this.shopInfo.name);
                return false;
            }
            
            // 2. 创建单号
            const createResult = await this.createOrderWaybill(orderId, deliveryInfo);
            if (!createResult.success) {
                this.logger.info(`订单 ${orderId} 创建单号失败: ${createResult.message}`, this.shopInfo.name);
                // 创建单号失败不一定要终止，可能已经有单号了，继续尝试出库
            }
            
            // 3. 执行出库
            const outboundResult = await this.onlyOutbound(orderId, deliveryInfo);
            if (!outboundResult.success) {
                this.logger.info(`订单 ${orderId} 出库失败: ${outboundResult.message}`, this.shopInfo.name);
                return false;
            }
            
            this.logger.info(`订单 ${orderId} 出库流程完成`, this.shopInfo.name);
            return true;
        } catch (e) {
            this.logger.info(`订单 ${orderId} 出库异常:`, e, this.shopInfo.name);
            return false;
        }
    }
    
    // 格式化时间戳
    formatTime(timestamp) {
        if (!timestamp) return '-';
        return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
    }
    
    // 出库成功飞书通知
    async outboundSuccessNotify(order) {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const shopName = this.shopInfo.name
        const orderCreateTime = this.formatTime(order.orderCreateTime)
        const paymentConfirmTime = this.formatTime(order.paymentConfirmTime)

        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `订单自动出库成功通知 - ${shopName}`
                },
                "template": "green"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**订单信息**"
                    }
                },
                {
                    "tag": "div",
                    "fields": [
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**订单号:** ${order.orderId}`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**下单时间:** ${orderCreateTime}`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**付款时间:** ${paymentConfirmTime}`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**出库时间:** ${now}`
                            }
                        }
                    ]
                }
            ]
        }
        
        const webhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/3e1ae178-a3cb-4ea9-b3f2-29d650c14731';

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        await rp(options);
    }
    
    // 出库失败飞书通知
    async outboundFailNotify(order, reason: string) {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const shopName = this.shopInfo.name
        const orderCreateTime = this.formatTime(order.orderCreateTime)
        const paymentConfirmTime = this.formatTime(order.paymentConfirmTime)

        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `订单自动出库失败通知 - ${shopName}`
                },
                "template": "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**订单信息**"
                    }
                },
                {
                    "tag": "div",
                    "fields": [
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**订单号:** ${order.orderId}`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**下单时间:** ${orderCreateTime}`
                            }
                        },
                        {
                            "is_short": true,
                            "text": {
                                "tag": "lark_md",
                                "content": `**付款时间:** ${paymentConfirmTime}`
                            }
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `**失败原因:** ${reason}`
                    }
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `**时间:** ${now}`
                    }
                }
            ]
        }
        
        const webhook = this.errorNotifyUrl;

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        await rp(options);
    }
    // 获取暂停的订单列表
    async getStopOrderList() {
        const lastBakList =  this.stopListBak;
        const lastList =  this.stopList;
        try {
            const res = await this.findStopOrder()

            if (Array.isArray(res.orderList)) {
                this.logger.info('京东可以访问', this.thread, this.shopInfo.name)
            } else {
                this.logoutNotify(res)
                this.logger.info('登录过期', this.thread, this.shopInfo.name)
            }
            this.stopListBak = [...this.stopList]

            const orderList =  res.orderList || [];
            const jumpList = [];
            for (const j of this.stopListBak) {
                const order = orderList.find(item => item.orderId == j.orderId)
                if (!order) {
                    jumpList.push(j)
                }
            }
            // 需要变更状态的订单列表
            if (jumpList.length > 0) {
                console.log('DIFF订单, 需要变更状态')
                for (const item of jumpList) {
                    const orderItems = item.orderItems;
                    for (const order of orderItems) {
                        const skuId = order.skuId
                        const hasOtherOrder = await this.stopListHasSkuOtherOrder((order.mainSkuId || order.skuId), item.orderId)
                        if (hasOtherOrder) {
                            continue;
                        }
                        const info = await this.queryOneBeiAnInfoJDL(skuId)
                        if (info && info.goodsClearanceMode == 3) {
                            info.orderId = item.orderId
                            info.paymentConfirmTime = item.paymentConfirmTime
                            const success = await this.updateJDLbeiAn(info, 1)
                            if (success) {
                                this.jumpSendFeiShu(
                                    {
                                        ...info,
                                        skuName: order.skuName,
                                    },
                                    1
                                )
                            }
                        }
                    }
                }
            }

            const remarkMap = await this.getOrderRemark(orderList.map(item => item.orderId).join(','))

            for await (const item of orderList) {
                const diffTime = dayjs(dayjs()).diff(item.paymentConfirmTime, 'minutes')
                const orderItems = item.orderItems;
                // // 异常订单不处理
                // if (item.orderStatus === -4) {
                //     continue;
                // }
                if(remarkMap[item.orderId]) {
                    // 身份证不匹配跳过
                    if (remarkMap[item.orderId].remark === '身份证信息不一致') {
                        this.logger.info(item.orderId, remarkMap[item.orderId].remark)
                        continue;
                    }
                }

                // await this.getOrderDetail(item.orderId)

                for await (const order of orderItems) {
                    const skuId = order.skuId
                    const info = await this.queryOneBeiAnInfoJDL(skuId)
                    if(!info) continue;
                    info.orderId = item.orderId
                    info.paymentConfirmTime = item.paymentConfirmTime
                    order.mainSkuId = skuId
                    if (info.goodsClearanceMode == 2) {
                        if (diffTime > 12) {
                            continue
                        }
                        const success = await this.updateJDLbeiAn(info, 0);
                        if (success) {
                            this.sendFeiShu(
                                {
                                    ...info,
                                    skuName: order.skuName
                                }
                                , 0)
                        }
                    } else {
                        const diffTime = dayjs(dayjs()).diff(item.paymentConfirmTime, 'minutes')
                        // 超过十分钟
                        if (diffTime >= 13 && diffTime <= 120) {
                            if (this.errOrderMap[item.orderId]) {
                                continue
                            }
                            this.errOrderMap[item.orderId] = true
                            this.logger.info(item.orderId, '超过十二分钟啦')
                            const hasOrder = await this.stopListHasSkuOtherOrder(order.mainSkuId, item.orderId)
                            // 如果其他订单不包含此sku
                            if (!hasOrder) {
                                const success = await this.updateJDLbeiAn(info, 1);
                                if (success) {
                                    this.tenMinutesNotify(info, 1)
                                }
                            }
                        }
                    }
                }
            }


            this.stopList = orderList
            setTimeout(() => {
                this.getStopOrderList()
            },18000)
            return  {
                res,
            }
        } catch (e) {
            setTimeout(() => {
                this.getStopOrderList()
            },18000)
            // this.stopListBak = lastBakList;
            // this.stopList = lastList;
            this.logger.info(e, 'error, stop Order catch')
        }
    }

    async changeTenOrder() {
        const uniqueData = [...new Set(this.orderList.map(JSON.stringify))].map(JSON.parse);
        for await (const item of uniqueData) {
            const diffTime = dayjs(dayjs()).diff(item.paymentConfirmTime, 'minutes')
            const orderItems = item.orderItems;
            // 异常订单不处理
            if (item.orderStatus === -4) {
                continue;
            }
            // if(remarkMap[item.orderId]) {
            //     // 身份证不匹配跳过
            //     if (remarkMap[item.orderId].remark === '身份证信息不一致') {
            //         this.logger.info(item.orderId, remarkMap[item.orderId].remark)
            //         continue;
            //     }
            // }

            for (const order of orderItems) {
                const skuId = order.skuId
                const info = await this.queryOneBeiAnInfo(skuId)
                if(!info) continue;
                info.orderId = item.orderId
                info.paymentConfirmTime = item.paymentConfirmTime
                order.mainSkuId = info.skuId
                if (info.type == 1) {
                    // if (diffTime > 12) {
                    //     continue
                    // }
                    // const success = await this.updateBeiAn(info, 0);
                    // if (success) {
                    //     this.sendFeiShu(
                    //         {
                    //             ...info,
                    //             skuName: order.skuName
                    //         }
                    //         , 0)
                    // }
                    uniqueData.splice(uniqueData.findIndex(t => t.orderId === item.orderId), 1)
                } else {
                    const diffTime = dayjs(dayjs()).diff(item.paymentConfirmTime, 'minutes')
                    // 超过十分钟
                    if (diffTime >= 12 && diffTime <= 7200) {
                        if (this.errOrderMap[item.orderId]) {
                            continue
                        }
                        this.errOrderMap[item.orderId] = true
                        this.logger.info(item.orderId, '超过十二分钟啦')
                        const hasOrder = await this.stopListHasSkuOtherOrder(skuId, item.orderId)
                        // 如果其他订单不包含此sku
                        if (!hasOrder) {
                            const success = await this.updateBeiAn(info, 1);
                            if (success) {
                                uniqueData.splice(uniqueData.findIndex(t => t.orderId === item.orderId), 1)
                                this.tenMinutesNotify(info, 1)
                            }
                        }
                    }
                }
            }
        }

        this.orderList = uniqueData;
    }
    // 查询下一阶段订单列表
    async findStopOrder() {
        try {

            const body = {
                "body": "9F34F7916A540DAC947F8914ECF9DB4C4AA7C5D7C8255A98CFFBFFAFBFAB218A",
                "appId": "COCX0HBWR4BA7RDVDBIQ",
                "api": "dsm.order.bff.orderListBffService.queryOrderTabs",
                "v": "1.0"
            }

            const signer = new security.ParamsSign({
                appId: "0248a",
                preRequest: !1,
                debug: !1,
                onSign: function(t) {}
            })

            const signerRes = await signer.sign(body)
            const h5st = signerRes.h5st;

            const res = await fetch("https://sff.jd.com/api?v=1.0&appId=COCX0HBWR4BA7RDVDBIQ&api=dsm.order.bff.orderListBffService.queryOrderPage", {
                "headers": {
                    // "cookie": "track=89b9b089-e8f2-f23d-4606-07843f93c72e; __jdu=17627641541081298261691; __jdv=34491710|122.51.6.129:9001|-|referral|-|1764316731749; dsm-lang=zh_CN; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; pinId=Mk_A6Nbv7MenkDneLmJDcA; unick=h2guneluxuqs47; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; ceshi3.com=000; 3AB9D23F7A4B3C9B=IDPLNTQEGONBHCRXJY6YJFAW5UYMCQV4SRKMK4V33X2PPYOJUJ52X6LG5KXEU73E5EBWH25KBSH2ERJRWVRCD6TB4U; language=zh_CN; light_key=AASBKE7rOxgWQziEhC_QY6ya_umV9Rv3SqeTnnu2ORYCeKZxCa7oMLO5Mhyk-YSJgywEzcFV; TrackID=1ryc2gmKe6d_JGUiIqMCToUF_bnnPw_vKq1z8ZOHIRh4JHGFLOZn9npUhBu5cj11k; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIEZYQDJWYTMFDX2KYQUWLZKBK6IGW44XQF5GDUD3; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFOS3ZJCKOYOHVCP5J47CLAPVHLPEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; __jdc=27966078; 3AB9D23F7A4B3CSS=jdd03IDPLNTQEGONBHCRXJY6YJFAW5UYMCQV4SRKMK4V33X2PPYOJUJ52X6LG5KXEU73E5EBWH25KBSH2ERJRWVRCD6TB4UAAAAM24NCEYEAAAAAAD6ZJGUVUVQP4JAX; _s_vender_=JACFLSGV5E2PIPOF6BH6JJZZBO74RVRL4RG32TKPVORVCONKOBPE7IYOEZGM4E25IRYAJ3ZCNBFCIKWKMID535SVGZMX5VMQCSII4WL37VUIMWSVFTU46XXVPKG7XL42AI6ACRHXRMENWUQ6PCF65IN3RMOIEFV3OASICB6JFVJBOLDDEF57MKQLK5JJB32FSAEH7QTFI4ZRDMN7GA2BQM3RRWCDEXKSKRYGH2O3RI4PL637DKGP5ZEVO53JAAM2GC2GIECX4TBCIN7VU3CI5LN4KWMVW2AG37HVOW67TGK7YK4AZES4QSQOCGN2BUQC2KNCHN55V22F6ZED4CFVZG6U4ZTKGLWQYUGKE3JOYQBDEOLB64ZRDASS7WMCHZWE; __USE_NEW_PAGEFRAME__=true; __USE_NEW_PAGEFRAME_VERSION__=v11; thor=6901B38FCABE2222F893FE4DA6A41AD29F9D1289C0DAE90FE3EC2176E1EFEE233BF14D8053C86B17ED5D84C1E106776572C25C08759CFADFE65D23DD59082C6DC60600E5B6284FC9E58BB4E0A841E0F14F7D1B01C55A01D2BF6C31077DA4D29F3AAAE8EF648B604BDE854E39D7E195172E5C8D5EB91F892127BB0A0FAB928C4FD7D06006231AD92A46061D79628B0EC3; _s_base_=JACFLSGV5E2PIPOF6BH6JJZZBOEKVUETHRO5HW752CNNBR53LZPHFLHDNSWAWIXYQ7ARPVJ3ETBN4ZRXQZOCVBGTPEIH7DYA4XH3KMJCYMJDOQQRHRGOPFO43J5SK7XJQ5TBXZH6AKWYVOU7D5A2QEZ6WJFZ5QYUOK6QCALOIHPJGQL5TN7XUHK5LKTJMXPO; flash=3_RXV4RTUcsdNZzVRPylLuaagpLxsw6EZEuR1AbSJEQttOFJau4xtHyGN3OGysAzhzSxVhWKZ2JaiN5nHG86ATFZ4NNmWMN-bmvZX1ty9UIU00swQxiaGq4elbYAwWqAw97baKtMP2EAl6r7HTsdGb; __jda=27966078.17627641541081298261691.1762764154.1764746741.1764753576.9; __jdb=27966078.1.17627641541081298261691|9.1764753576",
                    "cookie": this.JDCookies,
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "content-type": "application/json;charset=UTF-8",
                    // "dsm-eid": "jdd03IDPLNTQEGONBHCRXJY6YJFAW5UYMCQV4SRKMK4V33X2PPYOJUJ52X6LG5KXEU73E5EBWH25KBSH2ERJRWVRCD6TB4UAAAAM247NA4CQAAAAAC2M77PRKRHGJKUX",
                    "dsm-file-path": "lineation-price",
                    "dsm-lang": "zh_CN",
                    "dsm-platform": "pc",
                    "dsm-site": "",
                    "dsm-trace-id": "916c9587-b77e-4bcf-8002-3528f433deef",
                    "h5st":  h5st,     // "priority": "u=1, i",
                    // "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
                    // "sec-ch-ua-mobile": "?0",
                    // "sec-ch-ua-platform": "\"Windows\"",
                    // "sec-fetch-dest": "empty",
                    // "sec-fetch-mode": "cors",
                    // "sec-fetch-site": "same-site",
                    // "x-referer-page": "https://shop.jd.com/jdm/trade/orders/order-list",
                    // "x-requested-with": "XMLHttpRequest",
                    // "x-rp-client": "h5_1.0.0",
                    "Referer": "https://shop.jd.com/jdm/trade/orders/order-list?tabType=waitOverseasOut"
                },
                "body": "{\"request\":{\"source\":\"2000\",\"versionNo\":20240830,\"data\":{\"purchaseId\":null,\"consumerName\":null,\"consumerMobilePhone\":null,\"logiNo\":null,\"venderRemarkLevels\":[],\"remarkFlag\":null,\"userPin\":null,\"itemNum\":null,\"storeId\":null,\"orderTags\":[],\"orderStatusTypes\":[\"11\"],\"idSopShipmentType\":null,\"carrierCompany\":null,\"paymentType\":null,\"jdiOrderSignStatus\":null,\"orderSalType\":null,\"orderBusinessType\":null,\"ouId\":null,\"purchaseOrderNo\":null,\"firstOrderId\":null,\"tradeVendorId\":null,\"supplierId\":null,\"govSubActId\":null,\"companyId\":null,\"govSubsidyStatus\":null,\"orderId\":null,\"orderIds\":null,\"orderTab\":\"suspend\",\"sortMode\":\"orderDateAsc\",\"current\":1,\"pageSize\":10,\"monthsFlag\":\"within6months\"}},\"accessContext\":{\"source\":\"web\"}}",
                "method": "POST"
            }).then(async d => {
                // try {
                return d.json()
                // } catch (e) {
                // return d.text()
                // }
            });

            // console.log(res)
            return  {
                orderList: res.data ? (res.data?.results || []) : null
            }
        } catch (e) {
            console.log('findStopOrder', e)
            return {
                orderList: []
            }
        }
    }
    // 获取备列表
    async getBeiAnList(page = 1) {
        try {
            const result = await fetch("https://shop-hk.jd.com/popRecording/recorded/recordedManage.do?goodsName=&skuId=&upc=&customId=&fromCreated=&toCreated=&ccProvider=&customModel=&sellerRecord=&page=1", {
                "headers": {
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    // "cookie": "shshshfpa=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; shshshfpx=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; __jdu=1700109613209731139267; __jdv=76161171|direct|-|none|-|1703342303715; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; pinId=Mk_A6Nbv7MenkDneLmJDcA; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; user-key=8d21ce0f-8695-4c7e-835e-a2fc50c50830; corpBehavior=1; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMUOJ4NGQAAAAADSDP22VJIM6GNMX; cn=1; smb_track=E36463B1BA744C75803892A14AFFF0A9; language=zh_CN; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; TrackID=1eKDqnXkB0cCNjshjVGs7kkRuDN5_Qha45E8IfuM0IyGXJFm6xN_gwllHHQ4ocw_w; ceshi3.com=000; flash=2_3Vf3TU1oOHS1E3iLb5mioPPwrQ-L6JvcRzupMoYFEjuZidy3aoJAiw6EkDNkfqvzrWbw1ymxXXb9Xid3ms_lM599f059_YoIpxgLpMYfYkp*; thor=6901B38FCABE2222F893FE4DA6A41AD28B2FF5A6B6F54A76F64CA788BC1404FA432D8014F1CA9DE928F379133D2969B553703BE185EF1FD6649B263A5EA1B9472C6558C7D6FE5CD726F9BF383E4E4570D054429AC8A045F0B45922B76DF266888E87D583C7DF1F76D301771EF3F104D797CDE992C8421711685C97D73408EC5147BF2E12DEF84BD9DEDF129C6C483F90; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIHCOAOXSWXVJGQ2SINZCR5RT55BV5YF3H32UFC4S; mba_muid=1700109613209731139267; universityLanguage=zh_CN; xue_userTypeCookieName50b60fba08fddfff319d0b5acc9d6eee=\"{\\\"1\\\":\\\"POP\\\"}\"; xue_userTypePageCookieName50b60fba08fddfff319d0b5acc9d6eee=1; qid_uid=63fbf91a-2193-4141-8127-0b5a9a4da60e; qid_fs=1703595716678; qid_ls=1703595716678; qid_ts=1703595716684; qid_vis=1; shshshfpb=AAsaEOaaMEpILfXnDP1RQdOco4vsSWBcDNClSTgAAAAA; __jdc=191429163; __jda=191429163.1700109613209731139267.1700109613.1703595081.1703597990.29; __jdb=191429163.4.1700109613209731139267|29.1703597990; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFOSH3SMBJJZ724KPLBMR6EIVFPXEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A",
                    "cookie": this.JDCookies,
                    "Referer": "https://shop-hk.jd.com/popRecording/recorded/recorded.html",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            }).then(d => {
                return d.json()
            });

            const res = result.result.result;
            const list = res.list;
            this.beiAnList.push(...list)
            for (const item of list) {
                const info = await this.queryOneBeiAnInfo(item.skuId)
                if (info && info.type == 0) {
                    await this.updateBeiAn(info, 1);
                }
            }
            if (page < res.totalPage) {
                setTimeout(() => {
                    this.getBeiAnList(res.page + 1)
                }, 2000)
            } else {
                console.log('执行完成')
            }

        } catch (e) {
            console.log(e, 'getBeiAnList')
            this.getBeiAnList(1)
        }
        // list.forEach(item => {
        //     if (item.type === 1) {
        //         console.log('type 1')
        //     }
        // })
        // console.log(res,list, '--');
    }
    // 查询单个备案详情
    async queryOneBeiAnInfo(skuId, time = 0) {
        try {
            const result = await fetch(`https://shop-hk.jd.com/popRecording/recorded/recordedManage.do?goodsName=&skuId=${skuId}&upc=&customId=&fromCreated=&toCreated=&ccProvider=&customModel=&sellerRecord=&page=1`, {
                "headers": {
                    "accept": "*/*",
                    // "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    // "sec-ch-ua-mobile": "?0",
                    // "sec-ch-ua-platform": "\"macOS\"",
                    // "sec-fetch-dest": "empty",
                    // "sec-fetch-mode": "cors",
                    // "sec-fetch-site": "same-origin",
                    // "x-requested-with": "XMLHttpRequest",
                    // "cookie": "shshshfpa=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; shshshfpx=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; __jdu=1700109613209731139267; __jdv=76161171|direct|-|none|-|1703342303715; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; thor=6901B38FCABE2222F893FE4DA6A41AD2B7B0C890E50CD438CE70BC24E947BA5C74C62E09C0A0D0A20A7CCFE5D0A04A5D6A305B0189BF1DB012876E697BD7A9F1C25C33FB5C7D8232F7C988F93B071792F075969C4EB68244AC3D47514DB51535261E0DC5F6E20CE450E59D18E6E7A983493D50B5BE48D3413E1D73BC53BE64D061B8505DFCE5AC4C8A3CFD0D336BA931; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; pinId=Mk_A6Nbv7MenkDneLmJDcA; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; flash=2_ahn-HIMjFzg6gJaPiIiDr7fYvR5BkPzay-flyLklbZnw23kGkAPsX7sE7Bl-ZBivLG6zF5Hun6RMc6AtT6OQS5YudZiSpzZ7XNou97izdho*; ceshi3.com=000; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; TrackID=1eJakqOiiu7wAcmYygNZHWjPKiJPhQBiCiXDaFs6kzXOX_UMTTN1hvfe6V2MBgjxq; smb_track=68FA65B2AC0940C580281397D309CBF3; user-key=8d21ce0f-8695-4c7e-835e-a2fc50c50830; cn=0; language=zh_CN; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMTJL3GFYAAAAADNLQB5PBUZY27AX; shshshfpb=AAjDfXpqMEpILfXnDP1RQdOco4vsSWBcDNClSQQAAAAA; __jda=191429163.1700109613209731139267.1700109613.1703385126.1703396104.8; __jdc=191429163; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFIC5X344XUJBUB4ERW6SKYGMVMNEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU",
                    "Referer": "https://shop-hk.jd.com/popRecording/recorded/recorded.html",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "cookie": this.JDCookies
                },
                "body": null,
                "method": "GET"
            }).then(d => d.json());

            const info = result.result.result.list[0];
            if (info && info.mainSkuId) {
                return  await this.queryOneBeiAnInfo(info.mainSkuId)
            }
            return  info
        } catch (e) {
            this.logger.info(e, 'error info')
            if(time >= 2) {
                return null
            }
            return  await this.queryOneBeiAnInfo(skuId, time + 1)
        }
    }


    // 查询jd物流平台信息
    async queryJDLInfo() {
        const result = await fetch("https://api.jdl.com/linkSelectApi/getCustomByCustomQueryRequest", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "action-biz-type": "perf",
                "appparams": "{\"appid\":\"c2c_textbook\",\"ticket_type\":\"m\"}",
                "clientinfo": "{\"appName\":\"eclp_business_nirvana\",\"client\":\"pc\"}",
                "content-type": "application/json;charset=utf-8",
                "lop-dn": "bw.jdl.com",
                "lop-trace-id": "ECLP17649463133953949",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-requested-with": "XMLHttpRequest",
                "cookie": this.JDLCookies,
                "Referer": "https://scsw.jdl.com/"
            },
            "body": "[{\"permissionCodes\":[\"ASSIGN_EDIT_POMAIN_SELLER_YSHC\",\"CGRKGL_HCFS\",\"CGRKGL_FPCSHFWB\",\"SO_EXPORT_SELLER_BTN\",\"SO_IMPORT_SELLER_BTN\",\"SO_PLATFORM_IMPORT_SELLER_BTN\",\"ASSIGN_ADD_POMAIN_SELLER\",\"ASSIGN_EXPORT_POMAIN_SELLER\",\"ASSIGN_DOWN_POMAIN_SELLER\",\"ASSIGN_BATCHIMPORTTEMPLATE_POMAIN_SELLER\",\"ASSIGN_BATCHIMPORT_POMAIN_SELLER\",\"ASSIGN_CM_POMAIN_SELLER\",\"ASSIGN_CHUKOT_POMAIN_SELLER\",\"RTS_MAINLIST_IMPORT\",\"RTS_MAINLIST_IMPORTTASK\",\"ASSIGN_APPOINTMENT_POMAIN_SPD\",\"ASSIGN_APPOINTMENT_POMAIN_TRCT\",\"POMAIN_MANAGEMENT_APPOINTMENT_SPD\",\"POMAIN_MANAGEMENT_APPOINTMENT_TRCT\",\"SUPPLYCHAIN_INBOUND_V2_SWITCH-1\",\"SUPPLYCHAIN_INBOUND_V3_SWITCH\",\"SUPPLYCHAIN_OUTBOUND_V2_SWITCH\",\"SUPPLYCHAIN_OUTBOUND_V3_SWITCH\",\"ECLP_WLSJ_DR\",\"SELLER_SHOPGOODS_STATUS\",\"SELLER_WAIT_MNT_SG_BTN\",\"SUPPLYCHAIN__INVENTORY_FC\",\"SUPPLYCHAIN__INVENTORY_SHOP\",\"SUPPLYCHAIN__INVENTORY_LIMITATION\",\"SUPPLYCHAIN_INVENTORYSETTINGS_GOODS\",\"SUPPLYCHAIN_INVENTORYSETTINGS_SHOP\",\"SUPPLYCHAIN__INVENTORY_FLOW_V2.0_SWITCH\",\"SUPPLYCHAIN__INVENTORY_FLOW_V3.0_SWITCH\",\"YWGL_THRK_THRKGL_BATCH_IMPORT_RTW\",\"YWGL_THRK_THRKGL_BATCH_IMPORT_RTW_B2C\",\"YWGL_THRK_THRKGL_IMPORT_TASK_RTW\",\"YWGL_THRK_THRKGL_TRANSFER_RTW\",\"YWGL_THRK_THRKGL_CHECK_RTW\",\"Download_Video\",\"FULFILLMENT_OUTBOUND_CRETURN_V2.0_SWITCH_1\",\"FULFILLMENT_OUTBOUND_CRETURN_V3.0_SWITCH\",\"SUPPLYCHAIN_INBOUND_RETURN_V2.0_SWITCH_1\",\"SUPPLYCHAIN_INBOUND_RETURN_V3.0_SWITCH\",\"SUPPLYCHAIN__INVENTORY_FC-V2.0_SWITCH\",\"SUPPLYCHAIN__INVENTORY_SHOP_V2.0_SWITCH\",\"SUPPLYCHAIN__INVENTORY_LIMITATION_V2.0_SWITCH\",\"SUPPLYCHAIN__INVENTORY_FC_V3.0_SWITCH\",\"SUPPLYCHAIN__INVENTORY_SHOP_V3.0_SWITCH\",\"SUPPLYCHAIN__INVENTORY_LIMITATION_V3.0_SWITCH\",\"SUPPLYCHAIN_INVENTORYSETTINGS_GOODS_V2.0_SWITCH\",\"SUPPLYCHAIN_INVENTORYSETTINGS_GOODS_V3.0_SWITCH\",\"SUPPLYCHAIN_INVENTORYSETTINGS_SHOP_V2.0_SWITCH\",\"SUPPLYCHAIN_INVENTORYSETTINGS_SHOP_V3.0_SWITCH\",\"SUPPLYCHAIN_BBI_ESG_V2.0_SWITCH\",\"SUPPLYCHAIN_BBI_ESG_V3.0_SWITCH\",\"CUT_BSC_BBI_ESG\",\"international_POP_Store_Products_Import\",\"BC_Same_Warehouse_Store_Products_Import\",\"DISTRIBUTE_SALESORDER_RETURN_BUTTON_01\",\"DISTRIBUTE_SALESORDER_CANCEL_BUTTON_01\",\"SALESORDER_DELIVERY_BUTTON\",\"INTERNATIONAL_BONDED_BUTTON\",\"SPAREPARTS_SERVICEORDER_CANCEL_BUTTON_01\",\"SPAREPARTS_SPAREPARTSORDER_CANCEL_BUTTON_01\",\"ASSIGN_BATCHMODIFICATION_POMAIN_SELLER\",\"ASSIGN_BATCHMODIFICATION_POMAIN_SELLER_DIFFERENCES\",\"ASSIGN_BATCHMODIFICATION_POMAIN_SELLER_BOXINSTORE\",\"ASSIGN_BATCHCANCEL_POMAIN_SELLER\",\"RETURN_STORAGE_RULE_ADD_BTN\",\"RETURN_STORAGE_BATCH_ENABLE_BTN\",\"RETURN_STORAGE_BATCH_DISABLED_BTN\",\"RETURN_STORAGE_BATCH_IMPORT_BTN\",\"RETURN_STORAGE_ENABLE_BTN\",\"RETURN_STORAGE_DISABLE_BTN\",\"RETURN_STORAGE_MODIFY_WAREHOUSE_BTN\",\"CREATE_ORDER_VERIFICATION_STYLE_SELECT_BTN\",\"MANAGEMENT_ORDER_CANCEL_APPOINTMENT_BTN\",\"FULFILLMENT_INBOUND_POEDIT_TEST\",\"SO_SALE_ADD_SELLER_BTN\",\"SO_SALE_EDIT_SELLER_BTN\",\"INTELLIGENTWB_JH_ANALYSIS_INBOUNDDETAIL\",\"SUPPLYCHAIN__VALUEADDED_QUERY_NEW\",\"LARGEGOODS_VALUEADDED_SERVICE\"]}]",
            "method": "POST"
        }).then(res => res.json());

        if (!result.data) {
            this.jdlLogin = false
            return {}
        }

        this.jdlLogin = !!result?.data?.permissionInfo?.deptList

        return result?.data?.permissionInfo?.deptList
    }


    // 从jd物流平台查询单个备案
    async queryOneBeiAnInfoJDL(skuId, time = 0) {
        try {
            const jdlInfo = await this.queryJDLInfo()
            const result = await fetch(`https://api.jdl.com/goodsApi/queryShopGoodsList`, {
                "headers": {
                    "accept": "*/*",
                    // "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    // "sec-ch-ua-mobile": "?0",
                    // "sec-ch-ua-platform": "\"macOS\"",
                    // "sec-fetch-dest": "empty",
                    // "sec-fetch-mode": "cors",
                    // "sec-fetch-site": "same-origin",
                    // "x-requested-with": "XMLHttpRequest",
                    contentType: "application/json;charset=UTF-8",
                    "lop-dn": 'bw.jdl.com',
                    // "cookie": "shshshfpa=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; shshshfpx=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; __jdu=1700109613209731139267; __jdv=76161171|direct|-|none|-|1703342303715; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; thor=6901B38FCABE2222F893FE4DA6A41AD2B7B0C890E50CD438CE70BC24E947BA5C74C62E09C0A0D0A20A7CCFE5D0A04A5D6A305B0189BF1DB012876E697BD7A9F1C25C33FB5C7D8232F7C988F93B071792F075969C4EB68244AC3D47514DB51535261E0DC5F6E20CE450E59D18E6E7A983493D50B5BE48D3413E1D73BC53BE64D061B8505DFCE5AC4C8A3CFD0D336BA931; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; pinId=Mk_A6Nbv7MenkDneLmJDcA; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; flash=2_ahn-HIMjFzg6gJaPiIiDr7fYvR5BkPzay-flyLklbZnw23kGkAPsX7sE7Bl-ZBivLG6zF5Hun6RMc6AtT6OQS5YudZiSpzZ7XNou97izdho*; ceshi3.com=000; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; TrackID=1eJakqOiiu7wAcmYygNZHWjPKiJPhQBiCiXDaFs6kzXOX_UMTTN1hvfe6V2MBgjxq; smb_track=68FA65B2AC0940C580281397D309CBF3; user-key=8d21ce0f-8695-4c7e-835e-a2fc50c50830; cn=0; language=zh_CN; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMTJL3GFYAAAAADNLQB5PBUZY27AX; shshshfpb=AAjDfXpqMEpILfXnDP1RQdOco4vsSWBcDNClSQQAAAAA; __jda=191429163.1700109613209731139267.1700109613.1703385126.1703396104.8; __jdc=191429163; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFIC5X344XUJBUB4ERW6SKYGMVMNEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU",
                    "Referer": "https://scsw.jdl.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    // 京东物流平台cookie
                    "cookie": this.JDLCookies
                },
                "body": JSON.stringify([
                    {"commonPageRequest":{"iDisplayStart":0,"iDisplayLength":10},"params":{"spGoodsNo":skuId,"deptId":jdlInfo.deptId,"deptNo": jdlInfo.deptNo}}
                ]),
                "method": "POST"
            }).then(d => d.json());

            if (!result.data) {
                return false
            }

            // const info = result.result.result.list[0];
            // if (info && info.mainSkuId) {
            //     return  await this.queryOneBeiAnInfo(info.mainSkuId)
            // }
            // console.log(result.data, 'beiAn info')
            return  result.data.aaData[0]
        } catch (e) {
            console.log(e,  'beian error')
            // this.logger.info(e, 'error info')
            // if(time >= 2) {
            //     return null
            // }
            // return  await this.queryOneBeiAnInfo(skuId, time + 1)
        }
    }

    // 获取下一阶段订单列表
    async getSendOrderList() {
        try {
            //     const result = await fetch("https://porder.shop.jd.com/order/orderlist", {
            //         "headers": {
            //             "accept": "application/json, text/plain, */*",
            //             "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            //             "content-type": "application/json;charset=UTF-8",
            //             "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
            //             "sec-ch-ua-mobile": "?0",
            //             "sec-ch-ua-platform": "\"macOS\"",
            //             "sec-fetch-dest": "empty",
            //             "sec-fetch-mode": "cors",
            //             "sec-fetch-site": "same-origin",
            //             // "cookie": "__jdv=56585130|direct|-|none|-|1703600265575; pinId=Mk_A6Nbv7MenkDneLmJDcA; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; __jdu=17036002655721718781778; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMWCNULEAAAAAACOUKVNVUZZMDCUX; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; language=zh_CN; smb_track=02DE91E68A90440681C0768B8C50A8BD; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; shshshfpb=AAiuCuLWMEpILfXnDP1RQdOco4vsSWBcDNClSUAAAAAA; ceshi3.com=000; thor=6901B38FCABE2222F893FE4DA6A41AD295C4686446F3C80270DAE2F87F6FE9CD985FEE0548C72F11D75CB39996400BCB49F4D4921EA5F02E6E1052CA928689E500B2F78205C2E8E3662AFB0D9180F6E1E958D23FF533119A80288DDE04311FC9A27F36D987A8A01EF398B7BFC0A9131B6DB49F25381C09C19689B594980A4DE840DF86AF37D4DC612DA9C1B567C433C2; TrackID=13dfsVJnaAWq4FWTkMv6BAd6CtfiuKYWSuKhkd35WiTVkd-nLOGNTixZ0mhTcuDcv; flash=2_MSgbCeQeEs8HzyvVhFog67VnwQGd4fgAEzY_aWBgmyQPtTKiFWOWwBXDa7fh-Ol6b6wjq626uMal5RaZJqeJGcPQm9pw9u8S7ggL2A4h_ZP*; _vender_=TNK3O6PALVQGGMI642LJKJZPNN56IZEONGC7GL4VVDUXDFCCPPZQLPMTKJILMAPLZWB2RGOWODK2TOG3DDTHQXXNKYALDGQXK7G2A7QXSDNOYW6CAGCPRLP5Z3NIZCHA4EL275ID7OHDWKJCG3IKWJEKBLKXNRBLHPI43M6V7YP2SC4RQRZXNIFA6PUCI7UIJYQMBTNIZIILXODG4AMBHU7KVXB7C3FVYYIDB6CNUJRIY3OXKRFOLJ5NJPZVGTXO3MGRB5OZSQZPUXK7OTV5QTIP7NLKLLY3WYJPC4VDZHQGTTOSIIB5LHCFEU46QULB2S23NQFGX3NFYRWZZ4RSVT5V5XCLCR6ORQNFC6Z6LN7AOMH5WXHCJZAENA6SMDSKCIYM3B25NWIYPAC4U3MBP2BDLJVVANWICDN6T6NZ5EU4TAACUTVVOVRLM6JTGYD7NX4IWYHATFWDNHVJJUNUDUHMVNYQT2FAZY4YIO2ZIMJX5UUINOJOE5UGJGNEXRP3LEVEOKPEKYZQTGIEMICOMRE5O6LV2SNJ2JIEFB6S7UW65Q4TE6WWMAOJYZN26OZVDWM5N6CVR2ER6YG3W4SVEC3KWSVM7MJTUZNQVYDSJGIVLO3MU25PV33A5NUN7KDRRNKGCEK4V6MSOXETOVWA664XIMTDRCC4ZMMDMWXRXDHQ7WUHLISPYU7RSWJYVDGDHNBIGEPD7YSQU; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIHCOAOXSWXVJGQ7FEQWZ4SOEUWOUTSV4T76G23UJ; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFL3C6PMEP6KQXOFZE3VJ4CPPTABEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; _vender_new_=GI63BGTJFDBQ5VFYRAGXDIUTOUGBH4IELSA4HBAE7MB4S5HIL5QMHN2LMW7LKWD43YCKHJGXPJWTPRAEQ2QTFLJHKJUFHCXGGYIHCD7HNPX7P53NJYJBLEQQWIG3SGOKANYJB4AHZAIO2L2TATYNMMFW2T7ATNFOZD4PRFANVIODWIGDFMXKRJ4I6UJ43SNLVNG3LECZBJRH7CNAV24UOKLAU3DX3TBTR5D36HX3PK3QE6SIHOTS432W6FB24YGMPFIXXWGFUD5N4OM5BGIAMJJTSTBINZ7M65V2STDONSMADD2X7KWKLUZTWX3YXOD6XLJPSELOEX5KUTZEGIH2Q6ZPKB4MLH3YQR67XP522L4RC3RF7KVE6JBSB6UHWL2QZZ33LNQY6BGXBG24ZAN4N7GAGWVI4ZDKBF7ZYJAPU6GHUX2BV7IT2ELA7PH3JOOEANSFTFAJTXVVKULEH4XATPV477XMOLCIYERGKGFXTPLTIGOEN5JDFRA2366QQO5FV2AT2XABQCAT4PRSM6IW44RRTC3OBHJXEAXD2I4FDTV2FPOYRS5HCDD4DBLC7FPXYSMCF5FO7EVNPE3L4QREKVCPKBOC6ZHI7S3X65H3NZDRC47R63MJOVG4L23DWGWM; __jda=191429163.17036002655721718781778.1703600266.1703826608.1703855791.17; __jdc=191429163; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BTILDK3EHIQMTXDMLWP3Z2KVEN5Q; __jdb=191429163.23.17036002655721718781778|17.1703855791; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU",
            //             "cookie": this.JDCookies,
            //             // "cookie": "shshshfpa=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; shshshfpx=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; __jdu=1700109613209731139267; __jdv=76161171|direct|-|none|-|1703342303715; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; pinId=Mk_A6Nbv7MenkDneLmJDcA; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; user-key=8d21ce0f-8695-4c7e-835e-a2fc50c50830; corpBehavior=1; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMUOJ4NGQAAAAADSDP22VJIM6GNMX; cn=1; smb_track=E36463B1BA744C75803892A14AFFF0A9; language=zh_CN; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; TrackID=1eKDqnXkB0cCNjshjVGs7kkRuDN5_Qha45E8IfuM0IyGXJFm6xN_gwllHHQ4ocw_w; ceshi3.com=000; flash=2_3Vf3TU1oOHS1E3iLb5mioPPwrQ-L6JvcRzupMoYFEjuZidy3aoJAiw6EkDNkfqvzrWbw1ymxXXb9Xid3ms_lM599f059_YoIpxgLpMYfYkp*; thor=6901B38FCABE2222F893FE4DA6A41AD28B2FF5A6B6F54A76F64CA788BC1404FA432D8014F1CA9DE928F379133D2969B553703BE185EF1FD6649B263A5EA1B9472C6558C7D6FE5CD726F9BF383E4E4570D054429AC8A045F0B45922B76DF266888E87D583C7DF1F76D301771EF3F104D797CDE992C8421711685C97D73408EC5147BF2E12DEF84BD9DEDF129C6C483F90; _vender_=TNK3O6PALVQGGMI642LJKJZPNN56IZEONGC7GL4VVDUXDFCCPPZQLPMTKJILMAPLCVF5BI7BM6KSTB3TNH3PMYY5YAALDGQXK7G2A7QXSDNOYW6CAGCLDWEQCPKGC3KUGVRB646PDVLYUQI3BDJ566XYIWJK3BINEVNTZU4XPHS7MGPM3IRXP3KQCYUEFTMPHRWL6CUN7T6NJ73NKFWGRSQYITLV2HHO3WE5JGLOWXRT3TAPTQSGGNICGAJHKSRTNTSC54R6Q4CXGZB2XWZYYTWTKUI23OXFVXEK3PE6BHKXEXJ5ZBTE7AQ4DRO7SJ75N23E6IGHEDQCT72I5345J2I36SSU434I7P6CY7EB2AEQ7LYOCV7OPGUYC4YKELPF3MGRB5OZSQZPV5DBDCN2OVVT3WHFGAZIBXIZMBNTMAJCDBGXFURYZVWQPSCD3VDHMYA4TRS3V45TKL5WWCWLZJGL3O3E5ZV4ATZXW4SB4DJLYX2W5LCD463NVMESRXHGU7GPWC3OZ52TBSZVWNCCHLV74FF3X42RWEHORBFKVKO32KKWLMWICL5FHXUEAUU7DLZ7R7TMBK7WVVS3WBDRRYD2QA22CEXPI3DTY7JDOMGER4JRG54GG4GSVXV6ABW2A3EP2IIDQ3SSPF25JGU5EUCCQ4J6ZPZ4Z664WWOW5OSLBNGLDSIVWKEXWCXDLZI5OWDAMBXZDZNIDXXBMRK4DRDPSI; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIHCOAOXSWXVJGQ2SINZCR5RT55BV5YF3H32UFC4S; mba_muid=1700109613209731139267; universityLanguage=zh_CN; xue_userTypeCookieName50b60fba08fddfff319d0b5acc9d6eee=\"{\\\"1\\\":\\\"POP\\\"}\"; xue_userTypePageCookieName50b60fba08fddfff319d0b5acc9d6eee=1; qid_uid=63fbf91a-2193-4141-8127-0b5a9a4da60e; qid_fs=1703595716678; qid_ls=1703595716678; qid_ts=1703595716684; qid_vis=1; shshshfpb=AAsaEOaaMEpILfXnDP1RQdOco4vsSWBcDNClSTgAAAAA; __jdc=191429163; __jda=191429163.1700109613209731139267.1700109613.1703595081.1703597990.29; __jdb=191429163.4.1700109613209731139267|29.1703597990; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFOSH3SMBJJZ724KPLBMR6EIVFPXEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; _vender_new_=GI63BGTJFDBQ5VFYRAGXDIUTOUGBH4IELSA4HBAE7MB4S5HIL5QMHN2LMW7LKWD43YCKHJGXPJWTPRAEQ2QTFLJHKJUFHCXGGYIHCD7WSWY4PLU54NT3HGWB4MCDSKE4VJSCWBCJJ3C6Z2VI46TWP7ZJBWNTMPWIQ77NXK4VVKW6ABLW3LCTHZEYXQSC5L6SULQYZLAOLYQIKX2KPA4NEI5RHY4F2FAXI5CPTHP6BXFL757MRIFGERH2CQC2D3RAAFDYIVNI7B7NTLXWX5NEUT7IONYJQA2GVEUHKGHLAXO2JD6UI7C57LRQ4MAILLWECXYYZ2YLJ5HVL6HMAVKWPNRUQV7VQ4TJYKV2GUTU42R6YB2W5VZ6EM4KMCDPPN6Q7DONKSVFDJCTM5HGUPWAOVXNOPRDHCTAQ333PUDYCCF5H6RHZCCNDAPJ5WDJVY2XHWD7VVNICVT7PTKMSBW33L3BBSATV65XAXG72Z3QJ45MXA6IP2XQELXE7F47VC57UTM3EBWFRS7SWZCFQ5TPOT46JIQ6PNSYVA4453VSW4EAUWK6FRG3WAOQPSHG6BYFS7IG5ZCONS7EQAHSIUWPVDMBEDVBVCXW7ZSOG2U73QD4GGSJJ64QEOMY6A6GSGUVZUSD7QTIF7XR3TDIEYQPVXQMOE; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BTVDMR2XFT7UKF2SGMJ2HHVPJWUA",
            //             "Referer": "https://porder.shop.jd.com/order/orderlist/waitOverseasOut?t=1703856748544",
            //             "Referrer-Policy": "strict-origin-when-cross-origin"
            //         },
            //         "body": "{\"current\":1,\"pageSize\":10,\"sortName\":\"desc\",\"orderId\":\"\",\"skuName\":\"\",\"orderCreateDateRange\":[],\"orderCompleteDateRange\":[],\"receiverName\":\"\",\"receiverTel\":\"\",\"userPin\":\"\",\"skuId\":\"\",\"logiNo\":\"\",\"paymentType\":\"\",\"orderType\":\"\",\"orderSource\":\"\",\"deliveryType\":\"\",\"storeId\":\"\",\"huoHao\":\"\",\"orderStatusArray\":[],\"o2oStoreIds\":null,\"provinceIds\":[],\"orderTag\":null,\"selectedTabName\":\"waitOverseasOut\"}",
            //         "method": "POST"
            //     }).then(d => {
            //         return  d.json()
            //     }).catch(err => {
            //         console.log(err)
            //     });
            //     const result = {};
            //     const orderList = result.orderList;
            //     for await (const item of orderList) {
            //         const orderItems = item.orderItems;
            //         for (const order of orderItems) {
            //             const skuId = order.skuId
            //             const hasSkuInStop = this.stopListHasSku(skuId);
            //             if (!hasSkuInStop) {
            //                 const info = await this.queryOneBeiAnInfo(skuId)
            //                 if(!info) continue
            //                 const hasSkuInStop = this.stopListHasSku(info.skuId);
            //                 if (!hasSkuInStop && info && info.type == 0) {
            //                     await this.updateBeiAn(info, 1)
            //                 }
            //             }
            //         }
            //     }

            setTimeout(() => {
                this.getStopOrderList()
            },10000)
        } catch (e) {
            setTimeout(() => {
                this.getStopOrderList()
            },5000)
        }
        // const now = Date.now()
    }
    // 查询下一阶段订单列表
    async querySendOrder() {
        try {

            const body = {
                "body": "9F34F7916A540DAC947F8914ECF9DB4C4AA7C5D7C8255A98CFFBFFAFBFAB218A",
                "appId": "COCX0HBWR4BA7RDVDBIQ",
                "api": "dsm.order.bff.orderListBffService.queryOrderTabs",
                "v": "1.0"
            }

            const signer = new security.ParamsSign({
                appId: "0248a",
                preRequest: !1,
                debug: !1,
                onSign: function(t) {}
            })

            const signerRes = await signer.sign(body)
            const h5st = signerRes.h5st;

            const res = await fetch("https://sff.jd.com/api?v=1.0&appId=COCX0HBWR4BA7RDVDBIQ&api=dsm.order.bff.orderListBffService.queryOrderPage", {
                "headers": {

                    "cookie": this.JDCookies,
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "content-type": "application/json;charset=UTF-8",
                    // "dsm-eid": "jdd03IDPLNTQEGONBHCRXJY6YJFAW5UYMCQV4SRKMK4V33X2PPYOJUJ52X6LG5KXEU73E5EBWH25KBSH2ERJRWVRCD6TB4UAAAAM247NA4CQAAAAAC2M77PRKRHGJKUX",
                    "dsm-file-path": "lineation-price",
                    "dsm-lang": "zh_CN",
                    "dsm-platform": "pc",
                    "dsm-site": "",
                    "dsm-trace-id": "916c9587-b77e-4bcf-8002-3528f433deef",
                    "h5st":  h5st,     // "priority": "u=1, i",
                    // "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
                    // "sec-ch-ua-mobile": "?0",
                    // "sec-ch-ua-platform": "\"Windows\"",
                    // "sec-fetch-dest": "empty",
                    // "sec-fetch-mode": "cors",
                    // "sec-fetch-site": "same-site",
                    // "x-referer-page": "https://shop.jd.com/jdm/trade/orders/order-list",
                    // "x-requested-with": "XMLHttpRequest",
                    // "x-rp-client": "h5_1.0.0",
                    "Referer": "https://shop.jd.com/jdm/trade/orders/order-list?tabType=waitOverseasOut"
                },
                "body": "{\"request\":{\"source\":\"2000\",\"versionNo\":20240830,\"data\":{\"purchaseId\":null,\"consumerName\":null,\"consumerMobilePhone\":null,\"logiNo\":null,\"venderRemarkLevels\":[],\"remarkFlag\":null,\"userPin\":null,\"itemNum\":null,\"storeId\":null,\"orderTags\":[],\"orderStatusTypes\":[\"2\"],\"idSopShipmentType\":null,\"carrierCompany\":null,\"paymentType\":null,\"jdiOrderSignStatus\":null,\"orderSalType\":null,\"orderBusinessType\":null,\"ouId\":null,\"purchaseOrderNo\":null,\"firstOrderId\":null,\"tradeVendorId\":null,\"supplierId\":null,\"govSubActId\":null,\"companyId\":null,\"govSubsidyStatus\":null,\"orderId\":null,\"orderIds\":null,\"orderTab\":\"waitOverseasOut\",\"sortMode\":\"orderDateAsc\",\"current\":1,\"pageSize\":10,\"monthsFlag\":\"within6months\"}},\"accessContext\":{\"source\":\"web\"}}",
                "method": "POST"
            }).then(async d => {
                // try {
                return d.json()
                // } catch (e) {
                // return d.text()
                // }
            });

            const orderList = res.data.results || []
            for await (const item of orderList) {
                const diffTime = dayjs(dayjs()).diff(item.paymentConfirmTime, 'minutes')
                const orderItems = item.orderItems;
                // 异常订单不处理
                if (item.orderStatus === -4) {
                    continue;
                }
                for await (const order of orderItems) {
                    const skuId = order.skuId
                    const info = await this.queryOneBeiAnInfoJDL(skuId)
                    if(!info) continue;
                    info.orderId = item.orderId
                    info.paymentConfirmTime = item.paymentConfirmTime
                    order.mainSkuId = skuId
                    if (info.goodsClearanceMode == 3) {
                        const diffTime = dayjs(dayjs()).diff(item.paymentConfirmTime, 'minutes')
                        // 超过十分钟
                        if (diffTime >= 13 && diffTime <= 30) {
                            this.errOrderMap[item.orderId] = true
                            this.logger.info(item.orderId, diffTime, '超过十二分钟啦')
                            const hasOrder = await this.stopListHasSkuOtherOrder(order.mainSkuId, item.orderId)
                            // 如果其他订单不包含此sku
                            if (!hasOrder) {
                                const success = await this.updateJDLbeiAn(info, 1);
                                if (success) {
                                    this.tenMinutesNotify(info, 1, true)
                                }
                            }
                        }
                    }
                }
            }

            setTimeout(() => {
                this.querySendOrder()
            }, 1000 * 60 * 20)            // return  res
        } catch (e) {
            console.log('querySendOrder', 'error')
            setTimeout(() => {
                this.querySendOrder()
            }, 1000 * 60 * 20)
        }
    }
    // 更新/修改备案
    async updateBeiAn(info1, type = 1, time? = 0) {
        let info
        // let info = {
        //     "id": 16193866,
        //     "operationSign": 1,
        //     "rejectInfo": null,
        //     "operationSource": null,
        //     "status": 0,
        //     "statusStr": "已备案",
        //     "statusPending": null,
        //     "operation": 4,
        //     "operationStr": null,
        //     "skuId": "10084463187057",
        //     "upc": "03145891741057",
        //     "emgSkuId": null,
        //     "taxCommitmentsway": "0",
        //     "goodsName": "香奈儿（Chanel）可可小姐炫色口红coco bloom银黑细管唇膏送女友礼物",
        //     "goodsNameEn": "Chanel Coco Chanel Colorful Lipstick Coco Bloom Silver Black Tubular lipstick Gifts to Girlfriend",
        //     "brand": "香奈儿",
        //     "brandEn": "Chanel",
        //     "xingHao": "无",
        //     "spe": "3g/支",
        //     "unit": "支",
        //     "goodsSellerPrice": "389",
        //     "grossWeight": 0.004,
        //     "netWeight": 0.003,
        //     "actualWeight": null,
        //     "volume": "",
        //     "safeDays": "",
        //     "salesWebSite": "",
        //     "goodsPicture": "",
        //     "goodsData": "",
        //     "goodsAttach": "",
        //     "hsCode": "3304100091",
        //     "hgsbys": "0:香奈儿|1:13%|2:日用|3:盒装|4:香奈儿|5:58|6:3g/支|7:3g/支|8:3g/支",
        //     "function": "无",
        //     "use": "无",
        //     "composition": "无",
        //     "vatRate": 13,
        //     "taxRate": 0,
        //     "originCountry": "法国",
        //     "originArea": "法国；产品批次不同，产品产地以实物为准",
        //     "manufacturer": "法国；产品批次不同，产品产地以实物为准",
        //     "roduceAddress": "",
        //     "supplier": "",
        //     "note": "",
        //     "venderId": 13998334,
        //     "eclpCode": "EBU4418055094368",
        //     "eclpName": "INCOROYTRADELIMITED",
        //     "customModel": "zhiyou",
        //     "customModelName": "保税直邮",
        //     "customId": "guangzhou",
        //     "customName": "广州保税区",
        //     "customsRegionCode": "5141",
        //     "customsRegionName": null,
        //     "ccProvider": "010021",
        //     "venderName": "INCOROYTRADELIMITED个人护理海外专营店",
        //     "ccProviderName": "VIE伟世博",
        //     "phone": "",
        //     "email": "1029883657@qq.com",
        //     "sellerRecord": "10084463187057",
        //     "customRecord": "09010290",
        //     "qiRecord": "09010290",
        //     "taxNumberPost": "09010290",
        //     "postRate": 10,
        //     "country": "305",
        //     "qiCountry": "305",
        //     "measurement": "012",
        //     "qiMeasurement": "012",
        //     "isTaxFloat": 0,
        //     "legalUnit1": "035",
        //     "legalAmount1": "0.00300",
        //     "legalUnit2": "011",
        //     "legalAmount2": "1.00000",
        //     "gno": null,
        //     "delivery": "中国香港",
        //     "dutiablePrice": null,
        //     "ext1": null,
        //     "ext2": null,width: 64px;
        //     height: 22px;
        //     "operator": "13998334",
        //     "created": 1702006684000,
        //     "modified": 1702986383000,
        //     "modifiedMap": null,
        //     "clearType": null,
        //     "skuType": null,
        //     "type": 0,
        //     "mainSkuId": null,
        //     "vsp": null,
        //     "mfnTariff": "5",
        //     "penaltyTariff": "13",
        //     "isPlantPackage": null
        // }
        // "body":"goodsPicture=&goodsData=&goodsAttach=&id=16193797&customId=guangzhou&customsRegionCode=5141&ccProviderName=VIE%E4%BC%9F%E4%B8%96%E5%8D%9A&customModel=zhiyou&venderName=chaojie%E4%B8%AA%E4%BA%BA%E6%8A%A4%E7%90%86%E6%B5%B7%E5%A4%96%E4%B8%93%E8%90%A5%E5%BA%97&venderId=13942040&eclpCode=EBU4418055093551&skuId=10089822950614&type=1&taxCommitmentsway=0&upc=0697291997310924&emgSkuId=&goodsName=Lee%E7%89%9B%E4%BB%94%E8%A3%A4&goodsNameEn=lee+jeans&brand=%E6%97%A0&brandEn=Lee&xingHao=%E6%97%A0&spe=1%2F%E6%9D%A1&unit=%E6%9D%A1&goodsSellerPrice=317&grossWeight=0.04&netWeight=0.03&actualWeight=&volume=&safeDays=1359&salesWebSite=&hsCode=6203429090&hgsbys=Lee+9+%E6%9C%BA%E7%BB%87+%E9%95%BF%E8%A3%A4+%E5%A5%B3%E5%BC%8F+%E6%A3%89+Lee+0697291997310924&function=%E6%97%A0&use=%E6%97%A0&composition=%E6%97%A0&vatRate=13&taxRate=0&originCountry=%E6%B3%95%E5%9B%BD&originArea=%E6%B3%95%E5%9B%BD%EF%BC%9B%E4%BA%A7%E5%93%81%E6%89%B9%E6%AC%A1%E4%B8%8D%E5%90%8C%EF%BC%8C%E4%BA%A7%E5%93%81%E4%BA%A7%E5%9C%B0%E4%BB%A5%E5%AE%9E%E7%89%A9%E4%B8%BA%E5%87%86&manufacturer=%E6%B3%95%E5%9B%BD%EF%BC%9B%E4%BA%A7%E5%93%81%E6%89%B9%E6%AC%A1%E4%B8%8D%E5%90%8C%EF%BC%8C%E4%BA%A7%E5%93%81%E4%BA%A7%E5%9C%B0%E4%BB%A5%E5%AE%9E%E7%89%A9%E4%B8%BA%E5%87%86&roduceAddress=&supplier=&note=&mfnTariff=5&penaltyTariff=13&phone=134239015485&email=1608586943%40qq.com&eclpName=ChaojieTradeLimited&ccProvider=010021","method":"POST","mode":"cors"});fetch("https://shop-hk.jd.com/popRecording/recorded/changeRecording.do", {"credentials":"include","headers":{"accept":"*/*","accept-language":"zh-CN,zh;q=0.9","content-type":"application/x-www-form-urlencoded; charset=UTF-8","sec-fetch-mode":"cors","sec-fetch-site":"same-origin","x-requested-with":"XMLHttpRequest"},"referrer":"https://shop-hk.jd.com/popRecording/recorded/queryById.do?recorded=true&id=16193797","referrerPolicy":"no-referrer-when-downgrade","body":"goodsPicture=&goodsData=&goodsAttach=&id=16193797&customId=guangzhou&customsRegionCode=5141&ccProviderName=VIE%E4%BC%9F%E4%B8%96%E5%8D%9A&customModel=zhiyou&venderName=chaojie%E4%B8%AA%E4%BA%BA%E6%8A%A4%E7%90%86%E6%B5%B7%E5%A4%96%E4%B8%93%E8%90%A5%E5%BA%97&venderId=13942040&eclpCode=EBU4418055093551&skuId=10089822950614&type=1&taxCommitmentsway=0&upc=0697291997310924&emgSkuId=&goodsName=Lee%E7%89%9B%E4%BB%94%E8%A3%A4&goodsNameEn=lee+jeans&brand=%E6%97%A0&brandEn=Lee&xingHao=%E6%97%A0&spe=1%2F%E6%9D%A1&unit=%E6%9D%A1&goodsSellerPrice=317&grossWeight=0.04&netWeight=0.03&actualWeight=&volume=&safeDays=1359&salesWebSite=&hsCode=6203429090&hgsbys=Lee+9+%E6%9C%BA%E7%BB%87+%E9%95%BF%E8%A3%A4+%E5%A5%B3%E5%BC%8F+%E6%A3%89+Lee+0697291997310924&function=%E6%97%A0&use=%E6%97%A0&composition=%E6%97%A0&vatRate=13&taxRate=0&originCountry=%E6%B3%95%E5%9B%BD&originArea=%E6%B3%95%E5%9B%BD%EF%BC%9B%E4%BA%A7%E5%93%81%E6%89%B9%E6%AC%A1%E4%B8%8D%E5%90%8C%EF%BC%8C%E4%BA%A7%E5%93%81%E4%BA%A7%E5%9C%B0%E4%BB%A5%E5%AE%9E%E7%89%A9%E4%B8%BA%E5%87%86&manufacturer=%E6%B3%95%E5%9B%BD%EF%BC%9B%E4%BA%A7%E5%93%81%E6%89%B9%E6%AC%A1%E4%B8%8D%E5%90%8C%EF%BC%8C%E4%BA%A7%E5%93%81%E4%BA%A7%E5%9C%B0%E4%BB%A5%E5%AE%9E%E7%89%A9%E4%B8%BA%E5%87%86&roduceAddress=&supplier=&note=&mfnTariff=5&penaltyTariff=13&phone=134239015485&email=1608586943%40qq.com&eclpName=ChaojieTradeLimited&ccProvider=010021","method":"POST","mode":"cors"});
        info = {...info1}
        for (const k in info) {
            if (info[k] == null || info[k] == "null") {
                info[k] = ''
            } else {
                info[k] = encodeURIComponent(info[k])
            }
        }

        const body = `goodsPicture=${info.goodsPicture}&goodsData=${info.goodsData}&goodsAttach=${info.goodsAttach}&id=${info.id}&customId=${info.customId}&customsRegionCode=${info.customsRegionCode}&ccProviderName=${info.ccProviderName}&customModel=${info.customModel}&venderName=${info.venderName}&venderId=${info.venderId}&eclpCode=${info.eclpCode}&skuId=${info.skuId}&type=${type}&taxCommitmentsway=${info.taxCommitmentsway}&upc=${info.upc}&emgSkuId=${info.emgSkuId}&goodsName=${info.goodsName}&goodsNameEn=${info.goodsNameEn}&brand=${info.brand}&brandEn=${info.brandEn}&xingHao=${info.xingHao}&spe=${info.spe}&unit=${info.unit}&goodsSellerPrice=${info.goodsSellerPrice}&grossWeight=${info.grossWeight}&netWeight=${info.netWeight}&actualWeight=${info.actualWeight != 'null'? info.actualWeight: ''}&volume=${info.volume}&safeDays=${info.safeDays}&salesWebSite=${info.salesWebSite}&hsCode=${info.hsCode}&hgsbys=${info.hgsbys}&function=${info.function}&use=${info.use}&composition=${info.composition}&vatRate=${info.vatRate}&taxRate=${info.taxRate}&originCountry=${info.originCountry}&originArea=${info.originArea}&manufacturer=${info.manufacturer}&roduceAddress=${info.roduceAddress}&supplier=${info.supplier}&note=${info.note}&mfnTariff=${info.mfnTariff}&penaltyTariff=${info.penaltyTariff}&phone=${info.phone}&email=${info.email}&eclpName=${info.eclpName}&ccProvider=${info.ccProvider}&delivery=${info.delivery}`

        const res = await fetch("https://shop-hk.jd.com/popRecording/recorded/changeRecording.do", {
            "headers": {
                "accept": "*/*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "Referer": `https://shop-hk.jd.com/popRecording/recorded/queryById.do?recorded=true&id=${info.id}`,
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "cookie": this.JDCookies
            },
            "body": body,
            "method": "POST"
        }).then(d => d.json());
        if (res.result.success) {
            this.logger.info(`备案状态修改成功; 商品：${info1.goodsName}; skuId: ${info.skuId}`, type, this.shopInfo.name);
            if (time > 0) {
                this.logger.info('重试修改成功， 第', time, '次修改备案', info.skuId, this.shopInfo.name)
                this.reTrySuccess(info1, type, {...res.result})
            }
        } else {
            this.logger.info(`备案状态修改失败; 商品：${info1.goodsName}; skuId: ${info.skuId}`, JSON.stringify(res.result), type, this.shopInfo.name);
            this.eidtBeianFail({txt: `备案状态修改失败; 商品：${info1.goodsName}; skuId: ${info.skuId}`, ...res.result}, type)
            if (time > 0) {
                this.logger.info(`备案状态修改失败; 商品：${info1.goodsName}; skuId: ${info.skuId}`, JSON.stringify(res.result), type, this.shopInfo.name);
            }
            if (time <= 2 && !res.result.errorMsg.includes('并发')) {
                this.logger.info('尝试第', time + 1, '次修改备案', info.skuId, type, this.shopInfo.name)
                setTimeout(() => this.updateBeiAn(info1, type, time + 1), 5000)
            }
        }
        return res.result.success;
    }

    async updateJDLbeiAn(info, type) {
        const params = {
            "id": info.id,
            "status":1,
            "image":"",
            "remark":"",
            "sellerGoodsSign": info.sellerGoodsSign,
            "barcode": info.barcode,
            "goodsClearanceMode": type ?  2: 3,
            "globalPurchaseShippingMode": '3'
        }
        const res = await fetch("https://api.jdl.com/goodsApi/editShopGoods", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                "appparams": "{\"appid\":\"c2c_textbook\",\"ticket_type\":\"m\"}",
                "cache-control": "no-cache",
                "clientinfo": "{\"appName\":\"eclp_business_nirvana\",\"client\":\"pc\"}",
                "content-type": "application/json;charset=utf-8",
                "lop-dn": "bw.jdl.com",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-requested-with": "XMLHttpRequest",
                "cookie": this.JDLCookies,
                "Referer": "https://scsw.jdl.com/"
            },
            "body": JSON.stringify(
                [
                    {
                        "shopGoods":
                            {
                                ...params
                            }
                    }
                ]
            ),

            "method": "POST"
        }).then(res => {
            return res.json()
        })

        this.logger.info(`备案状态修改成功; 商品：${info.goodsName}; skuId: ${info.isvGoodsNo}`, type, this.shopInfo.name);

        return !!res.success
    }
    // 判断暂停列表存在sku
    stopListHasSku(skuId) {
        for (const item of this.stopList) {
            const orderItems = item.orderItems;
            if (item.orderStatus === -4 || !item.isPhoneOrder) {
                continue;
            }
            const hasSku = orderItems.some(j => j.skuId == skuId || j.mainSkuId == skuId);
            if(hasSku) {
                return true
            }
        }
        return  false
    }
    // 判断暂停列表存在其他订单有当前订单sku
    stopListHasSkuOtherOrder(skuId, orderId) {
        for (const item of this.stopList.filter(item => item.orderId !== orderId)) {
            const orderItems = item.orderItems;
            const hasSku = orderItems.some(j => j.skuId == skuId || j.mainSkuId == skuId);
            const diffTime = dayjs(dayjs()).diff(item.paymentConfirmTime, 'minutes')
            if (diffTime <= 13 && hasSku) {
                return true
            }
        }
        return  false
    }
    // 获取订单备注
    async getOrderRemark(orderIds) {
        try {
            const result = await fetch(`https://porder.shop.jd.com/order/global/getVenderRemarkMap?orderIds=${orderIds}`, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "sgm-context": "383111415140013900;383111415140013900",
                    // "cookie": "__jdv=56585130|direct|-|none|-|1703600265575; pinId=Mk_A6Nbv7MenkDneLmJDcA; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; __jdu=17036002655721718781778; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMWCNULEAAAAAACOUKVNVUZZMDCUX; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; language=zh_CN; smb_track=02DE91E68A90440681C0768B8C50A8BD; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; shshshfpb=AAiuCuLWMEpILfXnDP1RQdOco4vsSWBcDNClSUAAAAAA; ceshi3.com=000; thor=6901B38FCABE2222F893FE4DA6A41AD295C4686446F3C80270DAE2F87F6FE9CD985FEE0548C72F11D75CB39996400BCB49F4D4921EA5F02E6E1052CA928689E500B2F78205C2E8E3662AFB0D9180F6E1E958D23FF533119A80288DDE04311FC9A27F36D987A8A01EF398B7BFC0A9131B6DB49F25381C09C19689B594980A4DE840DF86AF37D4DC612DA9C1B567C433C2; TrackID=13dfsVJnaAWq4FWTkMv6BAd6CtfiuKYWSuKhkd35WiTVkd-nLOGNTixZ0mhTcuDcv; flash=2_MSgbCeQeEs8HzyvVhFog67VnwQGd4fgAEzY_aWBgmyQPtTKiFWOWwBXDa7fh-Ol6b6wjq626uMal5RaZJqeJGcPQm9pw9u8S7ggL2A4h_ZP*; _vender_=TNK3O6PALVQGGMI642LJKJZPNN56IZEONGC7GL4VVDUXDFCCPPZQLPMTKJILMAPLZWB2RGOWODK2TOG3DDTHQXXNKYALDGQXK7G2A7QXSDNOYW6CAGCPRLP5Z3NIZCHA4EL275ID7OHDWKJCG3IKWJEKBLKXNRBLHPI43M6V7YP2SC4RQRZXNIFA6PUCI7UIJYQMBTNIZIILXODG4AMBHU7KVXB7C3FVYYIDB6CNUJRIY3OXKRFOLJ5NJPZVGTXO3MGRB5OZSQZPUXK7OTV5QTIP7NLKLLY3WYJPC4VDZHQGTTOSIIB5LHCFEU46QULB2S23NQFGX3NFYRWZZ4RSVT5V5XCLCR6ORQNFC6Z6LN7AOMH5WXHCJZAENA6SMDSKCIYM3B25NWIYPAC4U3MBP2BDLJVVANWICDN6T6NZ5EU4TAACUTVVOVRLM6JTGYD7NX4IWYHATFWDNHVJJUNUDUHMVNYQT2FAZY4YIO2ZIMJX5UUINOJOE5UGJGNEXRP3LEVEOKPEKYZQTGIEMICOMRE5O6LV2SNJ2JIEFB6S7UW65Q4TE6WWMAOJYZN26OZVDWM5N6CVR2ER6YG3W4SVEC3KWSVM7MJTUZNQVYDSJGIVLO3MU25PV33A5NUN7KDRRNKGCEK4V6MSOXETOVWA664XIMTDRCC4ZMMDMWXRXDHQ7WUHLISPYU7RSWJYVDGDHNBIGEPD7YSQU; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIHCOAOXSWXVJGQ7FEQWZ4SOEUWOUTSV4T76G23UJ; __jda=191429163.17036002655721718781778.1703600266.1703826608.1703855791.17; __jdc=191429163; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFL3C6PMEP6KQXOK5XGBTC2ZQEENEQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BTOTV563G5N5XIXZOTJ5B7MAKMPA; _vender_new_=GI63BGTJFDBQ5VFYRAGXDIUTOUGBH4IELSA4HBAE7MB4S5HIL5QMHN2LMW7LKWD43YCKHJGXPJWTPRAEQ2QTFLJHKJUFHCXGGYIHCD7HNPX7P53NJYJBLEQQWIG3SGOKANYJB4AHZAIO2L2TATYNMMFW2T7ATNFOZD4PRFANVIODWIGDFMXKRJ4I6UJ43SNLVNG3LECZBJRH7CNAV24UOKLAU3DX3TBTR5D36HX3PK3QE6SIHOTS432W6FB24YGMPFIXXWGFUD5N4OM5BGIAMJJTSTBINZ7M65V2STDONSMADD2X7KWKLUZTWX3YXOD6XLJPSELOEX5KUWAFW3D57BRDTZRHHVY7S2ZFM6N22L4RC3RF7KVFQBNWY7PYMI465UJRVZ3CRTCHLG24ZAN4N7GAGWVI4ZDKBF7ZYJAPU6GHUX2BV7IT2ELA7PH3JOOEANSFTFAJTXVVKULEH4XATPV477XMOLCIYERGKGFXTPLTIGOEN5JDFRA2366QQO5FV2AT2XABQCAT4PRSM6IW44RRTC3OBHJXEAXD2I4FDTV2FPOYRS5HCDD4DBLC7FPXYSMCF5FO7EVNPE3L4QREKVCPKBOC6ZHI7S3X65AMSYBVNGHEX7FKY7SJY7KMDWIM; __jdb=191429163.27.17036002655721718781778|17.1703855791",
                    "cookie": this.JDCookies,
                    "Referer": "https://porder.shop.jd.com/order/orderlist/suspend?t=1703858255087",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            }).then(d => d.json());
            return result
        } catch (e) {
            return  {}
        }
    }
    // 获取店铺信息
    async getShopInfo() {
        try {
            const result = await fetch("https://i.shop.jd.com/optional/topMenu/overview?callback=jsonpCB_1703864564162_0hr4lix2mzgt&appName=jdos_porder-shop&menuId=1500&systemId=1", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "script",
                    "sec-fetch-mode": "no-cors",
                    "sec-fetch-site": "same-site",
                    "cookie": this.JDCookies,
                    // "cookie": "__jdv=56585130|direct|-|none|-|1703600265575; pinId=Mk_A6Nbv7MenkDneLmJDcA; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; __jdu=17036002655721718781778; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMWCNULEAAAAAACOUKVNVUZZMDCUX; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; language=zh_CN; smb_track=02DE91E68A90440681C0768B8C50A8BD; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; shshshfpb=AAiuCuLWMEpILfXnDP1RQdOco4vsSWBcDNClSUAAAAAA; QRCodeKEY=FC836460F1597075BD11887C4243E4A30E91A73D1DBCC75EEA63772BECCE94D89D2938D1818DA81A6C2501F503C01641; AESKEY=0EF530754B66CB9E; UIDKEY=102388463689062392; flash=2_IH1En_p4pwB7anzpN4g9YeEy6Cq8ndW6Gl4ZpRhSmLrJ3vp8VvF25G6kyptLLnI-5nsJ-ZlwdYkoPIncHUxs9ZmzBuYtJ21Mi-ReZGcdKmN*; TrackID=1tQ2ZaAoH6gQDGLIezMKIcWKp1ZonH3gP7yCOW311TyIqCWAL-VXhYZmVSowlStoC; thor=6901B38FCABE2222F893FE4DA6A41AD2EFBE1AE6D506095B2FAEDCEB50D6317CF4ED710E59A5BDC07B494EF3DEDA3AE77FF31FAE97C6939F67A9A90C4BB9533D6895B99957A61581CA0D1D092A6614CD5F6CE1A5E8216EFA2E7DC597CC1C9E9BDB25B69C9A9E8864B98C566DF2DFC030725042F0FEA51948BF9FA21D5D465EFDDC06968E1D3CA878812E3F9037676FEC; ceshi3.com=000; _vender_=TNK3O6PALVQGGMI642LJKJZPNN56IZEONGC7GL4VVDUXDFCCPPZQLPMTKJILMAPLXETACDXPW6K7OJOQKR2XAEWZEUALDGQXK7G2A7QXSDNOYW6CAGCPRLP5Z3NIZCHA4EL275ID7OHDWKJCG3IKWJEKBLKXNRBLHPI43M6V7YP2SC4RQRZXNIFA6PUCI7UIJYQMBTNIZIILXODG4AMBHU7KVXB7C3FVYYIDB6CNUJRIY3OXKRFOLJ5NJPZVGTXO3MGRB5OZSQZPUXK7OTV5QTIP7NLKLLY3WYJPC4VDZHQGTTOSIIB5LHCFEU46QULB2S23NQFGX3NFYRWZZ4RSVT5V5XCLCR6ORQNFC6Z6LN7AOMH5WXHCJZAENA6SMDSKCIYM3B25NWIYPAC4U3MBP2BDLJVVANWICDN6T6NZ5EU4TAACUTVVOVRLM6JTGYD7NX4IWYHATFWDNHVJJUNUDUHMVNYQT2FAZY4YIO2ZIMJX5UUINOJOE5UGJGNEXRP3LEVEOKPEKYZQTGIEMICOMRE5O6LV2SNJ2JIEFB6S7UW65Q4TE6WWMAOJYZN26OZVDWM5N6CVR2ER6YG3W4SVEC3KWSVM7MJTUZNQVYDSJGIVLO3MU25PV33A5NUN7KDRRNKGCEK4V6MSOXETOVWA664XIMTDRCC4ZMMDMWXRXDHQ7WUHLISPYU7RSWJYVDGDHNBIGEPD7YSQU; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIHCOAOXSWXVJGQ7OXEFJWRMO6T445JWTKI3BCRCC; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFM7GAY55D5OEZS72URFS7BAH2G5EQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BTFZDZIGJ4U53CZAYTLL4JRDKKAA; _vender_new_=GI63BGTJFDBQ5VFYRAGXDIUTOUGBH4IELSA4HBAE7MB4S5HIL5QMHN2LMW7LKWD43YCKHJGXPJWTPRAEQ2QTFLJHKJUFHCXGGYIHCD7HNPX7P53NJYJBLEQQWIG3SGOKANYJB4AHZAIO2L2TATYNMMFW2T7ATNFOZD4PRFANVIODWIGDFMXKRJ4I6UJ43SNLVNG3LECZBJRH7CNAV24UOKLAU3DX3TBTR5D36HX3PK3QE6SIHOTS432W6FB24YGMPFIXXWGFUD5N4OM5BGIAMJJTSTBINZ7M65V2STDONSMADD2X7KWKLUZTWX3YXOD6XLJPSELOEX5KVPUQJPFLEYACZTDLSK7COP6VUHF22L4RC3RF7KVL5ECLZKZGAAWMEI5HBNI3AHLGZG24ZAN4N7GAGWVI4ZDKBF7ZYJAPU6GHUX2BV7IT2ELA7PH3JOOEANSFTFAJTXVVKULEH4XATPV477XMOLCIYERGKGFXTPLTIGOEN5JDFRA2366QQO5FV2AT2XABQCAT4PRSM6IW44RRTC3OBHJXEAXD2I4FDTV2FPOYRS5HCDD4DBLC7FPXYSMCF5FO7EVNPE3L4QREKVCPKBOC6ZHI7S3X65CN5NLZUA4FQV26AUOUUBOMBMBA; __jda=191429163.17036002655721718781778.1703600266.1703826608.1703855791.17; __jdc=191429163; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU; __jdb=191429163.72.17036002655721718781778|17.1703855791",
                    "Referer": "https://porder.shop.jd.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            }).then(d => d.text());

            var reg = /^\w+\(({[^()]+})\)$/
            var matches = result.match(reg)
            if(matches){
                const ret = JSON.parse(matches[1])
                // matches[0]为整个字符串
                // matches[1]为匹配到的分组
                if (ret.shopSimpleVO) {
                    if (ret.shopSimpleVO.name) {
                        this.shopInfo = ret.shopSimpleVO
                    }
                }
                return ret.shopSimpleVO
            }
            return {}
        } catch (e) {
            return {}
        }
    }
    // 获取订单详情
    async getOrderDetail(orderId) {
        try {
            const res = await fetch(`https://neworder.shop.jd.com/order/orderDetail?orderId=${orderId}`, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "same-site",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "cookies": this.JDCookies,
                    // "cookie": "__jdv=56585130|direct|-|none|-|1703600265575; __jdu=17036002655721718781778; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMWCNULEAAAAAACOUKVNVUZZMDCUX; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; language=zh_CN; smb_track=02DE91E68A90440681C0768B8C50A8BD; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; pinId=0KP1G7s94DvJgNbIL3GMMg; pin=chaojie123cba; flash=2_WwND1-2U3YmZPYtd0E8mjfXBlx0Vg-YOe-CRdE8JnSEFqQ__A0kAq8-AuiZs83SI4YC4wiOUeNwGL4-vGafUyvVoM-P9K6vwsJ6vqtPd4s5*; unick=chaojie123cba; TrackID=13j-UcmSCVbez0BTynxOwH8X5p7betU6g23F95HYSr58nMFHSndrROOBQlN9rAkhM; ceshi3.com=000; _tp=Q3FSFtyD7FxyycX8ItQ1bA%3D%3D; thor=93FDA29B995A736AF476C3F3AC591BD32AF17612EC7FF984F9C27C5DECF2F488A3B643551841BEA1FBF9C5A52C2D262FD07E6252E83AC54C3592A8974D797D87BCCE1301D604484216D878CE4A8FECA6855429372741CCC37CB97BBCFA4EAD9EE4B25530D4FB50765F98D7D9385F9FF0C7A5596125D9062810853A20B8716CA8C163BFC43B7FE1A2F18F0FD2D87E86E6; _pst=chaojie123cba; _vender_=TNK3O6PALVQGH5ODXNPNG5HY7LEDNG5YAJGTU656HUFHJHL5SD2U63Q5RT6R2G3C55MKY5AWNVJF76BKARFB3ZAVGEXA5236RRQGSDOD2JMS62JXOWFNNDJ7EQS5NOGAKOXIMSVFZKPXQKDVUCWMYKS7CHKXNRBLHPI43M6V7YP2SC4RQRZT4SD6QWNUT5JXJYQMBTNIZIILXYYY2IM6F4YKZ57H7AQYKCEUR7VI3HQMHZSSHJ7QSZ4Z3GIOQQEIHZNX4BZQ7W244ZAYLAW7T2BAXVZ2ZZNDCTUEPTURCYAEM2D7XTRX4SYWXOI6NMRAHSNU57DW3IYEMPLYPTGN3RVTTACWDVX54BZ2X6ACFCBTFZKSRPB224EYBQTYNNHCEY4IQXGLDA3FUBE7EW2XDESAZ6JGI2TB3WPNQWTPS3YU4KGQYQSWZZX3U4GXD3M7JHHNWOPEQVT5GUSQO67RXUTBDQBGITG4RF4WVI33BBMVTQISM43BVK7IEHD6SHCXDTG2FE3KRTJWXDXQTIWMCCYW2C6PVLYJX2D5T55QBOXE4AY2M3O3TWCVBKYU3RA47QPSRRLJXT4CRRKF7S44UVMPZ7N3ERSBS3HPSACOW2JKH4BCUBG6HZVDCEX4QKDZGBD6M77N4GF7RVXLUSYLJSY4SFNSRF5QVY26KHLVQYDAN6I6LKA55YLEKXA4I34S; b-sec=VVCFY6DARKDGCPUIK4NBMFBHJZT3SOGRQH5THX3F4VDUBZDWDRWY7TMNQN7X7NMZ; shshshfpb=AAtGeY86MEpILfXnDP1RQdOco4vsSWBcDNClSWQAAAAA; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC4Z5CRLK5VT4DM4VBYYAICQITNQTCNE6YVKRXISVCUQWJ3F54LXISUVH46IGQS4XX2SG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD5RHBB4O3QU4OSWDXWLUPI6V33M5R7ZRO3CPUX7ZTHMF5OW4GTXSZ25F7SNG6QGSVVLLH6RCWLTI3MN7FRWSCISIZTBNT2LHU6H52J3V5VIZNDCOIP6WG2YAIELLNZNMASCK2XFRV3V3UEAJTIRVXNTBFXBQ; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BSDDYIA6TFMXVYLRPAFUXG4NHWDA; _vender_new_=GI63BGTJFDBQ5RB3M2OPP4RQOR7WQT7FL74543GBP5ZT234S3YC4EOR55KVOGWLALCLMZKGX3YNMDYQCA5LUPN34AMBNL6EBMUF7ST24ZF5YF6HUV5CEIE74GHGV2IKAFTZZMFHXFDGDGYGEMOCATRNMRKC5EXHA3LCBI4RFQNXJKAKUEWPNCOOLKSJ2GKUHBY7GQ5A3SQLCR4Z2FILXUEU4HCKFQNC66F6QTEXWXGFQBTEBEE2GJEQL6L3KWSIN33THD2ZFEUSMXWQ3KMHRTYNESRKFPOR42WQALLSYDRFE473J34KXCY2EFB22FYMQYR6ORFMDSJCFDDZYP777O5DJ4MCOH6557AEZYZWEPTUJLA4SIRIY6OD7773XI2PD3CLH4ERXIPHOYJZZGEHRW37ZW4QOGUXRWHJEFGFL4LKXHR5UW3TAXZO3VXEQXFLVNE3NSPYQ4FSQPA3ILE45O7DOJN5DWK42FW2XZG5MFVW5W5C6AB4G3BAF77KAJOBXTHBLFMBZDOOXF6OPH346RQDCKHWPV5PMVTHXCQA3M2IYA3EP72BCIYJ2CT4FMIG3YER2UYGBXAVGDBWVY3WJPFPDYXCHZ2EVQOJEIUMPHB77753UNHRYEHSJIANFXEK3; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU; __jda=34491710.17036002655721718781778.1703600266.1704269215.1704274807.32; __jdb=34491710.5.17036002655721718781778|32.1704274807; __jdc=34491710",
                    "Referer": "https://porder.shop.jd.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            }).then(d => d.text());

            return res;
        } catch (e) {
            console.log(e)
        }
    }
    // 检查登录
    async checkLogin() {
        try {
            const res = await fetch("https://porder.shop.jd.com/order/orderlist", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "content-type": "application/json;charset=UTF-8",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    cookie: this.JDCookies,
                    // "cookie": "shshshfpa=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; shshshfpx=44e010ae-b994-5292-d604-85a49c6a806d-1611905242; __jdu=1700109613209731139267; __jdv=76161171|direct|-|none|-|1703342303715; areaId=15; ipLoc-djd=15-1213-0-0; PCSYCityID=CN_330000_330100_0; _tp=WWkrE5q1uaY3bnuvPN7mC0Jy7Qj98SqryFRfDnmAGXBfj3EZkqYEdCCNPQpAbAri; pinId=Mk_A6Nbv7MenkDneLmJDcA; _pst=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; unick=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; pin=%E5%86%B0%E5%86%B0%E5%B0%8F%E5%BA%97111; user-key=8d21ce0f-8695-4c7e-835e-a2fc50c50830; corpBehavior=1; 3AB9D23F7A4B3CSS=jdd03OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLUAAAAMMUOJ4NGQAAAAADSDP22VJIM6GNMX; cn=1; smb_track=E36463B1BA744C75803892A14AFFF0A9; language=zh_CN; __USE_NEW_PAGEFRAME__=false; __USE_NEW_PAGEFRAME_VERSION__=v9; chat.jd.com=20170206; TrackID=1eKDqnXkB0cCNjshjVGs7kkRuDN5_Qha45E8IfuM0IyGXJFm6xN_gwllHHQ4ocw_w; ceshi3.com=000; flash=2_3Vf3TU1oOHS1E3iLb5mioPPwrQ-L6JvcRzupMoYFEjuZidy3aoJAiw6EkDNkfqvzrWbw1ymxXXb9Xid3ms_lM599f059_YoIpxgLpMYfYkp*; thor=6901B38FCABE2222F893FE4DA6A41AD28B2FF5A6B6F54A76F64CA788BC1404FA432D8014F1CA9DE928F379133D2969B553703BE185EF1FD6649B263A5EA1B9472C6558C7D6FE5CD726F9BF383E4E4570D054429AC8A045F0B45922B76DF266888E87D583C7DF1F76D301771EF3F104D797CDE992C8421711685C97D73408EC5147BF2E12DEF84BD9DEDF129C6C483F90; _vender_=TNK3O6PALVQGGMI642LJKJZPNN56IZEONGC7GL4VVDUXDFCCPPZQLPMTKJILMAPLCVF5BI7BM6KSTB3TNH3PMYY5YAALDGQXK7G2A7QXSDNOYW6CAGCLDWEQCPKGC3KUGVRB646PDVLYUQI3BDJ566XYIWJK3BINEVNTZU4XPHS7MGPM3IRXP3KQCYUEFTMPHRWL6CUN7T6NJ73NKFWGRSQYITLV2HHO3WE5JGLOWXRT3TAPTQSGGNICGAJHKSRTNTSC54R6Q4CXGZB2XWZYYTWTKUI23OXFVXEK3PE6BHKXEXJ5ZBTE7AQ4DRO7SJ75N23E6IGHEDQCT72I5345J2I36SSU434I7P6CY7EB2AEQ7LYOCV7OPGUYC4YKELPF3MGRB5OZSQZPV5DBDCN2OVVT3WHFGAZIBXIZMBNTMAJCDBGXFURYZVWQPSCD3VDHMYA4TRS3V45TKL5WWCWLZJGL3O3E5ZV4ATZXW4SB4DJLYX2W5LCD463NVMESRXHGU7GPWC3OZ52TBSZVWNCCHLV74FF3X42RWEHORBFKVKO32KKWLMWICL5FHXUEAUU7DLZ7R7TMBK7WVVS3WBDRRYD2QA22CEXPI3DTY7JDOMGER4JRG54GG4GSVXV6ABW2A3EP2IIDQ3SSPF25JGU5EUCCQ4J6ZPZ4Z664WWOW5OSLBNGLDSIVWKEXWCXDLZI5OWDAMBXZDZNIDXXBMRK4DRDPSI; b-sec=H7A3ZVYOXG5O6CIG7HQL4J7UIHCOAOXSWXVJGQ2SINZCR5RT55BV5YF3H32UFC4S; mba_muid=1700109613209731139267; universityLanguage=zh_CN; xue_userTypeCookieName50b60fba08fddfff319d0b5acc9d6eee=\"{\\\"1\\\":\\\"POP\\\"}\"; xue_userTypePageCookieName50b60fba08fddfff319d0b5acc9d6eee=1; qid_uid=63fbf91a-2193-4141-8127-0b5a9a4da60e; qid_fs=1703595716678; qid_ls=1703595716678; qid_ts=1703595716684; qid_vis=1; qid_sid=63fbf91a-2193-4141-8127-0b5a9a4da60e-1; qid_seq=3; _base_=YKH2KDFHMOZBLCUV7NSRBWQUJPBI7JIMU5R3EFJ5UDHJ5LCU7R2NILKK5UJ6GLA2RGYT464UKXAI4Z6HPCTN4UQM3WHVQ4ENFP57OC675CBWSP3REU42YTAQTNJUDXURTCNE6YVKRXISUFXTDU7V3U7QL2S3GKYL2ZCNGXSSG4SOQWCP5WPWO6EFS7HEHMRWVKBRVHB33TFD46QKR5DC3ZOXYJJSMQ7LPFV7Q42XNFW3B6USLKSP4DOKX736ZCQKMJCPUFAFUHXCAGBCJZTXPG55TUBDTGHQHRURVFOSH3SMBJJZ724NH6RPUBSC6X23EQXZ6XDSAY7EABH3APEXJ2C7MDIZP2K6O4UWVEXBLKE677BPFI2A; _vender_new_=GI63BGTJFDBQ5VFYRAGXDIUTOUGBH4IELSA4HBAE7MB4S5HIL5QMHN2LMW7LKWD43YCKHJGXPJWTPRAEQ2QTFLJHKJUFHCXGGYIHCD7WSWY4PLU54NT3HGWB4MCDSKE4VJSCWBCJJ3C6Z2VI46TWP7ZJBWNTMPWIQ77NXK4VVKW6ABLW3LCTHZEYXQSC5L6SULQYZLAOLYQIKX2KPA4NEI5RHY4F2FAXI5CPTHP6BXFL757MRIFGERH2CQC2D3RAAFDYIVNI7B7NTLXWX5NEUT7IONYJQA2GVEUHKGHLAXO2JD6UI7C57LRQ4MAILLWECXYYZ2YLJ5HVL6HMAVKWPNRUQV7VQ4TJYKV2GUTU42R6YB2W5VZ3XQXEWKPWY7U37DONKSVFDJCTM5HGUPWAOVXNOO54FZFST5WH5G3YCCF5H6RHZCCNDAPJ5WDJVY2XHWD7VVNICVT7PTKMSBW33L3BBSATV65XAXG72Z3QJ45MXA6IP2XQELXE7F47VC57UTM3EBWFRS7SWZCFQ5TPOT46JIQ6PNSYVA4453VSW4EAUWK6FRG3WAOQPSHG6BYFS7IG5ZCONS7EQAHSIUWPVDMBEDVBVCXW7ZSOG2U73QD4GGSJJ64QEOMY6A6GSGUVTIRL5UKNZLFIKJJT4PULCS3CSE; shshshfpb=AAsaEOaaMEpILfXnDP1RQdOco4vsSWBcDNClSTgAAAAA; _BELONG_CLIENT_=WPSC4XJXWK5USS4JNZY2X7VRLR5MCBKRSVHEXABGTHDGISIQK5YOLZUXYE7IOIM7MOKO74H6CRN6WHAAR4TMDV3XZWMXZRCRT5XRNE3V356BTOB2Y7LPK66VWQK6HPTGWVXIDXDCPVE3W5WMHAIO6AT2LX2XXVNUCXR34ZWFK6HY45CORGIKOSYDYZBF27WOKTUX6BS4FZMIJWNUX6CB4JAA25ZLF7ZEKYOO4QV5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BMTUJZACIBHXQFAVLRF76VQY5PNJGGJNBEZHSFYYJA3YORRT7FB5AHCOIFQKF3W5RWNUX6CB4JAA26JNMO7AYWNUPZF5HTSBXGNRM3E242MBI6V5D4C5VJDQ3EOYCOW5BWZDKMOJ5BS6II53ERY6ALV3ZWPF42L4CPUHEGPYIII35KDC4FCNVCORCXFD6IVNLBEDPB2GGP4UHWNRUDOQBDIW7RZJXBA2WV5ANZOTEGUCDWYRVQS2YUTIZNZ276PRYG4N56V6YTII7MBKBC7LYHO7C555HTSBXGNRM3E466AYN67DHWVM5HQFJ4NFDO5BSO5SF7ZNRNQMVBPEQMCXU26RC4Q; __jda=191429163.1700109613209731139267.1700109613.1703581530.1703595081.28; __jdc=191429163; __jdb=191429163.42.1700109613209731139267|28.1703595081; 3AB9D23F7A4B3C9B=OGIXHURWL4W2YOBLDZKWX2VSTPUXUVFYH3HXSX6VWZ4MSS2JDBQWZMFRLY5X3GAAGK5NRR2F5XYUYPKWK4MHQUTQLU",
                    "Referer": "https://porder.shop.jd.com/order/orderlist/suspend?t=1703664899837",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": "{\"current\":1,\"pageSize\":10,\"sortName\":\"desc\",\"orderId\":\"\",\"skuName\":\"\",\"orderCreateDateRange\":[],\"orderCompleteDateRange\":[],\"receiverName\":\"\",\"receiverTel\":\"\",\"userPin\":\"\",\"skuId\":\"\",\"logiNo\":\"\",\"paymentType\":\"\",\"orderType\":\"\",\"orderSource\":\"\",\"deliveryType\":\"\",\"storeId\":\"\",\"huoHao\":\"\",\"orderStatusArray\":[],\"o2oStoreIds\":null,\"provinceIds\":[],\"orderTag\":null,\"selectedTabName\":\"suspend\"}",
                "method": "POST"
            }).then(d => {
                try {
                    return d.json()
                } catch (e) {
                    return d.text()
                }
            });
            if (Array.isArray(res.orderList)) {
                return true
            } else {
                return false
            }
        } catch (e) {
            console.log(e, 'error--- checkLOgin')
            return false
        }
    }
    // 暂停里跳出新订单备案改为否通知
    async sendFeiShu(info1, type) {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'
        const shopName = this.shopInfo.name

        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `监测暂停订单-备案修改通知- ${shopName}`
                },
                "template": "green"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `**原因**`
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": `跳出新订单`
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**订单信息** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `商品sku名称: ${info1.skuName} 订单号: ${info1.orderId};  skuId: ${info1.isvGoodsNo} ; 付款时间: ${info1.paymentConfirmTime}`
                            }
                        }
                    ]
                },
                // {
                //     "tag": "div",
                //     "text": {
                //         "tag": "lark_md",
                //         "content": "**主备案信息** "
                //     },
                //     "fields": [
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": ''
                //             }
                //         },
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": `主备案商品名称${info1.goodsName}; 主备案skuId: ${info1.skuId}`
                //             }
                //         }
                //     ]
                // },
                // {
                //     "tag": "div",
                //     "text": {
                //         "tag": "lark_md",
                //         "content": "**主备案详情链接** "
                //     },
                //     "fields": [
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": ''
                //             }
                //         },
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": `https://shop-hk.jd.com/popRecording/recorded/queryById.html?id=${info1.id}&disabled=true&recorded=true`}
                //         }
                //     ]
                // },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**备案状态已修改为** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${type ? "直邮": '个人快件'} - ${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/3e1ae178-a3cb-4ea9-b3f2-29d650c14731';

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        await rp(options);
    }
    // 订单从暂停跳出备案状态改为是通知
    async jumpSendFeiShu(info1, type) {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'
        const shopName = this.shopInfo.name

        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `监测暂停订单-备案修改通知-${shopName}`
                },
                "template": "green"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `**原因**`
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": `订单从暂停跳出`
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**订单信息** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `商品sku名称: ${info1.skuName} 订单号: ${info1.orderId};  skuId: ${info1.isvGoodsNo} ; 付款时间: ${info1.paymentConfirmTime}`
                            }
                        }
                    ]
                },
                // {
                //     "tag": "div",
                //     "text": {
                //         "tag": "lark_md",
                //         "content": "**主备案信息** "
                //     },
                //     "fields": [
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": ''
                //             }
                //         },
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": `主备案商品名称${info1.goodsName}; 主备案skuId: ${info1.skuId}`
                //             }
                //         }
                //     ]
                // },
                // {
                //     "tag": "div",
                //     "text": {
                //         "tag": "lark_md",
                //         "content": "**主备案详情链接** "
                //     },
                //     "fields": [
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": ''
                //             }
                //         },
                //         {
                //             "is_short": false,
                //             "text": {
                //                 "tag": "lark_md",
                //                 "content": `https://shop-hk.jd.com/popRecording/recorded/queryById.html?id=${info1.id}&disabled=true&recorded=true`}
                //         }
                //     ]
                // },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**目前备案状态已改为** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${type?"直邮": '个人快件'} - ${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/3e1ae178-a3cb-4ea9-b3f2-29d650c14731';

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        await rp(options);
    }
    // 备案超过12分钟未跳出暂停改为是通知
    async tenMinutesNotify(info1, type, isSend = false) {
        const now = dayjs().format('YYYY-MM-DD hh:mm:ss') // '25/01/2019'
        const shopName = this.shopInfo.name

        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `订单超时未跳出暂停改为是通知-${shopName}`
                },
                "template": "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `**原因**`
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": `订单超过13分钟未跳出暂停${isSend? '-暂停下一阶段补偿逻辑' : '-暂停里超过'}`
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**订单信息&skuId** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `商品sku名称${info1.skuName} 订单号: ${info1.orderId};
                                 付款时间: ${info1.paymentConfirmTime}; 主备案商品名称${info1.goodsName}; 主备案skuId: ${info1.skuId}`
                            }
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**目前备案状态已修改为** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${type?"是": '否'} - ${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = this.errorNotifyUrl;

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        const res = await rp(options);
    }
    // 备案修改失败通知
    async eidtBeianFail(data, type) {
        if(data.errorMsg.includes('并发')) {
            return
        }
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'

        const shopName = this.shopInfo.name
        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `备案修改失败通知-线程${this.thread}-${shopName}`
                },
                "template": "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `京东接口返回值`
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": `${type}-${JSON.stringify(data)}`
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**当前时间** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = this.errorNotifyUrl;

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        const result = await rp(options);
        // this.lastErrorNotifyTime = Date.now()
        console.log(result)
    }
    // 备案重试修改成功通知
    async reTrySuccess(info1, type, data) {
        // if(data.errorMsg.includes('并发')) {
        //     return
        // }
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'
        const shopName = this.shopInfo.name

        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `备案修改失败重试修改成功通知-${shopName}`
                },
                "template": "green"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**主备案信息** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `主备案商品名称${info1.goodsName}; 主备案skuId: ${info1.skuId}`
                            }
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**主备案详情链接** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `https://shop-hk.jd.com/popRecording/recorded/queryById.html?id=${info1.id}&disabled=true&recorded=true`}
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**目前备案状态已改为** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${type?"是": '否'} - ${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = this.errorNotifyUrl;
        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        const  res = await rp(options);
        console.log(res, '重试群通知结果')
    }
    // 登录过期通知
    async logoutNotify(data, shopName1) {
        if (this.die > 2) {
            return
        }
        if (!this.fistErrorTime) {
            this.fistErrorTime = Date.now()
        }
        if (this.lastErrorNotifyTime) {
            const diffTime = dayjs(dayjs()).diff(this.lastErrorNotifyTime, 'minutes')
            if (diffTime < 10) {
                return ''
            }
        }

        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'

        const shopName = this.shopInfo.name
        if (!shopName && !shopName1) {
            return
        }
        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `京东商家后台登录过期-线程${this.thread}-${shopName || shopName1}`
                },
                "template": "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `京东接口返回值`
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": `${JSON.stringify(data)}`
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**当前时间** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = this.errorNotifyUrl;

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        const result = await rp(options);
        this.lastErrorNotifyTime = Date.now()
        this.die = this.die + 1
        console.log(result)

        onLineNotifyFn()
    }
    // 重新登录通知
    async reLoginNotify(data) {
        if (this.die > 0) {
            return
        }
        // if (!this.fistErrorTime) {
        //     this.fistErrorTime = Date.now()
        // }
        // if (this.lastErrorNotifyTime) {
        //     const diffTime = dayjs(dayjs()).diff(this.lastErrorNotifyTime, 'minutes')
        //     if (diffTime < 5) {
        //         return ''
        //     }
        // }

        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'

        const shopName = this.shopInfo.name
        if (!shopName) {
            return
        }
        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `京东商家后台登录过期-线程${this.thread}-${shopName}`
                },
                "template": "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `京东接口返回值`
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": `${JSON.stringify(data)}`
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**当前时间** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = this.errorNotifyUrl;

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        const result = await rp(options);
        // this.lastErrorNotifyTime = Date.now()
        console.log(result)
    }
}

@Provide()
export class JDMainService {
    constructor() {
        this.init()
        setInterval(() => {
            this.init()
        }, 30000)

        onLineNotifyFn = this.onlineShopNotify.bind(this)

        // 每天8点到20点， 整点 发送在线店铺列表通知
        schedule.scheduleJob('0 0 8-23,0 * * ?', () => {
            this.onlineShopNotify()
        });

        setTimeout(() => this.onlineShopNotify(), 1000 * 60)
    }

    _hash = {}

    shopNameHash = {}

    errorHash = {}

    @Inject()
    jdService: JDService;

    async init() {
        const stringData = fs.readFileSync('data.json', 'utf-8');
        const data = JSON.parse(stringData);

        const promiseList = []
        Object.keys(data).forEach(async (item: string) => {
            if(item == 240) return
            if(!data[item]) return
            if (!this._hash[item]) {
                if (data[item]) {
                    this._hash[item] = new JDService(data[item])
                    this._hash[item].JDCookies = data[item].cookies
                    this._hash[item].JDLCookies = data[item].jdlCookies
                    this._hash[item].thread = item
                }
            } else {
                if (!this._hash[item]) return
                this._hash[item].JDCookies = data[item].cookies
                this._hash[item].JDLCookies = data[item].jdlCookies
                this.checkShop(item)
            }
        })

        // const stringData = fs.readFileSync('data.json', 'utf-8');
        const datas = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
        Object.values(this._hash).forEach(jdService => {
            if (this._hash[jdService.thread]) {
                if (this._hash[jdService.thread].fistErrorTime) {
                    if (!this._hash[jdService.thread].die) {
                        this._hash[jdService.thread].die = 1
                    } else  {
                        datas[jdService.thread] && this._hash[jdService.thread].logoutNotify({'DATA': '京东商家后台登录过期'}, datas[jdService.thread].shopName)
                        // datas[jdService.thread] && this.onlineShopNotify()
                        this._hash[jdService.thread].die >= 2 && (datas[jdService.thread] = null)
                    }
                } else {
                    const shopName = this._hash[jdService.thread].shopInfo.name
                    // if (shopName === 'LAURAMERONl海外卖场店') {
                    //     delete datas[jdService.thread]
                    //     delete this._hash[jdService.thread]
                    // } else {
                    datas[jdService.thread] && (datas[jdService.thread].shopName = shopName)

                    // }
                    // this._hash[jdService.thread].die = 0
                }

                // const shopName = this._hash[jdService.thread].shopInfo.name
                // if (shopName) {
                //     if(!this.shopNameHash[shopName]) {
                //         if (!this._hash[jdService.thread].fistErrorTime) {
                //             this.shopNameHash[shopName] = jdService.thread
                //         }
                //     } else {
                //         if (this._hash[jdService.thread].fistErrorTime) {
                //             delete this.shopNameHash[shopName]
                //         }
                //     }
                // }

            }
        })
        fs.writeFileSync('data.json', JSON.stringify(datas))
    }

    // 当前在线店铺
    async onlineShopNotify() {
        const shopList = [...new Set([...Object.values(this._hash).filter(j => !j.die && j.shopInfo?.name).map(item =>  {
            return `${item.shopInfo.name} , 京东物流平台${item.jdlLogin ? '已登录': '未登录' }`
        })])]
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'
        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `当前在线店铺列表通知`
                },
                "template": "green"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**列表** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${now}`
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${shopList.join('\n')}`
                            }
                        }
                    ]
                }
            ]
        }
        // const webhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/3e1ae178-a3cb-4ea9-b3f2-29d650c14731';
        const webhook = 'https://open.feishu.cn/open-apis/bot/v2/hook/79e4aded-fdf2-411c-ac25-0156e975a072';

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        const result = await rp(options);
        // this.lastErrorNotifyTime = Date.now()
        // this.die = this.die + 1
        console.log(result)
    }

    // 检查店铺
    async checkShop(item) {
        // console.log('更新jd cookies成功')
        const isLogin = await this._hash[item].getShopInfo();
        // const jdlInfo = await this._hash[item].queryJDLInfo()

        if(!isLogin.name) {
            const diffTime = dayjs(dayjs()).diff(this._hash[item].fistErrorTime, 'minutes')
            if(diffTime > 10) {
            }
            console.log(`线程${item}, ${this._hash[item].shopInfo.name}访问京东接口异常`)
        } else {
            if (this._hash[item].die) {
                // 恢复登录通知
                await this.reLoginNotify(this._hash[item])
                this._hash[item].die = 0
                this.onlineShopNotify()
            }
            this._hash[item].fistErrorTime = null
            this._hash[item].die = 0
        }
    }

    // 重新登录通知
    async reLoginNotify(currentJdService) {

        const now = dayjs().format('YYYY-MM-DD HH:mm:ss') // '25/01/2019'

        const shopName = currentJdService.shopInfo.name;
        if (!shopName) {
            return
        }
        let card = {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": `京东商家后台已恢复登录通知-线程${currentJdService.thread}-${shopName}`
                },
                "template": "green"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": `上次过期时间`
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": `${dayjs(currentJdService.lastErrorNotifyTime).format('YYYY-MM-DD HH:mm:ss')}`
                        }
                    ]
                },
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": "**当前时间** "
                    },
                    "fields": [
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": ''
                            }
                        },
                        {
                            "is_short": false,
                            "text": {
                                "tag": "lark_md",
                                "content": `${now}`
                            }
                        }
                    ]
                }
            ]
        }
        const webhook = currentJdService.errorNotifyUrl;

        const options = {
            method: 'POST',
            url: webhook,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            dataType: 'json',
            body: {
                msg_type: 'interactive',
                card
            }
        };
        const result = await rp(options);
        console.log(result)
    }
}
