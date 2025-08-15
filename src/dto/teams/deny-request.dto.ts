import { ApiProperty } from "@nestjs/swagger";
import { NotesReqDto } from "../common/notes-request.dto";
import { IsUUID } from "class-validator";

export class TeamDenyReqDto extends NotesReqDto {
    @ApiProperty({
        description: '會員ID',
        required: true,
    })
    @IsUUID()
    memberId:string;
}