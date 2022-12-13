import {InjectEntityModel} from '@midwayjs/typegoose';
import {ReturnModelType} from '@typegoose/typegoose';
import {Project} from '../entity/project';
import {Provide} from '@midwayjs/decorator';


/**
 * 项目
 */
@Provide()
export class ProjectService {

    @InjectEntityModel(Project)
    ProjectModel: ReturnModelType<typeof Project>;


    // @ts-ignore
    /**
     * 添加控制台信息
     */
    createAppKey() {

    }

    /**
     * 查找单条AK
     * @param where
     */
    async findOne(where) {
        return this.ProjectModel.findOne().where(where).exec();
    }

    async createAK() {
        const appKey = this.createAppKey()
        // create data
        const {_id: id} = await this.ProjectModel.create({
            appId: 1,
            appKey: appKey
        }); // an "as" assertion, to have types for all properties

        return {
            id,
            appKey
        }
    }
}
