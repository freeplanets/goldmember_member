export interface IWeather {
    StationName?:string;
    temperature?: number;
    condition?: string;
    windSpeed?: number;
    humidity?: number;
    lastUpdated?: string;
    highTemp?: number;
    lowTemp?: number;
    forecast?: IForecast[];
}

export interface IForecast {
    date?: string;
    condition?: string;
    conditionCode?: string;
    highTemp?: number;
    lowTemp?: number;
}
