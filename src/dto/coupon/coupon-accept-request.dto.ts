import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Matches } from 'class-validator';
import { UUID_V4_STYLE } from '../../utils/constant';

export class CouponAcceptRequestDto {
    @ApiProperty({
        description: '優惠券代號',
        required: true,
        isArray: true,
    })
    @Matches(UUID_V4_STYLE, {each: true})
    id:string[];

    @ApiProperty({
        description: '原持有者會員代號',
        required: true,
    })
    @IsUUID()
    currentOwnerId:string;
}