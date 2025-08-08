import { ApiProperty } from '@nestjs/swagger';
import { ITeamMember } from '../interface/team-group.if';
import { TeamMemberPosition } from '../../utils/enum';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class TeamMemberUpdateRequestDto implements Partial<ITeamMember> {
    @ApiProperty({
        description: '會員 ID',
        required: true,
    })
    @IsUUID()
    id: string;

    @ApiProperty({
        description: '角色',
        required: false,
        enum: TeamMemberPosition,
        example: TeamMemberPosition.MEMBER,
    })
    @IsOptional()
    @IsString()
    role?: TeamMemberPosition;
}
    
    
    
    