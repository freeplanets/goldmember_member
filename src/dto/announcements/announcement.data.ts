import { ApiProperty } from '@nestjs/swagger';
import { IAnnouncement } from '../interface/announcement.if';
import { IModifiedBy } from '../interface/modifyed-by.if';
import { AnnouncementBaseDto } from './announcement-base.dto';

export class AnnouncementData extends AnnouncementBaseDto implements Partial<IAnnouncement> {

  @ApiProperty({
    description: '新增者',
    required: false,
  })
  creator: IModifiedBy;

  @ApiProperty({
    description: '修改者',
    required: false,
  })
  updater: IModifiedBy;

  @ApiProperty({
    description: '核准人',
    required: false,
  })
  authorizer?: IModifiedBy;
}
