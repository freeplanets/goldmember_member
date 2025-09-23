import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Announcement, AnnouncementSchema } from '../dto/schemas/announcement.schema';
import { EventNews, EventNewsSchema } from '../dto/schemas/event-news.schema';
import { GreenSpeeds, GreenSpeedsSchema } from '../dto/schemas/green-speeds.schema';
import { Weather, WeatherSchema } from '../dto/schemas/weather.schema';
import { InformationsService } from '../service/informations.service';
import { InformationsController } from '../controller/informations.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Announcement.name, schema:AnnouncementSchema},
            {name: EventNews.name, schema: EventNewsSchema},
            {name: GreenSpeeds.name, schema: GreenSpeedsSchema},
            {name: Weather.name, schema: WeatherSchema},
        ])
    ],
    controllers: [InformationsController],
    providers: [InformationsService]
})
export class InformationsModule {}
