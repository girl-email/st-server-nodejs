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
     * 项目名称
     */
    @prop()
    public projectName?: string;

    /**
     * 闪跳应用id
     */
    @prop()
    public appId?: string;

    /**
     * appKey
     */
    @prop({ type: () => String})
    public appKey?: string;

    /**
     * 创建时间
     */
    @prop({ type: () => Date})
    public createTime?: Date;
}
