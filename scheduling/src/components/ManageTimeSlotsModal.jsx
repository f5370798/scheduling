import React, { useState } from 'react';
import Icon from './Icon';
import ConfirmationModal from './ConfirmationModal';
import { SHIFT_TYPES } from '../constants/shifts';

/**
 * 時段設定管理模態框
 */
const ManageTimeSlotsModal = ({ timeSlots, onSave, onCancel, showToast, checkTimeSlotUsage }) => {
    const [localTimeSlots, setLocalTimeSlots] = useState({ ...timeSlots });
    const [selectedShiftType, setSelectedShiftType] = useState('MORNING');
    const [newTimeSlot, setNewTimeSlot] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(null);

    // 解析時段字串為可排序的數值
    const parseTimeSlot = (slot) => {
        // 取得開始時間部分 (例如 "8-12" -> "8", "8'-12" -> "8'")
        const startStr = slot.split('-')[0];

        // 取得數字部分
        const num = parseInt(startStr.replace("'", ""), 10);

        // 判斷是否為半點 (有 ')
        const isHalf = startStr.includes("'");

        // 計算排序值：
        // 假設 6 點以前的數字 (1-5) 是下午/晚上，加 12
        // 6 點以後 (6-12) 是早上/中午
        // 這樣 7 點 (7) < 8 點 (8)
        // 1 點 (13) > 12 點 (12)
        let sortVal = num;
        if (sortVal < 6) sortVal += 12;

        // 加上半點權重
        if (isHalf) sortVal += 0.5;

        return sortVal;
    };

    const handleAddTimeSlot = () => {
        const trimmedSlot = newTimeSlot.trim();
        if (!trimmedSlot) return;

        const currentSlots = localTimeSlots[selectedShiftType] || [];
        if (currentSlots.includes(trimmedSlot)) {
            showToast('此時段已存在！', 'warning');
            return;
        }

        const newSlots = [...currentSlots, trimmedSlot];

        // 使用自定義排序
        newSlots.sort((a, b) => parseTimeSlot(a) - parseTimeSlot(b));

        setLocalTimeSlots({
            ...localTimeSlots,
            [selectedShiftType]: newSlots
        });
        setNewTimeSlot('');
        setIsAdding(false);
    };

    const handleDeleteTimeSlot = (slotToDelete) => {
        // 檢查時段是否被使用
        if (checkTimeSlotUsage) {
            const usage = checkTimeSlotUsage(slotToDelete, selectedShiftType);
            if (usage.rules.length > 0 || usage.scheduleDates.length > 0) {
                let message = `無法刪除時段「${slotToDelete}」，因為它正在被使用：\n`;
                if (usage.rules.length > 0) {
                    message += `\n診次規則：${usage.rules.join(', ')}`;
                }
                if (usage.scheduleDates.length > 0) {
                    message += `\n排班資料：${usage.scheduleDates.length} 筆紀錄`;
                }

                showToast('無法刪除：此時段正在使用中', 'error');
                // alert(message); // 可選：如果需要詳細資訊
                return;
            }
        }

        setConfirmationModal({
            title: '刪除時段',
            message: `確定要刪除時段「${slotToDelete}」嗎？`,
            isDestructive: true,
            confirmText: '確認刪除',
            onConfirm: () => {
                setLocalTimeSlots({
                    ...localTimeSlots,
                    [selectedShiftType]: localTimeSlots[selectedShiftType].filter(s => s !== slotToDelete)
                });
                setConfirmationModal(null);
            },
            onCancel: () => setConfirmationModal(null)
        });
    };

    const handleSave = () => {
        onSave(localTimeSlots);
    };

    // 確保顯示時也是排序的 (針對既有資料)
    const sortedCurrentSlots = (localTimeSlots[selectedShiftType] || []).sort((a, b) => parseTimeSlot(a) - parseTimeSlot(b));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {confirmationModal && (
                <div className="absolute inset-0 z-[60]">
                    <ConfirmationModal {...confirmationModal} />
                </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <Icon name="Clock" size={20} className="text-purple-500" /> 時段設定管理
                </h3>

                <p className="text-sm text-slate-600 mb-4">
                    設定各班別可用的時段選項。
                </p>

                {/* 班別選擇 Tabs */}
                <div className="flex border-b border-slate-200 mb-4">
                    {Object.keys(localTimeSlots).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setSelectedShiftType(type);
                                setIsAdding(false);
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${selectedShiftType === type
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {SHIFT_TYPES[type]?.label || type}
                        </button>
                    ))}
                </div>

                {/* 新增時段區域 */}
                {isAdding ? (
                    <div className="mb-4 p-4 border-2 border-purple-300 bg-purple-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-purple-800 mb-2">新增 {SHIFT_TYPES[selectedShiftType]?.label} 時段</h4>
                        <input
                            type="text"
                            value={newTimeSlot}
                            onChange={(e) => setNewTimeSlot(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTimeSlot()}
                            placeholder="輸入時段，例如：8-12"
                            className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewTimeSlot('');
                                }}
                                className="min-w-touch min-h-touch px-3 py-1 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddTimeSlot}
                                disabled={!newTimeSlot.trim()}
                                className={`min-w-touch min-h-touch px-3 py-1 text-sm rounded-lg text-white font-medium ${newTimeSlot.trim() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-300 cursor-not-allowed'
                                    }`}
                            >
                                確認新增
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full min-h-touch py-2 mb-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Icon name="Plus" size={16} /> 新增時段
                    </button>
                )}

                {/* 現有時段列表 */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">現有時段 ({SHIFT_TYPES[selectedShiftType]?.label})</h4>
                    {sortedCurrentSlots.length === 0 ? (
                        <p className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                            尚未新增任何時段
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {sortedCurrentSlots.map(slot => (
                                <div key={slot} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50">
                                    <span className="font-medium text-slate-800">{slot}</span>
                                    <button
                                        onClick={() => handleDeleteTimeSlot(slot)}
                                        className="min-w-touch min-h-touch p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="刪除時段"
                                    >
                                        <Icon name="Trash2" size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 底部按鈕 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
                    <button
                        onClick={onCancel}
                        className="min-w-touch min-h-touch px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="min-w-touch min-h-touch px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        儲存設定
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageTimeSlotsModal;
