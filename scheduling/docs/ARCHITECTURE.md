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
