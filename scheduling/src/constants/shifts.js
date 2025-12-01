// 班別類型定義
export const SHIFT_TYPES = {
    OFF: { id: 'OFF', label: '休', color: 'bg-gray-100 text-gray-400', fullLabel: '未排班' },
    OFF_CONFIRMED: { id: 'OFF_CONFIRMED', label: 'OFF', color: 'bg-red-200 text-red-800 border-red-300', fullLabel: '已排休' },
    MORNING: { id: 'MORNING', label: '早', color: 'bg-blue-100 text-blue-700 border-blue-200', fullLabel: '早班' },
    AFTERNOON: { id: 'AFTERNOON', label: '午', color: 'bg-orange-100 text-orange-700 border-orange-200', fullLabel: '午班' },
    NIGHT: { id: 'NIGHT', label: '晚', color: 'bg-purple-100 text-purple-700 border-purple-200', fullLabel: '晚班' },
};

// 顯示在表格上的班別列表
export const ALL_SHIFT_TYPES = ['MORNING', 'AFTERNOON', 'NIGHT'];

export const EMPLOYEE_SHIFTS_COLUMNS = ALL_SHIFT_TYPES.map(type => ({
    type: type,
    label: SHIFT_TYPES[type].label,
    color: SHIFT_TYPES[type].color,
    fullLabel: SHIFT_TYPES[type].fullLabel
}));

// 主要班別定義
export const MAJOR_SHIFTS = {
    'NONE': '未設定',
    // 整日時段
    '8-4\'': '8-4\'',
    '8\'-5': '8\'-5',
    '9-5\'': '9-5\'',
    // 早班半天時段
    '8-12': '8-12',
    '8\'-12': '8\'-12',
    '8\'-12\'': '8\'-12\'',
    '9-1': '9-1',
    // 午班半天時段
    '1-5': '1-5',
    '1\'-5\'': '1\'-5\'',
    '2-6': '2-6',
};

export const MAJOR_SHIFT_GROUPS = {
    'FULL_DAY': { label: '整日班', shifts: ['8-4\'', '8\'-5', '9-5\''] },
    'MORNING_HALF': { label: '早班半天', shifts: ['8-12', '8\'-12', '8\'-12\'', '9-1'] },
    'AFTERNOON_HALF': { label: '午班半天', shifts: ['1-5', '1\'-5\'', '2-6'] },
};
