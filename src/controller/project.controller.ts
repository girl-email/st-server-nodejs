// import {Inject, Controller, Get, Post, Del, Body, Param} from '@midwayjs/decorator';
// import {Context} from '@midwayjs/koa';
// import {UserService} from '../service/user.service';
// import {ProjectService} from '../service/project.service';
// import {AliYunService} from '../service/aliyun.service';
// import BaseController from "../core/baseController";
// import {Put} from "@midwayjs/core";
// import { AddProjectDTO } from './../dto/project';
//
// /**
//  * 闪调项目管理控制器
//  */
// @Controller('/api/project')
// export class ProjectController extends BaseController {
//     @Inject()
//     ctx: Context;
//
//     @Inject()
//     userService: UserService;
//
//     @Inject()
//     AliYunService: AliYunService;
//
//     @Inject()
//     projectService: ProjectService;
//
//     /**
//      * 项目列表
//      */
//     @Get('/list')
//     async getList() {
//         const userId = this.ctx.user._id
//         const result = await this.projectService.getList({userId});
//         // TODO 写三行逻辑
//         return this.success(result)
//     }
//
//     /**
//      * 删除
//      */
//     @Del('/:id')
//     async userInfo(@Param('id') id) {
//         const result = await this.projectService.deleteProject(id);
//         if (!result.deletedCount) {
//             return this.fail(0, '该项目不存在')
//         }
//         return this.success(result, '操作成功')
//     }
//
//     /**
//      * 增加项目
//      */
//     @Post('/')
//     async addProject(@Body() param: AddProjectDTO) {
//         const userId = this.ctx.user._id
//         const result = await this.projectService.createProject({...param, userId});
//         return this.success(result)
//     }
//
//     /**
//      * 编辑项目
//      */
//     @Put('/:id')
//     async editProject(@Param('id') id, @Body() body: AddProjectDTO) {
//         const userId = this.ctx.user._id
//         const result = await this.projectService.updateProject({...body, userId, id});
//         return this.success(result)
//     }
// }
