import {} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ICommonResponse } from '../interface/common.if';
import { CommonResponseDto } from '../common/common-response.dto';

export class AnnouncementsResponseDto extends CommonResponseDto implements ICommonResponse<any[]> {
    @ApiProperty({
        description: '公告列表',
        // type: AnnouncementData,
        isArray: true,
    })
    data?: any[];
}
