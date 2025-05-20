import { AnyObject } from "mongoose";
import { GEO_INFO, WEATHER_ELEMENT } from "./weather-enum";

export interface IParamsOfWeather {
    Authorization:string;
    StationId?:string;      // C0AH50 => 林口
    StationName?:string;
    WeatherElement?:WEATHER_ELEMENT;
    GeoInfo?:GEO_INFO;
    LocationName?:string;
    ElementName?:string;
    format?:string;    //  
}
export interface IWeatherCommonResponse {
    success: string;
    result: AnyObject;
    records: any;
    [key: string]: any;
}
export interface IWeatherResponse extends IWeatherCommonResponse {
    //success: string;
    //result: AnyObject;
    records: {
        Station: IWeatherData[];
    }
}
export interface IWeatherData {
    StationName: string;    // 林口,
    StationId: string;  //C0AH50,
    ObsTime: {
      DateTime: string; //2025-04-08T09:00:00+08:00
    },
    GeoInfo: IGeoInfo,
    WeatherElement: IWeatherElement; 
}  
export interface IWeatherElement {
    Weather: string;    //陰,
    Now: {
        Precipitation: number;    //0
    },
    WindDirection: number;  //252,
    WindSpeed: number;  //1.5,
    AirTemperature: number; //21.3,
    RelativeHumidity: number;   //89,
    AirPressure: number;    //986,
    GustInfo: {
        PeakGustSpeed: number;  //-99,
        Occurred_at: {
            WindDirection: -99,
            DateTime: -99
        }
    },
    DailyExtreme: {
        DailyHigh: {
            TemperatureInfo: ITemperatureInfo;
        },
        DailyLow: {
            TemperatureInfo: ITemperatureInfo;
        }
    }
}

export interface ITemperatureInfo {
    AirTemperature: number; //19.3,
    Occurred_at: {
        DateTime: string; //2025-04-08T00:10:00+08:00
    }
}

export interface IGeoInfo {
    Coordinates?: ICoordinates[],
    StationAltitude?: number;    //275.0,
    CountyName?: string; //新北市,
    TownName: string;   //林口區,
    CountyCode?: number; //65000,
    TownCode?: number;   //65000170
} 

export interface ICoordinates {
    CoordinateName: string; //TWD67,WGS84 ... etc
    CoordinateFormat: string;   //decimal degrees,
    StationLatitude: number;    //25.073954,
    StationLongitude: number;   //121.37261
}

export interface IWeekWeatherResponse extends IWeatherCommonResponse {
    // success: string;
    // result: AnyObject;
    records: {
        Locations: IWeekLocations[];
    }
}
export interface IWeekLocations {
    DatasetDescription: string; // "臺灣各縣市鄉鎮未來1週逐12小時天氣預報",
    LocationsName: string // "新北市",
    Dataid: string; // "D0047-071",
    Location: IWeekLocation[];     
}
export interface IWeekLocation {
    LocationName: string;   //"林口區",
    Geocode: string;        //"65000170",
    Latitude: string;       //"25.078714",
    Longitude: string;      // "121.380575",
    WeatherElement: IWeekWeatherElement[]; //預報資料
}
export interface IWeekWeatherElement {
    ElementName: string; //最高溫度,最低溫度
    Time: IWeekTime[];    //預報時間
}

export interface IWeekTime {
    StartTime: string;  // "2025-04-11T06:00:00+08:00",
    EndTime: string;    //"2025-04-11T18:00:00+08:00",
    ElementValue: [
      {
        MaxTemperature: string; //"30"
        MinTemperature: string; //"19"
        Weather: string; //"多雲",
        WeatherCode: string; //"02",
      }
    ]    
}