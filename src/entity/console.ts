import { prop } from '@typegoose/typegoose';

/**
 * 存储console信息实体
 */
export class Console {
    /**
     * 用户名称
     */
    @prop()
    public userName?: string;

    /**
     * 用户id
     */
    @prop({ type: () => String})
    public userId?: string;

    /**
     * 日志等级
     */
    @prop({ type: () => String})
    public level?: string;

    /**
     * 内容
     */
    @prop()
    public content?: any;

    /**
     * 记录时间
     */
    @prop({ type: () => String})
    public timestamp?: string;

    /**
     * 创建时间
     */
    @prop({ type: () => Date})
    public createTime?: Date;
}
