"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"

interface Holiday {
  date: string
  localName?: string
  name: string
  countryCode?: string
}

interface OccaSearchProps {
  country?: string
  countryCode?: string
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function OccaSearch({
  country,
  countryCode,
  onSearch,
  placeholder = "Search for occasions...",
}: OccaSearchProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Get current date and date 7 days from now
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  // Format dates for API
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const currentYear = today.getFullYear()

  useEffect(() => {
    const fetchHolidays = async () => {
      if (!countryCode) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`)

        if (!response.ok) {
          throw new Error("Failed to fetch holidays")
        }

        const data: Holiday[] = await response.json()

        // Filter holidays to only include those in the next 7 days
        const filteredHolidays = data.filter((holiday) => {
          const holidayDate = new Date(holiday.date)
          return holidayDate >= today && holidayDate <= nextWeek
        })

        setHolidays(filteredHolidays)
      } catch (err) {
        setError("Error fetching holiday data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHolidays()
  }, [countryCode, currentYear])

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleSuggestionClick = (holidayName: string) => {
    setQuery(holidayName)
    if (onSearch) {
      onSearch(holidayName)
    }
    setIsFocused(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-2 pl-10 pr-4 text-white bg-black border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)] focus:shadow-[0_0_15px_rgba(59,130,246,0.8)] placeholder-blue-300"
            aria-label={`Search for occasions in ${country}`}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {isFocused && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-2 bg-black border-2 border-blue-500 rounded-lg shadow-lg shadow-blue-500/50 overflow-hidden"
            role="listbox"
            aria-label="Holiday suggestions"
          >
            {isLoading ? (
              <div className="p-4 text-center text-blue-300">
                <div className="animate-pulse">Loading holidays...</div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">{error}</div>
            ) : holidays.length > 0 ? (
              <div className="p-3">
                <div className="mb-2 text-xs text-blue-400">Upcoming holidays in {country}:</div>
                <div className="flex flex-wrap gap-2">
                  {holidays.map((holiday) => (
                    <button
                      key={holiday.date + holiday.name}
                      onClick={() => handleSuggestionClick(holiday.name)}
                      className="px-3 py-1 text-sm text-white bg-blue-900 rounded-full hover:bg-blue-800 transition-colors border border-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)] hover:shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      role="option"
                    >
                      {holiday.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-blue-300">No upcoming holidays in the next 7 days</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
