import React, { useState } from 'react';
import Icon from './Icon';

/**
 * 備份管理模態框 - 玻璃擬態版
 */
const BackupManagerModal = ({ backups, onRestore, onDelete, onRename, onCreate, onClose }) => {
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [newBackupName, setNewBackupName] = useState('');

    // 將備份轉為陣列並排序（最新的在前）
    const backupList = Object.values(backups).sort((a, b) => b.timestamp - a.timestamp);

    const handleStartEdit = (backup) => {
        setEditingId(backup.id);
        setEditingName(backup.name);
    };

    const handleSaveEdit = (backupId) => {
        if (editingName.trim()) {
            onRename(backupId, editingName.trim());
        }
        setEditingId(null);
        setEditingName('');
    };

    const handleCreateBackup = () => {
        onCreate(newBackupName.trim() || null);
        setNewBackupName('');
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-xl backdrop-brightness-110 p-6 rounded-2xl shadow-2xl border border-white/40 max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-scaleIn">
                {/* 標題 */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100/50 rounded-lg text-purple-600">
                            <Icon name="Archive" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">備份管理</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100/50 rounded-full transition-colors text-slate-500 hover:text-slate-700">
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* 建立新備份 */}
                <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 shadow-sm backdrop-blur-sm">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Icon name="PlusCircle" size={16} className="text-blue-500" />
                        建立新備份
                    </h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newBackupName}
                            onChange={(e) => setNewBackupName(e.target.value)}
                            placeholder="備份名稱（選填，預設為當前時間）"
                            className="flex-1 px-4 py-2 bg-white/70 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleCreateBackup}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-1"
                        >
                            <Icon name="Save" size={16} />
                            建立備份
                        </button>
                    </div>
                </div>

                {/* 備份列表 */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Icon name="Clock" size={16} />
                        現有備份 <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{backupList.length}/10</span>
                    </h4>

                    {backupList.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <Icon name="Archive" size={48} className="mx-auto mb-3 opacity-50" />
                            <p>尚無備份記錄</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {backupList.map((backup) => (
                                <div
                                    key={backup.id}
                                    className="group border border-white/40 bg-white/40 rounded-xl p-4 hover:bg-white/60 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* 備份資訊 */}
                                        <div className="flex-1 min-w-0">
                                            {editingId === backup.id ? (
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveEdit(backup.id);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-blue-500 rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h5 className="font-bold text-slate-800 truncate text-base">
                                                    {backup.name}
                                                </h5>
                                            )}
                                            <div className="text-xs text-slate-500 mt-2 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Icon name="Calendar" size={12} className="text-slate-400" />
                                                    {new Date(backup.timestamp).toLocaleString('zh-TW')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Icon name="Database" size={12} className="text-slate-400" />
                                                    {backup.metadata.employeeCount} 位員工 • {backup.metadata.scheduleCount} 筆排班 • {backup.metadata.size}
                                                </div>
                                                {backup.metadata.months && backup.metadata.months.length > 0 && (
                                                    <div className="flex items-center gap-2 text-slate-600 bg-slate-100/50 px-2 py-0.5 rounded-md w-fit mt-1 border border-slate-200/50" title={backup.metadata.months.join(', ')}>
                                                        <Icon name="List" size={12} className="text-slate-400" />
                                                        包含月份: {backup.metadata.months.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 操作按鈕 */}
                                        <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {editingId === backup.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveEdit(backup.id)}
                                                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                        title="儲存"
                                                    >
                                                        <Icon name="Check" size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="取消"
                                                    >
                                                        <Icon name="X" size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => onRestore(backup.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="還原此備份"
                                                    >
                                                        <Icon name="RotateCcw" size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStartEdit(backup)}
                                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="重新命名"
                                                    >
                                                        <Icon name="Edit2" size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(backup.id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="刪除"
                                                    >
                                                        <Icon name="Trash2" size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 關閉按鈕 */}
                <div className="flex justify-end pt-4 mt-4 border-t border-slate-200/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800/90 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl font-medium text-sm backdrop-blur-sm"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupManagerModal;
