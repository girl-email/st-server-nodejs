import {InjectEntityModel} from '@midwayjs/typegoose';
import {ReturnModelType} from '@typegoose/typegoose';
import {Console} from '../entity/console';
import {Provide} from '@midwayjs/decorator';


/**
 * 控制台信息server
 */
@Provide()
export class ConsoleService {

    @InjectEntityModel(Console)
    consoleModel: ReturnModelType<typeof Console>;

    /**
     * 添加控制台信息
     */
    async addConsole(data): Promise<string> {
        const {_id: id} = await this.consoleModel.create({
            ...data,
            createTime: new Date()
        } as unknown as Console); // an "as" assertion, to have types for all properties
        return id;
    }


    async findConsole() {
        return this.consoleModel.find().exec();
    }

    async getTest() {
        // create data
        const {_id: id} = await this.consoleModel.create({name: 'JohnDoe', jobs: ['Cleaner']} as Console); // an "as" assertion, to have types for all properties

        // find data
        const user = await this.consoleModel.findById(id).exec();
        console.log(user)
    }
}
