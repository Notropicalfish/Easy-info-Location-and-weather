export type Weekday = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
export enum WeatherDescription {
  Clear,
  Cloudy,
  Rain,
  Thunderstorm,
  Overcast,
  Fog,
  Snow
}

export interface SevenDayForecastItem {
  temperature: {
    high: number,
    low: number
  },
  weekday: Weekday,
  description: WeatherDescription
}

export interface HourlyForecastItem {
  time: number, // from 0-24 (2 = 2am, 14 = 2pm)
  description: WeatherDescription,
  temperature: number
}

export interface CurrentWeatherConditions {
  rainChance: number,
  windSpeed: number,
  uvIndex: number,
  temperature: number,
  description: WeatherDescription,
  relativeHumidity: number
}

export interface CityData {
  town: string,
  state: string,
  country: string,
  location: number[] // [ lat, long ]
}

export interface WeatherData {
  current: CurrentWeatherConditions,
  hourly: HourlyForecastItem[],
  daily: SevenDayForecastItem[]
}
