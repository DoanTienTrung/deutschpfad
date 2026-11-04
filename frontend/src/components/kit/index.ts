// Cửa import duy nhất cho component giao diện: import { Button, Card } from '@kit'
// Trang và component nghiệp vụ không tự tô <button>/<input>/<select>, không tự dựng hộp thoại.

export { cn, focusRing } from './cn'

// Cơ bản
export { Button, IconButton, ButtonLink, TextLink, Spinner } from './basic'
export { buttonClass, type ButtonVariant, type ButtonSize } from './button-class'
export { Field, Input, SearchInput, Textarea, NativeSelect, Select, Checkbox, Radio, Switch, Slider, FileInput, type SelectOption } from './form'

// Bố cục và hiển thị
export { PageHeader, SectionHeader, Card, Tag, Badge, Stat, Table, Divider, Avatar, Tooltip, ProgressBar, type CardVariant, type BadgeTone } from './layout'

// Phản hồi
export { Note, EmptyState, Skeleton, CardGridSkeleton, ListCardSkeleton, ToastProvider, type NoteTone } from './feedback'
export { useToast, type ToastTone } from './toast-context'

// Bề mặt bấm được
export { CardButton, RowButton, SettingRow, Disclosure, Chip, Fab } from './surfaces'

// Lớp phủ
export { Dialog, ConfirmDialog, BottomSheet, Drawer, DropdownMenu, Popover, type MenuItem } from './overlay'

// Điều hướng
export { Tabs, Segmented, Stepper, NavItem, Pagination, Breadcrumb, type TabItem, type Crumb } from './navigation'

// Nghiệp vụ DeutschPfad
export { GenderTag, Article, StreakTab, AnswerFeedback, AnswerOption, QuestionNav, BlankInput, LeitnerBox, ReviewCard, type AnswerState, type QuestionMark, type Gender, type LeitnerStage } from './domain'
