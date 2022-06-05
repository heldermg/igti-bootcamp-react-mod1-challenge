function sort(data, field, type) {
  return data.sort((a, b) => {
    let aValue, bValue;

    if (field == "TotalDeaths") {
      aValue = a[field] ? +a[field] : 0
      bValue = b[field] ? +b[field] : 0
      return type == "asc" ? aValue - bValue : bValue - aValue
    } else if (field == "Country") {
      return type == "asc"
        ? a[field].localeCompare(b[field])
        : b.name.localeCompare(a.name)
    }
  })
}

export { sort }