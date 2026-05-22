const formatDate = (value) => {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const day = `${date.getDate()}`.padStart(2, '0')
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const shouldFormatDate = (value) => {
  if (value instanceof Date) return true
  if (typeof value !== 'string') return false
  return /^\d{4}-\d{2}-\d{2}/.test(value)
}

const flattenObject = (obj, prefix = '') => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { [prefix]: obj }
  }
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, nextKey))
    } else {
      acc[nextKey] = value
    }
    return acc
  }, {})
}

const escapeCsvValue = (value) => {
  const stringValue = value === undefined || value === null ? '' : String(value)
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function exportToCSV(data, filename) {
  if (!Array.isArray(data) || data.length === 0) return

  const flattened = data.map((row) => flattenObject(row))
  const headers = Array.from(
    flattened.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key))
      return set
    }, new Set())
  )

  const rows = flattened.map((row) =>
    headers.map((header) => {
      const value = row[header]
      if (shouldFormatDate(value)) {
        const formatted = formatDate(value)
        if (formatted) return escapeCsvValue(formatted)
      }
      if (typeof value === 'object' && value !== null) {
        return escapeCsvValue(JSON.stringify(value))
      }
      return escapeCsvValue(value)
    })
  )

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
