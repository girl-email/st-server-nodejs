import { prop } from '@typegoose/typegoose';

/**
 * 存储Project信息实体
 */
export class Project {
    /**
     * 项目名称
     */
    @prop()
    public projectName?: string;

    /**
     * 项目描述
     */
    @prop()
    public projectDesc?: string;

    /**
     * appKey
     */
    @prop({ type: () => String})
    public appKey?: string;

    /**
     * userId
     */
    @prop({ type: () => String})
    public userId: string;

    /**
     * 创建时间
     */
    @prop({ type: () => Date, default: () => new Date()})
    public createTime?: Date;
}
