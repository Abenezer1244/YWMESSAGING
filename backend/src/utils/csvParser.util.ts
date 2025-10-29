import Papa from 'papaparse';
import { formatToE164, validatePhoneNumber } from './phone.utils.js';

export interface MemberCSVRow {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface ParsedMember {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export interface ParseResult {
  valid: ParsedMember[];
  invalid: Array<{
    row: number;
    data: MemberCSVRow;
    errors: string[];
  }>;
}

/**
 * Parse CSV file buffer
 */
export function parseCSV(fileBuffer: Buffer): MemberCSVRow[] {
  const csvString = fileBuffer.toString('utf-8');
  const result = Papa.parse<MemberCSVRow>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }

  return result.data;
}

/**
 * Validate single member row
 */
export function validateMemberRow(row: MemberCSVRow, rowNumber: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!row.firstName?.trim()) {
    errors.push('firstName is required');
  }
  if (!row.lastName?.trim()) {
    errors.push('lastName is required');
  }
  if (!row.phone?.trim()) {
    errors.push('phone is required');
  }

  // Validate phone format
  if (row.phone && !validatePhoneNumber(row.phone)) {
    errors.push(`Invalid phone format: ${row.phone}`);
  }

  // Email optional but validate if provided
  if (row.email?.trim() && !isValidEmail(row.email)) {
    errors.push(`Invalid email format: ${row.email}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format and validate all rows
 */
export function formatAndValidate(rows: MemberCSVRow[]): ParseResult {
  const result: ParseResult = {
    valid: [],
    invalid: [],
  };

  rows.forEach((row, index) => {
    const validation = validateMemberRow(row, index + 2); // +2 because header is row 1

    if (!validation.valid) {
      result.invalid.push({
        row: index + 2,
        data: row,
        errors: validation.errors,
      });
      return;
    }

    try {
      result.valid.push({
        firstName: row.firstName!.trim(),
        lastName: row.lastName!.trim(),
        phone: formatToE164(row.phone!),
        email: row.email?.trim() || undefined,
      });
    } catch (error) {
      result.invalid.push({
        row: index + 2,
        data: row,
        errors: [`Failed to format: ${(error as Error).message}`],
      });
    }
  });

  return result;
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
