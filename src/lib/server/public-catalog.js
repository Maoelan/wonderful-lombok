export function publicCatalog(catalog, rentalEnabled) {
  if (rentalEnabled) return catalog;
  const { rentals, ...visibleCatalog } = catalog;
  return visibleCatalog;
}
