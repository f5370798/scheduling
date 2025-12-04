import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScheduleTable from './ScheduleTable';
import React from 'react';

// Mock DndContext components since they rely on browser APIs
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }) => <div>{children}</div>,
    useSensors: () => { },
    useSensor: () => { },
    MouseSensor: {},
    TouchSensor: {},
    DragOverlay: ({ children }) => <div>{children}</div>,
    useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
    useDraggable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn(), transform: null }),
}));

describe('ScheduleTable Component', () => {
    const mockEmployees = [
        { id: 'emp1', name: '測試醫師', role: '醫師', majorShift: 'MORNING' }
    ];
    const mockDays = [
        { dateKey: '2023-01-01', date: new Date('2023-01-01'), dayOfWeek: 1, dayNumber: 1 }
    ];
    const mockSchedule = {};
    const mockVisibleShifts = ['MORNING', 'AFTERNOON', 'NIGHT'];

    it('應該正確渲染員工列並處理點擊高亮', () => {
        const onEmployeeRowClick = vi.fn();

        // 1. 初始渲染 (無高亮)
        const { rerender, container } = render(
            <ScheduleTable
                currentMonthDays={mockDays}
                employees={mockEmployees}
                schedule={mockSchedule}
                visibleShifts={mockVisibleShifts}
                highlightedEmpId={null}
                onEmployeeRowClick={onEmployeeRowClick}
                activeTool="SELECT"
            />
        );

        // 檢查員工姓名是否顯示
        const empName = screen.getByText('測試醫師');
        expect(empName).toBeDefined();

        // 模擬點擊
        fireEvent.click(empName.closest('td'));
        expect(onEmployeeRowClick).toHaveBeenCalledWith('emp1');

        // 2. 重新渲染 (模擬高亮狀態)
        rerender(
            <ScheduleTable
                currentMonthDays={mockDays}
                employees={mockEmployees}
                schedule={mockSchedule}
                visibleShifts={mockVisibleShifts}
                highlightedEmpId="emp1" // 設定高亮 ID
                onEmployeeRowClick={onEmployeeRowClick}
                activeTool="SELECT"
            />
        );

        // 檢查是否應用了強制樣式
        const row = container.querySelector('tr');
        // 檢查 inline style 是否包含 border-bottom
        expect(row.style.borderBottom).toContain('3px solid');
        expect(row.style.borderBottom).toMatch(/#3b82f6|rgb\(59, 130, 246\)/);

        // 檢查 class 是否包含 !bg-blue-50
        expect(row.className).toContain('!bg-blue-50');
    });
});
