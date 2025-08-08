import { IsString, IsNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DATE_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';
import { IReserveSection } from '../interface/reservations.if';
import { CourseName } from '../../utils/enum';

export class BookingsPostRequestDto implements Partial<IReserveSection> {
  @ApiProperty({
    description: '區域代號',
    required: true,
  })
  @IsString()
  course?: CourseName;

  @ApiProperty({
    description: '日期',
    required: true,    
  })
  @IsString()
  @Matches(DATE_STYLE , { message: DtoErrMsg.DATE_STYLE_ERROR })
  date: string;

  @ApiProperty({
    description: '時間代號',
    required: true,
  })
  @IsString()
  timeSlot: string;

  @ApiProperty({
    description: '人數',
    required: true,
  })
  @IsNumber()
  players: number;
}
