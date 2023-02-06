import {Index, prop } from '@typegoose/typegoose';

/**
 * 闪调客户
 */
@Index({ userName: 1, mobile: 1 }, { unique: true }) // compound index
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
     * pwd
     */
    @prop({ type: () => String, default: '888888'})
    public pwd?: string;

    /**
     * 创建时间
     */
    @prop({ type: () => Date})
    public createTime?: Date;
}
