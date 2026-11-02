export const categoryLabels = {
  digital: 'AI·디지털',
  research: '연구·자문',
  leadership: '교육 리더십',
}

export function matchesActivityFilter(categories, filter) {
  return filter === 'all' || categories.includes(filter)
}
