import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { parseLinkedInCSV, validateCSVFile, parseFromCachedCSV } from '../utils/csvParser';
import { connectionsStorage } from '../utils/connectionsStorage';

interface ConnectionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const ConnectionUploadModal: React.FC<ConnectionUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasCachedCSV = connectionsStorage.hasCachedCSV();

  if (!isOpen) return null;

  const handleRefreshFromCache = async () => {
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    try {
      // Re-parse from cached CSV
      const connections = parseFromCachedCSV();

      // Save to storage
      connectionsStorage.saveConnections(connections);
      connectionsStorage.saveMetadata({
        imported_at: new Date().toISOString(),
        connection_count: connections.length,
        source: 'linkedin_csv'
      });

      setSuccess(`Successfully refreshed ${connections.length} connections from cache!`);
      
      setTimeout(() => {
        onSuccess(connections.length);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh from cache');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    setSuccess(null);

    // Validate file
    const validation = validateCSVFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsProcessing(true);

    try {
      // Parse CSV
      const connections = await parseLinkedInCSV(file);

      // Save to storage
      connectionsStorage.saveConnections(connections);
      connectionsStorage.saveMetadata({
        imported_at: new Date().toISOString(),
        connection_count: connections.length,
        source: 'linkedin_csv'
      });

      setSuccess(`Successfully imported ${connections.length} connections!`);
      
      // Close modal and notify parent after a short delay
      setTimeout(() => {
        onSuccess(connections.length);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Import LinkedIn Connections</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to export your LinkedIn connections:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Go to <a href="https://www.linkedin.com/mypreferences/d/categories/account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 underline inline-flex items-center gap-1"> LinkedIn Settings & Privacy</a></li>
              <li>Click "Data privacy" → "Get a copy of your data"</li>
              <li>Select "Connections" only</li>
              <li>Request and download the CSV file</li>
              <li>Upload it here</li>
            </ol>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🔒 Privacy & Data Usage</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Your data stays on your device (localStorage)</li>
              <li>✓ Never shared with other users</li>
              <li>✓ Not sent to external servers</li>
              <li>✓ Deletable anytime from settings</li>
              <li>✓ CSV cached for easy re-import</li>
            </ul>
          </div>

          {/* Cached CSV Option */}
          {hasCachedCSV && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">💾 Cached CSV Available</h3>
                  <p className="text-sm text-green-700">You can refresh your connections without re-uploading</p>
                </div>
                <button
                  onClick={handleRefreshFromCache}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  Refresh from Cache
                </button>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-gray-600">Processing your connections...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="text-indigo-600" size={48} />
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    Drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    <span className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block">
                      Browse Files
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-400">CSV files only, max 10MB</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-900">Success!</p>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {success ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
