import React from 'react';
import Icon from './Icon';

/**
 * 匯出選單下拉元件
 */
const ExportMenu = ({ onExportJSON, onImportJSON, onExportPDF, onExportIndividual, onClose }) => {
    return (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-slate-100 z-50 origin-top-right animate-in fade-in zoom-in-95">
            <div className="p-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">排班資料操作</h4>
                <div className="space-y-1">
                    <button
                        onClick={() => { onExportPDF(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Printer" size={16} /> 輸出排班表 (PDF/列印)
                    </button>
                    <button
                        onClick={() => { onExportIndividual(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="User" size={16} /> 匯出個人班表 (圖片)
                    </button>
                    <button
                        onClick={() => { onExportJSON(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Upload" size={16} /> 匯出編輯檔 (.json)
                    </button>
                    <button
                        onClick={() => { onImportJSON(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Download" size={16} /> 匯入編輯檔 (.json)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportMenu;
