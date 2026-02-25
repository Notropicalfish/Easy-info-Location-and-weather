'use client'

// This is the main "Weather" page.
// High‑level flow:
//   1. Figure out where the user is (geolocation → reverse lookup → fallback to IP).
//   2. Fetch weather data for that location from Open‑Meteo.
//   3. Store everything in React state.
//   4. Pass state down into presentational components to render the UI.

import { useState, useEffect } from 'react'

// Shared types so this component and your child components
// all agree on the shape of the data they get.
import type { WeatherData, CityData, HourlyForecastItem, DailyForecastItem } from '../extras/types.ts'
import { WeatherDescription } from '../extras/types.ts'
// Helper utilities for converting raw API values into nice UI values.
import { wmoToDescription, weekdayFromDate, getPosition } from '@/extras/scripts.ts'

// UI components that consume the state this page manages.
import SearchBar from '@/components/home/searchbar.tsx'
import MainContent from '@/components/home/maincontent.tsx'
import HourlyForecast from '@/components/home/hourlyforecast.tsx'
import ExtraInfo from '@/components/home/extrainfo.tsx'
import DailyForecast from '@/components/home/dailyforecast.tsx'
import Navbar from '@/components/generic/navbar.tsx'

export default function Home() {
  // Whether we are currently waiting on a weather API response.
  const [ loading, setLoading ] = useState(true)

  // Display preferences chosen by the user.
  const [ tempUnit, setTempUnit ] = useState<'F' | 'C'>('C')
  const [ speedUnit, setSpeedUnit ] = useState<'mph' | 'km/h'>('km/h')
  const [ clockFormat, setClockFormat ] = useState<'24' | '12'>('24')

  // The "active" city that all weather data is based on.
  // We start with a static fallback (NYC) so the UI has something
  // to render before geolocation / IP lookup finishes.
  const [ city, setCity ] = useState<CityData>({
    town: 'New York (fallback)',
    state: 'New York',
    country: 'United States',
    location: [ -74.0060, 40.7128 ]
  })

  // Weather data fetched from Open‑Meteo for the current city.
  // It is split into:
  //   - current: one "now" snapshot
  //   - hourly: the next 12 hours
  //   - daily: the next 7 days
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

  // Fallback: get an approximate city from the user's IP address.
  // This is used when geolocation is unavailable or fails.
  async function captureIpLocation(): Promise<CityData> {
    const res = await fetch('https://ipapi.co/json/')
    
    // If the IP service is down or blocked, fall back to a static city.
    if (res.status != 200) {
      return {
        town: 'New York (fallback)',
        state: 'New York',
        country: 'United States',
        location: [ -74.0060, 40.7128 ]
      }
    }

    // The API already gives us the city name and coordinates we need.
    const { city, region, country_name, latitude, longitude } = await res.json()

    return { town: city, state: region, country: country_name, location: [ latitude, longitude ] }
  }

  // Core function that talks to Open‑Meteo using the current city + units
  // and normalizes the response into our WeatherData shape.
  async function fetchWeather() {
    if (!city) return

    setLoading(true)

    // Build a big query string telling Open‑Meteo which fields we care
    // about (current + hourly + daily) and which units to use.
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.location[0]}&longitude=${city.location[1]}&daily=uv_index_max,temperature_2m_max,temperature_2m_min,weather_code&hourly=temperature_2m,visibility,weather_code,precipitation_probability&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=${tempUnit == 'C' ? 'celsius' : 'fahrenheit'}&wind_speed_unit=${speedUnit == 'km/h' ? 'kmh' : 'mph'}&precipitation_unit=${speedUnit == 'km/h' ? 'mm' : 'inch'}&timezone=auto`)
    const data = await res.json()

    // Open‑Meteo returns arrays for daily values; we only want today's UV index.
    const uvIndex = data.daily.uv_index_max[0]
    const hourly: HourlyForecastItem[] = []
    const daily: DailyForecastItem[] = []
    const hours = new Date().getHours()

    // Build the next 12 hours of forecast starting from "now".
    for (let i = hours; i < (hours + 12); i++) {
      hourly.push({
        // Hour is encoded as an ISO string like "2024‑05‑02T13:00".
        time: parseInt(data.hourly.time[i].split('T')[1].split(':')[0]),
        description: wmoToDescription(data.hourly.weather_code[i]),
        temperature: Math.floor(data.hourly.temperature_2m[i]),
        visibility: data.hourly.visibility[i],
        rainChance: data.hourly.precipitation_probability[i]
      })
    }

    console.log(hourly)

    // Build 7 days of daily forecast data.
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

    // Finally, hydrate the React state with our normalized data.
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

  // On initial page load, try to figure out *where* the user is.
  // Priority:
  //   1. Use browser geolocation (most accurate).
  //   2. If that fails or is blocked, fall back to IP location.
  useEffect(() => {
    async function run() {
      // If the browser doesn't support geolocation at all, go straight to IP.
      if (!('geolocation' in navigator)) {
        const location = await captureIpLocation()

        setCity(location)

        return
      }

      // Wrap navigator.geolocation in a Promise helper (getPosition).
      const position = await getPosition().catch(() => {console.log('geolocation failed, using ip as location fallback')})

      // If the user denies permission or some other error occurs,
      // fall back to the IP‑based location.
      if (!position) {
        const location = await captureIpLocation()

        setCity(location)
        
        return
      }

      // Geolocation succeeded: we have precise coordinates.
      const { latitude, longitude } = position.coords

      // Use OpenStreetMap's Nominatim API to reverse‑lookup
      // a human‑readable city / state / country from the coordinates.
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)

      if (res.status != 200) {
        // If reverse geocoding fails, still fall back to IP.
        const location = await captureIpLocation()

        setCity(location)
        
        return
      }

      const { town, state, country } = (await res.json()).address
      const cdata: CityData = { town, state, country, location: [ latitude, longitude ] }
      
      // This city then drives the weather fetch below.
      setCity(cdata)
    }

    run()
  }, [])

  // Whenever the city or unit preferences change, refetch weather.
  // This covers:
  //   - Initial city discovered by the effect above.
  //   - User searches for a new city.
  //   - User toggles between °C/°F or km/h/mph.
  useEffect(() => {
    function thing() {
      fetchWeather()
    }

    thing()
  }, [ city, tempUnit, speedUnit ])

  // Layout:
  //   - Left: vertical navbar.
  //   - Right: main weather content column + daily forecast column.
  return(
    <div className='flex flex-col md:flex-row min-h-screen p-5 font-sans bg-slate-800 gap-3'>
      <Navbar />

      <div className='flex flex-col gap-3 min-h-screen md:max-w-[60%]'>
        {/* Top search + unit controls. This component will call
            setCity / setTempUnit / setSpeedUnit / setClockFormat
            which in turn triggers fetchWeather via the effect above. */}
        <SearchBar fetchWeather={fetchWeather}
          setCity={setCity}
          setClockFormat={setClockFormat}
          setSpeedUnit={setSpeedUnit}
          setTempUnit={setTempUnit}
          clockFormat={clockFormat}
          speedUnit={speedUnit}
          tempUnit={tempUnit} 
          />

        {/* Main "hero" card: current temperature, description, city name, etc. */}
        <MainContent loading={loading}
          weatherData={weatherData}
          tempUnit={tempUnit}
          city={city}
          />

        {/* Scrollable 12‑hour forecast row. */}
        <HourlyForecast loading={loading}
          weatherData={weatherData}
          tempUnit={tempUnit}
          clockFormat={clockFormat}
          />

        {/* Extra numeric details like humidity, wind, UV index, etc. */}
        <ExtraInfo loading={loading}
          weatherData={weatherData}
          speedUnit={speedUnit}
          />
      </div>

      {/* Right‑hand column: 7‑day forecast cards. */}
      <DailyForecast loading={loading}
        weatherData={weatherData}
        tempUnit={tempUnit}
        />
    </div>
  )
}
