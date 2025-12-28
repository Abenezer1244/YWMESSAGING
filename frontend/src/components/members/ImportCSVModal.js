import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { importMembers } from '../../api/members';
export function ImportCSVModal({ isOpen, onClose, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                toast.error('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
            setResult(null);
        }
    };
    const handleImport = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }
        try {
            setIsLoading(true);
            const importResult = await importMembers(file);
            setResult(importResult);
            if (importResult.imported > 0) {
                toast.success(`${importResult.imported} members imported successfully`);
                onSuccess();
                // Reset file and result state for next import
                setFile(null);
                setResult(null);
            }
            if (importResult.failed > 0) {
                toast.error(`${importResult.failed} rows failed to import`);
            }
        }
        catch (error) {
            // Log full error for debugging
            console.error('CSV Import Error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
            // Check if error has details from backend
            const errorMessage = error.response?.data?.error || error.message || 'Failed to import members';
            const failedDetails = error.response?.data?.failedDetails;
            // If there are detailed validation errors, show them
            if (failedDetails && Array.isArray(failedDetails)) {
                setResult({
                    imported: 0,
                    failed: failedDetails.length,
                    failedDetails: failedDetails.map((detail) => ({
                        ...detail,
                        error: detail.errors?.join('; ') || detail.error || 'Unknown error',
                    })),
                });
                toast.error(`Validation failed: ${errorMessage}`);
            }
            else {
                toast.error(errorMessage);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const downloadTemplate = () => {
        const csv = `firstName,lastName,phone,email
John,Doe,2025550173,john@example.com
Jane,Smith,202-555-0174,jane@example.com
Robert,Johnson,(202) 555-0175,robert@example.com`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'members_template.csv';
        a.click();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Import Members from CSV" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Select CSV File" }), _jsxs("div", { className: "border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition dark:bg-slate-700", children: [_jsx("input", { type: "file", accept: ".csv", onChange: handleFileChange, className: "hidden", id: "csv-upload", disabled: isLoading }), _jsx("label", { htmlFor: "csv-upload", className: "cursor-pointer", children: _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: file ? `✓ ${file.name}` : 'Click to select CSV file' }) })] })] }), _jsx("button", { type: "button", onClick: downloadTemplate, className: "w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium", children: "\uD83D\uDCE5 Download CSV Template" }), _jsxs("div", { className: "bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300", children: [_jsx("p", { className: "font-medium mb-1", children: "CSV Format:" }), _jsx("p", { className: "font-mono text-xs", children: "firstName,lastName,phone,email" }), _jsxs("p", { className: "text-xs mt-2 text-gray-600 dark:text-gray-400", children: [_jsx("strong", { children: "Required:" }), " firstName, lastName, phone (US format: (202) 555-0173, 202-555-0173, or 2025550173)"] }), _jsxs("p", { className: "text-xs mt-1 text-gray-600 dark:text-gray-400", children: [_jsx("strong", { children: "Optional:" }), " email"] })] }), result && (_jsxs("div", { className: "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-3 text-sm", children: [_jsxs("p", { className: "font-medium text-green-700 dark:text-green-400", children: ["\u2713 ", result.imported, " imported"] }), result.failed > 0 && (_jsxs(_Fragment, { children: [_jsxs("p", { className: "font-medium text-red-700 dark:text-red-400", children: ["\u2717 ", result.failed, " failed"] }), result.failedDetails?.slice(0, 3).map((item, idx) => (_jsxs("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: ["Row ", idx + 1, ": ", item.error] }, idx))), result.failedDetails?.length > 3 && (_jsxs("p", { className: "text-xs text-red-600 dark:text-red-400", children: ["+", result.failedDetails.length - 3, " more errors"] }))] }))] })), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition", disabled: isLoading, children: "Close" }), _jsx("button", { type: "button", onClick: handleImport, disabled: !file || isLoading, className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400", children: isLoading ? 'Importing...' : 'Import' })] })] })] }) }));
}
//# sourceMappingURL=ImportCSVModal.js.map