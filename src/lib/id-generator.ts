/**
 * ID Generation Utilities for Elite Homes
 * Generates unique Resident IDs, Complaint Ticket IDs, and Payment Receipt IDs.
 */

export function generateResidentId(roomNumber: string, sequenceNumber: number): string {
  // roomNumber format: "G1", "A7", "B12"
  // Clean room number to 3 chars if single digit (e.g. A7 -> A07, G1 -> G01, B12 -> B12)
  let formattedRoom = roomNumber.toUpperCase().trim();
  const match = formattedRoom.match(/^([A-Z]+)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const num = match[2].padStart(2, '0');
    formattedRoom = `${prefix}${num}`;
  }
  const seqStr = sequenceNumber.toString().padStart(3, '0');
  return `EH-${formattedRoom}-${seqStr}`;
}

export function generateTicketId(year: number, sequenceNumber: number): string {
  const seqStr = sequenceNumber.toString().padStart(4, '0');
  return `EH-TKT-${year}-${seqStr}`;
}

export function generateReceiptId(year: number, sequenceNumber: number): string {
  const seqStr = sequenceNumber.toString().padStart(5, '0');
  return `EH-REC-${year}-${seqStr}`;
}
