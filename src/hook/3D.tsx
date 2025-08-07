import { useEffect, type RefObject } from 'react';
export const use3DTilt = (containerRef: RefObject<HTMLElement>) => {
    useEffect(() => {
        const loginContainer = containerRef.current;
        if (!loginContainer) return;

        // 鼠标移动时的处理函数
        const handleMouseMove = (e: MouseEvent) => {
            const xAxis = -(window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
            loginContainer.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        };

        // 鼠标进入容器时的处理函数
        const handleMouseEnter = () => {
            loginContainer.style.transition = 'all 0.3s ease';
        };

        // 鼠标离开容器时的处理函数
        const handleMouseLeave = () => {
            loginContainer.style.transition = 'all 0.5s ease';
            loginContainer.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        };

        // 绑定事件监听
        document.addEventListener('mousemove', handleMouseMove);
        loginContainer.addEventListener('mouseenter', handleMouseEnter);
        loginContainer.addEventListener('mouseleave', handleMouseLeave);

        // 组件卸载时清理事件监听
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            loginContainer.removeEventListener('mouseenter', handleMouseEnter);
            loginContainer.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [containerRef]); // 依赖 containerRef
};