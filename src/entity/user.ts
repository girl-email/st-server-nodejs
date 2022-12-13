import { prop } from '@typegoose/typegoose';

/**
 * 闪调客户
 */
export class User {
    /**
     * 公司
     */
    @prop()
    public company?: string;


    /**
     * userName
     */
    @prop({ type: () => String})
    public userName?: string;

    /**
     * avatarUrl
     */
    @prop({ type: () => String})
    public avatarUrl?: string;

    /**
     * openId
     */
    @prop({ type: () => String})
    public openId?: string;

    /**
     * mobile
     */
    @prop({ type: () => String})
    public mobile?: string;

    /**
     * 创建时间
     */
    @prop({ type: () => Date})
    public createTime?: Date;
}
