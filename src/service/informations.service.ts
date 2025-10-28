import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { DateLocale } from '../classes/common/date-locale';
import { FuncWithTryCatchNew } from '../classes/common/func.def';
import { DateRangeQueryReqDto } from '../dto/common/date-range-query-request.dto';
import { EventNewsQueryRequest } from '../dto/eventnews/event-news-query-request.dto';
import { IAnnouncement } from '../dto/interface/announcement.if';
import { IAllInfo } from '../dto/interface/informations.if';
import { IMember } from '../dto/interface/member.if';
import { IWeather } from '../dto/interface/weather.if';
import { Announcement, AnnouncementDocument } from '../dto/schemas/announcement.schema';
import { EventNews, EventNewsDocument } from '../dto/schemas/event-news.schema';
import { GreenSpeeds, GreenSpeedsDocument } from '../dto/schemas/green-speeds.schema';
import { Weather, WeatherDocument } from '../dto/schemas/weather.schema';
import { THREE_MONTH } from '../utils/constant';
import { ANNOUNCEMENT_GROUP, DS_LEVEL } from '../utils/enum';
import { IReturnObj } from '../dto/interface/common.if';

@Injectable()
export class InformationsService {
    private myDate = new DateLocale();
    private InfoCache:IAllInfo = {}
    constructor(
        @InjectModel(EventNews.name) private readonly modelEN:Model<EventNewsDocument>,
        @InjectModel(Weather.name) private readonly weatherModel:Model<WeatherDocument>,
        @InjectModel(Announcement.name) private readonly modelAnnounce:Model<AnnouncementDocument>,
        @InjectModel(GreenSpeeds.name) private readonly modelGS:Model<GreenSpeedsDocument>,
    ){}
    async getInfo(dates:DateRangeQueryReqDto) {
        return FuncWithTryCatchNew(this, 'getAll', dates);
    }
    private async getAll(dates:DateRangeQueryReqDto, user:Partial<IMember> | undefined) {
        // const datas:IAllInfo = {};
        console.log('get all dates:', dates);
        const rtn:IReturnObj = {};
        if (!this.InfoCache.Announcements || this.InfoCache.Announcements.length === 0) {
            this.InfoCache.Announcements = await this.getAnnounce();
        } else {
            console.log('cache announcements');
        }
        if (!this.InfoCache.GreensSpeeds || this.InfoCache.GreensSpeeds.length === 0) {
            this.InfoCache.GreensSpeeds = await this.greensSpeeds(dates.startDate, dates.endDate);
        } else {
            if (this.InfoCache.GreensSpeeds[0].date < this.myDate.toDateString()) {
                this.InfoCache.GreensSpeeds = await this.greensSpeeds(dates.startDate, dates.endDate);
                console.log('GreensSpeeds check new');                
            } else {
                console.log('cache GreensSpeeds');
            }
        }
        if (!this.InfoCache.EventNews) {
            const query = new EventNewsQueryRequest();
            query.dateEnd = dates.endDate;
            query.dateStart = dates.startDate;
            this.InfoCache.EventNews = await this.eventNews(query);
        } else {
            console.log('cache EventNews')
        }
        if (!this.InfoCache.Weather) {
            this.InfoCache.Weather = await this.weather();       
        } else {
            console.log('cache weather')
        }
        rtn.data = this.InfoCache;
        return rtn;
    }
    private async greensSpeeds(startD:string, endD:string){
        if (!startD) startD = this.myDate.AddMonth(-1);
        if (!endD) endD = this.myDate.toDateString();
        const filter:FilterQuery<GreenSpeedsDocument> = {
            $and: [
                {date: { $gte: startD }},
                {date: { $lte: endD}},
            ]
        };
        console.log('greens speeds filter:', filter, filter.$and);
        let ans = await this.modelGS.find(filter).sort({date: 1});
        //console.log('ans:', ans);
        if (ans.length > 0) ans = [ ans.pop() ];
        //console.log('ans afer pop:', ans);
        return ans;
    }
    private async eventNews(query:EventNewsQueryRequest) {
        console.log('query:', query);
        console.log('query:', query);
        const filter:FilterQuery<EventNewsDocument> = {
            isDeleted: false,
        }
        if (query.dateStart && query.dateEnd) {
            filter.$and = [
                {dateStart: { $gte: query.dateStart}},
                {dateEnd: { $lte: query.dateEnd }},
            ]
        } else if (query.dateStart) {
            filter.dateStart = query.dateStart;
        } else if (query.dateEnd) {
            filter.dateEnd = query.dateEnd;
        } else {
            filter.dateStart = { $gte: this.myDate.toDateString() };
        }
        console.log('filter:', filter, filter.$and, filter.dateStart, filter.dateEnd);
        return this.modelEN.find(filter);
    }
    private async weather() {
        const w:Partial<IWeather> = {};
        const rlt = await this.weatherModel.findOne({StationName: '林口'});
        if (rlt) {
            w.temperature = rlt.temperature;
            w.condition=rlt.condition;
            w.windSpeed=rlt.windSpeed;
            w.humidity=rlt.humidity;
            w.lowTemp=rlt.lowTemp;
            w.highTemp=rlt.highTemp;
            w.forecast = rlt.forecast;
        }
        return w;
    }
    private async getAnnounce(user:Partial<IMember>|undefined = undefined) {
        console.log(user);
        const filter =  await this.getFilter(user);
        console.log('filter', filter, filter.$or);
        if (filter.$or) {
            filter.$or.forEach((itm:any) => {
                console.log(itm);
            })
        }
        const ans = await this.modelAnnounce.find(filter, "id title content type publishDate isTop iconType attachments");
            // console.log('ans:', ans);
        let rlt = [];
        if (ans) {
            console.log('check1');
            rlt = (ans as Partial<IAnnouncement[]>).map((itm) => {
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
        }
        return rlt;
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
                    // {targetGroups: { $elemMatch: { $eq: ANNOUNCEMENT_GROUP.ALL }}},
                    {targetGroups: { $elemMatch: { $eq: user.membershipType }}},
                    {targetGroups: { $elemMatch: { id: user.id}}}
                ],
            }
            if (user.isDirector) {
                filter.$or.push({targetGroups: { $elemMatch: { $eq: ANNOUNCEMENT_GROUP.DIRECTOR_SUPERVISOR }}})
            }            

        }
        filter.isPublished = true;
        filter.publishedTs = { $gt: Date.now() - THREE_MONTH };
        filter.expiryDate = { $gt: this.myDate.toDateString() };
        // filter.isApprev = true;
        filter.authorizer = { $exists: true };
        return filter;
    }     
}