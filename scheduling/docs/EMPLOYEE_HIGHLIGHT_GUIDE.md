# 員工列高亮功能實作指南

## 🎯 功能說明

### 高亮觸發條件（優先級由高到低）
1. **編輯模態框開啟** - 高亮正在編輯的員工（原有功能）
2. **選擇模態框開啟** - 高亮正在選擇的員工（原有功能）
3. **點擊員工姓名** - 手動高亮該員工（新功能）

---

## 📝 實作步驟

### 步驟 1: 在 App.jsx 加入狀態

在 `settingsButtonRef` 定義後（約第 272-273 行），加入：

```javascript
const settingsMenuContainerRef = useRef(null);
const settingsButtonRef = useRef(null);

// ============ 員工列高亮狀態 ============
const [highlightedEmployee, setHighlightedEmployee] = useState(null);

// 切換員工列高亮
const handleEmployeeRowClick = useCallback((empId) => {
    setHighlightedEmployee(prev => prev === empId ? null : empId);
}, []);
```

---

### 步驟 2: 傳遞 props 到 ScheduleTable

找到 `<ScheduleTable` 元件（約第 1198 行），修改 `highlightedEmpId` 這一行：

**修改前**:
```javascript
highlightedEmpId={selectionModal?.empId || editingEmployee?.id}
```

**修改後**:
```javascript
highlightedEmpId={selectionModal?.empId || editingEmployee?.id || highlightedEmployee}
onEmployeeRowClick={handleEmployeeRowClick}
```

---

### 步驟 3: 在 ScheduleTable.jsx 接收 props

找到 `ScheduleTable` 函數定義（約第 69 行），加入新的 prop：

**修改前**:
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

**修改後**:
```javascript
const ScheduleTable = ({
    currentMonthDays,
    employees,
    schedule,
    visibleShifts,
    onCellClick,
    onMajorShiftClick,
    highlightedEmpId,
    onEmployeeRowClick, // 新增
    currentMonth,
    activeTool = 'SELECT',
    onShiftMove
}) => {
```

---

### 步驟 4: 在員工姓名格子加入點擊事件

找到員工姓名的 `<td>` 元素（約第 248 行），加入點擊事件：

**修改前**:
```javascript
<td className={`grid-cell sticky left-0 print:static z-20 font-semibold border-r-2 border-slate-300 bg-clip-padding min-w-[6rem] transition-colors ${highlightedEmpId === emp.id
    ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
    : 'bg-white text-slate-800 group-hover:bg-blue-50'
    }`}>
```

**修改後**:
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

### 步驟 5: 更新員工列樣式（加入底線）

找到員工列的 `<tr>` 元素（約第 246 行），加入底線樣式：

**修改前**:
```javascript
<tr key={emp.id} className={`transition-colors border-b border-slate-200 group ${highlightedEmpId === emp.id ? 'bg-yellow-50' : ''}`}>
```

**修改後**:
```javascript
<tr 
    key={emp.id} 
    className={`transition-colors border-b border-slate-200 group ${highlightedEmpId === emp.id ? 'bg-yellow-50 highlighted-row' : ''}`}
>
```

---

### 步驟 6: 加入 CSS 樣式

在 `src/visual-feedback.css` 檔案最後加入：

```css
/* ========== 員工列高亮 ========== */

/* 高亮列底線 */
.highlighted-row {
    border-bottom: 3px solid #3b82f6 !important;
    position: relative;
}

/* 列印時隱藏底線 */
@media print {
    .highlighted-row {
        border-bottom: 1px solid #e2e8f0 !important;
    }
}
```

---

## ✅ 完成檢查清單

- [ ] 步驟 1: App.jsx 加入狀態和處理函數
- [ ] 步驟 2: 傳遞 props 到 ScheduleTable
- [ ] 步驟 3: ScheduleTable 接收新的 prop
- [ ] 步驟 4: 員工姓名格子加入點擊事件
- [ ] 步驟 5: 員工列加入 highlighted-row 類別
- [ ] 步驟 6: 加入 CSS 樣式

---

## 🧪 測試步驟

### 測試 1: 原有功能（編輯模態框）
1. 點擊任一格子開啟編輯模態框
2. ✅ 該員工列應該有黃色背景 + 藍色底線
3. 關閉模態框
4. ✅ 高亮消失

### 測試 2: 新功能（點擊員工姓名）
1. 點擊員工姓名
2. ✅ 該員工列應該有黃色背景 + 藍色底線
3. 再次點擊同一員工姓名
4. ✅ 高亮消失

### 測試 3: 優先級測試
1. 先點擊員工 A 的姓名（高亮 A）
2. 點擊員工 B 的排班格子開啟編輯模態框
3. ✅ 應該高亮員工 B（模態框優先）
4. 關閉模態框
5. ✅ 應該恢復高亮員工 A

---

## 🎨 視覺效果

### 正常列
```
┌────────┬─────┬─────┬─────┐
│ 王小明 │ 早  │ 午  │ 晚  │
├────────┼─────┼─────┼─────┤ ← 細線
```

### 高亮列（點擊姓名或編輯時）
```
┌────────┬─────┬─────┬─────┐
│ 李大華 │ 早  │ 午  │ 晚  │ ← 黃色背景
└────────┴─────┴─────┴─────┘
  ━━━━━━━━━━━━━━━━━━━━━━━  ← 藍色粗底線
```

---

## 💡 使用方式

### 方法 1: 點擊員工姓名
- 點擊一次 → 高亮
- 再點一次 → 取消高亮

### 方法 2: 點擊其他員工
- 點擊員工 A → 高亮 A
- 點擊員工 B → 切換到高亮 B

### 方法 3: 編輯模態框（自動）
- 開啟編輯模態框 → 自動高亮
- 關閉模態框 → 恢復之前的高亮狀態

---

**建立時間**: 2025-12-04  
**版本**: v1.1.2
