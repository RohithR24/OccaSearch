"use client"

import { useState } from "react"
import OccaSearch from "@/components/occa-search"

export default function Home() {
  const [searchResult, setSearchResult] = useState<string | null>(null)

  const handleSearch = (query: string) => {
    setSearchResult(query)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-400 mb-2 text-shadow-glow">OccaSearch</h1>
        </div>

        <OccaSearch country="United States" onSearch={handleSearch} />

        {searchResult && (
          <div className="mt-8 p-4 border border-blue-500 rounded-lg bg-black/50 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Search Result:</h2>
            <p>{searchResult}</p>
          </div>
        )}
      </div>
    </main>
  )
}
