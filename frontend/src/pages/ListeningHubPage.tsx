import { FileText, MonitorPlay } from 'lucide-react'
import { PageHeader } from '@kit'
import HubChoice from '../components/hub/HubChoice'

export default function ListeningHubPage() {
  return (
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Luyện nghe tiếng Đức"
        description="Luyện nghe qua video hội thoại YouTube theo chủ đề đời sống, hoặc luyện trực tiếp với dữ liệu đề thi mẫu chính thức Goethe-Institut để làm quen với đúng định dạng thi thật." />
      <div className="grid gap-4 sm:grid-cols-2">
        <HubChoice to="/app/listening/youtube" featured icon={<MonitorPlay />} title="Luyện qua video YouTube" description="Hội thoại đời sống, đủ mọi cấp độ" />
        <HubChoice to="/app/listening/exam" icon={<FileText />} title="Luyện qua đề thi" description="Dữ liệu Modellsatz Goethe-Institut" />
      </div>
    </div>
  )
}
