import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { dbOp } from '../classes/common/db-op';
import { FuncWithTryCatch } from '../classes/common/func.def';
import { EventNews, EventNewsDocument } from '../dto/schemas/event-news.schema';
import { EventNewsQueryRequest } from '../dto/eventnews/event-news-query-request.dto';
import { DateLocale } from '../classes/common/date-locale';

@Injectable()
export class EventNewsService {
    private dbOP:dbOp<EventNewsDocument>;
    private myDate = new DateLocale();
    constructor(@InjectModel(EventNews.name) private readonly modelEN:Model<EventNewsDocument>){
        this.dbOP = new dbOp(modelEN);
    }

    async list(query:EventNewsQueryRequest) {
        console.log('query:', query);
        // Object.keys(query).forEach((key) => {
        //     query[key] = this.myDate.toDateString(query[key]);
        // })
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
        // const filterext:FilterQuery<EventNewsDocument> = {
        //     $or: [
        //         {...filter, type: {$ne: EventNewsType.INDIVIDUAL}},
        //         {dateEnd: {$gte: this.myDate.toDateString() }, targetId: query.memberId}
        //     ],
        //     isDeleted: false,
        // }
        console.log('filter:', filter, filter.$and, filter.dateStart, filter.dateEnd);
        //console.log('filterext', filterext.$or[1]);
        return FuncWithTryCatch(this.dbOP.list, filter);
    }

    async findOne(id: string) {
        return FuncWithTryCatch(this.dbOP.findOneById, id);
    }
}