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
import {OnWSDisConnection} from "@midwayjs/core";
let tableData = [
    [
        {
            value: '1'
        },
        {
            value: '1'
        },
        {
            value: '1'
        }
    ],
    [
        {
            value: '1'
        },
        {
            value: '1'
        },
        {
            value: '1'
        }
    ],
    [
        {
            value: '1'
        },
        {
            value: '1'
        },
        {
            value: '1'
        }
    ],
    [
        {
            value: '1'
        },
        {
            value: '1'
        },
        {
            value: '1'
        }
    ],
    [
        {
            value: '1'
        },
        {
            value: '1'
        },
        {
            value: '1'
        }
    ]
]

/**
 * 客户端连接websocket
 */
@WSController('/table')
export class ClientController {
    @Inject()
    ctx: Context;

    @App('socketIO')
    app: Application;


    @Init()
    init() {
        setInterval(() => {
            this.ctx.broadcast.emit("data", {
                cmd: 'tableData',
                data: tableData
            });
            const count = this.app.engine.clientsCount;      // 获取所有的连接数
            this.ctx.broadcast.emit("data", {
                cmd: 'userCount',
                data: count
            });
        }, 200000)
    }

    @OnWSConnection()
    async onConnectionMethod() {
        console.log('on client connect', this.ctx.id);

        this.ctx.emit('data', {
            cmd: 'connected',
            data: 'connected success1'
        });

        this.ctx.emit("data", {
            cmd: 'tableData',
            data: tableData
        });

    }

    /**
     * @param data
     */
    @OnWSDisConnection()
    async disConnection(data = {cmd: '', data: {}}) {
    }

    /**
     * 响应客户端发送的数据
     * @param data
     */
    @OnWSMessage('data')
    @WSEmit('data')
    async gotMessage(data = {cmd: '', data: {}}) {
        switch (data.cmd) {
            case "editTable":
                this.editTable(data)
                break;
            default:
                break;
        }
    }

    /**
     * 编辑表格
     * @param data
     */
    editTable(data) {
        tableData = data.data
        console.log(data.data)

        this.ctx.broadcast.emit("data", {
            cmd: 'tableData',
            data: tableData
        });
    }
}　　　
