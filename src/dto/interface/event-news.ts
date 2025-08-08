// import { EventNewsType } from '../../utils/enum';
import { IModifiedBy } from './modifyed-by.if';

export interface IEventNews {
    id: string;
    targetId: string;
    title: string;
    dateStart: string;
    dateEnd: string;
    location: string;
    description: string;
    creator: IModifiedBy;
    updater: IModifiedBy;
    deleter: IModifiedBy;
    isDeleted: boolean;
    //type: EventNewsType;
}