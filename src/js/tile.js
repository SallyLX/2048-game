/**
 * 方块模块
 * 代表游戏中的数字方块
 */

class Tile {
    constructor(row, col, value) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.previousRow = null;
        this.previousCol = null;
        this.mergedFrom = null;
        this.isNew = true;
    }

    /**
     * 保存当前位置（用于动画）
     */
    savePosition() {
        this.previousRow = this.row;
        this.previousCol = this.col;
    }

    /**
     * 更新位置
     */
    updatePosition(row, col) {
        this.row = row;
        this.col = col;
    }

    /**
     * 获取方块的 CSS 类名
     */
    getClassName() {
        if (this.value <= 2048) {
            return `tile-${this.value}`;
        }
        return 'tile-super';
    }

    /**
     * 获取字体大小
     */
    getFontSize() {
        if (this.value < 100) return '40px';
        if (this.value < 1000) return '36px';
        if (this.value < 10000) return '32px';
        return '24px';
    }
}

// 导出 Tile 类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tile;
}