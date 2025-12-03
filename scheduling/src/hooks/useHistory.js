import { useState, useCallback } from 'react';

/**
 * useHistory Hook
 * 提供狀態的復原 (Undo) 與重做 (Redo) 功能，並支援動作描述。
 * 實作了「時光機」模式，記錄過去、現在與未來的狀態。
 * 
 * @template T
 * @param {T | (() => T)} initialValue - 初始狀態或初始化函數
 * @param {number} [maxHistory=50] - 最大歷史紀錄數量，預設 50 筆
 * @returns {[
 *   T,                                      // current state
 *   (newState: T | ((prev: T) => T), action?: string) => void, // setState function with optional action description
 *   {
 *     undo: () => string | null,            // undo function, returns the action description undone
 *     redo: () => string | null,            // redo function, returns the action description redone
 *     canUndo: boolean,                     // flag indicating if undo is possible
 *     canRedo: boolean,                     // flag indicating if redo is possible
 *     reset: (newPresent: T) => void,       // function to reset history with new state
 *     history: Object                       // full history object (for debugging)
 *   }
 * ]}
 */
export default function useHistory(initialValue, maxHistory = 50) {
    const [history, setHistory] = useState(() => {
        const value = typeof initialValue === 'function' ? initialValue() : initialValue;
        return {
            past: [],
            present: { state: value, action: '初始狀態' },
            future: []
        };
    });

    const { present, past, future } = history;

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const setState = useCallback((newState, action = '變更') => {
        setHistory(curr => {
            const currentPresentState = curr.present.state;
            const nextState = typeof newState === 'function' ? newState(currentPresentState) : newState;

            // 如果狀態沒有改變，不進行任何操作
            if (nextState === currentPresentState) return curr;

            const newPast = [...curr.past, curr.present];

            // 限制歷史紀錄長度
            if (newPast.length > maxHistory) {
                newPast.shift();
            }

            return {
                past: newPast,
                present: { state: nextState, action },
                future: [] // 新的變更會清空 Redo 堆疊
            };
        });
    }, [maxHistory]);

    const undo = useCallback(() => {
        if (history.past.length === 0) return null;

        const actionUndone = history.present.action;

        setHistory(curr => {
            if (curr.past.length === 0) return curr;

            const previous = curr.past[curr.past.length - 1];
            const newPast = curr.past.slice(0, curr.past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [curr.present, ...curr.future]
            };
        });

        return actionUndone;
    }, [history]);

    const redo = useCallback(() => {
        if (history.future.length === 0) return null;

        const actionRedone = history.future[0].action;

        setHistory(curr => {
            if (curr.future.length === 0) return curr;

            const next = curr.future[0];
            const newFuture = curr.future.slice(1);

            return {
                past: [...curr.past, curr.present],
                present: next,
                future: newFuture
            };
        });

        return actionRedone;
    }, [history]);

    // 重置歷史紀錄 (例如載入新檔案時)
    const reset = useCallback((newPresent) => {
        setHistory({
            past: [],
            present: { state: newPresent, action: '重置' },
            future: []
        });
    }, []);

    return [
        present.state, // 回傳當前狀態 (解包)
        setState,
        {
            undo,
            redo,
            canUndo,
            canRedo,
            reset,
            history // 僅供除錯用
        }
    ];
}
