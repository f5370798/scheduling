import { describe, it, expect } from 'vitest';
import {
    cleanupOldScheduleData,
    formatDateKey,
    getWeekOfMonth,
    getShiftLabel,
    getShiftMemo,
    getNumericSortValue,
    sortRulesArray,
    buildShiftData,
    getRuleRequiredSkillsGlobal
} from './dataUtils';

describe('Data Utility Functions', () => {

    // ============ Date Formatting Tests ============
    describe('formatDateKey', () => {
        it('應該正確格式化日期為 YYYY-MM-DD', () => {
            const date = new Date(2023, 11, 25); // Month is 0-indexed, so 11 is Dec
            expect(formatDateKey(date)).toBe('2023-12-25');
        });

        it('應該正確處理個位數的月份和日期', () => {
            const date = new Date(2024, 0, 5); // Jan 5th
            expect(formatDateKey(date)).toBe('2024-01-05');
        });
    });

    // ============ Week Calculation Tests ============
    describe('getWeekOfMonth', () => {
        it('應該正確計算該月第一週', () => {
            const currentMonth = new Date(2023, 11, 1); // Dec 2023
            const weekStart = new Date(2023, 10, 27); // Nov 27 (Monday of the week containing Dec 1st)
            // Note: Depending on logic, if Dec 1 is Friday, the week starting Nov 27 is Week 1
            expect(getWeekOfMonth(weekStart, currentMonth)).toBe(1);
        });

        it('應該正確計算該月第二週', () => {
            const currentMonth = new Date(2023, 11, 1);
            const weekStart = new Date(2023, 11, 4); // Dec 4 (Monday)
            expect(getWeekOfMonth(weekStart, currentMonth)).toBe(2);
        });
    });

    // ============ Shift Data Helper Tests ============
    describe('getShiftLabel & getShiftMemo', () => {
        it('getShiftLabel 應該回傳物件中的 label', () => {
            const shift = { label: '71診', memo: 'Test' };
            expect(getShiftLabel(shift)).toBe('71診');
        });

        it('getShiftLabel 應該回傳字串本身', () => {
            expect(getShiftLabel('OFF')).toBe('OFF');
        });

        it('getShiftLabel 若為 null 應該回傳 OFF', () => {
            expect(getShiftLabel(null)).toBe('OFF');
        });

        it('getShiftMemo 應該回傳備註', () => {
            const shift = { label: '71診', memo: ' Test Memo ' };
            expect(getShiftMemo(shift)).toBe('Test Memo');
        });

        it('getShiftMemo 若無備註應該回傳空字串', () => {
            expect(getShiftMemo('OFF')).toBe('');
        });
    });

    // ============ Sorting Logic Tests ============
    describe('Sorting Logic', () => {
        it('getNumericSortValue 應該解析開頭的數字', () => {
            expect(getNumericSortValue('01診')).toBe(1);
            expect(getNumericSortValue('10診')).toBe(10);
            expect(getNumericSortValue('A診')).toBe(Infinity);
        });

        it('sortRulesArray 應該正確排序規則', () => {
            const rules = [
                { sessionId: '10診' },
                { sessionId: '02診' },
                { sessionId: '01診' },
                { sessionId: '特殊診' }
            ];
            const sorted = sortRulesArray(rules);
            expect(sorted.map(r => r.sessionId)).toEqual(['01診', '02診', '10診', '特殊診']);
        });
    });

    // ============ Hierarchy Building Tests ============
    describe('buildShiftData', () => {
        it('應該正確建構 SHIFT_HIERARCHY', () => {
            const rules = [
                { shiftType: 'TypeA', timeSlot: 'Morning', sessionId: '01' },
                { shiftType: 'TypeA', timeSlot: 'Morning', sessionId: '02' },
                { shiftType: 'TypeB', timeSlot: 'Afternoon', sessionId: '03' }
            ];

            const { SHIFT_HIERARCHY } = buildShiftData(rules);

            expect(SHIFT_HIERARCHY['TypeA']['Morning']).toEqual(['01', '02']);
            expect(SHIFT_HIERARCHY['TypeB']['Afternoon']).toEqual(['03']);
        });
    });

    // ============ Required Skills Tests ============
    describe('getRuleRequiredSkillsGlobal', () => {
        it('應該回傳正確的技能列表', () => {
            const rules = [
                { shiftType: 'A', timeSlot: 'M', sessionId: '01', requiredSkills: ['Skill1'] }
            ];
            const skills = getRuleRequiredSkillsGlobal(rules, 'A', 'M', '01');
            expect(skills).toEqual(['Skill1']);
        });

        it('若無匹配規則應該回傳空陣列', () => {
            const rules = [];
            const skills = getRuleRequiredSkillsGlobal(rules, 'A', 'M', '01');
            expect(skills).toEqual([]);
        });
    });

    // ============ Cleanup Logic Tests ============
    describe('cleanupOldScheduleData', () => {
        it('應該刪除超過 90 天的舊資料', () => {
            const baseDate = new Date('2025-12-01');
            const oldDate = '2025-08-01'; // 超過 90 天
            const newDate = '2025-11-01'; // 30 天前 (保留)

            const mockData = {
                [`${oldDate}_101_ShiftA`]: 'Old Shift',
                [`${newDate}_101_ShiftB`]: 'New Shift'
            };

            const { cleanedData, deletedCount } = cleanupOldScheduleData(mockData, 90, baseDate);

            expect(deletedCount).toBe(1);
            expect(cleanedData[`${oldDate}_101_ShiftA`]).toBeUndefined();
            expect(cleanedData[`${newDate}_101_ShiftB`]).toBeDefined();
        });

        it('應該保留邊界日期 (剛好 90 天)', () => {
            const baseDate = new Date('2025-12-01');
            // 90 天前是 2025-09-02
            const boundaryDate = '2025-09-02';

            const mockData = {
                [`${boundaryDate}_101_ShiftA`]: 'Boundary Shift'
            };

            const { cleanedData, deletedCount } = cleanupOldScheduleData(mockData, 90, baseDate);

            expect(deletedCount).toBe(0); // 應該保留
            expect(cleanedData[`${boundaryDate}_101_ShiftA`]).toBeDefined();
        });

        it('如果資料為空，應該回傳空物件', () => {
            const { cleanedData, deletedCount } = cleanupOldScheduleData({}, 90);
            expect(cleanedData).toEqual({});
            expect(deletedCount).toBe(0);
        });
    });
});
