import React from 'react';
import Icon from './Icon';

/**
 * 匯出選單下拉元件
 */
const ExportMenu = ({ onExportJSON, onImportJSON, onExportPDF, onExportIndividual, onClose, placement = 'bottom' }) => {
    const positionClasses = placement === 'top'
        ? 'bottom-full mb-3 origin-bottom-right'
        : 'top-full mt-3 origin-top-right';

    return (
        <div className={`absolute right-0 w-64 bg-white/90 backdrop-blur-xl backdrop-brightness-95 rounded-lg shadow-xl border border-white/30 z-50 animate-in fade-in zoom-in-95 ${positionClasses}`}>
            <div className="p-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <Icon name="Download" size={14} /> 排班資料操作
                </h4>
                <div className="space-y-1">
                    <button
                        onClick={() => { onExportPDF(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Printer" size={16} className="text-purple-600" /> 輸出排班表 (PDF/列印)
                    </button>
                    <button
                        onClick={() => { onExportIndividual(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="User" size={16} className="text-blue-600" /> 匯出個人班表 (圖片)
                    </button>
                    <button
                        onClick={() => { onExportJSON(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Upload" size={16} className="text-green-600" /> 匯出編輯檔 (.json)
                    </button>

                    <div className="my-1 border-t border-white/30"></div>

                    <button
                        onClick={() => { onImportJSON(); onClose(); }}
                        className="w-full text-left flex items-center gap-2 p-2 text-sm text-slate-700 hover:bg-white/50 rounded-md transition-colors min-h-touch"
                    >
                        <Icon name="Download" size={16} className="text-orange-600" /> 匯入編輯檔 (.json)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportMenu;
