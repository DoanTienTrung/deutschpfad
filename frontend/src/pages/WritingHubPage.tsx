import { Languages, PenLine } from 'lucide-react'
import { PageHeader } from '@kit'
import HubChoice from '../components/hub/HubChoice'

export default function WritingHubPage() {
  return (
    <div className="mx-auto max-w-lesen">
      <PageHeader title="Viết" description="Luyện dịch để đặt câu tiếng Đức cho đúng, rồi luyện viết bài hoàn chỉnh theo dạng đề thi." />
      <div className="grid gap-4 sm:grid-cols-2">
        <HubChoice to="/app/writing/translate" featured icon={<Languages />} title="Luyện dịch"
          description="Dịch Việt sang Đức theo từng chủ điểm ngữ pháp, chấm và chữa từng câu." />
        <HubChoice icon={<PenLine />} title="Luyện viết" comingSoon
          description="Viết email, bài diễn đàn, thư trang trọng theo đề thi Goethe, AI chấm và chữa bài." />
      </div>
    </div>
  )
}
