// 隐私说明：说明文字里与“链接文字”（表单文案 › 隐私说明中的链接文字）相同的部分变成隐私政策链接。
// 询盘表单、红色在线服务窗口、蓝色在线沟通面板共用，三处的链接写法一致
export function PrivacyText({ note, link }: { note: string; link?: string }) {
  const index = link ? note.indexOf(link) : -1
  if (!link || index < 0) return <>{note}</>
  return (
    <>
      {note.slice(0, index)}
      <a href="/privacy-policy/" target="_blank" rel="noopener">
        {link}
      </a>
      {note.slice(index + link.length)}
    </>
  )
}
