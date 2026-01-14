import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { JobConnectionMatch } from '../utils/connectionMatcher';

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: JobConnectionMatch[];
  companyName: string;
}

export const ConnectionsModal: React.FC<ConnectionsModalProps> = ({
  isOpen,
  onClose,
  connections,
  companyName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Connections at {companyName}</h2>
            <p className="text-sm text-gray-600 mt-1">{connections.length} connection{connections.length !== 1 ? 's' : ''} found</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {connections.map((match, idx) => {
              const connection = match.connection;
              return (
                <div
                  key={idx}
                  className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {connection.linkedin_url ? (
                        <a
                          href={connection.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-2 group"
                        >
                          <span className="truncate">{connection.connection_name}</span>
                          <ExternalLink size={14} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ) : (
                        <p className="text-base font-semibold text-emerald-700 truncate">
                          {connection.connection_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mt-1">
                        {connection.job_title_raw || 'Employee'}
                      </p>
                      {connection.company_name_raw && (
                        <p className="text-xs text-gray-500 mt-1">
                          {connection.company_name_raw}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
