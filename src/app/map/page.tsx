'use client'

// Map page:
// - Reuses the same SearchBar component as the weather home page.
// - When you pick a city in the search bar, we center the big
//   OpenStreetMap view on that city's coordinates.

import { useEffect, useState } from 'react'
import Navbar from '@/components/generic/navbar'
import SearchBar from '@/components/home/searchbar'
import type { CityData, ClockFormat, SpeedUnit, TempUnit } from '@/extras/types'

// Minimal lat/lon pair used to drive the iframe.
interface Coordinates {
    lat: number
    lon: number
}

export default function MapPage() {
  // Display options here are only used so the SearchBar
  // behaves the same as on the main page (the toggles work).
    const [clockFormat, setClockFormat] = useState<ClockFormat>('24')
    const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('km/h')
    const [tempUnit, setTempUnit] = useState<TempUnit>('C')

  // City that the SearchBar controls. It uses the Open‑Meteo
  // geocoding API to fill this with a CityData object.
    const [city, setCity] = useState<CityData>({
        town: 'New York (fallback)',
        state: 'New York',
        country: 'United States',
        // NOTE: In the shared types, this is [latitude, longitude].
        location: [40.7128, -74.006],
    })

  // Coordinates that actually drive the OpenStreetMap embed.
    const [coords, setCoords] = useState<Coordinates>({
        lat: city.location[0],
        lon: city.location[1],
    })

  // Whenever the SearchBar changes the city (via setCity),
  // keep the map center in sync with that new city's coordinates.
    useEffect(() => {
        if (!city) return
        const [lat, lon] = city.location
        setCoords({ lat, lon })
    }, [city])

  // The SearchBar expects a "fetchWeather" callback. On the home page
  // that actually hits the weather API, but on this page we don't
  // need to fetch anything. We still provide a no‑op function to
  // satisfy the prop type and keep the same UI.
  async function handleSearchBarAction() {
    // No extra work needed: the effect above already syncs the map
    // when the SearchBar changes the city.
    return
  }

  // OpenStreetMap's embed URL takes a "bbox" (left, bottom, right, top)
  // and a "marker" parameter for the pin. We build a small bounding box
  // around the current center so the map isn't zoomed out too far.
  const delta = 0.05
  const bbox = [
    coords.lon - delta,
    coords.lat - delta,
    coords.lon + delta,
    coords.lat + delta,
  ].join(',')

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-5 font-sans bg-slate-800 gap-3">
      <Navbar />

      <div className="flex flex-1 flex-col gap-3">
        {/* Same search bar + unit toggles as the main weather page.
            Here it just controls which city's coordinates the map uses. */}
        <SearchBar
          fetchWeather={handleSearchBarAction}
          setCity={setCity}
          setClockFormat={setClockFormat}
          setSpeedUnit={setSpeedUnit}
          setTempUnit={setTempUnit}
          clockFormat={clockFormat}
          speedUnit={speedUnit}
          tempUnit={tempUnit}
        />

        <div className="flex-1 overflow-hidden rounded-3xl border border-slate-700">
          <iframe
            title="OpenStreetMap view"
            src={embedUrl}
            className="h-full rounded-3xl min-h-[60vh] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

/*

'use client'

// This page shows a big OpenStreetMap view with
// a search box that talks to the Nominatim API.
// As you type, we show clickable suggestions, and
// hitting "Search" or clicking a suggestion recenters the map.

import { FormEvent, useEffect, useState } from 'react'
import Navbar from '@/components/generic/navbar'

// Lat/lon pair we keep in React state.
interface Coordinates {
  lat: number
  lon: number
}

// What we keep for each suggestion row.
interface Suggestion {
  name: string
  lat: number
  lon: number
}

export default function MapPage() {
  // Raw text in the search box.
  const [query, setQuery] = useState('')

  // The coordinates that drive the map center + marker.
  const [coords, setCoords] = useState<Coordinates>({
    lat: 40.7128,
    lon: -74.006,
  })

  // "Search" button state.
  const [loading, setLoading] = useState(false)

  // Top‑level error message for failed search or no results.
  const [error, setError] = useState<string | null>(null)

  // Autocomplete suggestions under the input.
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionLoading, setSuggestionLoading] = useState(false)

  // Submit handler for the form: do a "strong" search
  // that recenters the map on the first Nominatim hit.
  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmed,
        )}&format=json&limit=1`,
      )

      if (!res.ok) {
        throw new Error('Search failed')
      }

      const results: Array<{ lat: string; lon: string }> = await res.json()
      if (!results.length) {
        setError('No results found for that place.')
        return
      }

      const { lat, lon } = results[0]
      setCoords({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      })

      // Once we've jumped the map, we can hide suggestions.
      setSuggestions([])
      setShowSuggestions(false)
    } catch (err) {
      setError('Unable to search that location right now.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // When the user types, we hit Nominatim with a debounced
  // search and show up to 5 suggestions.
  useEffect(() => {
    const trimmed = query.trim()

    // If the box is empty, clear and hide suggestions.
    if (!trimmed) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Small delay so we don't send a request on *every* keystroke.
    const timeoutId = setTimeout(async () => {
      try {
        setSuggestionLoading(true)

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            trimmed,
          )}&format=json&limit=5`,
        )

        if (!res.ok) {
          throw new Error('Suggestion search failed')
        }

        type RawResult = {
          display_name: string
          lat: string
          lon: string
        }

        const results: RawResult[] = await res.json()

        // Map the raw Nominatim payload into our light Suggestion type.
        const mapped = results.map((r) => ({
          name: r.display_name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
        }))

        setSuggestions(mapped)
        setShowSuggestions(mapped.length > 0)
      } catch (err) {
        // For autocomplete, we fail silently and just hide suggestions.
        console.error(err)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setSuggestionLoading(false)
      }
    }, 400)

    // Cleanup: cancel the timeout if query changes quickly.
    return () => clearTimeout(timeoutId)
  }, [query])

  // Clicking a suggestion should:
  // - fill the input with a nice name
  // - move the map center
  // - clear any previous error
  function handleSuggestionClick(suggestion: Suggestion) {
    setQuery(suggestion.name)
    setCoords({
      lat: suggestion.lat,
      lon: suggestion.lon,
    })
    setError(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Simple bounding box around the current coordinates for the embed.
  // OpenStreetMap's embed URL takes a "bbox" (left, bottom, right, top)
  // and a "marker" param for the pin.
  const delta = 0.05
  const bbox = [
    coords.lon - delta,
    coords.lat - delta,
    coords.lon + delta,
    coords.lat + delta,
  ].join(',')

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-5 font-sans bg-slate-800 gap-3">
      <Navbar />

      <div className="flex flex-1 flex-col gap-3">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-2 items-stretch md:items-center"
        >
          // Wrapping the input in a relative container so
          // we can absolutely-position the suggestions list.
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              placeholder="Search for a place (city, address, landmark...)"
              className="w-full rounded-3xl px-3 py-2 bg-slate-700 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
            />

            {showSuggestions && (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-3xl border border-slate-700 bg-slate-800 shadow-lg">
                {suggestionLoading && (
                  <div className="px-3 py-2 text-sm text-slate-300">
                    Searching...
                  </div>
                )}

                {!suggestionLoading && suggestions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    No suggestions.
                  </div>
                )}

                {!suggestionLoading &&
                  suggestions.map((s, index) => (
                    <button
                      key={`${s.lat}-${s.lon}-${index}`}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </form>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex-1 overflow-hidden rounded-3xl border border-slate-700">
          <iframe
            title="OpenStreetMap view"
            src={embedUrl}
            className="h-full min-h-[60vh] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

*/
