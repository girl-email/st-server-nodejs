import {InjectEntityModel} from '@midwayjs/typegoose';
import {ReturnModelType} from '@typegoose/typegoose';
import {AppKey} from '../entity/appKey';
import {Provide} from '@midwayjs/decorator';

const crypto = require("crypto");

/**
 * 控制台信息server
 */
@Provide()
export class AKService {

    @InjectEntityModel(AppKey)
    AppKeyModel: ReturnModelType<typeof AppKey>;

    private appSecret = 'consoleModel'

    /**
     * 添加控制台信息
     */
    createAppKey(): Promise<string> {
        const shasum = crypto.createHash('sha1');//返回sha1哈希算法
        shasum.update(this.appSecret + '22');//指定要摘要的原始内容,可以在摘要被输出之前使用多次update方法来添加摘要内容
        return  shasum.digest('hex');
    }

    /**
     * 查找单条AK
     * @param where
     */
    async findOne(where) {
        return this.AppKeyModel.findOne().where(where).exec();
    }

    async createAK() {
        const appKey = this.createAppKey()
        // create data
        const {_id: id} = await this.AppKeyModel.create({
            appId: 1,
            appKey: appKey
        }); // an "as" assertion, to have types for all properties

        return {
            id,
            appKey
        }
    }
}
