import {InjectEntityModel} from '@midwayjs/typegoose';
import {ReturnModelType} from '@typegoose/typegoose';
import {Project} from '../entity/project';
import {Provide} from '@midwayjs/decorator';
const crypto = require("crypto");

/**
 * 项目
 */
@Provide()
export class ProjectService {

    @InjectEntityModel(Project)
    ProjectModel: ReturnModelType<typeof Project>;

    private appSecret = 'consoleModel'

    /**
     * 添加控制台信息
     */
    createAppKey(id = ""): Promise<string> {
        const shasum = crypto.createHash('sha1');//返回sha1哈希算法
        shasum.update(this.appSecret + id);//指定要摘要的原始内容,可以在摘要被输出之前使用多次update方法来添加摘要内容
        return shasum.digest('hex');
    }

    /**
     * 创建项目
     */
    async createProject(param: Project) {

        const {_id: id} = await this.ProjectModel.create({
            projectName: param.projectName,
            projectDesc: param.projectDesc,
        });

        const appKey = this.createAppKey(id);

        const updateRes = await this.ProjectModel.update({
            appKey
        }).where({_id: id}).exec()

        return {
            id,
            updateRes
        }
    }

    /**
     * 查找单条AK
     * @param where
     */
    async findOne(where) {
        return this.ProjectModel.findOne().where(where).exec();
    }

}
