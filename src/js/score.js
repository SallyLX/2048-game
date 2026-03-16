/**
 * 得分管理模块
 * 负责当前得分和历史最高分的记录
 */

class Score {
    constructor() {
        this.currentScore = 0;
        this.bestScore = this.loadBestScore();
    }

    /**
     * 从 localStorage 加载最高分
     */
    loadBestScore() {
        try {
            const bestScore = localStorage.getItem('2048-best-score');
            return bestScore ? parseInt(bestScore, 10) : 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * 保存最高分到 localStorage
     */
    saveBestScore() {
        try {
            localStorage.setItem('2048-best-score', this.bestScore.toString());
        } catch (e) {
            // localStorage 不可用时静默失败
        }
    }

    /**
     * 增加得分
     * @param {number} value - 合并后的方块值
     */
    addScore(value) {
        this.currentScore += value;
        
        // 更新最高分
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            this.saveBestScore();
        }
    }

    /**
     * 获取当前得分
     */
    getScore() {
        return this.currentScore;
    }

    /**
     * 获取最高分
     */
    getBestScore() {
        return this.bestScore;
    }

    /**
     * 重置得分
     */
    reset() {
        this.currentScore = 0;
    }
}

// 导出 Score 类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Score;
}