/** "awaiting_shipment" -> "Awaiting Shipment" */
export function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
