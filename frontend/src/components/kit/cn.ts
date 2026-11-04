import { extendTailwindMerge } from 'tailwind-merge'

// Gộp class Tailwind, class truyền vào sau thắng class mặc định của component. Báo cho tailwind-merge
// biết các tên bóng/bo góc của hệ token, không thì nó coi shadow-lift là màu bóng và gộp sai.
const merge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ['lift', 'pop', 'offset'],
      radius: ['karte', 'reiter', 'rund'],
    },
  },
})

export function cn(...classes: (string | false | null | undefined)[]) {
  return merge(classes.filter(Boolean).join(' '))
}

/** Vòng focus thống nhất cho mọi thứ bấm được. */
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fokus'
