import { timeFormatFunction, weatherDescriptionToString } from '@/extras/scripts'
import { weatherDescriptionToEmoji } from '@/extras/scripts-tsx'
import type { ClockFormat, TempUnit, WeatherData } from '@/extras/types'

interface props {
  loading: boolean,
  weatherData: WeatherData,
  tempUnit: TempUnit,
  clockFormat: ClockFormat
}

export default function HourlyForecast({ loading, weatherData, tempUnit, clockFormat }: props) {
  return (
    <div className='flex flex-row rounded-3xl bg-slate-700 p-5 gap-3 h-2/3 min-h-50 w-full overflow-x-auto'>
      {!loading ? weatherData.hourly.map((itm, i) => <div key={i} className={`h-full min-w-30 px-4 md:gap-2 flex-col items-center justify-between py-5 flex rounded-3xl hover:--md-sys-color-primary hover:w-[150%] transition-all ${i == 0 ? 'bg-blue-500' : 'bg-slate-600'}`}>
        <p className={`font-bold text-md ${i == 0 ? 'text-slate-300' : 'text-slate-400'}`}>{timeFormatFunction(itm.time, clockFormat)}</p>
        <p className='text-3xl md:text-5xl'>{weatherDescriptionToEmoji(itm.description)}</p>
        <p className='text-xl font-bold'>{itm.temperature}°{tempUnit}</p>
        <p className='text-xl md:text-2xl text-slate-300'>{weatherDescriptionToString(itm.description)}</p>
      </div>) : 'Loading...'}
    </div>
  )
}
