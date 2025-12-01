import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';

const SHIFT_TYPES = {
    MORNING: { label: '早', value: 'MORNING', color: 'bg-blue-100 text-blue-700' },
    AFTERNOON: { label: '午', value: 'AFTERNOON', color: 'bg-orange-100 text-orange-700' },
    NIGHT: { label: '晚', value: 'NIGHT', color: 'bg-purple-100 text-purple-700' }
};

const SIMPLE_SHIFT_TYPES = ['MORNING', 'AFTERNOON', 'NIGHT'];

const ManageDoctorsModal = ({
    rules = [],
    shiftDoctors = [],
    onSave,
    onCancel,
    showToast
}) => {
    // 取得所有不重複的診次 ID
    const sessionIds = [...new Set(rules.map(r => r.sessionId))].sort();

    const [localDoctors, setLocalDoctors] = useState(shiftDoctors);
    const [formData, setFormData] = useState({
        sessionId: sessionIds[0] || '',
        shiftType: 'MORNING',
        days: [], // 1-6 (Mon-Sat)
        doctorName: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(null);

    useEffect(() => {
        setLocalDoctors(shiftDoctors);
    }, [shiftDoctors]);

    useEffect(() => {
        if (sessionIds.length > 0 && !formData.sessionId) {
            setFormData(prev => ({ ...prev, sessionId: sessionIds[0] }));
        }
    }, [sessionIds]);

    const handleDayToggle = (day) => {
        setFormData(prev => {
            const days = prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day].sort();
            return { ...prev, days };
        });
    };

    const handleAdd = () => {
        if (!formData.sessionId || !formData.doctorName || formData.days.length === 0) {
            showToast('請填寫完整資訊（診次、醫師姓名、至少選擇一天）', 'error');
            return;
        }

        const newEntries = [];
        const conflicts = [];

        formData.days.forEach(day => {
            // 檢查是否已有設定
            const existingIndex = localDoctors.findIndex(d =>
                d.sessionId === formData.sessionId &&
                d.shiftType === formData.shiftType &&
                d.dayOfWeek === day &&
                d.id !== editingId
            );

            if (existingIndex >= 0) {
                conflicts.push({ day, existing: localDoctors[existingIndex] });
            }

            newEntries.push({
                id: editingId && formData.days.length === 1 ? editingId : Date.now() + Math.random(),
                sessionId: formData.sessionId,
                shiftType: formData.shiftType,
                dayOfWeek: day,
                doctorName: formData.doctorName
            });
        });

        const performAdd = () => {
            let updatedDoctors = [...localDoctors];

            if (editingId) {
                updatedDoctors = updatedDoctors.filter(d => d.id !== editingId);
            }

            // 移除衝突的舊資料
            conflicts.forEach(c => {
                updatedDoctors = updatedDoctors.filter(d => d.id !== c.existing.id);
            });

            updatedDoctors = [...updatedDoctors, ...newEntries];
            setLocalDoctors(updatedDoctors);

            // 重置表單
            setFormData({
                sessionId: sessionIds[0] || '',
                shiftType: 'MORNING',
                days: [],
                doctorName: ''
            });
            setEditingId(null);
            showToast(editingId ? '已更新設定' : '已加入設定', 'success');
        };

        if (conflicts.length > 0) {
            setConfirmationModal({
                title: '診次重複確認',
                message: `發現 ${conflicts.length} 個衝突的設定（例如：週${['日', '一', '二', '三', '四', '五', '六'][conflicts[0].day]}）。確定要覆蓋嗎？`,
                onConfirm: () => {
                    performAdd();
                    setConfirmationModal(null);
                },
                onCancel: () => setConfirmationModal(null)
            });
        } else {
            performAdd();
        }
    };

    const handleEdit = (doc) => {
        setFormData({
            sessionId: doc.sessionId,
            shiftType: doc.shiftType,
            days: [doc.dayOfWeek],
            doctorName: doc.doctorName
        });
        setEditingId(doc.id);
    };

    const handleDelete = (id) => {
        setLocalDoctors(prev => prev.filter(d => d.id !== id));
    };

    const handleSaveAll = () => {
        onSave(localDoctors);
    };

    const getDayLabel = (day) => ['日', '一', '二', '三', '四', '五', '六'][day];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Icon name="Users" size={20} className="text-blue-500" />
                        <h2 className="text-lg font-bold text-slate-800">診次醫師管理</h2>
                    </div>
                    <button onClick={onCancel} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <Icon name="X" size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* 左側：表單 */}
                    <div className="p-6 border-b md:border-b-0 md:border-r w-full md:w-1/3 bg-slate-50 overflow-y-auto">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Icon name={editingId ? "Edit2" : "Plus"} size={18} />
                            {editingId ? '編輯設定' : '新增設定'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">診次</label>
                                <select
                                    value={formData.sessionId}
                                    onChange={e => setFormData({ ...formData, sessionId: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                >
                                    {sessionIds.map(id => (
                                        <option key={id} value={id}>{id}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">班別</label>
                                <div className="flex gap-2">
                                    {SIMPLE_SHIFT_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, shiftType: type })}
                                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${formData.shiftType === type
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-white border text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {SHIFT_TYPES[type].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">星期</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3, 4, 5, 6].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => handleDayToggle(day)}
                                            className={`py-2 rounded-md text-sm font-medium transition-colors ${formData.days.includes(day)
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-white border text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            週{getDayLabel(day)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">醫師姓名</label>
                                <input
                                    type="text"
                                    value={formData.doctorName}
                                    onChange={e => setFormData({ ...formData, doctorName: e.target.value })}
                                    className="w-full border rounded-md p-2"
                                    placeholder="輸入醫師姓名"
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                {editingId && (
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setFormData({
                                                sessionId: sessionIds[0] || '',
                                                shiftType: 'MORNING',
                                                days: [],
                                                doctorName: ''
                                            });
                                        }}
                                        className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                                    >
                                        取消
                                    </button>
                                )}
                                <button
                                    onClick={handleAdd}
                                    className={`flex-1 py-2 text-white rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    <Icon name={editingId ? "Save" : "Plus"} size={18} />
                                    {editingId ? '更新設定' : '加入'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 右側：列表 */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-bold text-slate-700">目前設定 ({localDoctors.length})</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {localDoctors.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                                    <Icon name="AlertTriangle" size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>尚未設定任何醫師</p>
                                </div>
                            ) : (
                                localDoctors.sort((a, b) => {
                                    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
                                    const shiftOrder = { MORNING: 1, AFTERNOON: 2, NIGHT: 3 };
                                    if (shiftOrder[a.shiftType] !== shiftOrder[b.shiftType]) return shiftOrder[a.shiftType] - shiftOrder[b.shiftType];
                                    return a.sessionId.localeCompare(b.sessionId);
                                }).map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow group">
                                        <div className="flex items-center gap-4">
                                            <span className="w-12 text-center font-bold text-slate-600 bg-slate-100 rounded px-2 py-1 text-sm">
                                                週{getDayLabel(doc.dayOfWeek)}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${SHIFT_TYPES[doc.shiftType].color}`}>
                                                {SHIFT_TYPES[doc.shiftType].label}
                                            </span>
                                            <span className="font-medium text-slate-800">{doc.sessionId}</span>
                                            <span className="text-slate-600 border-l pl-4">{doc.doctorName}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(doc)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                title="編輯"
                                            >
                                                <Icon name="Edit2" size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                title="刪除"
                                            >
                                                <Icon name="Trash2" size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Icon name="Save" size={18} />
                        儲存變更
                    </button>
                </div>
            </div>

            {confirmationModal && (
                <ConfirmationModal
                    {...confirmationModal}
                />
            )}
        </div>
    );
};

export default ManageDoctorsModal;
