import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookingsPostRequestDto {
  @ApiProperty({
    description: '區域代號',
    required: true,
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: '時間代號',
    required: true,
  })
  @IsString()
  timeSlotId: string;

  @ApiProperty({
    description: '人數',
    required: true,
  })
  @IsNumber()
  players: number;
}
