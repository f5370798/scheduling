import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import Icon from './Icon';

const IndividualScheduleModal = ({
    isOpen,
    onClose,
    employees,
    currentMonth,
    schedule,
    customShiftRules,
    shiftDoctors = []
}) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const previewRef = useRef(null);

    useEffect(() => {
        if (isOpen && employees.length > 0 && !selectedEmployeeId) {
            setSelectedEmployeeId(employees[0].id);
        }
    }, [isOpen, employees, selectedEmployeeId]);

    if (!isOpen) return null;

    const handleDownload = async () => {
        if (previewRef.current) {
            try {
                const canvas = await html2canvas(previewRef.current, {
                    scale: 2, // 提高解析度
                    backgroundColor: '#ffffff',
                    useCORS: true
                });

                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                const employee = employees.find(e => e.id === parseInt(selectedEmployeeId));
                const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

                link.href = image;
                link.download = `${employee?.name}_${monthStr}_班表.png`;
                link.click();
            } catch (error) {
                console.error('Export failed:', error);
                alert('匯出圖片失敗，請稍後再試。');
            }
        }
    };

    // 產生當月所有日期的陣列
    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const date = new Date(year, month, 1);
        const days = [];

        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const days = getDaysInMonth();
    const selectedEmployee = employees.find(e => e.id === parseInt(selectedEmployeeId));

    // 取得每一天的排班資料
    const getScheduleForDay = (date) => {
        if (!selectedEmployee) return null;

        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // 搜尋該員工當天的所有排班
        const shifts = [];

        // 遍歷所有可能的班別類型 (MORNING, AFTERNOON, NIGHT)
        ['MORNING', 'AFTERNOON', 'NIGHT'].forEach(shiftType => {
            const key = `${dateKey}_${selectedEmployee.id}_${shiftType}`;
            const shiftData = schedule[key];
            if (shiftData) {
                let shiftLabel = shiftData;
                if (typeof shiftData === 'object' && shiftData.label) {
                    shiftLabel = shiftData.label;
                }

                shifts.push({ label: shiftLabel, shiftType });
            }
        });

        return shifts;
    };

    // 格式化日期顯示 (例如: 11/01(六))
    const formatDate = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
        return `${month}/${day}(${weekDay})`;
    };

    // 判斷是否為週日 (用於紅線分隔)
    const isSunday = (date) => date.getDay() === 0;

    // 解析排班資料，提取時段和診次名稱
    const parseShiftData = (shiftObj) => {
        const { label: rawData, shiftType } = shiftObj;

        // 處理 "R" (休假)
        if (rawData === 'R' || rawData === 'OFF' || rawData === 'OFF_CONFIRMED') {
            return { timeSlot: '', sessionId: '', isRest: true, shiftType };
        }

        // 處理複合格式: "MORNING / 8-12 / 82診"
        if (typeof rawData === 'string' && rawData.includes(' / ')) {
            const parts = rawData.split(' / ');
            if (parts.length >= 3) {
                return {
                    timeSlot: parts[1].trim(),
                    sessionId: parts[2].trim(),
                    isRest: false,
                    shiftType
                };
            }
        }

        // 如果是簡單的診次名稱，嘗試從規則中查找時段
        const rule = customShiftRules.find(r => r.sessionId === rawData);
        if (rule) {
            return {
                timeSlot: rule.timeSlot || '',
                sessionId: rawData,
                isRest: false,
                shiftType
            };
        }

        // 預設情況
        return { timeSlot: '', sessionId: rawData || '', isRest: false, shiftType };
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleIn">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Icon name="User" size={20} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-slate-800">匯出個人班表</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <Icon name="X" size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
                    {/* Controls */}
                    <div className="mb-6 flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
                        <label className="font-medium text-slate-700">選擇員工：</label>
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="border rounded px-3 py-2 min-w-[200px] focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleDownload}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Icon name="Download" size={16} />
                            下載圖片
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="flex justify-center">
                        <div
                            ref={previewRef}
                            className="bg-white p-8 shadow-lg min-w-[500px]"
                            style={{ fontFamily: '"Microsoft JhengHei", sans-serif' }}
                        >
                            {/* Table Header Info */}
                            {selectedEmployee && (
                                <div className="mb-4 text-center">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                                        {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月 班表
                                    </h3>
                                    <p className="text-lg text-slate-600 font-medium">
                                        姓名：{selectedEmployee.name}
                                    </p>
                                </div>
                            )}

                            {/* The Table */}
                            <table className="w-full border-collapse border border-slate-400 text-sm">
                                <tbody>
                                    {days.map((date, index) => {
                                        const shifts = getScheduleForDay(date);
                                        const hasShifts = shifts && shifts.length > 0;

                                        let timeSlotsDisplay = '';
                                        let sessionIdsDisplay = null;
                                        let isRestDay = false;

                                        if (hasShifts) {
                                            // 解析所有排班資料
                                            const parsedShifts = shifts.map(parseShiftData);

                                            // 檢查是否有休假
                                            const hasRest = parsedShifts.some(s => s.isRest);

                                            if (hasRest) {
                                                isRestDay = true;
                                            } else {
                                                // 收集所有時段（去重）
                                                const timeSlots = parsedShifts
                                                    .map(s => s.timeSlot)
                                                    .filter(t => t)
                                                    .filter((t, i, arr) => arr.indexOf(t) === i); // 去重

                                                timeSlotsDisplay = timeSlots.join('/');

                                                // 收集診次資訊 (包含科別和醫師)
                                                const sessionInfos = parsedShifts
                                                    .filter(s => s.sessionId)
                                                    .map(s => {
                                                        // 查找科別
                                                        const rule = customShiftRules.find(r => r.sessionId === s.sessionId);
                                                        const department = rule?.department;

                                                        // 查找醫師
                                                        const dayOfWeek = date.getDay();
                                                        const doctor = shiftDoctors.find(d =>
                                                            d.sessionId === s.sessionId &&
                                                            d.shiftType === s.shiftType &&
                                                            d.dayOfWeek === dayOfWeek
                                                        );
                                                        const doctorName = doctor?.doctorName;

                                                        return {
                                                            sessionId: s.sessionId,
                                                            department,
                                                            doctorName
                                                        };
                                                    });

                                                // 去重
                                                const uniqueSessions = sessionInfos.filter((v, i, a) =>
                                                    a.findIndex(t =>
                                                        t.sessionId === v.sessionId &&
                                                        t.department === v.department &&
                                                        t.doctorName === v.doctorName
                                                    ) === i
                                                );

                                                sessionIdsDisplay = (
                                                    <div className="flex flex-wrap gap-1">
                                                        {uniqueSessions.map((info, idx) => {
                                                            // 根據關鍵字設定顏色
                                                            const colorClass = info.sessionId.includes('神') ? 'text-red-600' :
                                                                info.sessionId.includes('整') ? 'text-orange-600' :
                                                                    info.sessionId.includes('乳') ? 'text-pink-600' :
                                                                        info.sessionId.includes('泌') ? 'text-blue-600' :
                                                                            info.sessionId.includes('直') ? 'text-purple-600' :
                                                                                'text-slate-800';

                                                            return (
                                                                <span key={idx} className={`${colorClass} font-medium`}>
                                                                    {info.sessionId}
                                                                    {(info.department || info.doctorName) && (
                                                                        <span className="text-slate-600 ml-1 text-xs">
                                                                            ({info.department || ''}{info.department && info.doctorName ? '/' : ''}{info.doctorName || ''})
                                                                        </span>
                                                                    )}
                                                                    {idx < uniqueSessions.length - 1 ? '、' : ''}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            }
                                        }

                                        // 決定邊框樣式：如果是週日，下方加粗紅線
                                        const borderClass = isSunday(date) ? 'border-b-4 border-b-red-600' : 'border-b border-slate-300';

                                        // 決定日期欄位樣式
                                        const dateCellClass = "border-r border-slate-300 p-2 w-24 text-center font-medium";

                                        return (
                                            <tr key={index} className={borderClass}>
                                                {/* 日期欄 */}
                                                <td className={dateCellClass}>
                                                    {formatDate(date)}
                                                </td>

                                                {/* 時間/R 欄 */}
                                                <td className="border-r border-slate-300 p-2 w-24 text-center">
                                                    {isRestDay ? (
                                                        <span className="inline-block bg-yellow-300 px-3 py-0.5 font-bold text-black rounded-sm">
                                                            R
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-800 font-medium">{timeSlotsDisplay}</span>
                                                    )}
                                                </td>

                                                {/* 內容欄 */}
                                                <td className="p-2 text-left">
                                                    {sessionIdsDisplay}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IndividualScheduleModal;
