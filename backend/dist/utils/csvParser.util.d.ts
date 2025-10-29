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
export declare function parseCSV(fileBuffer: Buffer): MemberCSVRow[];
/**
 * Validate single member row
 */
export declare function validateMemberRow(row: MemberCSVRow, rowNumber: number): {
    valid: boolean;
    errors: string[];
};
/**
 * Format and validate all rows
 */
export declare function formatAndValidate(rows: MemberCSVRow[]): ParseResult;
//# sourceMappingURL=csvParser.util.d.ts.map