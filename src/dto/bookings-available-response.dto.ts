import {} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommonResponseDto } from './common/common-response.dto';
import { ICommonResponse } from './interface/common.if';
import { IReserveSection } from './interface/reservations.if';

export class BookedResponseDto extends CommonResponseDto implements ICommonResponse<Partial<IReserveSection>[]> {
    @ApiProperty({
        description: '已預約時段列表',
    })
    data?: Partial<IReserveSection>[];
}
