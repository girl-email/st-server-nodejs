import { Rule, RuleType } from '@midwayjs/validate';

export class AddProjectDTO {
    @Rule(RuleType.string().required())
    projectName: string;

    @Rule(RuleType.string().required())
    projectDesc: string;
}
