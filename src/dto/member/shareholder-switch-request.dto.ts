import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ShareholderSwitchReqDto {
    @ApiProperty({
        description: '邀請碼',
        required: true,
    })
    @IsString()
    code:string;

    @ApiProperty({
        description: '股號',
        required: true,
    })
    @IsString()
    no:string;
}