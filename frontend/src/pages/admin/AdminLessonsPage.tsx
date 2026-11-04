import { useEffect, useState } from 'react'
import { Button, Input, NativeSelect, Note } from '@kit'
import { listLessons, createLesson, deleteLesson, listTopics } from '../../api/adminApi'
import type { Lesson, Topic, VocabularySource } from '../../api/types'
import { ApiError } from '../../api/client'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('A1')
  const [source, setSource] = useState<VocabularySource>('FREQUENCY')
  const [orderIndex, setOrderIndex] = useState(1)
  const [description, setDescription] = useState('')
  const [topicId, setTopicId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const [l, t] = await Promise.all([listLessons(), listTopics()])
    setLessons(l)
    setTopics(t)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, load() reused by handlers below
    load()
  }, [])

  async function handleCreate() {
    setError(null)
    try {
      await createLesson({ title, level, source, orderIndex, description, topicId })
      setTitle('')
      setDescription('')
      setTopicId(null)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteLesson(id)
      await load()
    } catch (err) {
      const serverMessage = err instanceof ApiError ? (err.data as { message?: string } | null)?.message : undefined
      setError(serverMessage || 'Có lỗi xảy ra')
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-xl font-bold text-bleistift">Quản lý Bài học</h2>

      {error && <Note tone="bad" className="mb-4">{error}</Note>}

      <div className="mb-6 grid grid-cols-1 gap-2 rounded-karte border border-kartenrand bg-karteikarte p-4 sm:grid-cols-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên bài học"
          className="sm:col-span-2"
        />
        <NativeSelect
          value={level}
          onChange={(e) => setLevel(e.target.value)}
         
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </NativeSelect>
        <Input
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(Number(e.target.value))}
          placeholder="Thứ tự"
         
        />
        <NativeSelect
          value={source}
          onChange={(e) => setSource(e.target.value as VocabularySource)}
          className="sm:col-span-2"
        >
          <option value="FREQUENCY">Nguồn: Tần suất (mặc định)</option>
          <option value="GOETHE">Nguồn: Goethe-Zertifikat</option>
          <option value="TEXTBOOK">Nguồn: Giáo trình</option>
          <option value="LIFE">Nguồn: Sống ở Đức</option>
        </NativeSelect>
        <NativeSelect
          value={topicId ?? ''}
          onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : null)}
          className="sm:col-span-2"
        >
          <option value="">-- Không thuộc chủ đề nào (từ vựng theo cấp) --</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </NativeSelect>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả (tuỳ chọn)"
          className="sm:col-span-2"
        />
        <Button variant="primary" className="sm:col-span-2"
          onClick={handleCreate}>
          Thêm bài học
        </Button>
      </div>

      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="flex items-center justify-between rounded-karte border border-kartenrand bg-karteikarte p-3"
          >
            <span>
              <strong>{lesson.level}</strong> - Bài {lesson.orderIndex}: {lesson.title}
              {lesson.source === 'GOETHE' && <span className="ml-2 text-xs text-radiert">[Goethe]</span>}
              {lesson.source === 'LIFE' && <span className="ml-2 text-xs text-radiert">[Sống ở Đức]</span>}
              {lesson.topicName && <span className="ml-2 text-xs text-radiert">[{lesson.topicName}]</span>}
            </span>
            <Button variant="ghost" className="text-rotstift"
              onClick={() => handleDelete(lesson.id)}>
              Xoá
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
