const filterItemsByGroups = (items, authGroups) => {
  return items.filter(item => {
    if (!item.groups) {
      return true
    }

    return item.groups.some(group => authGroups?.includes(group))
  })
}

export { filterItemsByGroups }
