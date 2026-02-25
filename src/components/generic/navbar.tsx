'use client'

import { useState } from 'react'
import { 
  faBook, 
  faClock, 
  faCloud, 
  faCog, 
  faFaceGrinSquintTears, 
  faLanguage, 
  faMap, 
  faChevronRight,
  faChevronLeft,
  IconDefinition 
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

interface LinkItem {
  icon: IconDefinition,
  label: string,
  href: string
}

export default function Navbar() {
  const [isExpanded, setIsExpanded] = useState(false)

  const links: LinkItem[] = [
    { icon: faCloud, label: 'Weather', href: '/' },
    { icon: faMap, label: 'Map', href: '/map' },
    { icon: faFaceGrinSquintTears, label: 'Meme', href: '/meme' },
    /*{ icon: faClock, label: 'Global Time', href: '/gclocks' }*/
  ]

  return (
    <nav className={`
      hidden md:flex flex-col h-screen bg-slate-700 rounded-3xl text-slate-200 border-r border-slate-800
      transition-all duration-300 ease-in-out py-6
      ${isExpanded ? 'w-100' : 'w-20'}
    `}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-8 flex items-center justify-center w-12 h-12 self-center rounded-3xl hover:bg-slate-700 transition-colors"
      >
        <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
      </button>

      {/* Main Links */}
      <div className="flex flex-col gap-2 px-3 flex-grow">
        {links.map((itm, i) => (
          <Link 
            key={i} 
            href={itm.href} 
            className="relative flex items-center h-12 rounded-3xl hover:bg-slate-700 transition-all group overflow-hidden"
          >
            {/* Icon Container - Forced sizing to keep it centered */}
            <div className="min-w-[3.5rem] flex items-center justify-center">
              <FontAwesomeIcon icon={itm.icon} className="text-xl" />
            </div>
            
            {/* Label - Absolute positioning prevents layout shifts during transition */}
            <span className={`
              absolute left-14 font-medium whitespace-nowrap transition-all duration-300
              ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
            `}>
              {itm.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 px-3 mt-auto border-t border-slate-700 pt-6">
        <button className="relative flex items-center h-12 rounded-3xl hover:bg-slate-700 transition-all group overflow-hidden">
          <div className="min-w-[3.5rem] flex items-center justify-center">
            <FontAwesomeIcon icon={faLanguage} className="text-xl text-slate-400" />
          </div>
          <span className={`
            absolute left-14 font-medium transition-all duration-300
            ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}>
            Language
          </span>
        </button>

        <Link href="/settings" className="relative flex items-center h-12 rounded-3xl hover:bg-slate-700 transition-all group overflow-hidden">
          <div className="min-w-[3.5rem] flex items-center justify-center">
            <FontAwesomeIcon icon={faCog} className="text-xl text-slate-400" />
          </div>
          <span className={`
            absolute left-14 font-medium transition-all duration-300
            ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}>
            Settings
          </span>
        </Link>
      </div>
    </nav>
  )
}