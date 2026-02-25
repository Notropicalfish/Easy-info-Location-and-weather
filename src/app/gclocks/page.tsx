'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlobe, faClock } from '@fortawesome/free-solid-svg-icons'

import Navbar from '@/components/generic/navbar'

interface GlobalClockProps {
  timezone: string;
  label: string;
}

export default function GlobalClock({ timezone, label }: GlobalClockProps) {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    // Function to update the time based on the specific timezone
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setTime(formatter.format(now));
    }

    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, [timezone]);

  return (
    <div className="flex flex p-4 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 min-w-[200px]">
        <Navbar />
      <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
        <FontAwesomeIcon icon={faGlobe} className="text-xs" />
        <span className="font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faClock} className="text-2xl text-blue-400" />
        <span className="text-3xl font-mono font-bold">
          {time || '00:00:00 AM'}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500 italic">{timezone}</p>
    </div>
  )
}