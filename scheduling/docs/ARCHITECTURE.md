# 外科門診排班系統 - 系統架構文件

## 1. 專案概述
本專案為基於 React + Vite + Tailwind CSS 建構的單頁應用程式 (SPA)。
主要功能為外科門診的排班管理，支援拖拉操作、規則檢查、報表匯出等功能。

## 2. 核心架構
### 2.1 狀態管理 (State Management)
*   **模式**: 集中式管理 (Centralized State)。
*   **核心元件**: `src/App.jsx` 是唯一的 Truth of Source。
*   **機制**: 所有核心資料 (Employees, Schedule, Rules...) 都由 `App.jsx` 管理，並透過 Props 向下傳遞給子元件。
*   **Undo/Redo**: 使用自定義 Hook `useHistory` 實作全域狀態的時光機功能。

### 2.2 資料持久化 (Data Persistence)
系統完全依賴瀏覽器的 `localStorage` 進行資料儲存。
**Storage Keys:**
*   `schedulingEmployees`: 員工列表
*   `schedulingData`: 排班資料 (核心)
*   `schedulingSkills`: 技能列表
*   `schedulingRules`: 診次規則 (CustomShiftRules)
*   `schedulingVisibleShifts`: 顯示班別設定
*   `schedulingTimeSlots`: 時段設定
*   `schedulingShiftDoctors`: 診次醫師設定

### 2.3 錯誤處理 (Error Handling)
*   **ErrorBoundary**: 位於 `src/components/ErrorBoundary.jsx`。
*   **功能**: 攔截渲染錯誤，防止白畫面。
*   **緊急救援**: 提供 `handleEmergencyExport` 功能，直接從 localStorage 讀取原始資料並匯出，繞過 React 狀態。

## 3. 核心邏輯說明
### 3.1 排班資料結構
*   **Key 格式**: `YYYY-MM-DD_EmpId_ShiftType` (例如: `2025-12-01_101_71診`)
*   **Value**: 字串 (標籤) 或 物件 (包含備註)。

### 3.2 自動清理機制
*   **位置**: `App.jsx` 初始化 `useHistory` 時。
*   **邏輯**: 每次啟動時檢查 `schedulingData`，自動刪除日期早於 90 天前的排班紀錄，以維持效能。

### 3.3 匯出/匯入
*   **JSON**: 完整備份。包含版本號、匯出日期及所有上述 Storage Keys 的資料。
*   **PDF**: 使用 `window.print()` 搭配 CSS `@media print` 進行列印。

## 4. 目錄結構
*   `src/components`: UI 元件 (Modals, Table, Header...)
*   `src/hooks`: 自定義 Hooks (useHistory)
*   `src/utils`: 工具函式 (日期處理, 格式化)
*   `src/constants`: 常數定義 (預設資料, 班別列表)

## 5. 測試策略 (Testing Strategy)
*   **框架**: Vitest
*   **範圍**:
    *   **Unit Tests**: 針對 `src/utils/dataUtils.js` 中的核心邏輯進行測試，確保資料處理與規則檢查的正確性。
    *   **指令**: `npm run test` 執行測試。

## 6. AI 導航地圖 (AI Navigation Map)

此章節專為 AI 助手設計，用於快速定位元件關係與資料流向。

### 6.1 元件樹狀圖 (Component Tree)
```mermaid
graph TD
    App[App.jsx (Root/State Store)]
    App --> Header[Header.jsx]
    App --> QuickFillToolbar[QuickFillToolbar.jsx (Floating)]
    App --> ScheduleTable[ScheduleTable.jsx (Main View)]
    App --> Modals[Modals Container]
    
    Header --> SettingsMenu[SettingsMenu.jsx]
    Header --> ExportMenu[ExportMenu.jsx]
    
    ScheduleTable --> Icon[Icon.jsx]
    
    Modals --> ShiftSelection[ShiftSelectionModal.jsx]
    Modals --> ManageShifts[ManageShiftsModal.jsx]
    Modals --> ManageDoctors[ManageDoctorsModal.jsx]
    Modals --> ManageSkills[ManageSkillsModal.jsx]
    Modals --> IndividualSchedule[IndividualScheduleModal.jsx]
    Modals --> TrackingReport[TrackingReportModal.jsx]
    Modals --> Confirmation[ConfirmationModal.jsx]
```

