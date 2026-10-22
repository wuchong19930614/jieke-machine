// WhatsApp 链接：https://wa.me/{号码}?text={预填消息}，预填消息只含网站文案和产品名（技术方案 4.5）
export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '')
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${query}`
}
