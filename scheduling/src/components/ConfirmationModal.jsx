import React from 'react';
import Icon from './Icon';

/**
 * 確認對話框元件
 */
const ConfirmationModal = ({
    message,
    onConfirm,
    onCancel,
    confirmText = '確認',
    isDestructive = false,
    title = '確認操作'
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-scaleIn">
            <h3 className={`text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 ${isDestructive ? 'text-red-500' : 'text-indigo-500'}`}>
                <Icon name={isDestructive ? "AlertTriangle" : "Info"} size={20} /> {title}
            </h3>
            <p className="text-slate-600 mb-6 text-sm">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    {isDestructive ? '取消' : '關閉'}
                </button>
                <button
                    onClick={onConfirm}
                    className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmationModal;
