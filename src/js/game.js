/**
 * 游戏主模块
 * 负责游戏的核心逻辑和状态管理
 */

class Game {
    constructor() {
        this.gridSize = 4;
        this.grid = new Grid(this.gridSize);
        this.score = new Score();
        this.leaderboard = new Leaderboard();
        this.renderer = new Renderer();
        this.over = false;
        this.won = false;
        this.keepPlaying = false;
        
        // 撤销功能
        this.history = [];
        this.maxHistory = 3;
        this.undoCount = 3;
        
        // 初始化渲染
        this.renderer.initGrid();
        
        // 初始化输入
        new Input(
            this.move.bind(this),
            this.restart.bind(this)
        );
        
        // 初始化 UI 控件
        this.initControls();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.renderer.updateGridSize();
        });
        
        // 开始新游戏
        this.restart();
    }

    /**
     * 初始化 UI 控件
     */
    initControls() {
        // 网格大小选择器
        const sizeSelect = document.getElementById('grid-size-select');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                this.gridSize = parseInt(e.target.value);
                this.updateGridSize();
                this.restart();
            });
        }
        
        // 撤销按钮
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }
        
        // 排行榜按钮
        const leaderboardBtn = document.getElementById('leaderboard-btn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        }
        
        // 排行榜关闭
        const closeBtn = document.getElementById('close-leaderboard');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideLeaderboard());
        }
        
        // 排行榜标签切换
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const size = parseInt(e.target.dataset.size);
                this.renderLeaderboard(size);
            });
        });
        
        // 重试按钮
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.restart();
            });
        }
    }

    /**
     * 更新网格大小
     */
    updateGridSize() {
        // 更新 CSS 变量
        const sizes = {
            3: { grid: 300, cell: 90, gap: 10 },
            4: { grid: 400, cell: 90, gap: 10 },
            5: { grid: 450, cell: 82, gap: 8 },
            6: { grid: 480, cell: 72, gap: 8 }
        };
        
        const sizeConfig = sizes[this.gridSize] || sizes[4];
        
        document.documentElement.style.setProperty('--grid-size', `${sizeConfig.grid}px`);
        document.documentElement.style.setProperty('--cell-size', `${sizeConfig.cell}px`);
        document.documentElement.style.setProperty('--cell-gap', `${sizeConfig.gap}px`);
        
        // 更新渲染器
        this.renderer.cellSize = sizeConfig.cell;
        this.renderer.cellGap = sizeConfig.gap;
        this.renderer.initGrid();
    }

    /**
     * 开始新游戏
     */
    restart() {
        this.grid = new Grid(this.gridSize);
        this.score.reset();
        this.over = false;
        this.won = false;
        this.keepPlaying = false;
        this.history = [];
        this.undoCount = 3;
        
        // 更新网格大小
        this.updateGridSize();
        
        // 初始生成两个方块
        this.addRandomTile();
        this.addRandomTile();
        
        // 更新显示
        this.update();
        this.updateUndoButton();
        
        // 隐藏游戏结束界面
        this.renderer.hideGameOver();
    }

    /**
     * 保存当前状态（用于撤销）
     */
    saveState() {
        const state = {
            grid: this.grid.cells.map(row => row.map(cell => cell ? { value: cell.value } : null)),
            score: this.score.currentScore
        };
        
        this.history.push(state);
        
        // 限制历史记录数量
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    /**
     * 撤销上一步
     */
    undo() {
        if (this.history.length === 0 || this.undoCount <= 0) {
            return;
        }
        
        const state = this.history.pop();
        
        // 恢复网格
        for (let row = 0; row < this.grid.size; row++) {
            for (let col = 0; col < this.grid.size; col++) {
                const cell = state.grid[row][col];
                if (cell) {
                    this.grid.setCell(row, col, new Tile(row, col, cell.value));
                } else {
                    this.grid.setCell(row, col, null);
                }
            }
        }
        
        // 恢复得分
        this.score.currentScore = state.score;
        
        // 减少撤销次数
        this.undoCount--;
        
        // 游戏未结束
        this.over = false;
        this.renderer.hideGameOver();
        
        // 更新显示
        this.update();
        this.updateUndoButton();
    }

    /**
     * 更新撤销按钮状态
     */
    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.textContent = `↩ 撤销 (${this.undoCount})`;
            undoBtn.disabled = this.undoCount <= 0 || this.history.length === 0;
        }
    }

    /**
     * 随机生成新方块
     */
    addRandomTile() {
        const cell = this.grid.getRandomAvailableCell();
        if (cell) {
            // 90% 概率生成 2，10% 概率生成 4
            const value = Math.random() < 0.9 ? 2 : 4;
            const tile = new Tile(cell.row, cell.col, value);
            this.grid.setCell(cell.row, cell.col, tile);
            return tile;
        }
        return null;
    }

    /**
     * 移动方块
     * @param {number} direction - 0: up, 1: right, 2: down, 3: left
     */
    move(direction) {
        if (this.over && !this.keepPlaying) return;
        
        // 检查是否可以移动
        if (!this.grid.canMove(direction)) {
            return;
        }
        
        // 保存状态（用于撤销）
        this.saveState();
        
        // 保存当前状态
        this.grid.getAllTiles().forEach(tile => {
            tile.savePosition();
        });
        
        // 移动向量
        const vectors = [
            { row: -1, col: 0 },  // up
            { row: 0, col: 1 },   // right
            { row: 1, col: 0 },   // down
            { row: 0, col: -1 }   // left
        ];
        
        const vector = vectors[direction];
        
        // 确定遍历顺序
        const traversals = this.getTraversals(direction);
        
        let moved = false;
        
        // 清除合并标记
        this.grid.getAllTiles().forEach(tile => {
            tile.mergedFrom = null;
        });
        
        // 遍历所有格子
        traversals.rows.forEach(row => {
            traversals.cols.forEach(col => {
                const tile = this.grid.getCell(row, col);
                
                if (tile) {
                    const result = this.findFarthestPosition(tile, vector);
                    const next = result.next;
                    
                    // 检查是否可以合并
                    if (next && this.grid.getCell(next.row, next.col) &&
                        this.grid.getCell(next.row, next.col).value === tile.value &&
                        !this.grid.getCell(next.row, next.col).mergedFrom) {
                        
                        // 合并
                        const merged = this.mergeTiles(tile, this.grid.getCell(next.row, next.col));
                        this.grid.setCell(row, col, null);
                        this.grid.setCell(next.row, next.col, merged);
                        
                        // 增加得分
                        this.score.addScore(merged.value);
                        
                        // 检查是否达到 2048
                        if (merged.value === 2048 && !this.won) {
                            this.won = true;
                            // 可以选择继续游戏或结束
                            // 这里选择继续
                            this.keepPlaying = true;
                        }
                        
                        moved = true;
                    } else {
                        // 移动到最远位置
                        const farthest = result.farthest;
                        if (farthest.row !== row || farthest.col !== col) {
                            this.grid.setCell(row, col, null);
                            this.grid.setCell(farthest.row, farthest.col, tile);
                            moved = true;
                        }
                    }
                }
            });
        });
        
        // 如果移动了，生成新方块
        if (moved) {
            this.addRandomTile();
            
            // 检查游戏是否结束
            if (this.grid.isGameOver()) {
                this.over = true;
                // 添加到排行榜
                this.leaderboard.addScore(this.gridSize, this.score.getScore());
                this.renderer.showGameOver(this.score.getScore());
            }
            
            // 更新显示
            this.update();
            this.updateUndoButton();
        } else {
            // 没有移动，移除刚保存的状态
            this.history.pop();
        }
    }

    /**
     * 获取遍历顺序
     */
    getTraversals(direction) {
        const traversals = {
            rows: [],
            cols: []
        };
        
        for (let i = 0; i < this.grid.size; i++) {
            traversals.rows.push(i);
            traversals.cols.push(i);
        }
        
        // 从右向左遍历
        if (direction === 1) {
            traversals.cols.reverse();
        }
        // 从下向上遍历
        if (direction === 2) {
            traversals.rows.reverse();
        }
        
        return traversals;
    }

    /**
     * 找到方块能移动到的最远位置
     */
    findFarthestPosition(tile, vector) {
        let previous;
        let current = { row: tile.row, col: tile.col };
        
        do {
            previous = current;
            current = {
                row: previous.row + vector.row,
                col: previous.col + vector.col
            };
        } while (this.grid.isWithinBounds(current.row, current.col) && 
                 !this.grid.getCell(current.row, current.col));
        
        return {
            farthest: previous,
            next: this.grid.isWithinBounds(current.row, current.col) ? current : null
        };
    }

    /**
     * 合并两个方块
     */
    mergeTiles(tile1, tile2) {
        const merged = new Tile(tile2.row, tile2.col, tile1.value * 2);
        merged.mergedFrom = [tile1, tile2];
        return merged;
    }

    /**
     * 更新显示
     */
    update() {
        // 清除 isNew 标记（在下次渲染时不再显示动画）
        this.grid.getAllTiles().forEach(tile => {
            tile.isNew = false;
        });
        
        // 更新方块显示
        this.renderer.renderTiles(this.grid.getAllTiles());
        
        // 更新得分显示
        this.renderer.updateScore(this.score.getScore(), this.score.getBestScore());
    }

    /**
     * 显示排行榜
     */
    showLeaderboard() {
        const overlay = document.getElementById('leaderboard-overlay');
        if (overlay) {
            overlay.classList.add('show');
            // 显示当前网格大小的排行榜
            this.renderLeaderboard(this.gridSize);
            
            // 更新活动标签
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.size) === this.gridSize);
            });
        }
    }

    /**
     * 隐藏排行榜
     */
    hideLeaderboard() {
        const overlay = document.getElementById('leaderboard-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    /**
     * 渲染排行榜
     */
    renderLeaderboard(size) {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;
        
        const scores = this.leaderboard.getScores(size);
        
        if (scores.length === 0) {
            list.innerHTML = '<div class="empty-message">暂无记录</div>';
            return;
        }
        
        list.innerHTML = scores.map((item, index) => {
            let className = 'leaderboard-item';
            if (index === 0) className += ' gold';
            else if (index === 1) className += ' silver';
            else if (index === 2) className += ' bronze';
            
            return `
                <div class="${className}">
                    <span class="rank">#${index + 1}</span>
                    <span class="score">${item.score}</span>
                    <span class="date">${item.date}</span>
                </div>
            `;
        }).join('');
    }
}

// 游戏入口
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});

// 导出 Game 类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}