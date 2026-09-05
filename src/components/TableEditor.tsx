import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Download, HardDrive, FileJson, FileSpreadsheet, Trash2 } from 'lucide-react';
import { getDriveAccessToken, saveToDrive } from '../lib/drive';

interface TableEditorProps {
  user: any;
}

export const TableEditor: React.FC<TableEditorProps> = ({ user }) => {
  const [data, setData] = useState<string[][]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('Text');
    if (!pastedText) return;

    // Parse the pasted text (typically TSV from Excel)
    Papa.parse<string[]>(pastedText, {
      delimiter: '\t', // Excel uses tabs
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Filter out completely empty rows
          const filteredData = results.data.filter(row => row.some(cell => cell.trim() !== ''));
          if (filteredData.length > 0) {
            setData(filteredData);
            showMessage('Data imported successfully!', 'success');
          }
        }
      },
    });
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const csv = Papa.unparse(data);
    downloadFile(csv, 'export.csv', 'text/csv');
  };

  const exportJSON = () => {
    if (data.length === 0) return;
    // Assuming first row is headers
    const headers = data[0];
    const json = data.slice(1).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    downloadFile(JSON.stringify(json, null, 2), 'export.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToGoogleDrive = async (format: 'csv' | 'json') => {
    if (!user) {
      showMessage('Please log in first to save to Google Drive.', 'error');
      return;
    }
    if (data.length === 0) return;

    setIsSaving(true);
    try {
      let content = '';
      let mimeType = '';
      let filename = '';

      if (format === 'csv') {
        content = Papa.unparse(data);
        mimeType = 'text/csv';
        filename = `excel_export_${new Date().getTime()}.csv`;
      } else {
        const headers = data[0];
        const json = data.slice(1).map(row => {
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        content = JSON.stringify(json, null, 2);
        mimeType = 'application/json';
        filename = `excel_export_${new Date().getTime()}.json`;
      }

      const token = await getDriveAccessToken();
      await saveToDrive(filename, content, mimeType, token);
      showMessage(`Successfully saved ${filename} to Google Drive!`, 'success');
    } catch (error: any) {
      console.error(error);
      showMessage(error.message || 'Failed to save to Google Drive.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md text-white transition-opacity z-50 ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Active Dataset</h2>
          <p className="mt-1 text-sm text-slate-500">
            {data.length === 0 
              ? 'Copy data from Excel and press Ctrl+V / Cmd+V anywhere on this page.' 
              : `Imported from clipboard \u2022 ${data[0].length} columns \u2022 ${data.length - 1} rows`}
          </p>
        </div>
        
        {data.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
             <button
              onClick={() => setData([])}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:border-slate-300 shadow-sm transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:border-slate-300 shadow-sm transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={exportJSON}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:border-slate-300 shadow-sm transition-colors flex items-center gap-2"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
            
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="relative group inline-block">
              <button
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HardDrive className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save to Drive'}
              </button>
              
              {/* Dropdown for Drive Save Options */}
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => saveToGoogleDrive('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Save as CSV
                  </button>
                  <button
                    onClick={() => saveToGoogleDrive('json')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Save as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center bg-slate-50 flex flex-col items-center justify-center min-h-[400px]">
          <HardDrive className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No data pasted</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Copy cells from Microsoft Excel or Google Sheets, click anywhere here, and press 
            <kbd className="mx-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono shadow-sm">Ctrl+V</kbd> 
            (or <kbd className="mx-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono shadow-sm">Cmd+V</kbd>).
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white min-h-0">
          <div className="overflow-auto flex-1">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-[0_1px_0_0_#e2e8f0]">
                <tr>
                  {/* First row is usually headers, let's treat it conditionally or just render everything */}
                  {data[0].map((cell, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {cell || `Col ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                    {/* Ensure we render the same number of columns as the header */}
                    {data[0].map((_, colIndex) => (
                      <td 
                        key={colIndex} 
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600"
                      >
                        {row[colIndex] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
