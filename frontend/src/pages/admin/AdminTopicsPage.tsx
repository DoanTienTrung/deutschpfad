import { useEffect, useState } from 'react'
import { listTopics, createTopic, deleteTopic } from '../../api/adminApi'
import type { Topic } from '../../api/types'
import { ApiError } from '../../api/client'

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setTopics(await listTopics())
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  async function handleCreate() {
    setError(null)
    try {
      await createTopic(name)
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteTopic(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? String((err.data as { message?: string })?.message) : 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Quản lý Chủ đề</h2>

      {error && <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên chủ đề (vd. Bewerbung)"
          className="flex-1 rounded-sm border border-hairline px-3 py-2"
        />
        <button
          onClick={handleCreate}
          className="rounded-sm bg-primary px-4 py-2 font-medium text-white"
        >
          Thêm
        </button>
      </div>

      <ul className="space-y-2">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className="flex items-center justify-between rounded-sm border border-hairline bg-white p-3"
          >
            <span>{topic.name}</span>
            <button
              onClick={() => handleDelete(topic.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Xoá
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
