import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class TeamAcceptReqDto {
    @ApiProperty({
        description: '會員 ID',
        required: true,
    })
    @IsUUID()
    memberId:string
}