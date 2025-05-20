import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IForecast, IWeather } from "../interface/weather.if";
import { WeatherForecastData } from "../weather/weather-forecast.data";

export type WeatherDocument = Document & IWeather;

@Schema()
export class Weather implements IWeather {
    @Prop({unique:true})
    StationName: string;

    @Prop()
    temperature?: number;

    @Prop()
    condition?: string;

    @Prop()
    windSpeed?: number;

    @Prop()
    humidity?: number;

    @Prop()
    lastUpdated?: string;

    @Prop()
    lowTemp?: number;

    @Prop()
    highTemp?: number;

    @Prop({
        type: Array<WeatherForecastData>,
    })
    forecast?: IForecast[];
    
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);