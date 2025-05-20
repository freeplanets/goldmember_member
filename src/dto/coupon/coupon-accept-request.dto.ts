import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CouponAcceptRequestDto {
    @ApiProperty({
        description: '優惠券代號',
        required: true,
    })
    @IsUUID()
    id:string

    @ApiProperty({
        description: '原持有者會員代號',
        required: true,
    })
    @IsUUID()
    currentOwnerId:string;
}