### 6.2 關鍵資料流 (Key Data Flows)

#### A. 排班修改流程 (Shift Modification)
1.  **Trigger**: User clicks cell in `ScheduleTable` -> calls `onCellClick`.
2.  **Logic**: `App.jsx` determines action:
    *   *Quick Fill*: Directly calls `handleQuickFill` -> updates `schedule` state.
    *   *Selection*: Sets `selectionModal` state -> opens `ShiftSelectionModal`.
3.  **Update**: `ShiftSelectionModal` calls `onSave` -> `handleShiftChange` in `App.jsx`.
4.  **Persist**: `useEffect` in `App.jsx` saves new `schedule` to `localStorage`.

#### B. 規則設定流程 (Rule Configuration)
1.  **Trigger**: User opens `ManageShiftsModal`.
2.  **Read**: Reads `customShiftRules` from `App.jsx` props.
3.  **Edit**: User adds/edits rule -> Local state in Modal updates.
4.  **Save**: User clicks Save -> calls `onSave` -> `setCustomShiftRules` in `App.jsx`.
5.  **Effect**: `App.jsx` re-renders `ScheduleTable` with new rules (e.g., new columns or dropdown options).

### 6.3 檔案職責速查 (File Responsibility Map)

| 功能領域 | 關鍵檔案 | 備註 |
| :--- | :--- | :--- |
| **核心狀態** | `src/App.jsx` | 所有的 State, Context, Effects 都在這 |
| **排班視圖** | `src/components/ScheduleTable.jsx` | 表格渲染、長按邏輯、拖拉互動 |
| **資料邏輯** | `src/utils/dataUtils.js` | 日期計算、規則排序、資料清理 |
| **預設資料** | `src/constants/defaultData.js` | 初始員工、診次規則、技能列表 |
| **樣式系統** | `src/index.css` | Tailwind directives, 列印樣式, Glassmorphism |
| **備份還原** | `src/hooks/useHistory.js` | Undo/Redo 邏輯 |
| **錯誤防護** | `src/components/ErrorBoundary.jsx` | 崩潰攔截、緊急資料匯出 |

---

## 7. 優化與維護輔助功能 (Optimization & Maintenance Features)

此章節記錄所有已實作的優化項目，這些功能雖然不直接影響業務邏輯，但能大幅提升系統的**可維護性**、**穩定性**與**開發效率**。

### 7.1 程式碼品質 (Code Quality)

#### ✅ JSDoc 型別註解
*   **位置**: `src/App.jsx` (第 35-58 行)
*   **功能**: 為核心資料結構 (`Employee`, `ShiftRule`) 加入標準的 JSDoc 註解。
*   **效益**: 
    *   讓 VS Code 提供智慧提示 (IntelliSense)。
    *   讓 AI 助手能精確理解資料格式，降低誤判機率。
*   **範例**:
    ```javascript
    /**
     * @typedef {Object} Employee 員工資料
     * @property {number} id - 員工 ID
     * @property {string} name - 姓名
     * @property {string} role - 職稱 (Doctor/Nurse/Admin)
     */
    ```

#### ✅ 常數化 (Constants Extraction)
*   **位置**: `src/constants/ui.js`
*   **功能**: 將散落在程式碼中的「魔術字串」集中管理。
*   **範例**: 
    *   Toast 類型: `TOAST_TYPES.SUCCESS`, `TOAST_TYPES.ERROR`, `TOAST_TYPES.INFO`
*   **效益**: 
    *   防止拼字錯誤 (typo) 導致的 Bug。
    *   未來修改設定只需改一處。

#### ✅ 程式碼風格統一 (Code Formatting)
*   **設定檔**: `.prettierrc`
*   **規則**: 
    *   縮排: 4 個空白
    *   引號: 單引號
    *   分號: 必須
    *   行寬: 100 字元
*   **效益**: 確保多人協作或 AI 生成的程式碼格式一致，減少 Git diff 干擾。

---

### 7.2 開發體驗 (Developer Experience)

