import { describe, it, expect } from 'vitest';
import { cleanupOldScheduleData } from './dataUtils';

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
