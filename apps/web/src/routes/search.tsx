import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

function SearchPage() {
  const [query, setQuery] = React.useState('')
  const [userId, setUserId] = React.useState('demo-user')
  const search = useMutation({
    mutationFn: async () => {
      const res = await fetch('/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, user_id: userId, topK: 5 }),
      })
      if (!res.ok) throw new Error('Search failed')
      return res.json() as Promise<{ results: { score: number; payload: { title: string; text_chunk: string } }[] }>
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Semantic Search</h1>
      <div className="flex gap-2">
        <input className="border p-2 rounded flex-1" placeholder="Query" value={query} onChange={(e) => setQuery(e.target.value)} />
        <input className="border p-2 rounded w-48" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <button onClick={() => search.mutate()} className="bg-black text-white px-4 py-2 rounded">Search</button>
      </div>
      <div className="space-y-3">
        {search.data?.results.map((r, i) => (
          <div key={i} className="border rounded p-3">
            <div className="text-sm text-gray-500">Score: {r.score.toFixed(3)} • {r.payload.title}</div>
            <p className="mt-2 whitespace-pre-wrap">{r.payload.text_chunk}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

