import { ApiProperty } from '@nestjs/swagger';
import { IReservations } from '../interface/reservations.if';
import { ReserveStatus, ReserveType } from '../../utils/enum';
import { IsOptional, IsString, Matches } from 'class-validator';
import { DATE_STYLE } from '../../utils/constant';
import { DtoErrMsg } from '../../utils/enumError';
import { DateWithLeadingZeros } from '../../utils/common';

export class ReservationsQueryRequestDto implements Partial<IReservations> {
    @ApiProperty({
        description: '預約狀態',
        enum: ReserveStatus,
        required:false,
    })
    @IsOptional()
    @IsString()
    status?: ReserveStatus;

    @ApiProperty({
        description: '開始日期 (YYYY/MM/DD)',
        example: DateWithLeadingZeros(),
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(DATE_STYLE, {message: DtoErrMsg.DATE_STYLE_ERROR})
    startDate:string

    @ApiProperty({
        description: '結束日期 (YYYY/MM/DD)',
        example: DateWithLeadingZeros(),
        required: false,
    })
    @IsOptional()
    @IsString()
    @Matches(DATE_STYLE, {message: DtoErrMsg.DATE_STYLE_ERROR})
    endDate:string;
}