import { prop } from '@typegoose/typegoose';

export class Console {
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
     * 记录时间
     */
    @prop({ type: () => String})
    public timestamp?: string;


    /**
     * 记录时间
     */
    @prop({ type: () => Date})
    public createTime?: Date;

    /**
     * 内容
     */
    @prop()
    public content?: any;
}
