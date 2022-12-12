import { Provide } from '@midwayjs/decorator';
// const Core = require('@alicloud/pop-core');
// This file is auto-generated, don't edit it
import Sts20150401, * as $Sts20150401 from '@alicloud/sts20150401';
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
// @ts-ignore
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
// import * as $tea from '@alicloud/tea-typescript';

@Provide()
export class AliYunService {
  /**
   * 使用AK&SK初始化账号Client
   * @return Client
   * @throws Exception
   */
  createClient(): Sts20150401 {
    let config = new $OpenApi.Config({

    });
    // 访问的域名
    config.endpoint = `sts.cn-hangzhou.aliyuncs.com`;
    return new Sts20150401(config);
  }

  async test(args: string[]): Promise<any> {
    // 初始化 Client，采用 AK&SK 鉴权访问的方式，此方式可能会存在泄漏风险，建议使用 STS 方式。鉴权访问方式请参考：https://help.aliyun.com/document_detail/378664.html
    // 获取 AK 链接：https://usercenter.console.aliyun.com
    // @ts-ignore
    let client = this.createClient();
    let assumeRoleRequest = new $Sts20150401.AssumeRoleRequest({
      durationSeconds: 3600,
    });
    try {
      // 复制代码运行请自行打印 API 的返回值
      const result = await client.assumeRoleWithOptions(assumeRoleRequest, new $Util.RuntimeOptions({ }));
      return result;
    } catch (error) {
      // 如有需要，请打印 error
      Util.assertAsString(error.message);
    }
  }

}
