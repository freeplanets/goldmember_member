import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class SendMessageReqDto {
    @ApiProperty({
        description: 'Push Token',
        type:String,
        isArray: true,
    })
    @IsArray()
    tokens:string[];

    @ApiProperty({
        description: 'message',
    })
    @IsString()
    message:string;
}