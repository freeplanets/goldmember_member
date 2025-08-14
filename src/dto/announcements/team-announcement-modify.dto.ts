import { ApiProperty } from '@nestjs/swagger';
import { IAnnouncement, IAttachmemt } from '../interface/announcement.if';
import { Attachment } from './attachment';
import { IsOptional, IsString } from 'class-validator';
import { DateLocale } from '../../classes/common/date-locale';
import { TeamAnnouncementCreateDto } from './team-announcement-create.dto';

export class TeamAnnouncementModifyDto extends TeamAnnouncementCreateDto implements Partial<IAnnouncement> {
    @ApiProperty({
        description: '標題',
        required: false,
        example: '一般公告'
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        description: '公告日期',
        required: false,
        example: new DateLocale().toDateString(),
    })
    @IsOptional()
    @IsString()
    publishDate?: string;

    @ApiProperty({
        description: '內容',
        required: false,
        example: '一般公告'
    })
    content?: string;
    
    @ApiProperty({
        description: '附件',
        required: false,
        type: Attachment,
        isArray: true,
        // example: [new Attachment()],
    })
    attachments?: IAttachmemt[];

}