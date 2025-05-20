import { ApiProperty } from "@nestjs/swagger";
import { MemberCreateRequestDto } from "./member-create-request.dto";
import { IsNumberString } from "class-validator";

export class MemberRegisterRequestDto extends MemberCreateRequestDto {
    @ApiProperty({
        description: '認證碼',
        example: '123456',
        required: true,
    })
    @IsNumberString()
    verificationCode: string;
}