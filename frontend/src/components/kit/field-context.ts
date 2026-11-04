import { createContext, useContext, type AriaAttributes } from 'react'

export interface FieldContextValue {
  id: string
  describedBy?: string
  invalid: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

/** Ô nhập đặt trong <Field> tự nhận id, aria-describedby, aria-invalid từ Field. */
export function useFieldControl(props: { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: AriaAttributes['aria-invalid'] }) {
  const field = useContext(FieldContext)
  return {
    // Trong Field thì id do Field cấp, để nhãn luôn trỏ đúng ô nhập.
    id: field?.id ?? props.id,
    'aria-describedby': [field?.describedBy, props['aria-describedby']].filter(Boolean).join(' ') || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid ? true : undefined),
  }
}
