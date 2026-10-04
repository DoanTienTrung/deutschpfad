// Bước "làm quen bảng chữ cái" của danh sách làm quen ở trang chủ. Không có dữ liệu phía server cho
// việc xem bảng chữ cái, nên trình duyệt tự nhớ (mất khi đổi máy - chấp nhận được với một gợi ý).

const KEY = 'deutschpfad.alphabetVisited'

export function markAlphabetVisited() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // không lưu được thì thôi
  }
}

export function hasVisitedAlphabet(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
