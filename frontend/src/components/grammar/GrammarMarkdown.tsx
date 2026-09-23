import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Lý thuyết ngữ pháp và bảng tra cứu đều viết bằng markdown (GFM) ở trang admin, nên chỗ nào
// hiển thị cũng đi qua đây để giữ chung một kiểu chữ. Bảng bị bọc thêm 1 lớp cuộn ngang: bảng
// chia động từ 6 cột không thể vừa màn hình điện thoại, thà cho cuộn riêng còn hơn để nó đẩy cả
// trang tràn ngang.
export default function GrammarMarkdown({ children }: { children: string }) {
  return (
    <div className="prose-theory">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => <div className="prose-theory-table">
            <table>{children}</table>
          </div>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
