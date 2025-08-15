
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
export class NotesReqDto {
    @ApiProperty({
        description: '備註',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;    
}