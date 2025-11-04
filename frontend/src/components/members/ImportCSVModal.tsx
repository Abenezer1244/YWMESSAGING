import { useState } from 'react';
import toast from 'react-hot-toast';
import { importMembers } from '../../api/members';

interface ImportCSVModalProps {
  isOpen: boolean;
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportCSVModal({ isOpen, groupId, onClose, onSuccess }: ImportCSVModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const importResult = await importMembers(groupId, file);
      setResult(importResult);

      if (importResult.imported > 0) {
        toast.success(`${importResult.imported} members imported successfully`);
        onSuccess();
      }

      if (importResult.failed > 0) {
        toast.error(`${importResult.failed} rows failed to import`);
      }
    } catch (error: any) {
      // Check if error has details from backend
      const errorMessage = error.response?.data?.error || error.message || 'Failed to import members';
      const failedDetails = error.response?.data?.failedDetails;

      // If there are detailed validation errors, show them
      if (failedDetails && Array.isArray(failedDetails)) {
        setResult({
          imported: 0,
          failed: failedDetails.length,
          failedDetails: failedDetails.map((detail: any) => ({
            ...detail,
            error: detail.errors?.join('; ') || detail.error || 'Unknown error',
          })),
        });
        toast.error(`Validation failed: ${errorMessage}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Import Members from CSV</h2>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
                disabled={isLoading}
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <p className="text-gray-600">
                  {file ? `✓ ${file.name}` : 'Click to select CSV file'}
                </p>
              </label>
            </div>
          </div>

          {/* Template Download */}
          <button
            type="button"
            onClick={downloadTemplate}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            📥 Download CSV Template
          </button>

          {/* CSV Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
            <p className="font-medium mb-1">CSV Format:</p>
            <p className="font-mono text-xs">firstName,lastName,phone,email</p>
            <p className="text-xs mt-2 text-gray-600">
              <strong>Required:</strong> firstName, lastName, phone (US format: (202) 555-0173, 202-555-0173, or 2025550173)
            </p>
            <p className="text-xs mt-1 text-gray-600">
              <strong>Optional:</strong> email
            </p>
          </div>

          {/* Import Results */}
          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-green-700">✓ {result.imported} imported</p>
              {result.failed > 0 && (
                <>
                  <p className="font-medium text-red-700">✗ {result.failed} failed</p>
                  {result.failedDetails?.slice(0, 3).map((item: any, idx: number) => (
                    <p key={idx} className="text-xs text-red-600 mt-1">
                      Row {idx + 1}: {item.error}
                    </p>
                  ))}
                  {result.failedDetails?.length > 3 && (
                    <p className="text-xs text-red-600">
                      +{result.failedDetails.length - 3} more errors
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isLoading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
