// 技能列表
export const INITIAL_SKILLS = ['超音波', '拆線', '石膏', 'Dr.高', '其他'];

// 新增的週一到週五 8'-12' 診次
export const NEW_PRIME_SESSIONS = [
    '71診', '72診', '73診', '74診', '76診',
    '78診', '79診', '80診', '84診', '94診',
    '95診', '97診', '98診'
];

// Helper function to ensure all rules have default week frequency
export const addDefaultWeekFrequency = (rules) => {
    return rules.map(rule => ({
        weekFrequency: rule.weekFrequency || [1, 2, 3, 4, 5],
        isTracked: rule.isTracked || false,
        ...rule,
        requiredSkills: rule.requiredSkills || []
    }));
};

// 診次規則初始狀態
export const INITIAL_CUSTOM_SHIFT_RULES = addDefaultWeekFrequency([
    // Custom/Special Sessions
    { id: 7, sessionId: '83診', capacity: 1, shiftType: 'MORNING', timeSlot: '8-12', days: [1], requiredSkills: ['拆線'], isTracked: false },
    { id: 8, sessionId: '82診', capacity: 1, shiftType: 'MORNING', timeSlot: '8-12', days: [1, 2, 3, 4, 5, 6], requiredSkills: ['石膏'], weekFrequency: [1, 3], isTracked: true },
    { id: 9, sessionId: '102診', capacity: 1, shiftType: 'MORNING', timeSlot: '8-12', days: [4], requiredSkills: [], isTracked: false },
    { id: 10, sessionId: '105診', capacity: 2, shiftType: 'MORNING', timeSlot: '8\'-12\'', days: [1, 2], requiredSkills: [], weekFrequency: [2, 4], isTracked: false },
    { id: 11, sessionId: '105診', capacity: 1, shiftType: 'MORNING', timeSlot: '8-12', days: [4], requiredSkills: [], isTracked: false },

    // New Prime Sessions
    ...NEW_PRIME_SESSIONS.map((sess, idx) => ({
        id: 200 + idx,
        sessionId: sess,
        capacity: 1,
        shiftType: 'MORNING',
        timeSlot: '8\'-12\'',
        days: [1, 2, 3, 4, 5],
        requiredSkills: [],
        isTracked: false
    })),

    // Default Session for 9-1 slot
    { id: 400, sessionId: '門診', capacity: 1, shiftType: 'MORNING', timeSlot: '9-1', days: [1, 2, 3, 4, 5, 6], requiredSkills: [], isTracked: false },
]);

// 預設員工資料
export const DEFAULT_EMPLOYEES = [
    { id: 1, name: '王小明', role: '正職', skills: ['拆線', '石膏'], majorShift: 'FULL', mainSessionId: '83' },
    { id: 2, name: '李大華', role: '正職', skills: ['石膏', '超音波'], majorShift: 'FULL', mainSessionId: '' },
    { id: 3, name: '陳雅婷', role: '半職', skills: ['拆線'], majorShift: 'MORNING', mainSessionId: '105' },
    { id: 4, name: '張志豪', role: '支援', skills: [], majorShift: 'NONE', mainSessionId: '' },
];
