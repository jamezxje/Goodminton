interface Props {
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
}

const config = {
  DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  OPEN: { label: 'Đang mở', className: 'bg-green-50 text-green-700 border-green-200' },
  CLOSED: { label: 'Đã chốt', className: 'bg-blue-50 text-blue-700 border-blue-200' },
}

export default function SessionStatusBadge({ status }: Props) {
  const { label, className } = config[status] || config.DRAFT
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}
