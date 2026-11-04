import { useState, type ReactNode } from 'react'
import { BookOpen, Copy, Library, Pencil, Plus, Settings2, Trash2, Volume2 } from 'lucide-react'
import {
  AnswerFeedback, AnswerOption, Article, Avatar, Badge, BlankInput, BottomSheet, Breadcrumb, Button, ButtonLink, Card, CardButton,
  CardGridSkeleton, Checkbox, Chip, ConfirmDialog, Dialog, Disclosure, Divider, Drawer, DropdownMenu, EmptyState, Fab, Field,
  FileInput, GenderTag, IconButton, Input, LeitnerBox, ListCardSkeleton, NativeSelect, NavItem, Note, PageHeader, Pagination,
  Popover, ProgressBar, QuestionNav, Radio, ReviewCard, RowButton, SearchInput, Segmented, Select, SectionHeader, SettingRow,
  Skeleton, Slider, Spinner, Stat, Stepper, StreakTab, Switch, Table, Tabs, Tag, Textarea, TextLink, Tooltip, useToast,
} from '@kit'

// Danh mục sống của bộ kit (GĐ 4): mọi component, mọi biến thể và trạng thái, đúng như app dùng.

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card title={title}>
        <div className="space-y-6">{children}</div>
      </Card>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs text-hauch">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export default function KitCatalog() {
  const toast = useToast()
  const [selectValue, setSelectValue] = useState<string | null>('a2')
  const [segment, setSegment] = useState('light')
  const [tab, setTab] = useState('a')
  const [page, setPage] = useState(3)
  const [switchOn, setSwitchOn] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const [dialog, setDialog] = useState<null | 'dialog' | 'confirm' | 'sheet' | 'drawer'>(null)
  const [blank, setBlank] = useState('')

  return (
    <div className="space-y-6">
      <Group id="k-co-ban" title="Nút">
        <Row label="Button: primary / secondary / ghost / danger">
          <Button>Bắt đầu ôn</Button>
          <Button variant="secondary">Để sau</Button>
          <Button variant="ghost">Bỏ qua</Button>
          <Button variant="danger" icon={<Trash2 className="size-4" aria-hidden="true" />}>Xoá bộ từ</Button>
        </Row>
        <Row label="size sm, icon, loading, disabled">
          <Button size="sm" icon={<Plus className="size-4" aria-hidden="true" />}>Thêm từ</Button>
          <Button loading>Đang lưu...</Button>
          <Button disabled>Đã ôn xong</Button>
          <Button variant="secondary" disabled>Không bấm được</Button>
        </Row>
        <Row label="IconButton (bắt buộc có label), ButtonLink, TextLink, Spinner">
          <IconButton label="Nghe phát âm" icon={<Volume2 className="size-4" aria-hidden="true" />} />
          <IconButton variant="secondary" label="Sửa" icon={<Pencil className="size-4" aria-hidden="true" />} />
          <IconButton variant="primary" label="Sao chép" icon={<Copy className="size-4" aria-hidden="true" />} />
          <ButtonLink to="/app" variant="secondary">Về trang chủ</ButtonLink>
          <TextLink to="/app/grammar">Liên kết trong chữ</TextLink>
          <Spinner label="Đang tải" />
        </Row>
      </Group>

      <Group id="k-form" title="Ô nhập và chọn">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Input" hint="Gợi ý nằm dưới ô."><Input placeholder="die Anmeldung" /></Field>
          <Field label="Input lỗi" error="Termin là der, Akkusativ thành einen Termin."><Input defaultValue="ein Termin" /></Field>
          <Field label="Mật khẩu" required><Input type="password" defaultValue="geheim123" /></Field>
          <Field label="SearchInput"><SearchInput placeholder="Tìm chủ điểm..." /></Field>
          <Field label="Select tự vẽ">
            <Select value={selectValue} onChange={setSelectValue}
              options={[{ value: 'a1', label: 'A1' }, { value: 'a2', label: 'A2' }, { value: 'b1', label: 'B1' }]} />
          </Field>
          <Field label="NativeSelect">
            <NativeSelect defaultValue="die"><option value="der">der</option><option value="die">die</option><option value="das">das</option></NativeSelect>
          </Field>
          <Field label="Textarea" className="sm:col-span-2"><Textarea placeholder="Viết lại câu bằng tiếng Đức..." /></Field>
          <Field label="FileInput"><FileInput /></Field>
          <Field label="Slider"><Slider min={0} max={1} step={0.1} defaultValue={0.6} /></Field>
          <Input disabled placeholder="Ô bị khoá" aria-label="Ô bị khoá" />
        </div>
        <Row label="Checkbox, Radio, Switch">
          <Checkbox label="Tự động chuyển câu" defaultChecked />
          <Checkbox label="Bị khoá" disabled />
          <Radio name="demo-radio" label="Đúng" defaultChecked />
          <Radio name="demo-radio" label="Sai" />
          <Switch label="Nhắc ôn mỗi ngày" checked={switchOn} onChange={setSwitchOn} className="min-w-56" />
        </Row>
      </Group>

      <Group id="k-bo-cuc" title="Bố cục, thẻ">
        <div className="rounded-karte border border-dashed border-kante p-4">
          <PageHeader title="PageHeader" description="Tiêu đề trang, mô tả và hành động bên phải." back={{ to: '/app', label: 'Trang chủ' }}
            actions={<Button size="sm">Hành động</Button>} className="mb-0" />
        </div>
        <SectionHeader title="SectionHeader" description="Tiêu đề một mục trong trang." action={<TextLink to="/app">Xem tất cả</TextLink>} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card><p className="font-semibold">Card default</p><p className="text-sm text-radiert">Thẻ nằm trên bìa.</p></Card>
          <Card variant="highlight"><p className="font-semibold">Card highlight</p><p className="text-sm text-radiert">Thẻ đang chọn.</p></Card>
          <Card variant="sunken"><p className="font-semibold">Card sunken</p><p className="text-sm text-radiert">Khay lõm, không bóng.</p></Card>
          <Card variant="dashed"><p className="font-semibold">Card dashed</p><p className="text-sm text-radiert">Chỗ trống, vùng thả tệp.</p></Card>
        </div>
        <Card title="Card có tiêu đề (dòng đỏ đầu thẻ)" action={<Badge>3 thẻ</Badge>}>
          <p className="text-sm text-radiert">Thẻ lồng bên trong tự nhẹ đi:</p>
          <Card className="mt-3"><p className="text-sm">Card lồng trong Card: nền lõm, viền kẻ nhạt, không bóng.</p></Card>
        </Card>
        <Divider />
      </Group>

      <Group id="k-hien-thi" title="Nhãn, số liệu, bảng">
        <Row label="Tag, Badge (neutral / ok / bad / info / emph)">
          <Tag>Behörde</Tag>
          <Badge>12 từ</Badge>
          <Badge tone="ok">Đúng 9/10</Badge>
          <Badge tone="bad">3 quá hạn</Badge>
          <Badge tone="info">Đang học</Badge>
          <Badge tone="emph">Thành thạo</Badge>
        </Row>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Từ đã thuộc" value="128" hint="+12 tuần này" />
          <Stat label="Cần ôn" value="24" />
          <div className="flex items-center gap-3"><Avatar name="Doan Trung" /><Avatar name="Chậm" /></div>
          <div className="flex items-center">
            <Tooltip content="Chuỗi ngày học liên tiếp"><Button variant="secondary" size="sm">Rê chuột vào đây</Button></Tooltip>
          </div>
        </div>
        <ProgressBar value={0.4} label="Tiến độ" />
        <ProgressBar value={0.8} label="Mục tiêu" tone="emph" />
        <Table>
          <thead><tr><th>Ngôi</th><th>Đuôi</th><th>Ví dụ</th></tr></thead>
          <tbody>
            <tr><td>ich</td><td>-e</td><td>ich lerne</td></tr>
            <tr><td>du</td><td>-st</td><td>du lernst</td></tr>
            <tr><td>er/sie/es</td><td>-t</td><td>er lernt</td></tr>
          </tbody>
        </Table>
      </Group>

      <Group id="k-phan-hoi" title="Phản hồi">
        <div className="grid gap-3 sm:grid-cols-2">
          <Note tone="info" title="Thông tin">Bài nghe mới: 12 video hội thoại A2.</Note>
          <Note tone="ok" title="Đã lưu">Hẹn bạn ngày mai.</Note>
          <Note tone="emph" title="Sắp đạt mục tiêu">Còn 3 thẻ nữa là xong mục tiêu tuần.</Note>
          <Note tone="bad" title="Có lỗi" action={<Button size="sm" variant="secondary">Thử lại</Button>}>Không tải được âm thanh.</Note>
        </div>
        <EmptyState icon={<Library />} title="Chưa có bộ từ nào" description="Tạo bộ từ đầu tiên rồi thêm từ bạn muốn ôn."
          action={<Button size="sm" icon={<Plus className="size-4" aria-hidden="true" />}>Tạo bộ từ</Button>} />
        <Row label="Toast (bấm để hiện)">
          <Button variant="secondary" size="sm" onClick={() => toast({ tone: 'ok', message: 'Đã lưu từ vào bộ của bạn.' })}>Toast ok</Button>
          <Button variant="secondary" size="sm" onClick={() => toast({ tone: 'info', message: 'Có 3 video mới.' })}>Toast info</Button>
          <Button variant="secondary" size="sm" onClick={() => toast({ tone: 'bad', message: 'Mất kết nối, thử lại sau.' })}>Toast bad</Button>
        </Row>
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <ListCardSkeleton count={3} />
          <CardGridSkeleton count={3} />
        </div>
      </Group>

      <Group id="k-bam" title="Bề mặt bấm được">
        <div className="grid gap-3 sm:grid-cols-2">
          <CardButton to="/app/vocabulary"><p className="font-semibold">CardButton (liên kết)</p><p className="text-sm text-radiert">Cả thẻ bấm được.</p></CardButton>
          <CardButton onClick={() => toast({ message: 'Đã bấm thẻ.' })}><p className="font-semibold">CardButton (nút)</p><p className="text-sm text-radiert">Nhấc lên khi rê chuột.</p></CardButton>
        </div>
        <Card className="p-2">
          <RowButton icon={<BookOpen />} title="RowButton" description="Một dòng trong danh sách" to="/app/vocabulary" />
          <RowButton icon={<Settings2 />} title="RowButton đang chọn" selected onClick={() => {}} />
        </Card>
        <Card className="py-1">
          <SettingRow label="SettingRow" description="Nhãn bên trái, điều khiển bên phải."><Switch label={<span className="sr-only">Bật</span>} checked={switchOn} onChange={setSwitchOn} /></SettingRow>
        </Card>
        <Disclosure summary="Disclosure: bấm để mở">Nội dung ẩn bên trong, gập lại được.</Disclosure>
        <Row label="Chip (lọc), Fab ở góc dưới phải">
          <Chip selected>A1</Chip>
          <Chip>A2</Chip>
          <Chip disabled>C2</Chip>
          <span className="text-xs text-hauch">Fab xem ở góc màn hình</span>
        </Row>
        <Fab label="Thêm từ mới" icon={<Plus />} onClick={() => toast({ message: 'Fab đã được bấm.' })} className="right-24" />
      </Group>

      <Group id="k-lop-phu" title="Lớp phủ">
        <Row label="Dialog, ConfirmDialog, BottomSheet, Drawer, DropdownMenu, Popover">
          <Button variant="secondary" onClick={() => setDialog('dialog')}>Mở Dialog</Button>
          <Button variant="secondary" onClick={() => setDialog('confirm')}>Mở ConfirmDialog</Button>
          <Button variant="secondary" onClick={() => setDialog('sheet')}>Mở BottomSheet</Button>
          <Button variant="secondary" onClick={() => setDialog('drawer')}>Mở Drawer</Button>
          <DropdownMenu label="Tuỳ chọn bộ từ" trigger={<><Settings2 className="size-4" aria-hidden="true" /> Menu</>}
            items={[{ label: 'Đổi tên', icon: <Pencil />, onSelect: () => {} }, { label: 'Xoá', icon: <Trash2 />, danger: true, onSelect: () => {} }]} />
          <Popover label="Giải thích" trigger="Popover">
            <p className="font-semibold">Akkusativ</p>
            <p className="mt-1 text-radiert">Cách 4: tân ngữ trực tiếp. der thành den.</p>
          </Popover>
        </Row>
        <Dialog open={dialog === 'dialog'} onClose={() => setDialog(null)} title="Dừng buổi ôn?" description="Thẻ đã chấm vẫn được lưu."
          footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Ôn tiếp</Button><Button onClick={() => setDialog(null)}>Dừng</Button></>} />
        <ConfirmDialog open={dialog === 'confirm'} onClose={() => setDialog(null)} onConfirm={() => setDialog(null)} danger
          title="Xoá bộ từ này?" description="Không hoàn tác được." confirmLabel="Xoá" />
        <BottomSheet open={dialog === 'sheet'} onClose={() => setDialog(null)} title="Chế độ luyện">
          <RowButton title="Flashcard" selected onClick={() => setDialog(null)} />
          <RowButton title="Trắc nghiệm" onClick={() => setDialog(null)} />
        </BottomSheet>
        <Drawer open={dialog === 'drawer'} onClose={() => setDialog(null)} label="Menu thử">
          <div className="p-4">
            <p className="mb-3 font-display text-lg font-semibold">Drawer</p>
            <Button variant="secondary" onClick={() => setDialog(null)}>Đóng</Button>
          </div>
        </Drawer>
      </Group>

      <Group id="k-dieu-huong" title="Điều hướng">
        <Tabs label="Tab mẫu" value={tab} onChange={setTab}
          items={[{ value: 'a', label: 'Bảng chữ cái' }, { value: 'b', label: 'Âm ghép', count: 12 }, { value: 'c', label: 'Luyện tập' }]}>
          <p className="text-sm text-radiert">Nội dung tab "{tab}".</p>
        </Tabs>
        <Row label="Segmented, Stepper, Pagination">
          <Segmented label="Giao diện" value={segment} onChange={setSegment}
            options={[{ value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }, { value: 'system', label: 'Theo máy' }]} />
          <Stepper steps={['Nghe', 'Chép', 'Kiểm tra']} current={1} />
          <Pagination page={page} pageCount={9} onChange={setPage} />
        </Row>
        <Breadcrumb items={[{ label: 'Nghe', to: '/app/listening' }, { label: 'Video YouTube', to: '/app/listening/youtube' }, { label: 'Nicos Weg, Folge 1' }]} />
        <div className="max-w-60 space-y-0.5 rounded-karte border border-kartenrand bg-karteikarte p-2">
          <NavItem to="/design" icon={<BookOpen />} label="NavItem đang mở" />
          <NavItem to="/app/review" icon={<Library />} label="NavItem có số" badge={<Badge tone="bad">24</Badge>} />
        </div>
      </Group>

      <Group id="k-nghiep-vu" title="Nghiệp vụ DeutschPfad">
        <Row label="GenderTag, Article, StreakTab">
          <GenderTag gender="der" /><GenderTag gender="die" /><GenderTag gender="das" />
          <span><Article gender="die" /> Anmeldung</span>
          <StreakTab days={12} />
        </Row>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewCard flipped={flipped} onFlip={() => setFlipped((f) => !f)}
            front={<><span className="font-display text-3xl font-semibold"><Article gender="die" /> Anmeldung</span><span className="mt-3 text-xs text-hauch">Bấm để lật</span></>}
            back={<><span className="font-display text-xl font-semibold">sự đăng ký (cư trú)</span><span className="mt-2 text-sm text-radiert italic">Die Anmeldung dauert zehn Minuten.</span></>} />
          <div className="space-y-2">
            <AnswerOption state="idle">das</AnswerOption>
            <AnswerOption state="selected">die (đang chọn)</AnswerOption>
            <AnswerOption state="correct">die</AnswerOption>
            <AnswerOption state="wrong">der</AnswerOption>
            <AnswerOption state="dim">das</AnswerOption>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <AnswerFeedback correct>Danh từ đuôi -ung luôn là die.</AnswerFeedback>
          <AnswerFeedback correct={false}>Termin là der, Akkusativ thành einen Termin.</AnswerFeedback>
        </div>
        <p className="text-lg leading-loose">
          Ich habe einen
          <BlankInput chars={6} value={blank} onChange={(e) => setBlank(e.target.value)} aria-label="Chỗ trống"
            state={blank.length === 0 ? 'empty' : blank === 'Termin' ? 'correct' : 'wrong'} />
          beim Bürgeramt.
        </p>
        <QuestionNav current={2} onSelect={() => {}} marks={['correct', 'wrong', 'open', 'open', 'correct', 'open']} />
        <LeitnerBox stages={[
          { label: 'Chưa nhớ', hint: 'mới gặp hoặc vừa quên', count: 24 },
          { label: 'Đang học', hint: 'nhớ được 1 lần', count: 41 },
          { label: 'Đã thuộc', hint: 'nhớ đúng từ 2 lần', count: 63 },
          { label: 'Nhớ lâu', hint: 'lịch ôn cách từ 3 tuần', count: 120 },
        ]} />
      </Group>
    </div>
  )
}
