/**
 * 2048 游戏 - v0.4.0
 * 增强功能版本
 */

class Game2048 {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.score = 0;
        this.bestScore = this.getBestScore();
        this.isGameOver = false;
        this.tileSize = 0;
        this.gapSize = 15;
        
        // 撤销功能
        this.history = [];
        this.maxUndoCount = 3;
        this.undoCount = this.maxUndoCount;
        
        // 主题
        this.isDarkMode = this.getThemePreference();
        
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.setupBoard();
        this.setupEventListeners();
        this.updateBestScore();
        this.updateUndoButton();
        this.startNewGame();
    }
    
    // 获取主题偏好
    getThemePreference() {
        return localStorage.getItem('theme') === 'dark';
    }
    
    // 保存主题偏好
    saveThemePreference(isDark) {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    
    // 应用主题
    applyTheme() {
        const themeBtn = document.getElementById('theme-btn');
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            themeBtn.textContent = '☀️ 日间模式';
        } else {
            document.body.classList.remove('dark-mode');
            themeBtn.textContent = '🌙 深夜模式';
        }
    }
    
    // 切换主题
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.saveThemePreference(this.isDarkMode);
        this.applyTheme();
    }
    
    // 获取最高分（按难度分别存储）
    getBestScore() {
        const key = `bestScore_${this.size}x${this.size}`;
        return parseInt(localStorage.getItem(key)) || 0;
    }
    
    // 保存最高分
    saveBestScore(score) {
        const key = `bestScore_${this.size}x${this.size}`;
        localStorage.setItem(key, score);
    }
    
    // 初始化游戏网格
    setupBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '<div class="grid-container"></div>';
        const container = board.querySelector('.grid-container');
        
        // 设置网格列数
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
        
        // 创建空白格子背景
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            container.appendChild(cell);
        }
        
        // 计算方块大小
        this.calculateTileSize();
    }
    
    // 计算方块尺寸
    calculateTileSize() {
        const container = document.querySelector('.grid-container');
        const boardWidth = container.offsetWidth - (this.gapSize * (this.size - 1));
        this.tileSize = boardWidth / this.size;
    }
    
    // 设置事件监听
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            
            if (keyMap[e.key]) {
                e.preventDefault();
                this.move(keyMap[e.key]);
            }
        });
        
        // 新游戏按钮
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startNewGame();
        });
        
        // 撤销按钮
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undo();
        });
        
        // 难度选择
        document.getElementById('size-select').addEventListener('change', (e) => {
            const newSize = parseInt(e.target.value);
            this.changeSize(newSize);
        });
        
        // 触摸支持
        this.setupTouchEvents();
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.calculateTileSize();
            this.renderTiles();
        });
        
        // 排行榜
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboard();
        });
        
        document.getElementById('close-leaderboard').addEventListener('click', () => {
            document.getElementById('leaderboard-modal').classList.add('hidden');
        });
        
        // 主题切换
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    // 触摸事件支持
    setupTouchEvents() {
        const board = document.getElementById('game-board');
        let startX, startY;
        
        board.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        board.addEventListener('touchend', (e) => {
            if (this.isGameOver) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipe = 50;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipe) {
                    this.move(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(deltaY) > minSwipe) {
                    this.move(deltaY > 0 ? 'down' : 'up');
                }
            }
        });
    }
    
    // 切换难度
    changeSize(newSize) {
        this.size = newSize;
        this.bestScore = this.getBestScore();
        this.updateBestScore();
        this.setupBoard();
        this.startNewGame();
    }
    
    // 开始新游戏
    startNewGame() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.history = [];
        this.undoCount = this.maxUndoCount;
        
        this.updateScore();
        this.updateUndoButton();
        this.hideGameOver();
        this.hideNewRecord();
        
        // 清除现有方块
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 添加两个初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderTiles();
    }
    
    // 添加随机方块（90% 生成 2，10% 生成 4）
    addRandomTile() {
        const emptyCells = [];
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length === 0) return false;
        
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        
        return { row, col };
    }
    
    // 保存历史状态（用于撤销）
    saveHistory() {
        this.history.push({
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        });
        
        // 最多保留一步历史
        if (this.history.length > 1) {
            this.history.shift();
        }
    }
    
    // 撤销操作
    undo() {
        if (this.history.length === 0 || this.undoCount <= 0 || this.isGameOver) return;
        
        const previousState = this.history.pop();
        this.grid = previousState.grid;
        this.score = previousState.score;
        this.undoCount--;
        
        this.updateScore();
        this.updateUndoButton();
        this.renderTiles();
    }
    
    // 更新撤销按钮状态
    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        const undoCountSpan = document.getElementById('undo-count');
        
        undoCountSpan.textContent = `(${this.undoCount})`;
        
        if (this.undoCount <= 0 || this.history.length === 0) {
            undoBtn.disabled = true;
        } else {
            undoBtn.disabled = false;
        }
    }
    
    // 移动方块
    move(direction) {
        // 保存当前状态用于撤销
        this.saveHistory();
        
        const oldGrid = JSON.stringify(this.grid);
        let moved = false;
        let mergedPositions = [];
        
        switch (direction) {
            case 'up':
                const upResult = this.moveUp();
                moved = upResult.moved;
                mergedPositions = upResult.merged;
                break;
            case 'down':
                const downResult = this.moveDown();
                moved = downResult.moved;
                mergedPositions = downResult.merged;
                break;
            case 'left':
                const leftResult = this.moveLeft();
                moved = leftResult.moved;
                mergedPositions = leftResult.merged;
                break;
            case 'right':
                const rightResult = this.moveRight();
                moved = rightResult.moved;
                mergedPositions = rightResult.merged;
                break;
        }
        
        if (moved) {
            const newTile = this.addRandomTile();
            this.renderTiles(newTile, mergedPositions);
            this.updateScore();
            this.updateUndoButton();
            
            if (this.checkGameOver()) {
                this.gameOver();
            }
        } else {
            // 如果没有移动，移除刚才保存的历史
            this.history.pop();
        }
    }
    
    // 向上移动
    moveUp() {
        let moved = false;
        let merged = [];
        
        for (let col = 0; col < this.size; col++) {
            const column = [];
            for (let row = 0; row < this.size; row++) {
                column.push(this.grid[row][col]);
            }
            
            const result = this.mergeLine(column);
            
            for (let row = 0; row < this.size; row++) {
                if (this.grid[row][col] !== result.line[row]) {
                    moved = true;
                }
                this.grid[row][col] = result.line[row];
            }
            
            result.mergedIndices.forEach(idx => {
                merged.push({ row: idx, col: col });
            });
            
            this.score += result.score;
        }
        
        return { moved, merged };
    }
    
    // 向下移动
    moveDown() {
        let moved = false;
        let merged = [];
        
        for (let col = 0; col < this.size; col++) {
            const column = [];
            for (let row = this.size - 1; row >= 0; row--) {
                column.push(this.grid[row][col]);
            }
            
            const result = this.mergeLine(column);
            
            for (let row = this.size - 1; row >= 0; row--) {
                if (this.grid[row][col] !== result.line[this.size - 1 - row]) {
                    moved = true;
                }
                this.grid[row][col] = result.line[this.size - 1 - row];
            }
            
            result.mergedIndices.forEach(idx => {
                merged.push({ row: this.size - 1 - idx, col: col });
            });
            
            this.score += result.score;
        }
        
        return { moved, merged };
    }
    
    // 向左移动
    moveLeft() {
        let moved = false;
        let merged = [];
        
        for (let row = 0; row < this.size; row++) {
            const line = [...this.grid[row]];
            const result = this.mergeLine(line);
            
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] !== result.line[col]) {
                    moved = true;
                }
                this.grid[row][col] = result.line[col];
            }
            
            result.mergedIndices.forEach(idx => {
                merged.push({ row: row, col: idx });
            });
            
            this.score += result.score;
        }
        
        return { moved, merged };
    }
    
    // 向右移动
    moveRight() {
        let moved = false;
        let merged = [];
        
        for (let row = 0; row < this.size; row++) {
            const line = [...this.grid[row]].reverse();
            const result = this.mergeLine(line);
            
            const newLine = result.line.reverse();
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] !== newLine[col]) {
                    moved = true;
                }
                this.grid[row][col] = newLine[col];
            }
            
            result.mergedIndices.forEach(idx => {
                merged.push({ row: row, col: this.size - 1 - idx });
            });
            
            this.score += result.score;
        }
        
        return { moved, merged };
    }
    
    // 合并一行/列
    mergeLine(line) {
        let filtered = line.filter(val => val !== 0);
        let score = 0;
        let mergedIndices = [];
        
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                score += filtered[i];
                filtered.splice(i + 1, 1);
                mergedIndices.push(i);
            }
        }
        
        while (filtered.length < this.size) {
            filtered.push(0);
        }
        
        return { line: filtered, score, mergedIndices };
    }
    
    // 渲染方块
    renderTiles(newTilePos = null, mergedPositions = []) {
        const board = document.getElementById('game-board');
        
        const tiles = board.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        const container = board.querySelector('.grid-container');
        const containerRect = container.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        
        const offsetX = containerRect.left - boardRect.left;
        const offsetY = containerRect.top - boardRect.top;
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const value = this.grid[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    
                    if (newTilePos && newTilePos.row === row && newTilePos.col === col) {
                        tile.classList.add('tile-new');
                    }
                    
                    const isMerged = mergedPositions.some(pos => pos.row === row && pos.col === col);
                    if (isMerged) {
                        tile.classList.add('tile-merged');
                    }
                    
                    const left = offsetX + col * (this.tileSize + this.gapSize);
                    const top = offsetY + row * (this.tileSize + this.gapSize);
                    
                    tile.style.width = `${this.tileSize}px`;
                    tile.style.height = `${this.tileSize}px`;
                    tile.style.left = `${left}px`;
                    tile.style.top = `${top}px`;
                    
                    let fontSize = this.tileSize * 0.45;
                    if (value >= 100) fontSize = this.tileSize * 0.38;
                    if (value >= 1000) fontSize = this.tileSize * 0.3;
                    if (value >= 10000) fontSize = this.tileSize * 0.25;
                    tile.style.fontSize = `${fontSize}px`;
                    
                    tile.textContent = value;
                    board.appendChild(tile);
                }
            }
        }
    }
    
    // 更新得分
    updateScore() {
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore(this.bestScore);
            this.updateBestScore();
        }
    }
    
    // 更新最高分
    updateBestScore() {
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    // 检查游戏是否结束
    checkGameOver() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) return false;
            }
        }
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const current = this.grid[row][col];
                
                if (col < this.size - 1 && this.grid[row][col + 1] === current) {
                    return false;
                }
                
                if (row < this.size - 1 && this.grid[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // 游戏结束
    gameOver() {
        this.isGameOver = true;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
        
        // 保存到排行榜
        if (this.score > 0) {
            const isNewRecord = this.saveToLeaderboard(this.score);
            if (isNewRecord) {
                this.showNewRecord(this.score);
            }
        }
    }
    
    // 隐藏游戏结束界面
    hideGameOver() {
        document.getElementById('game-over').classList.add('hidden');
    }
    
    // 显示新纪录
    showNewRecord(score) {
        document.getElementById('record-score').textContent = score;
        document.getElementById('new-record').classList.remove('hidden');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.hideNewRecord();
        }, 3000);
    }
    
    // 隐藏新纪录
    hideNewRecord() {
        document.getElementById('new-record').classList.add('hidden');
    }
    
    // 保存到排行榜
    saveToLeaderboard(score) {
        const key = `leaderboard_${this.size}x${this.size}`;
        let leaderboard = JSON.parse(localStorage.getItem(key)) || [];
        
        // 检查是否是新纪录
        const isNewRecord = leaderboard.length === 0 || score > leaderboard[0].score;
        
        // 添加新记录
        leaderboard.push({
            score: score,
            date: new Date().toLocaleDateString('zh-CN'),
            size: `${this.size}x${this.size}`
        });
        
        // 按分数降序排序
        leaderboard.sort((a, b) => b.score - a.score);
        
        // 只保留前 10 名
        leaderboard = leaderboard.slice(0, 10);
        
        localStorage.setItem(key, JSON.stringify(leaderboard));
        
        return isNewRecord;
    }
    
    // 显示排行榜
    showLeaderboard() {
        const modal = document.getElementById('leaderboard-modal');
        const list = document.getElementById('leaderboard-list');
        const currentSize = document.getElementById('size-select').value;
        const key = `leaderboard_${currentSize}x${currentSize}`;
        const leaderboard = JSON.parse(localStorage.getItem(key)) || [];
        
        if (leaderboard.length === 0) {
            list.innerHTML = '<div class="leaderboard-empty">暂无记录，快去玩游戏吧！</div>';
        } else {
            list.innerHTML = leaderboard.map((item, index) => `
                <div class="leaderboard-item">
                    <div>
                        <span class="leaderboard-rank">#${index + 1}</span>
                    </div>
                    <div>
                        <div class="leaderboard-score">${item.score}</div>
                        <div class="leaderboard-info">${item.date}</div>
                    </div>
                </div>
            `).join('');
        }
        
        modal.classList.remove('hidden');
    }
}

// 初始化游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new Game2048(4);
    window.game2048 = game; // 暴露全局变量用于调试
});