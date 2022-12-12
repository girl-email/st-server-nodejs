import { prop } from '@typegoose/typegoose';

/**
 * 存储console信息实体
 */
export class AppKey {
    /**
     * 客户id
     */
    @prop()
    public appId?: string;

    /**
     * 用户id
     */
    @prop({ type: () => String})
    public appKey?: string;


    /**
     * 创建时间
     */
    @prop({ type: () => Date})
    public createTime?: Date;
}
