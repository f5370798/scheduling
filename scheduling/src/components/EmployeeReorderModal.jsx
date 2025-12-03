import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from './Icon';

/**
 * 可排序的列表項目元件
 */
const SortableItem = ({ id, emp, index, onMoveUp, onMoveDown, isFirst, isLast }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative',
        opacity: isDragging ? 0.9 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white p-3 rounded border border-slate-200 flex items-center justify-between shadow-sm transition-all ${isDragging ? 'shadow-xl ring-2 ring-indigo-500/50 scale-[1.02]' : 'hover:shadow-md'}`}
        >
            <div className="flex items-center gap-3">
                {/* 拖曳手柄 */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded touch-none"
                    title="拖曳以排序"
                >
                    <Icon name="GripVertical" size={20} />
                </div>

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
                    onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
                    disabled={isFirst}
                    className={`p-1.5 rounded border transition-colors ${isFirst
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                        }`}
                    title="上移"
                >
                    <Icon name="ChevronUp" size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
                    disabled={isLast}
                    className={`p-1.5 rounded border transition-colors ${isLast
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'
                        }`}
                    title="下移"
                >
                    <Icon name="ChevronDown" size={16} />
                </button>
            </div>
        </div>
    );
};

/**
 * 員工排序調整 Modal
 * 支援拖曳排序與按鈕排序
 */
const EmployeeReorderModal = ({ isOpen, onClose, employees, onSave }) => {
    const [localEmployees, setLocalEmployees] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setLocalEmployees([...employees]);
        }
    }, [isOpen, employees]);

    const sensors = useSensors(
        useSensor(PointerSensor), // 移除 activationConstraint，讓拖曳即時反應
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setLocalEmployees((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleMoveUp = (index) => {
        if (index > 0) {
            setLocalEmployees(items => {
                const newItems = [...items];
                [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                return newItems;
            });
        }
    };

    const handleMoveDown = (index) => {
        if (index < localEmployees.length - 1) {
            setLocalEmployees(items => {
                const newItems = [...items];
                [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                return newItems;
            });
        }
    };

    const handleSave = () => {
        onSave(localEmployees);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh] animate-scaleIn">
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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={localEmployees.map(e => e.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {localEmployees.map((emp, index) => (
                                    <SortableItem
                                        key={emp.id}
                                        id={emp.id}
                                        emp={emp}
                                        index={index}
                                        onMoveUp={handleMoveUp}
                                        onMoveDown={handleMoveDown}
                                        isFirst={index === 0}
                                        isLast={index === localEmployees.length - 1}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
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
