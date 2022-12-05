import {
    WSController,
    OnWSConnection,
    Inject,
    OnWSMessage,
    WSEmit,
    Init,
    App
} from '@midwayjs/decorator';
import {Context, Application} from '@midwayjs/socketio';
import ClientUser from './serverUser';
import {ConsoleService} from '../service/console.service';
import {OnWSDisConnection} from "@midwayjs/core";


/**
 * 客户端连接websocket
 */
@WSController('/')
export class ClientController {
    @Inject()
    ctx: Context;

    @App()
    app: Application;

    @Init()
    init() {
    }

    @Inject()
    consoleService: ConsoleService;


    /**
     * 给客户端推消息
     * @param cmd
     * @param data
     */
    async sendData(cmd, data) {
        this.ctx.emit('data', {
            cmd: 'connected',
            data: 'connected success'
        });
    }

    @OnWSConnection()
    async onConnectionMethod() {
        console.log('on client connect', this.ctx.id);
        console.log('地址', this.ctx.handshake.address);
        console.log('参数', this.ctx.handshake.query);
        this.ctx.emit('data', {
            cmd: 'connected',
            data: 'connected success'
        });

        this.ctx.broadcast.emit("data", {
            cmd: 'getUserList',
            data: ClientUser.userList
        });


        for (var i=0;i<1000;i++)
        {
            this.consoleService.addConsole()
        }
        // return {
        //     cmd: 'connected',
        //     data: 'connected success'
        // }
    }

    /**
     * 接受数据
     * @param data
     */
    @OnWSDisConnection()
    async disConnection(data = {cmd: '', data: {}}) {
        console.log('OnWSDisConnection', this.ctx.id)
        ClientUser.delUser(this.ctx.id)
    }

    /**
     * 接受数据
     * @param data
     */
    @OnWSMessage('data')
    @WSEmit('data')
    async gotMessage(data = {cmd: '', data: {}}) {
        console.log('on data got', this.ctx.id, data);
        const hasUser = ClientUser.hasUser(this.ctx.id);

        if (!hasUser && data.cmd != 'login') {
            return {
                cmd: 'needLogin',
                message: "未登录",
            }
        }


        switch (data.cmd) {
            case "login":
                // @ts-ignore
                this.serverLogin(data.data) // 登陆
                break;
            case "log":
                // @ts-ignore
                this.dealLog(data) // 登陆
                break;
            default:
                break;
        }
    }


    private disconnect() {
        this.ctx.emit('disConnect', {
            cmd: 'loginSuccess',
            data: {},
        })
    }

    /**
     * 处理log
     * @param data
     * @private
     */
    private dealLog(data) {
        const serverUser = ClientUser.hasUser(this.ctx.id);
        if (!serverUser) {
            // 断开连接
            return this.disconnect()
        }

        // const { userId } = serverUser;
    }

    /**
     * 客户端登陆socket
     * @param data
     * @private
     */
    private serverLogin(data: {
        userId: Boolean;
    }) {
        console.log(this.ctx.id, 'this.ctx.id')
        if (!ClientUser.hasUser(this.ctx.id)) {
            if (data && data.userId) {
                ClientUser.addUser(this.ctx.id, data)
                this.ctx.emit('data', {
                    cmd: 'loginSuccess',
                    data: data,
                })
                return
            } else {
                this.ctx.emit('data', {
                    cmd: 'notFound',
                    message: '缺少必要参数'
                })
                return;
            }
        }
        this.ctx.emit('data', {
            cmd: 'loginSuccess',
            data: data,
        })
    }
}　　　
