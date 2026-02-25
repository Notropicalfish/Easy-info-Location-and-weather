import type { SpeedUnit, WeatherData } from '@/extras/types'
import { faCloudRain, faDroplet, faEye, faGaugeSimple, faSun, faWind } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface props {
  loading: boolean,
  weatherData: WeatherData,
  speedUnit: SpeedUnit
}

export default function ExtraInfo({ loading, weatherData, speedUnit }: props) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 rounded-3xl gap-3 p-5 bg-slate-700 h-full min-h-50 w-full'>

        <div className='bg-slate-600 flex justify-center px-12 gap-3 items-center text-slate-300 h-full w-full rounded-3xl'>
          <FontAwesomeIcon className='text-4xl flex justify-center items-center' icon={faDroplet}/>

          <p className='text-2xl md:text-3xl font-bold flex h-20 flex-col justify-center'>
            <span className='text-lg md:text-xl text-slate-400'>Humidity</span>
            <span className='text-xl md:text-3xl flex gap-3 justify-center'>{!loading ? `${weatherData.current.relativeHumidity}% RH` : 'Loading...'}</span>
          </p>
        </div>

        <div className='bg-slate-600 flex justify-center px-12 gap-3 items-center text-slate-300 h-full w-full rounded-3xl'>
          <FontAwesomeIcon className='text-4xl' icon={faCloudRain}/>

          <p className='text-2xl md:text-3xl h-20 justify-center font-bold flex flex-col'>
            <span className='text-lg md:text-xl text-slate-400'>Precipitation</span>
            <span className='text-xl md:text-3xl'>{!loading ? `${weatherData.hourly[0].rainChance}%` : 'Loading...'}</span>
          </p>
        </div>
      
        <div className='bg-slate-600 flex justify-center px-12 gap-3 items-center text-slate-300 h-full w-full rounded-3xl'>
          <FontAwesomeIcon className='text-4xl' icon={faWind}/>

          <p className='text-2xl md:text-3xl h-20 justify-center font-bold flex flex-col'>
            <span className='text-lg md:text-xl text-slate-400'>Windspeed</span>
            <span className='text-xl md:text-3xl'>{!loading ? `${weatherData.current.windSpeed} ${speedUnit}` : 'Loading...'}</span>
          </p>
        </div>

        <div className='bg-slate-600 flex justify-center px-12 gap-3 items-center text-slate-300 h-full w-full rounded-3xl'>
          <FontAwesomeIcon className='text-4xl' icon={faSun}/>

          <p className='text-2xl md:text-3xl h-20 justify-center font-bold flex flex-col'>
            <span className='text-lg md:text-xl text-slate-400'>UV Index</span>
            <span className='text-xl md:text-3xl'> {!loading ? `${weatherData.current.uvIndex}` : 'Loading...'}</span>
          </p>
        </div>

        <div className='bg-slate-600 flex justify-center px-12 gap-3 items-center text-slate-300 h-full w-full rounded-3xl'>
          <FontAwesomeIcon className='text-4xl' icon={faEye}/>

          <p className='text-2xl md:text-3xl h-20 justify-center font-bold flex flex-col'>
            <span className='text-lg md:text-xl text-slate-400'>Visibility</span>
            <span className='text-xl md:text-3xl'>{!loading ? (speedUnit == 'km/h' ? `${weatherData.hourly[0].visibility / 1000} km` : `${Math.round(weatherData.hourly[0].visibility / (5280 / 10)) * 10}mi`) : 'Loading...'}</span>
          </p>
        </div>

        <div className='bg-slate-600 flex justify-center px-12 gap-3 items-center text-slate-300 h-full w-full rounded-3xl'>
          <FontAwesomeIcon className='text-4xl' icon={faGaugeSimple}/>

          <p className='text-2xl md:text-3xl h-20 justify-center font-bold flex flex-col'>
            <span className='text-lg md:text-xl text-slate-400'>Pressure</span>
            <span className='text-xl md:text-3xl'> 1018.2 mb</span>
          </p>
        </div>
    </div>
  )
}
