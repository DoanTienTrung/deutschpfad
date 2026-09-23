// Cho phép bất kỳ trang nào mở widget Gia sư kèm sẵn câu hỏi, mà không phải nhấc state của
// TutorChatWidget lên context toàn app chỉ vì một nút bấm. Widget nằm trong AppLayout còn các
// trang là route con, nên một CustomEvent trên window là đường ngắn nhất giữa hai bên.
const OPEN_TUTOR_EVENT = 'deutschpfad:open-tutor'

export function openTutorWithQuestion(question: string) {
  window.dispatchEvent(new CustomEvent<string>(OPEN_TUTOR_EVENT, { detail: question }))
}

export function onOpenTutor(handler: (question: string) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<string>).detail)
  window.addEventListener(OPEN_TUTOR_EVENT, listener)
  return () => window.removeEventListener(OPEN_TUTOR_EVENT, listener)
}
