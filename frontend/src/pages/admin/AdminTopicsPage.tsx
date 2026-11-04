import { useEffect, useState } from 'react'
import { Button, Input, Note } from '@kit'
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
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteTopic(id)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-bleistift">Quản lý Chủ đề</h2>

      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      <div className="mb-6 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên chủ đề (vd. Bewerbung)"
          className="flex-1"
        />
        <Button variant="primary"
          onClick={handleCreate}>
          Thêm
        </Button>
      </div>

      <ul className="space-y-2">
        {topics.map((topic) => (
          <li
            key={topic.id}
            className="flex items-center justify-between rounded-karte border border-kartenrand bg-karteikarte p-3"
          >
            <span>{topic.name}</span>
            <Button variant="ghost" className="text-rotstift"
              onClick={() => handleDelete(topic.id)}>
              Xoá
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
