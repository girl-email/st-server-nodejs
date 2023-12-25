// import {
//     WSController,
//     OnWSConnection,
//     Inject,
//     OnWSMessage,
//     WSEmit,
//     Init,
//     App
// } from '@midwayjs/decorator';
// import {Context, Application} from '@midwayjs/socketio';
// import ClientUser from './serverUser';
// import {ConsoleService} from '../service/console.service';
// import {AKService} from '../service/ak.service';
// import {OnWSDisConnection} from "@midwayjs/core";
// import {ProjectService} from "../service/project.service";
//
// /**
//  * 客户端连接websocket
//  */
// @WSController('/')
// export class ClientController {
//     @Inject()
//     ctx: Context;
//
//     @App('socketIO')
//     app: Application;
//
//     @Init()
//     init() {
//     }
//
//     @Inject()
//     consoleService: ConsoleService;
//
//     @Inject()
//     projectService: ProjectService;
//
//     @Inject()
//     akService: AKService;
//
//     /**
//      * 给客户端推消息
//      * @param cmd
//      * @param data
//      */
//     async sendData(cmd, data) {
//         this.ctx.emit('data', {
//             cmd: 'connected',
//             data: 'connected success'
//         });
//     }
//
//     @OnWSConnection()
//     async onConnectionMethod() {
//         console.log('on client connect', this.ctx.id);
//
//         this.ctx.emit('data', {
//             cmd: 'connected',
//             data: 'connected success'
//         });
//
//         this.ctx.broadcast.emit("data", {
//             cmd: 'getUserList',
//             data: ClientUser.userList
//         });
//
//     }
//
//     /**
//      * 接受数据
//      * @param data
//      */
//     @OnWSDisConnection()
//     async disConnection(data = {cmd: '', data: {}}) {
//         ClientUser.delUser(this.ctx.id)
//     }
//
//     /**
//      * 接受数据
//      * @param data
//      */
//     @OnWSMessage('data')
//     @WSEmit('data')
//     async gotMessage(data = {cmd: '', data: {}}) {
//         const hasUser = ClientUser.hasUser(this.ctx.id);
//
//         if (!hasUser && data.cmd != 'login') {
//             return {
//                 cmd: 'needLogin',
//                 message: "未登录",
//             }
//         }
//
//         switch (data.cmd) {
//             case "login":
//                 // @ts-ignore
//                 this.serverLogin(data.data) // 登陆
//                 break;
//             case "log":
//                 await this.dealLog(data) // 处理console信息
//                 break;
//             default:
//                 break;
//         }
//     }
//
//     /**
//      * 服务端主动断开连接
//      * @param theSocketId socketId
//      * @private
//      */
//     private disConnect(theSocketId): void {
//         this.ctx.emit('data', {
//             cmd: 'disconnectSocket',
//             data: '',
//             message: '即将把你断开'
//         });
//         this.app.of("/").in(theSocketId).disconnectSockets();
//         ClientUser.delUser(theSocketId)
//         return
//     }
//
//     /**
//      * 处理log
//      * @param data
//      * @private
//      */
//     private async dealLog(data) {
//         const serverUser = ClientUser.hasUser(this.ctx.id);
//         if (!serverUser) {
//             // 断开连接
//             return this.disConnect(this.ctx.id)
//         }
//
//         const id = await this.consoleService.addConsole({
//             level: data.type,
//             content: data.value,
//             timeStamp: data.createTime,
//             // @ts-ignore
//             userId: serverUser.userId,
//             // @ts-ignore
//             userName: serverUser.userName
//         })
//
//         console.log(id, '保存成功')
//
//         this.ctx.emit('data', {
//             cmd: 'log',
//             data: {id},
//             message: '保存成功'
//         })
//     }
//
//     /**
//      * 客户端登陆socket
//      * @param data
//      * @private
//      */
//     private async serverLogin(data: {
//         userId: Boolean;
//         appKey: string
//     }) {
//         const  { appKey } = data;
//
//         const appKeyInfo = await this.projectService.findOne({appKey});
//         if (!appKeyInfo) {
//             this.ctx.emit('data', {
//                 cmd: 'notFound',
//                 message: 'appKey不存在'
//             })
//
//             this.disConnect(this.ctx.id)
//             return;
//         }
//
//         if (!ClientUser.hasUser(this.ctx.id)) {
//             if (data && data.userId) {
//                 ClientUser.addUser(this.ctx.id, data)
//                 this.ctx.emit('data', {
//                     cmd: 'loginSuccess',
//                     data: data,
//                 })
//             } else {
//                 this.ctx.emit('data', {
//                     cmd: 'notFound',
//                     message: '缺少必要参数'
//                 })
//             }
//             return;
//         }
//
//         this.ctx.emit('data', {
//             cmd: 'loginSuccess',
//             data: data,
//         })
//     }
// }　　　
