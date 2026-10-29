// Minimum bookable road distance for a point-to-point transfer.
// Confirmed baseline: 1 km. Adjust this single constant to change the rule.
export const MIN_TRANSFER_DISTANCE_METRES = 1000;

export function transferDistanceLabel(metres = MIN_TRANSFER_DISTANCE_METRES) {
  const value = Number(metres);
  if (!Number.isFinite(value) || value <= 0) return '';
  return value >= 1000 ? `${value / 1000} km` : `${Math.round(value)} m`;
}

export const MIN_TRANSFER_DISTANCE_LABEL = transferDistanceLabel();

export function isBookableTransferDistance(distanceMetres) {
  return Number.isFinite(distanceMetres) && distanceMetres >= MIN_TRANSFER_DISTANCE_METRES;
}
