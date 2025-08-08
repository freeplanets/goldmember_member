import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Announcement, AnnouncementDocument } from '../dto/schemas/announcement.schema';
import { FilterQuery, Model } from 'mongoose';
import { IMember } from '../dto/interface/member.if';
import { ANNOUNCEMENT_GROUP, DS_LEVEL } from '../utils/enum';
import { THREE_MONTH } from '../utils/constant';
import { AnnouncementsResponseDto } from '../dto/announcements/announcements-response.dto';
import { ErrCode } from '../utils/enumError';
import { Member, MemberDcoument } from '../dto/schemas/member.schema';
import { IAnnouncement } from '../dto/interface/announcement.if';
import { DateLocale } from '../classes/common/date-locale';

@Injectable()
export class AnnouncementsService {
    private myDate = new DateLocale();
    constructor(
        @InjectModel(Announcement.name) private readonly modelAnnounce:Model<AnnouncementDocument>,
        @InjectModel(Member.name) private readonly modelMember:Model<MemberDcoument>,
    ) {}

    async getAnnounce(user:Partial<IMember>|undefined = undefined):Promise<AnnouncementsResponseDto> {
        const annRes = new AnnouncementsResponseDto();
        console.log(user);
        const filter =  await this.getFilter(user);
        console.log('filter', filter, filter.$or);
        if (filter.$or) {
            filter.$or.forEach((itm) => {
                console.log(itm);
            })
        }
        try {
            const ans = await this.modelAnnounce.find(filter, "id title content type publishDate isTop iconType attachments");
            // console.log('ans:', ans);
            if (ans) {
                console.log('check1');
                const rlt = (ans as Partial<IAnnouncement[]>).map((itm) => {
            if (itm.attachments) {
              itm.attachments = itm.attachments.map((att) => {
                if (typeof att === 'string') {
                  if (`${att}`.indexOf('"') !== -1) {
                    att = JSON.parse(att);
                    console.log('att:', att);
                  }
                }
                return att;
              });
            }
            return itm;
          });

                annRes.data = rlt
            }
        } catch  (e) {
            console.log(e);
            annRes.ErrorCode = ErrCode.UNEXPECTED_ERROR_ARISE;
            annRes.error.extra = e;
        }
        return annRes;
    }
    async getFilter(user:Partial<IMember>|undefined = undefined) {
        let filter:FilterQuery<Announcement>={};
        console.log(user);
        if (!user) {
            filter.targetGroups = {
                    $elemMatch: { $eq: ANNOUNCEMENT_GROUP.ALL },
            };
        } else {
            filter = {
                $or:[
                    {targetGroups: { $elemMatch: { $eq: ANNOUNCEMENT_GROUP.ALL }}},
                    {targetGroups: { $elemMatch: { $eq: user.membershipType }}},
                    {targetGroups: { $elemMatch: { id: user.id}}}
                ],
            }
            if (user.isDirector !== DS_LEVEL.NONE) {
                filter.$or.push({targetGroups: { $elemMatch: { $eq: ANNOUNCEMENT_GROUP.DIRECTOR_SUPERVISOR }}})
            }            

        }
        filter.isPublished = true;
        filter.publishedTs = { $gt: Date.now() - THREE_MONTH };
        filter.expiryDate = { $gte: this.myDate.toDateString() };
        // filter.isApprev = true;
        filter.authorizer = { $exists: true };
        return filter;
    }
}