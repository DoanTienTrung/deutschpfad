-- Dọn hậu quả của V50.
--
-- V50 muốn chèn MỘT dòng ">" trống giữa hai dòng trích dẫn liền nhau, nhưng biểu thức của nó
-- ('(\n>[^\n]*)\n(>[^\n]*)') khớp lại chính kết quả nó vừa tạo — dòng ">" rỗng cũng thoả
-- '[^\n]*'. Chạy 4 lượt với cờ 'g' nên mỗi chỗ bị chèn tới 7 dòng rỗng thay vì 1.
--
-- Ở đây gom mọi chuỗi dòng ">" rỗng liền nhau về đúng một dòng: '(\n>)+' chỉ khớp các dòng chỉ có
-- dấu ">", còn '(\n> )' đòi dấu cách sau ">" nên luôn là dòng có nội dung — nhờ vậy dòng nội dung
-- được giữ nguyên chứ không bị nuốt.
--
-- Lưu ý khi sửa file này: KHÔNG bọc chuỗi thay thế trong E'...' — khi đó '\2' bị hiểu là escape
-- ký tự chứ không phải tham chiếu nhóm, và phần nội dung sẽ mất dấu cách đầu dòng.

UPDATE grammar_topics
SET theory_md = regexp_replace(theory_md, '(\n>)+(\n> )', chr(10) || '>' || '\2', 'g')
WHERE theory_md ~ '(\n>){2,}';

UPDATE grammar_reference_tables
SET content_md = regexp_replace(content_md, '(\n>)+(\n> )', chr(10) || '>' || '\2', 'g')
WHERE content_md ~ '(\n>){2,}';
