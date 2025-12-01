import React, { useState, useEffect } from 'react';
import Icon from './Icon';

/**
 * 員工排序調整 Modal
 * 允許使用者透過上移/下移按鈕調整員工順序
 */
const EmployeeReorderModal = ({ isOpen, onClose, employees, onSave }) => {
    const [localEmployees, setLocalEmployees] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setLocalEmployees([...employees]);
        }
    }, [isOpen, employees]);

    const handleMoveUp = (index) => {
        if (index > 0) {
            const newEmployees = [...localEmployees];
            [newEmployees[index - 1], newEmployees[index]] = [newEmployees[index], newEmployees[index - 1]];
            setLocalEmployees(newEmployees);
        }
    };

    const handleMoveDown = (index) => {
        if (index < localEmployees.length - 1) {
            const newEmployees = [...localEmployees];
            [newEmployees[index], newEmployees[index + 1]] = [newEmployees[index + 1], newEmployees[index]];
            setLocalEmployees(newEmployees);
        }
    };

    const handleSave = () => {
        onSave(localEmployees);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Icon name="List" size={20} />
                        調整員工順序
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-slate-50">
                    <div className="space-y-2">
                        {localEmployees.map((emp, index) => (
                            <div
                                key={emp.id}
                                className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <div className="font-bold text-slate-800">{emp.name}</div>
                                        <div className={`text-xs ${emp.role === '半職'
                                            ? 'text-purple-600 font-medium'
                                            : emp.role === '支援'
                                                ? 'text-orange-600 font-medium'
                                                : 'text-slate-500'
                                            }`}>{emp.role}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className={`p-1.5 rounded border transition-colors ${index === 0
                                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                            : 'bg-white text-slate-600 border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                                            }`}
                                        title="上移"
                                    >
                                        <Icon name="ChevronUp" size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === localEmployees.length - 1}
                                        className={`p-1.5 rounded border transition-colors ${index === localEmployees.length - 1
                                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                            : 'bg-white text-slate-600 border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                                            }`}
                                        title="下移"
                                    >
                                        <Icon name="ChevronDown" size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-white rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 border border-slate-300 hover:bg-slate-100 rounded transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        儲存順序
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeReorderModal;
