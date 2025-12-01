import * as LucideIcons from 'lucide-react';

/**
 * Icon 元件 - 使用 lucide-react 圖標庫
 * @param {string} name - 圖標名稱
 * @param {number} size - 圖標大小，預設 18
 * @param {string} className - 額外的 CSS 類別
 */
const Icon = ({ name, size = 18, className = '' }) => {
    const IconComponent = LucideIcons[name];

    if (!IconComponent) {
        // 如果找不到圖標，返回一個預設的圓形圖標
        return (
            <LucideIcons.Circle
                size={size}
                className={`${className} text-gray-400`}
            />
        );
    }

    return <IconComponent size={size} className={className} />;
};

export default Icon;
