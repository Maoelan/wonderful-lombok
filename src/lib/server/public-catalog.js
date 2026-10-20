export function publicCatalog(catalog, rentalEnabled) {
  if (rentalEnabled) return catalog;
  return { ...catalog, rentals: [] };
}
