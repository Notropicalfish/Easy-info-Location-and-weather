import { weatherDescriptionToEmoji } from '@/extras/scripts-tsx'
import { CityData, TempUnit, WeatherData } from '@/extras/types'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface props {
  loading: boolean,
  weatherData: WeatherData,
  tempUnit: TempUnit,
  city: CityData
}

export default function MainContent({ loading, weatherData, tempUnit, city }: props) {
  return (
    <div className='flex justify-center rounded-3xl p-5 h-full bg-blue-500'>
      <div className='flex justify-center gap-3 items-center'>
        <div>
          <p className='text-7xl md:text-9xl font-bold'>{weatherDescriptionToEmoji(weatherData.current.description)}</p>
        </div>

        <div>
          <p className='md:text-2xl font-bold text-slate-300'>{!loading ? `${city.town}, ${city.state}` : 'Loading...'}</p>

          <p className='text-5xl md:text-6xl font-bold'>
            {!loading ? `${weatherData.current.temperature}°${tempUnit}` : 'Loading...'}
            <span className='text-xl md:text-2xl font-bold text-stone-300'>
              <FontAwesomeIcon icon={faCaretUp}/>
              {!loading ? `${weatherData.daily[0].temperature.high}°${tempUnit}` : 'Loading...'} /
              <FontAwesomeIcon icon={faCaretDown}/>
              {!loading ? `${weatherData.daily[0].temperature.low}°${tempUnit}` : 'Loading...'}
            </span>
          </p>

          <p className='text-xl md:text-2xl text-slate-300 font-bold'>Rain Chance: {!loading ? `${weatherData.hourly[0].rainChance}%` : 'Loading...'}</p>
        </div>
      </div>
    </div>
  )
}
