import { Weather, WeatherSchema } from "../../dto/schemas/weather.schema";
import { WeatherInfo } from "./weather-info";
import { IWeatherData, IWeatherResponse, IWeekLocation, IWeekWeatherResponse } from "./weather-if";
import { IForecast, IWeather } from "../../dto/interface/weather.if";
import { getMongoDB as getDB } from "../database/mongodb";


export const getWeather = async () => {
    const db = await getDB();
    const weatherModel = db.model(Weather.name, WeatherSchema);
    const wi = new WeatherInfo();
    const ans:IWeatherResponse|boolean = await wi.getRecords();
    if (ans) {
        const rlt:IWeatherData[] = ans.records.Station;
        //const promises = rlt.map((data) => {
        for (let i=0, n=rlt.length;  i<n; i++) {
            const data = rlt[i];
            // console.log('data:', data);
            const StationName = data.StationName;
            const wdata:Partial<IWeather> = {};
            const we = data.WeatherElement;
            if (we.AirTemperature && we.AirTemperature !== -99) {
                wdata.temperature = we.AirTemperature;
                wdata.condition = we.Weather;
                wdata.windSpeed = we.WindSpeed;
                wdata.humidity = we.RelativeHumidity;
                wdata.highTemp = we.DailyExtreme.DailyHigh.TemperatureInfo.AirTemperature;
                wdata.lowTemp = we.DailyExtreme.DailyLow.TemperatureInfo.AirTemperature;
                console.log(wdata)
                const f = await weatherModel.findOne({StationName});
                //console.log('find', f);
                let ans:any;
                if (f) {
                    //console.log('check1');
                    ans = await weatherModel.updateOne({StationName}, wdata);
                } else {
                    //console.log('check2');
                    wdata.StationName = StationName;
                    ans = await weatherModel.create(wdata);
                }
                //console.log("ans", ans);
            }
        //});
        }
    }
    await db.disconnect();
}

export const getWeekWeather = async () => {
    const db = await getDB();
    const weatherModel = db.model(Weather.name, WeatherSchema);
    const wi = new WeatherInfo();
    const ans:IWeekWeatherResponse|boolean = await wi.getRecords(wi.UrlWeek, wi.OptWeek);
    //console.log('getWeatherData ans:', ans);
    if (ans) {
        //console.log('getWeatherData ans:', ans.records.Locations[0]);
        const rlt:IWeekLocation[] = ans.records.Locations[0].Location;
        // console.log('rlt:', rlt);
        const forecasts:IForecast[] = [];
        rlt.forEach(async (data) => {
            // console.log('data:', data);
            data.WeatherElement.forEach((we) => {
                // console.log('we:', we);
                if (we.ElementName == '最高溫度') {
                    we.Time.forEach((t) => {
                        const date1 = t.StartTime.split('T')[0];
                        const date2 = t.StartTime.split('T')[0];
                        console.log('date:', date1, date2, t);
                        if (date1 == date2) { 
                            const f = forecasts.find((f) => f.date == date1);
                            // console.log('f:', f);
                            if (f) {
                                f.highTemp = Number(t.ElementValue[0].MaxTemperature)
                            } else {
                                forecasts.push({
                                    date: date1,
                                    highTemp: Number(t.ElementValue[0].MaxTemperature),
                                    lowTemp: 0,
                                });
                            }
                        }
                    });
                } else if (we.ElementName == '最低溫度') {
                    we.Time.forEach((t) => {
                        const date1 = t.StartTime.split('T')[0];
                        const date2 = t.StartTime.split('T')[0];
                        console.log('date:', date1, date2, t);
                        if (date1 == date2) { 
                            const f = forecasts.find((f) => f.date == date1);
                            if (f) {
                                f.lowTemp = Number(t.ElementValue[0].MinTemperature);
                            } else {
                                forecasts.push({
                                    date: date1,
                                    highTemp: 0,
                                    lowTemp: Number(t.ElementValue[0].MinTemperature),
                                });
                            }
                        }
                    })
                } else if (we.ElementName == '天氣現象') {
                    we.Time.forEach((t) => {
                        const date1 = t.StartTime.split('T')[0];
                        const date2 = t.StartTime.split('T')[0];
                        console.log('date:', date1, date2, t);
                        if (date1 == date2) { 
                            const f = forecasts.find((f) => f.date == date1);
                            if (f) {
                                f.condition = t.ElementValue[0].Weather;
                                f.conditionCode = t.ElementValue[0].WeatherCode;
                            } else {
                                forecasts.push({
                                    date: date1,
                                    highTemp: 0,
                                    lowTemp: 0,
                                    condition: t.ElementValue[0].Weather,
                                    conditionCode: t.ElementValue[0].WeatherCode,
                                });
                            }
                        }
                    });
                }
            });
        });
        console.log('forecasts:', forecasts);
        const upd = await weatherModel.findOneAndUpdate({StationName: '林口'}, {forecast: forecasts});
        console.log('update', upd);
        await db.disconnect();
    }
}