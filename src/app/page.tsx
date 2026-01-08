'use client'

import { useState, useEffect } from 'react'

import type { WeatherData, CityData, HourlyForecastItem, DailyForecastItem } from '../extras/types.ts'
import { WeatherDescription } from '../extras/types.ts'
import { wmoToDescription, weekdayFromDate, getPosition } from '@/extras/scripts.ts'

import SearchBar from '@/components/home/searchbar.tsx'
import MainContent from '@/components/home/maincontent.tsx'
import HourlyForecast from '@/components/home/hourlyforecast.tsx'
import ExtraInfo from '@/components/home/extrainfo.tsx'
import DailyForecast from '@/components/home/dailyforecast.tsx'
import Navbar from '@/components/generic/navbar.tsx'

export default function Home() {
  const [ loading, setLoading ] = useState(true)
  const [ tempUnit, setTempUnit ] = useState<'F' | 'C'>('C')
  const [ speedUnit, setSpeedUnit ] = useState<'mph' | 'km/h'>('km/h')
  const [ clockFormat, setClockFormat ] = useState<'24' | '12'>('24')
  const [ city, setCity ] = useState<CityData>({
    town: 'New York (fallback)',
    state: 'New York',
    country: 'United States',
    location: [ -74.0060, 40.7128 ]
  })
  const [ weatherData, setWeatherData ] = useState<WeatherData>({
    hourly: [],
    daily: [],
    current: {
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

  async function fetchWeather() {
    if (!city) return

    setLoading(true)

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.location[0]}&longitude=${city.location[1]}&daily=uv_index_max,temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,visibility,weather_code,precipitation_probability&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=${tempUnit == 'C' ? 'celsius' : 'fahrenheit'}&wind_speed_unit=${speedUnit == 'km/h' ? 'kmh' : 'mph'}&precipitation_unit=${speedUnit == 'km/h' ? 'mm' : 'inch'}&timezone=auto`)
    const data = await res.json()

    const uvIndex = data.daily.uv_index_max[0]
    const hourly: HourlyForecastItem[] = []
    const daily: DailyForecastItem[] = []
    const hours = new Date().getHours()

    for (let i = hours; i < (hours + 12); i++) {
      hourly.push({
        time: parseInt(data.hourly.time[i].split('T')[1].split(':')[0]),
        description: wmoToDescription(data.hourly.weather_code[i]),
        temperature: Math.floor(data.hourly.temperature_2m[i]),
        visibility: data.hourly.visibility[i],
        rainChance: data.hourly.precipitation_probability[i]
      })
    }

    console.log(hourly)
    for (let i = 0; i < 7; i++) {
      daily.push({
        temperature: {
          high: Math.floor(data.daily.temperature_2m_max[i]),
          low: Math.floor(data.daily.temperature_2m_min[i])
        },
        weekday: weekdayFromDate(data.daily.time[i]),
        description: wmoToDescription(data.daily.weather_code[i])
      })
    }

    setWeatherData({
      current: {
        windSpeed: data.current.wind_speed_10m,
        uvIndex,
        temperature: Math.floor(data.current.temperature_2m),
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

        return
      }

      const position = await getPosition().catch(() => {console.log('geolocation failed, using ip as location fallback')})

      if (!position) {
        const location = await captureIpLocation()

        setCity(location)

        return
      }

      const { latitude, longitude } = position.coords

      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)

      if (res.status != 200) {
        const location = await captureIpLocation()

        setCity(location)
        
        return
      }

      const { town, state, country } = (await res.json()).address
      const cdata: CityData = { town, state, country, location: [ latitude, longitude ] }
      
      setCity(cdata)
    }

    run()
  }, [])

  useEffect(() => {
    function thing() {
      fetchWeather()
    }

    thing()
    // ok to do this because it needs to rerun when those are changed and i dont feel like making better logic lmfao
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ city, tempUnit, speedUnit ])

  return (
    <div className='flex flex-col md:flex-row min-h-screen p-5 font-sans bg-slate-800 gap-3'>
      <Navbar />

      <div className='flex flex-col gap-3 min-h-screen md:max-w-[60%]'>
        <SearchBar fetchWeather={fetchWeather}
          setCity={setCity}
          setClockFormat={setClockFormat}
          setSpeedUnit={setSpeedUnit}
          setTempUnit={setTempUnit}
          clockFormat={clockFormat}
          speedUnit={speedUnit}
          tempUnit={tempUnit} 
          />

        <MainContent loading={loading}
          weatherData={weatherData}
          tempUnit={tempUnit}
          city={city}
          />

        <HourlyForecast loading={loading}
          weatherData={weatherData}
          tempUnit={tempUnit}
          clockFormat={clockFormat}
          />

        <ExtraInfo loading={loading}
          weatherData={weatherData}
          speedUnit={speedUnit}
          />
      </div>

      <DailyForecast loading={loading}
        weatherData={weatherData}
        tempUnit={tempUnit}
        />
    </div>
  )
}
