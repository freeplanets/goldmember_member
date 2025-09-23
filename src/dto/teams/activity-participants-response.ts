import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '../common/common-response.dto';
import { ICommonResponse } from '../interface/common.if';
import { IActMemberInfo, ITeamMember } from '../interface/team-group.if';
import { ActivityMemberInfo } from './activity-member-info';
import { TeamMemberData } from './team-member-data';

export class ActivityParticipantsResponse extends CommonResponseDto implements ICommonResponse<Partial<ITeamMember>[]> { //<Partial<IActMemberInfo>[]> {
    @ApiProperty({
        description: '活動成員列表',
        //type: ActivityMemberInfo,
        type: TeamMemberData,
        isArray: true,
    })
    data?: Partial<ITeamMember>[];
    //data?: Partial<IActMemberInfo>[];
}