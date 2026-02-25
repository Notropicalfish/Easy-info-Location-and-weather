'use client'

import type { CityData, ClockFormat, SpeedUnit, TempUnit } from '@/extras/types'
import { faClock, faTemperature0 } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'

interface props {
  fetchWeather: () => Promise<void>,
  setCity: React.Dispatch<React.SetStateAction<CityData>>,
  setClockFormat: React.Dispatch<React.SetStateAction<ClockFormat>>,
  setSpeedUnit: React.Dispatch<React.SetStateAction<SpeedUnit>>,
  setTempUnit: React.Dispatch<React.SetStateAction<TempUnit>>,
  clockFormat: ClockFormat,
  speedUnit: SpeedUnit,
  tempUnit: TempUnit
}

export default function SearchBar({ fetchWeather, setCity, setClockFormat, setSpeedUnit, setTempUnit, clockFormat, speedUnit, tempUnit }: props) {
  const [ searchCityName, setSearchCityName ] = useState('')
  const [ inputActive, setInputActive ] = useState(false)
  const [ searchCities, setSearchCities ] = useState<CityData[]>([])

  async function searchForCities() {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchCityName}&count=8&language=en&format=json`)
    const data = await res.json()
    const cities: CityData[] = []

    if (!data.results) return

    for (let i = 0; i < data.results.length; i++) {
      cities.push({
        town: data.results[i].name,
        state: data.results[i].admin1,
        country: data.results[i].country,
        location: [ data.results[i].latitude, data.results[i].longitude ]
      })
    }

    setSearchCities(cities)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    fetchWeather()
  }

  function handleCityNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchCityName(e.target.value)
  }

  function handleSelectSearchCity(idx: number) {
    setCity(searchCities[idx])

    fetchWeather()
  }

  function toggleClockFormat() {
    if (clockFormat == '12') {
      setClockFormat('24')
    } else {
      setClockFormat('12')
    }
  }

  function toggleSpeedUnit() {
    if (speedUnit == 'mph') {
      setSpeedUnit('km/h')
    } else {
      setSpeedUnit('mph')
    }
  }

  function toggleTempUnit() {
    if (tempUnit == 'F') {
      setTempUnit('C')
    } else {
      setTempUnit('F')
    }
  }

  useEffect(() => {
    function thing() {
      searchForCities()
    }

    thing()
    // ok to do this because it needs to rerun when those are changed and i dont feel like making better logic lmfao
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ searchCityName ])

  return (
    <div className='w-full flex flex-col md:flex-row gap-2'>
      <form onSubmit={handleSubmit} className='w-full'>
        <input type='text' placeholder='Enter city name' className='bg-slate-700 rounded-3xl p-2 w-full h-15 placeholder-slate-500' onChange={handleCityNameChange} onFocus={() => { setInputActive(true) }} onBlur={() => { setInputActive(false) }} />

        {inputActive && <div className='relative'>
          <div className='absolute w-full bg-slate-700 top-3 rounded-3xl p-4 flex h-15 flex-col gap-2'>
            {searchCities.map((itm, i) => <button key={i} className='w-full bg-slate-600 rounded-md py-2 px-4 text-left hover:bg-slate-500 transition-colors' onMouseDown={() => { handleSelectSearchCity(i) }}>{itm.town}, {itm.state}, {itm.country}</button> )}
            {searchCities.length == 0 && <span>No results found.</span>}
          </div>
        </div>}
      </form>

      <div className='flex gap-2 w-full md:w-auto'>
        <button onClick={toggleClockFormat} className='bg-slate-700 rounded-3xl p-2 font-bold w-full md:w-20 h-15 gap-2 flex justify-center items-center'><FontAwesomeIcon icon={faClock}/>{clockFormat}</button>
        <button onClick={toggleSpeedUnit} className='bg-slate-700 rounded-3xl p-2 font-bold w-full md:w-20 h-15 gap-2'>{speedUnit.toUpperCase()}</button>
        <button onClick={toggleTempUnit} className='bg-slate-700 rounded-3xl p-2 font-bold w-full md:w-20 h-15 flex justify-center items-center'><FontAwesomeIcon icon={faTemperature0}/>°{tempUnit}</button>
      </div>
    </div>
  )
}
