import { FileText, Newspaper } from 'lucide-react'
import { PageHeader } from '@kit'
import HubChoice from '../components/hub/HubChoice'

export default function ReadingHubPage() {
  return (
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Luyện đọc tiếng Đức"
        description="Luyện đọc qua bài báo, trích đoạn sách theo chủ đề đời sống, hoặc luyện trực tiếp với dữ liệu đề thi mẫu chính thức Goethe-Institut để làm quen với đúng định dạng thi thật." />
      <div className="grid gap-4 sm:grid-cols-2">
        <HubChoice to="/app/reading/articles" featured icon={<Newspaper />} title="Đọc qua sách, báo" description="Bài báo, trích đoạn sách đời sống" />
        <HubChoice to="/app/reading/exam" icon={<FileText />} title="Đọc qua đề thi" description="Dữ liệu Modellsatz Goethe-Institut" />
      </div>
    </div>
  )
}
