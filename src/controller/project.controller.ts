import {Inject, Controller, Get, Query, Del} from '@midwayjs/decorator';
import {Context} from '@midwayjs/koa';
import {UserService} from '../service/user.service';
import {ProjectService} from '../service/project.service';
import {AliYunService} from '../service/aliyun.service';
import BaseController from "../core/baseController";
import {Put} from "@midwayjs/core";

/**
 * 闪调项目控制器
 */
@Controller('/api/project')
export class ProjectController extends BaseController {
    @Inject()
    ctx: Context;

    @Inject()
    userService: UserService;

    @Inject()
    AliYunService: AliYunService;

    @Inject()
    projectService: ProjectService;

    /**
     * 项目列表
     */
    @Get('/list')
    async getList() {
        const result = await this.projectService.getList();
        // TODO 写三行逻辑
        return this.success(result)
    }

    /**
     * 删除
     */
    @Del('/:id')
    async userInfo(param) {
        const result = await this.projectService.deleteProject(param);
        return this.success(result)
    }

    /**
     * 增加项目
     */
    @Put('/')
    async getUser(@Query() param) {
        const result = await this.projectService.createProject(param);
        return this.success(result)
    }
}
