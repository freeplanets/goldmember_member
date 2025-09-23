import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from '../common/common-response.dto';
import { ICommonResponse } from '../interface/common.if';
import { IMember } from '../interface/member.if';
import { MemberDetailInfo } from './member-detail-info';

export class MemberProfileResponseDto extends CommonResponseDto implements ICommonResponse<Partial<IMember>> {
  @ApiProperty({
    description: '會員詳細資料',
    type: MemberDetailInfo,
  }) 
  data?: Partial<IMember>;
}
