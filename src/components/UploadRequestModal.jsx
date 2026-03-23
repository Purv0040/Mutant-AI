import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UploadRequestModal({ isOpen, onClose, onSubmit, defaultAccessMode = 'All' }) {
  const { isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [accessMode, setAccessMode] = useState(defaultAccessMode);
  const fileInputRef = useRef(null);

  // Sync when defaultAccessMode changes (e.g. different user opens modal)
  useEffect(() => {
    setAccessMode(defaultAccessMode);
  }, [defaultAccessMode, isOpen]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onSubmit({ file, accessMode });
    setFile(null);
    setAccessMode(defaultAccessMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold font-headline text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">publish</span>
            {isAdmin ? 'Upload Document' : 'Request Document Upload'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-sm text-slate-500">
            {isAdmin 
              ? 'Select a document and assign it to a target department for processing.' 
              : 'Submit a document to the administrator for approval and vectorization.'}
          </p>

          {/* File Dropzone */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept=".pdf,.docx,.csv,.xlsx,.pptx"
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <p className="text-sm font-bold text-slate-700 truncate max-w-full">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                </div>
                <p className="text-sm font-bold text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, CSV, XLSX, PPTX</p>
              </div>
            )}
          </div>

          {/* Access Mode */}
          <div>
            <label className="block text-sm font-bold text-slate-700 font-headline mb-2">
              Target Department (Access Mode)
            </label>
            {!isAdmin && defaultAccessMode !== 'All' ? (
              <div className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700 font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">lock</span>
                {accessMode} (your department)
              </div>
            ) : (
              <select
                value={accessMode}
                onChange={(e) => setAccessMode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                }}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Design">Design</option>
              </select>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAdmin ? 'Upload' : 'Send Request'}
              <span className="material-symbols-outlined text-sm">{isAdmin ? 'upload_file' : 'send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
