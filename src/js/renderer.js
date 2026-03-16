/**
 * 渲染管理模块
 * 负责游戏界面的渲染
 */

class Renderer {
    constructor() {
        this.gridContainer = document.getElementById('grid-container');
        this.tileContainer = document.getElementById('tile-container');
        this.currentScoreElement = document.getElementById('current-score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.finalScoreElement = document.getElementById('final-score');
        
        this.cellSize = 90;
        this.cellGap = 10;
    }

    /**
     * 初始化网格背景
     */
    initGrid() {
        this.gridContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gridContainer.appendChild(cell);
        }
    }

    /**
     * 渲染方块
     */
    renderTiles(tiles) {
        // 清空现有方块
        this.tileContainer.innerHTML = '';

        tiles.forEach(tile => {
            const tileElement = this.createTileElement(tile);
            this.tileContainer.appendChild(tileElement);
        });
    }

    /**
     * 创建方块 DOM 元素
     */
    createTileElement(tile) {
        const element = document.createElement('div');
        element.className = `tile ${tile.getClassName()}`;
        
        // 添加动画类
        if (tile.isNew) {
            element.classList.add('tile-new');
        }
        if (tile.mergedFrom) {
            element.classList.add('tile-merged');
        }
        
        // 计算位置
        const x = tile.col * (this.cellSize + this.cellGap);
        const y = tile.row * (this.cellSize + this.cellGap);
        
        element.style.transform = `translate(${x}px, ${y}px)`;
        
        // 创建内部元素
        const inner = document.createElement('div');
        inner.className = 'tile-inner';
        inner.textContent = tile.value;
        
        element.appendChild(inner);
        
        return element;
    }

    /**
     * 更新得分显示
     */
    updateScore(currentScore, bestScore) {
        this.currentScoreElement.textContent = currentScore;
        this.bestScoreElement.textContent = bestScore;
    }

    /**
     * 显示游戏结束界面
     */
    showGameOver(score) {
        this.finalScoreElement.textContent = score;
        this.gameOverOverlay.classList.add('show');
    }

    /**
     * 隐藏游戏结束界面
     */
    hideGameOver() {
        this.gameOverOverlay.classList.remove('show');
    }

    /**
     * 更新网格大小（响应式）
     */
    updateGridSize() {
        // 从 CSS 变量获取实际尺寸
        const computedStyle = getComputedStyle(document.documentElement);
        const cellSize = computedStyle.getPropertyValue('--cell-size').trim();
        const cellGap = computedStyle.getPropertyValue('--cell-gap').trim();
        
        if (cellSize) {
            this.cellSize = parseInt(cellSize);
        }
        if (cellGap) {
            this.cellGap = parseInt(cellGap);
        }
    }
}

// 导出 Renderer 类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}