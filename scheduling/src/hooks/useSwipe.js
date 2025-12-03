import { useRef } from 'react';

/**
 * 處理觸控滑動手勢的 Hook
 * @param {Object} options
 * @param {Function} options.onSwipeLeft - 左滑回呼函式 (通常用於下一頁)
 * @param {Function} options.onSwipeRight - 右滑回呼函式 (通常用於上一頁)
 * @param {number} options.threshold - 觸發滑動的最小距離 (px)，預設 50
 */
export const useSwipe = ({ onSwipeLeft, onSwipeRight, threshold = 50 }) => {
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);
    const isSwipingRef = useRef(false);

    const onTouchStart = (e) => {
        touchEndRef.current = null;
        isSwipingRef.current = false;
        touchStartRef.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };
    };

    const onTouchMove = (e) => {
        touchEndRef.current = {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        };

        // 檢查是否發生顯著移動，標記為滑動中
        if (touchStartRef.current) {
            const distanceX = Math.abs(touchEndRef.current.x - touchStartRef.current.x);
            const distanceY = Math.abs(touchEndRef.current.y - touchStartRef.current.y);

            // 如果移動超過 10px，視為滑動意圖，準備攔截點擊
            if (distanceX > 10 || distanceY > 10) {
                isSwipingRef.current = true;
            }
        }
    };

    const onTouchEnd = () => {
        if (!touchStartRef.current || !touchEndRef.current) return;

        const distanceX = touchStartRef.current.x - touchEndRef.current.x;
        const distanceY = touchStartRef.current.y - touchEndRef.current.y;
        const isLeftSwipe = distanceX > threshold;
        const isRightSwipe = distanceX < -threshold;

        // 判斷是否為水平滑動 (水平位移 > 垂直位移)
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
            if (isLeftSwipe && onSwipeLeft) {
                onSwipeLeft();
            }
            if (isRightSwipe && onSwipeRight) {
                onSwipeRight();
            }
        }

        // 延遲重置滑動狀態，確保能攔截到隨後的 onClick
        setTimeout(() => {
            isSwipingRef.current = false;
        }, 100);
    };

    // 在捕獲階段攔截點擊事件
    const onClickCapture = (e) => {
        if (isSwipingRef.current) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onClickCapture,
        isSwipingRef // 暴露 ref 給外部使用
    };
};
