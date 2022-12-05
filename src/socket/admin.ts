import {
  WSController,
  OnWSConnection,
  Inject,
  OnWSMessage,
  WSEmit,
  Init
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/socketio';
// import {Init} from "@midwayjs/core";
/**
 * 测试
 */
@WSController('/admin')
export class AdminController {
  @Inject()
  ctx: Context;


  constructor() {
    console.log('init')
  }


  @Init()
  init() {
    console.log('init')
  }

  @OnWSConnection()
  async onConnectionMethod() {
    console.log('on client connect', this.ctx.id);
    console.log('地址', this.ctx.handshake.address);
    console.log('参数', this.ctx.handshake.query);
    this.ctx.emit('data', {
      cmd:'connect',
      data: 'success'
    });

  }

  /**
   * 接受数据
   * @param data
   */
  @OnWSMessage('data')
  @WSEmit('data')
  async gotMessage(data) {
    console.log('on data got', this.ctx.id, data);
  }


}