#### ✅ 路徑別名 (Path Aliases)
*   **設定檔**: `vite.config.js`, `jsconfig.json`
*   **功能**: 使用 `@` 符號代表 `src` 資料夾。
*   **範例**: 
    ```javascript
    // 舊寫法 (相對路徑)
    import Header from '../../components/Header';
    
    // 新寫法 (絕對路徑)
    import Header from '@/components/Header';
    ```
*   **效益**: 
    *   檔案搬移時不需修改 import 路徑。
    *   AI 生成程式碼時不會算錯層級。

#### ✅ 單元測試 (Unit Testing)
*   **框架**: Vitest
*   **測試檔案**: `src/utils/dataUtils.test.js`
*   **涵蓋範圍**: 
    *   自動清理邏輯 (`cleanupOldScheduleData`)
    *   邊界條件測試 (90 天臨界值)
*   **執行指令**: `npm run test`
*   **效益**: 
    *   修改程式碼後能立即驗證是否破壞既有功能。
    *   為未來重構提供安全網。

---

### 7.3 系統穩定性 (System Stability)

#### ✅ 錯誤邊界 (Error Boundary)
*   **位置**: `src/components/ErrorBoundary.jsx`
*   **功能**: 
    1.  攔截 React 渲染錯誤，防止白畫面。
    2.  顯示友善的錯誤提示。
    3.  提供「緊急備份」按鈕，直接從 `localStorage` 救出資料。
*   **效益**: 
    *   即使程式崩潰，使用者也能保全資料。
    *   降低因錯誤導致的資料遺失風險。

#### ✅ 自動資料清理 (Auto Data Cleanup)
*   **位置**: `src/utils/dataUtils.js` (`cleanupOldScheduleData`)
*   **觸發時機**: 應用程式啟動時
*   **邏輯**: 自動刪除 90 天前的舊排班資料
*   **效益**: 
    *   防止 `localStorage` 無限膨脹導致效能下降。
    *   保持資料庫輕量化。

#### ✅ 資料完整性驗證 (Data Integrity)
*   **位置**: `src/App.jsx` (`handleImportJSON`)
*   **功能**: 匯入 JSON 時進行格式驗證
*   **檢查項目**: 
    *   檔案是否為有效 JSON
    *   是否包含必要欄位 (`employees`, `schedule`, `customShiftRules`)
*   **效益**: 防止匯入損壞的備份檔導致系統崩潰。

---

### 7.4 文件與知識管理 (Documentation)

#### ✅ 系統架構文件
*   **檔案**: `docs/ARCHITECTURE.md` (本檔案)
*   **內容**: 
    *   資料流向圖
    *   元件樹狀圖
    *   Storage Keys 說明
    *   AI 導航地圖
*   **效益**: 讓新接手的開發者或 AI 能快速理解系統架構。

#### ✅ 變更日誌
*   **檔案**: `docs/CHANGELOG.md`
*   **內容**: 記錄每個版本的新增功能、Bug 修復、優化項目
*   **效益**: 追蹤系統演進歷史，方便回溯問題。

---

### 7.5 未來優化建議 (Future Recommendations)

以下是目前**尚未實作**，但對長期維護有幫助的優化方向：

#### 🔮 TypeScript 遷移 (適合新專案)
*   **時機**: 開發全新系統時
*   **效益**: 
    *   編譯時期就能發現型別錯誤，減少 90% 的低級 Bug。
    *   AI 生成程式碼的準確率接近 100%。
*   **風險**: 現有專案遷移成本高，不建議中途改造。

#### 🔮 效能優化 (當使用者反映卡頓時)
*   **方案**: 使用 `React.memo` 優化 `ScheduleTable` 渲染。
*   **時機**: 當排班表格子數量超過 500 個時。

#### 🔮 程式碼模組化 (當 App.jsx 超過 1500 行時)
*   **方案**: 將 `App.jsx` 拆分為多個自定義 Hooks (`useEmployees`, `useSchedule`)。
*   **效益**: 降低單一檔案複雜度，提升 AI 閱讀效率。

---

**最後更新**: 2025-12-02  
**維護者**: AI Assistant (Gemini)

