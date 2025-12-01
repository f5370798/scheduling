/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // 針對橫向螢幕優化的斷點
            screens: {
                'tablet': '1024px',      // 平板橫向
                'desktop': '1440px',     // 桌面
                'wide': '1920px',        // 寬螢幕
            },
            // 觸控友善的最小尺寸
            minHeight: {
                'touch': '48px',
            },
            minWidth: {
                'touch': '48px',
            },
        },
    },
    plugins: [],
}
