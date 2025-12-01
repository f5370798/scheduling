// 格式化日期鍵 (YYYY-MM-DD)
export const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// 獲取當前日期是當月的第几週 (1-5)
// 獲取當前日期是當月的第几週
export const getWeekOfMonth = (weekStart, currentMonth) => {
    if (!currentMonth) {
        const dayOfMonth = weekStart.getDate();
        return Math.ceil(dayOfMonth / 7);
    }

    // 找到 currentMonth 第一天所在的週的起始日 (週一)
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

    // 計算該週週一的日期
    // 如果是週日(0)，往前推6天；否則往前推 dayOfWeek - 1 天
    const diff = firstDayOfMonth.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const firstWeekStart = new Date(firstDayOfMonth);
    firstWeekStart.setDate(diff);

    // 計算週數差
    const timeDiff = weekStart.getTime() - firstWeekStart.getTime();
    const weekDiff = Math.round(timeDiff / (7 * 24 * 60 * 60 * 1000));

    return weekDiff + 1;
};

// 從排班數據中獲取標籤
export const getShiftLabel = (shift) => {
    if (typeof shift === 'object' && shift !== null && shift.label) {
        return shift.label;
    }
    return shift || 'OFF';
};

// 從排班數據中獲取備註
export const getShiftMemo = (shift) => {
    if (typeof shift === 'object' && shift !== null && shift.memo) {
        return shift.memo.trim();
    }
    return '';
};

// 用於對診次名稱進行數字/中文排序
export const getNumericSortValue = (sessionId) => {
    const match = sessionId.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
};

export const sortRulesArray = (rulesArray) => {
    return [...rulesArray].sort((a, b) => {
        const numA = getNumericSortValue(a.sessionId);
        const numB = getNumericSortValue(b.sessionId);

        if (numA !== numB) {
            return numA - numB;
        }
        return a.sessionId.localeCompare(b.sessionId, 'zh-TW');
    });
};

// 根據規則構建 SHIFT_HIERARCHY
export const buildShiftData = (rules) => {
    const hierarchy = {};
    const sortedRules = sortRulesArray(rules);

    sortedRules.forEach(rule => {
        if (!hierarchy[rule.shiftType]) {
            hierarchy[rule.shiftType] = {};
        }
        if (!hierarchy[rule.shiftType][rule.timeSlot]) {
            hierarchy[rule.shiftType][rule.timeSlot] = [];
        }

        if (!hierarchy[rule.shiftType][rule.timeSlot].includes(rule.sessionId)) {
            hierarchy[rule.shiftType][rule.timeSlot].push(rule.sessionId);
        }
    });

    return { SHIFT_HIERARCHY: hierarchy };
};

// 獲取診次所需技能
export const getRuleRequiredSkillsGlobal = (rules, shiftType, timeSlot, sessionId) => {
    const matchingRule = rules.find(rule =>
        rule.shiftType === shiftType &&
        rule.timeSlot === timeSlot &&
        rule.sessionId === sessionId
    );
    return matchingRule?.requiredSkills || [];
};

/**
 * 清理舊排班資料
 * @param {Object} scheduleData - 原始排班資料
 * @param {number} retentionDays - 保留天數 (預設 90)
 * @param {Date} [baseDate] - 基準日期 (預設為今天，方便測試)
 * @returns {Object} { cleanedData, deletedCount }
 */
export const cleanupOldScheduleData = (scheduleData, retentionDays = 90, baseDate = new Date()) => {
    if (!scheduleData) return { cleanedData: {}, deletedCount: 0 };

    const cutoffDate = new Date(baseDate);
    cutoffDate.setDate(baseDate.getDate() - retentionDays);
    cutoffDate.setHours(0, 0, 0, 0);

    const newData = { ...scheduleData };
    let deletedCount = 0;

    Object.keys(newData).forEach(key => {
        // key 格式: YYYY-MM-DD_EmpId_ShiftType
        const parts = key.split('_');
        if (parts.length > 0) {
            const dateStr = parts[0];
            const itemDate = new Date(dateStr);

            // 確保日期有效且早於截止日期
            if (!isNaN(itemDate.getTime()) && itemDate < cutoffDate) {
                delete newData[key];
                deletedCount++;
            }
        }
    });

    return { cleanedData: newData, deletedCount };
};
