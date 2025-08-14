import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class MakeingfriendsReqDto {
    @ApiProperty({
        description: '邀請者ID',
        required: true,
    })
    @IsString()
    inviteId:string;

    @ApiProperty({
        description: '接受者ID',
        required: true,
    })
    @IsString()
    acceptId: string;
}