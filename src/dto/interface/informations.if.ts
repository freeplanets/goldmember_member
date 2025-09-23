import { IAnnouncement } from './announcement.if';
import { IEventNews } from './event-news';
import { IGreenSpeeds } from './field-management.if';
import { IWeather } from './weather.if';

export interface IAllInfo {
    GreensSpeeds?: Partial<IGreenSpeeds>[];
    Announcements?: Partial<IAnnouncement>[];
    Weather?: Partial<IWeather>;
    EventNews?: Partial<IEventNews>[]; 
}