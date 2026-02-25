import type { TempUnit, WeatherData } from '@/extras/types'
import { faCaretDown, faCaretUp, faDroplet } from '@fortawesome/free-solid-svg-icons'
import { weatherDescriptionToString } from '@/extras/scripts'
import { weatherDescriptionToEmoji } from '@/extras/scripts-tsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface props {
  loading: boolean,
  weatherData: WeatherData,
  tempUnit: TempUnit
}

export default function DailyForecast({ loading, weatherData, tempUnit }: props) {
  return (
    <div className='bg-slate-700 w-full md:w-[60%] p-5 rounded-3xl flex flex-col gap-3'>
      {!loading ? weatherData.daily.map((itm, i) => <div className='bg-slate-600 rounded-3xl p-5 flex-row  flex items-center font-bold' key={i}>
        <div className='flex justify-between w-full h-20 items-center'>
          <div className='flex items-start flex-col justify-start gap-1'>
            <span className='text-xl font-bold'>{itm.weekday}</span>

            <span className='text-lg font-bold'>
              <span className='text-orange-300'>
                <FontAwesomeIcon icon={faCaretUp}/>
                {!loading ? `${itm.temperature.high}°${tempUnit}` : 'Loading...'}
              </span>
              /
              <span className='text-blue-300'>
                <FontAwesomeIcon icon={faCaretDown}/>
                {!loading ? `${itm.temperature.low}°${tempUnit}` : 'Loading...'}
              </span>
            </span>
          </div>
          <div>
            <p className='text-5xl'>{weatherDescriptionToEmoji(itm.description)}</p>
          </div>

        </div>
      </div>) : 'Loading...'}
    </div>
  )
}
