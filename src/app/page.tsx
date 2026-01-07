'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { WeatherData, CityData, HourlyForecastItem, SevenDayForecastItem, Weekday } from '../extras/types.ts'
import { WeatherDescription } from '../extras/types.ts'

import { faSun, faCloud, faWind, faCloudSun, faCloudRain, faCloudBolt, faSnowflake, faMap, faCog, faBook} from '@fortawesome/free-solid-svg-icons'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [ searchCityName, setSearchCityName ] = useState('')
  const [ city, setCity ] = useState<CityData>()
  const [ loading, setLoading ] = useState(true)
  const [ metric, setMetric ] = useState(false)
  const [ weatherData, setWeatherData ] = useState<WeatherData>({
    hourly: [],
    daily: [],
    current: {
      rainChance: 0,
      windSpeed: 0,
      uvIndex: 0,
      temperature: 0,
      description: WeatherDescription.Clear,
      relativeHumidity: 0
    }
  })

  async function captureIpLocation(): Promise<CityData> {
    const res = await fetch('https://ipapi.co/json/')
    
    if (res.status != 200) {
      return {
        town: 'New York (fallback)',
        state: 'New York',
        country: 'United States',
        location: [ -74.0060, 40.7128 ]
      }
    }

    const { city, region, country_name, latitude, longitude } = await res.json()

    return { town: city, state: region, country: country_name, location: [ latitude, longitude ] }
  }
  
  async function getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((loc) => { resolve(loc) }, reject)
    })
  }

  function weekdayFromDate(date: string): Weekday {
    return 'Friday'
  }

  function wmoToDescription(wmo: number): WeatherDescription {
    switch (wmo) {
      case 0: return WeatherDescription.Clear // 'Clear sky'
      case 1: return WeatherDescription.Overcast // 'Mainly clear, partly cloudy, and overcast'
      case 2: return WeatherDescription.Overcast
      case 3: return WeatherDescription.Overcast
      case 45: return WeatherDescription.Fog // 'Fog and depositing rime fog'
      case 48: return WeatherDescription.Fog
      case 51: return WeatherDescription.Rain // 'Drizzle: Light, moderate, and dense intensity'
      case 53: return WeatherDescription.Rain
      case 55: return WeatherDescription.Rain
      case 56: return WeatherDescription.Rain // 'freezing drizzle'
      case 57: return WeatherDescription.Rain
      case 61: return WeatherDescription.Rain // 'Rain: Slight, moderate and heavy intensity'
      case 63: return WeatherDescription.Rain
      case 65: return WeatherDescription.Rain
      case 66: return WeatherDescription.Rain // 'Freezing Rain: Light and heavy intensity'
      case 67: return WeatherDescription.Rain
      case 71: return WeatherDescription.Snow // 'Snow fall: Slight, moderate, and heavy intensity'
      case 73: return WeatherDescription.Snow
      case 75: return WeatherDescription.Snow
      case 77: return WeatherDescription.Snow // 'Snow grains'
      case 80: return WeatherDescription.Rain // 'Rain showers: Slight, moderate, and violent'
      case 81: return WeatherDescription.Rain
      case 82: return WeatherDescription.Rain
      case 85: return WeatherDescription.Snow // 'Snow showers slight and heavy'
      case 86: return WeatherDescription.Snow
      case 95: return WeatherDescription.Thunderstorm // 'Thunderstorm: Slight or moderate'
      case 96: return WeatherDescription.Thunderstorm // 'Thunderstorm with slight and heavy hail'
      case 99: return WeatherDescription.Thunderstorm
      default: return WeatherDescription.Clear
    }
  }

  function weatherDescriptionToString(desc: WeatherDescription): string {
    switch (desc) {
      case WeatherDescription.Clear: return 'Clear'
      case WeatherDescription.Cloudy: return 'Cloudy'
      case WeatherDescription.Fog: return 'Foggy'
      case WeatherDescription.Overcast: return 'Overcast'
      case WeatherDescription.Rain: return 'Rain'
      case WeatherDescription.Snow: return 'Snow'
      case WeatherDescription.Thunderstorm: return 'T-Storm'
    }
  }

  function weatherDescriptionToEmoji(desc: WeatherDescription): React.ReactElement {
    switch (desc) {
      case WeatherDescription.Clear: return <FontAwesomeIcon icon={faSun}/>
      case WeatherDescription.Cloudy: return <FontAwesomeIcon icon={faCloud}/>
      case WeatherDescription.Fog: return <FontAwesomeIcon icon={faWind}/>
      case WeatherDescription.Overcast: return <FontAwesomeIcon icon={faCloudSun}/>
      case WeatherDescription.Rain: return <FontAwesomeIcon icon={faCloudRain}/>
      case WeatherDescription.Snow: return <FontAwesomeIcon icon={faSnowflake}/>
      case WeatherDescription.Thunderstorm: return <FontAwesomeIcon icon={faCloudBolt}/>
    }
  }

  async function fetchWeather() {
    if (!city) return

    setLoading(true)

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.location[0]}&longitude=${city.location[1]}&daily=uv_index_max,temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&temperature_unit=${metric ? 'celcius' : 'fahrenheit'}&wind_speed_unit=${metric ? 'kph' : 'mph'}&precipitation_unit=${metric ? 'centimeter' : 'inch'}&timezone=auto`)
    const data = await res.json()

    const uvIndex = data.daily.uv_index_max[0]
    const hourly: HourlyForecastItem[] = []
    const daily: SevenDayForecastItem[] = []
    const hours = new Date().getHours()

    for (let i = hours; i < (hours + 7); i++) {
      hourly.push({
        time: parseInt(data.hourly.time[i].split('T')[1].split(':')[0]),
        description: wmoToDescription(data.hourly.weather_code[i]),
        temperature: data.hourly.temperature_2m[i]
      })
    }

    for (let i = 0; i < 7; i++) {
      daily.push({
        temperature: {
          high: data.daily.temperature_2m_max[i],
          low: data.daily.temperature_2m_min[i]
        },
        weekday: weekdayFromDate(data.daily.time[i]),
        description: wmoToDescription(data.daily.weather_code[i])
      })
    }

    setWeatherData({
      current: {
        rainChance: data.current.precipitation * 100,
        windSpeed: data.current.wind_speed_10m,
        uvIndex,
        temperature: data.current.temperature_2m,
        description: wmoToDescription(data.current.weather_code),
        relativeHumidity: data.current.relative_humidity_2m
      },
      hourly,
      daily
    })

    setLoading(false)
  }

  useEffect(() => {
    async function run() {
      if (!('geolocation' in navigator)) {
        const location = await captureIpLocation()

        setCity(location)
        setMetric(location.country != 'United States')

        return
      }

      const position = await getPosition().catch(() => {console.log('geolocation failed, using ip as location fallback')})

      if (!position) {
        const location = await captureIpLocation()

        setCity(location)
        setMetric(location.country != 'United States')

        return
      }

      const { latitude, longitude } = position.coords

      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
      
      if (res.status != 200) {
        const location = await captureIpLocation()

        setCity(location)
        setMetric(location.country != 'United States')
        
        return
      }

      const { town, state, country } = (await res.json()).address
      
      setCity({ town, state, country, location: [ latitude, longitude ] })
      setMetric(country != 'United States')
    }

    run()
  }, [])

  useEffect(() => {
    
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    fetchWeather()
  }

  function handleCityNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchCityName(e.target.value)
  }

  return (
    <div className='flex flex-col md:flex-row min-h-screen p-5 font-sans bg-slate-800 gap-3'>
      <div className='flex flex-col gap-3 min-h-screen justify-between w-[8%] py-10 rounded-xl bg-slate-700'>
        <div className='flex flex-col items-center gap-3 justify-start h-full'>
          <Link href='/' className='flex flex-col items-center'><FontAwesomeIcon icon={faCloud} className='text-2xl text-slate-300' /><p>Weather</p></Link>
          <Link href='/Map' className='flex flex-col items-center'><FontAwesomeIcon icon={faMap} className='text-2xl text-slate-300' /><p>Map</p></Link>
          <Link href='/info' className='flex flex-col items-center'><FontAwesomeIcon icon={faBook} className='text-2xl text-slate-300' /><p>Info</p></Link>
        </div>
        <div className='flex flex-col items-center justify-end h-full'>
          <Link href='/settings' className='flex flex-col items-center'><FontAwesomeIcon icon={faCog} className='text-2xl text-slate-300' />Settings</Link>
        </div>
      </div>

      {/* Left */}
      <div className='flex flex-col gap-3 min-h-screen w-full'>
        {/* Search bar */}
          <form onSubmit={handleSubmit}>
            <input type='text' placeholder='Enter city name' className='bg-slate-700 rounded-xl p-2 w-full placeholder-slate-500' onChange={handleCityNameChange} />
          </form>
        
      
        {/* Main content */}
        <div className='flex flex-col rounded-xl mt-3 p-5 h-full bg-linear-to-t from-blue-500 to-blue-400'>
          <div className='flex flex-row gap-5 justify-start '>
            <div className='flex justify-between flex-col h-full w-full gap-5'>
              <div>
                <h1 className='text-3xl font-bold text-slate-300'>{!loading ? `${city?.town}, ${city?.state}` : 'Loading...'}</h1>
                <p className='text-slate-400'>Chance of Rain: {!loading ? `${weatherData.current.rainChance}%` : 'Loading...'}</p>
              </div>

              <div>
                <h1 className='text-6xl font-bold text-slate-300'>{!loading ? `${weatherData.current.temperature}°${metric ? 'C' : 'F'}` : 'Loading...'}</h1>
              </div>
            </div>

            <div className='flex items-center justify-center h-full'>
              <h1 className='text-9xl font-bold text-slate-300'>{weatherDescriptionToEmoji(weatherData.current.description)}</h1>
            </div>
          </div>
          
        </div> 

        {/* Todays Forecast */}
        <div className='flex flex-row rounded-xl bg-slate-700 p-5 gap-3 h-2/3 min-h-50 w-full'>
          {!loading ? weatherData.hourly.map((itm, i) => <div key={i} className='h-full w-full flex-col items-center justify-between py-5 flex bg-slate-600 rounded-xl hover:bg-slate-500 hover:w-[125%] transition-all'>
            <p className='font-bold text-md text-slate-400'>{itm.time}:00</p>
            <p className='text-5xl'>{weatherDescriptionToEmoji(itm.description)}</p>
            <p className='text-2xl'>{Math.floor(itm.temperature)}°{metric ? 'C' : 'F'}</p>
            <p className='font-bold text-2xl text-slate-300'>{weatherDescriptionToString(itm.description)}</p>
          </div>) : 'Loading...'}
        </div>

        {/* Extra Info */}
        <div className='grid grid-cols-2 grid-rows-2 rounded-xl p-5 gap-5 bg-slate-700 h-full min-h-50 w-full'>
          <div className='bg-slate-600 flex justify-between px-12 gap-10 items-center text-slate-300 h-full w-full rounded-xl'>
            <p className='text-3xl font-bold'>Humidity: {!loading ? `${weatherData.current.relativeHumidity}% RH` : 'Loading...'}</p>
            <FontAwesomeIcon className='text-4xl' icon={faSun}/>
          </div>

          <div className='bg-slate-600 flex justify-between px-12 gap-10 items-center text-slate-300 h-full w-full rounded-xl'>
            <p className='text-3xl font-bold'>Windspeed: {!loading ? `${weatherData.current.windSpeed} ${metric ? 'km/h' : 'mph'}` : 'Loading...'}</p>
            <FontAwesomeIcon className='text-4xl' icon={faSun}/>
          </div>

          <div className='bg-slate-600 flex justify-between px-12 gap-10 items-center text-slate-300 h-full w-full rounded-xl'>
            <p className='text-3xl font-bold'>UV Index: {!loading ? `${weatherData.current.uvIndex}` : 'Loading...'}</p>
            <FontAwesomeIcon className='text-4xl' icon={faSun}/>
          </div>

          <div className='bg-slate-600 flex justify-between px-12 gap-10 items-center text-slate-300 h-full w-full rounded-xl'>
            <p className='text-3xl font-bold'>Chance of Rain: {!loading ? `${weatherData.current.rainChance}%` : 'Loading...'}</p>
            <FontAwesomeIcon className='text-4xl' icon={faSun}/>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className='flex flex-col rounded-xl bg-slate-700 h-screen w-full md:w-[60%]'>
        {/* Weekly Forecast */}
        
      </div>
    </div>
  )
}
