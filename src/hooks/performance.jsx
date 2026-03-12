import { useEffect } from 'react';

const usePerformanceMonitoring = () => {
    useEffect(() => {
        // 存储观察者实例，用于后续清理
        const observers = [];

        // 监控 LCP
        try {
            const lcpObserver = new PerformanceObserver((entryList) => {
                try {
                    const entries = entryList.getEntries();
                    // 确保有条目再处理，避免空数组错误
                    if (entries.length > 0) {
                        const lastEntry = entries[entries.length - 1];
                        console.log('📊 LCP:', lastEntry.startTime.toFixed(2), 'ms');
                        // 打印出被认定为最大的元素信息
                        if (lastEntry.element) {
                            console.log('🎯 LCP 元素:', lastEntry.element);
                        }
                        // 可以在这里添加数据上报逻辑
                        // reportToAnalytics('LCP', lastEntry.startTime);
                    }
                } catch (error) {
                    console.error('处理 LCP 数据时出错:', error);
                }
            });

            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            observers.push(lcpObserver);
            console.log('✅ LCP 监控已启动');
        } catch (error) {
            console.error('❌ 初始化 LCP 监控失败:', error);
        }

        // // 监控 CLS (建议添加，因为它是核心Web指标之一)
        // try {
        //     let clsValue = 0;
        //     const clsObserver = new PerformanceObserver((entryList) => {
        //         try {
        //             for (const entry of entryList.getEntries()) {
        //                 if (!entry.hadRecentInput) {
        //                     clsValue += entry.value;
        //                     console.log('📏 CLS 累计:', clsValue.toFixed(4));

        //                     // 可以在这里添加数据上报逻辑
        //                     // reportToAnalytics('CLS', clsValue);
        //                 }
        //             }
        //         } catch (error) {
        //             console.error('处理 CLS 数据时出错:', error);
        //         }
        //     });

        //     clsObserver.observe({ type: 'layout-shift', buffered: true });
        //     observers.push(clsObserver);
        //     console.log('✅ CLS 监控已启动');
        // } catch (error) {
        //     console.error('❌ 初始化 CLS 监控失败:', error);
        // }

        // 监控长任务（与 INP 相关）
        // try {
        //     const longTaskObserver = new PerformanceObserver((entryList) => {
        //         try {
        //             for (const entry of entryList.getEntries()) {
        //                 const duration = entry.duration;
        //                 console.log('⏰ 长任务阻塞主线程:', duration.toFixed(2), 'ms');

        //                 // 可以添加阈值警告
        //                 if (duration > 200) {
        //                     console.warn('🚨 发现严重长任务 (>200ms):', duration.toFixed(2), 'ms');
        //                 }

        //                 // 可以在这里添加数据上报逻辑
        //                 // reportToAnalytics('LONG_TASK', duration);
        //             }
        //         } catch (error) {
        //             console.error('处理长任务数据时出错:', error);
        //         }
        //     });

        //     longTaskObserver.observe({ type: 'longtask', buffered: true });
        //     observers.push(longTaskObserver);
        //     console.log('✅ 长任务监控已启动');
        // } catch (error) {
        //     console.error('❌ 初始化长任务监控失败:', error);
        // }

        // 清理函数：断开所有观察者
        return () => {
            console.log('🧹 清理性能监控');
            observers.forEach(observer => {
                try {
                    observer.disconnect();
                } catch (error) {
                    console.error('断开性能观察者时出错:', error);
                }
            });
        };
    }, []); // 空依赖数组确保只运行一次
};

export default usePerformanceMonitoring;