/**
 * 排行榜管理模块
 * 负责本地排行榜的存储和读取
 */

class Leaderboard {
    constructor() {
        this.storageKey = '2048-leaderboard';
    }

    /**
     * 获取排行榜数据
     * @param {number} gridSize - 网格大小
     */
    getScores(gridSize) {
        try {
            const data = localStorage.getItem(this.storageKey);
            const allScores = data ? JSON.parse(data) : {};
            return allScores[gridSize] || [];
        } catch (e) {
            return [];
        }
    }

    /**
     * 添加分数
     * @param {number} gridSize - 网格大小
     * @param {number} score - 分数
     */
    addScore(gridSize, score) {
        try {
            const data = localStorage.getItem(this.storageKey);
            const allScores = data ? JSON.parse(data) : {};
            
            if (!allScores[gridSize]) {
                allScores[gridSize] = [];
            }
            
            allScores[gridSize].push({
                score: score,
                date: new Date().toLocaleDateString('zh-CN')
            });
            
            // 按分数降序排序，只保留前 10 名
            allScores[gridSize].sort((a, b) => b.score - a.score);
            allScores[gridSize] = allScores[gridSize].slice(0, 10);
            
            localStorage.setItem(this.storageKey, JSON.stringify(allScores));
            return allScores[gridSize];
        } catch (e) {
            return [];
        }
    }

    /**
     * 获取最高分
     * @param {number} gridSize - 网格大小
     */
    getHighScore(gridSize) {
        const scores = this.getScores(gridSize);
        return scores.length > 0 ? scores[0].score : 0;
    }

    /**
     * 清空排行榜
     * @param {number} gridSize - 网格大小（可选，不传则清空所有）
     */
    clear(gridSize) {
        try {
            if (gridSize) {
                const data = localStorage.getItem(this.storageKey);
                const allScores = data ? JSON.parse(data) : {};
                delete allScores[gridSize];
                localStorage.setItem(this.storageKey, JSON.stringify(allScores));
            } else {
                localStorage.removeItem(this.storageKey);
            }
        } catch (e) {
            // 静默失败
        }
    }
}

// 导出 Leaderboard 类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Leaderboard;
}