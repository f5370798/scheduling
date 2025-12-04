# 員工列高亮功能 - 快速修改指南

## 🎯 目標
讓使用者可以點擊員工姓名來高亮整列，並顯示藍色底線。

## ✅ 已完成
1. ✅ CSS 樣式 (`src/visual-feedback.css`)
2. ✅ ScheduleTable 加入 `highlighted-row` 類別

## ⏸️ 需要手動完成

### 步驟 1: 在 App.jsx 加入狀態 (約第 276 行)

找到這段：
```javascript
// ============ 快速填寫工具狀態 ============
const [activeTool, setActiveTool] = useState('SELECT');
```

在下面加入：
```javascript
// ============ 員工列高亮狀態 ============
const [highlightedEmployee, setHighlightedEmployee] = useState(null);

// 切換員工列高亮
const handleEmployeeRowClick = useCallback((empId) => {
    setHighlightedEmployee(prev => prev === empId ? null : empId);
}, []);
```

---

### 步驟 2: 傳遞 props 到 ScheduleTable (約第 1201-1202 行)

找到這段：
```javascript
highlightedEmpId={selectionModal?.empId || editingEmployee?.id}
currentMonth={currentMonth}
```

修改為：
```javascript
highlightedEmpId={selectionModal?.empId || editingEmployee?.id || highlightedEmployee}
onEmployeeRowClick={handleEmployeeRowClick}
currentMonth={currentMonth}
```

---

### 步驟 3: 在 ScheduleTable.jsx 接收 props (約第 69-79 行)

找到這段：
```javascript
const ScheduleTable = ({
    currentMonthDays,
    employees,
    schedule,
    visibleShifts,
    onCellClick,
    onMajorShiftClick,
    highlightedEmpId,
    currentMonth,
    activeTool = 'SELECT',
    onShiftMove
}) => {
```

在 `highlightedEmpId` 後面加入：
```javascript
const ScheduleTable = ({
    currentMonthDays,
    employees,
    schedule,
    visibleShifts,
    onCellClick,
    onMajorShiftClick,
    highlightedEmpId,
    onEmployeeRowClick,  // ← 加這行
    currentMonth,
    activeTool = 'SELECT',
    onShiftMove
}) => {
```

---

### 步驟 4: 在員工姓名格子加入點擊事件 (約第 248-251 行)

找到這段：
```javascript
<td className={`grid-cell sticky left-0 print:static z-20 font-semibold border-r-2 border-slate-300 bg-clip-padding min-w-[6rem] transition-colors ${highlightedEmpId === emp.id
    ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
    : 'bg-white text-slate-800 group-hover:bg-blue-50'
    }`}>
```

修改為：
```javascript
<td 
    className={`grid-cell sticky left-0 print:static z-20 font-semibold border-r-2 border-slate-300 bg-clip-padding min-w-[6rem] transition-colors cursor-pointer ${highlightedEmpId === emp.id
        ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
        : 'bg-white text-slate-800 group-hover:bg-blue-50'
    }`}
    onClick={() => onEmployeeRowClick?.(emp.id)}
    title="點擊高亮此員工列"
>
```

---

## ✅ 完成檢查

修改完成後，在瀏覽器 Console 執行：

```javascript
document.querySelector('tbody tr td').click();
setTimeout(() => {
    const row = document.querySelector('.highlighted-row');
    if (row) {
        console.log('✅ 成功！底線樣式:', window.getComputedStyle(row).borderBottom);
    } else {
        console.log('❌ 失敗');
    }
}, 300);
```

應該會看到：
```
✅ 成功！底線樣式: 3px solid rgb(59, 130, 246)
```

---

**建立時間**: 2025-12-04  
**預計時間**: 5-10 分鐘
