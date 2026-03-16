/**
 * 网格管理模块
 * 负责 4x4 网格的状态管理
 */

class Grid {
    constructor(size = 4) {
        this.size = size;
        this.cells = this.createEmptyGrid();
    }

    /**
     * 创建空网格
     */
    createEmptyGrid() {
        const grid = [];
        for (let row = 0; row < this.size; row++) {
            grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                grid[row][col] = null;
            }
        }
        return grid;
    }

    /**
     * 获取指定位置的方块
     */
    getCell(row, col) {
        if (this.isWithinBounds(row, col)) {
            return this.cells[row][col];
        }
        return null;
    }

    /**
     * 设置指定位置的方块
     */
    setCell(row, col, tile) {
        if (this.isWithinBounds(row, col)) {
            this.cells[row][col] = tile;
            if (tile) {
                tile.row = row;
                tile.col = col;
            }
        }
    }

    /**
     * 检查位置是否在边界内
     */
    isWithinBounds(row, col) {
        return row >= 0 && row < this.size && col >= 0 && col < this.size;
    }

    /**
     * 获取所有空格子
     */
    getAvailableCells() {
        const availableCells = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.cells[row][col] === null) {
                    availableCells.push({ row, col });
                }
            }
        }
        return availableCells;
    }

    /**
     * 随机获取一个空格子
     */
    getRandomAvailableCell() {
        const availableCells = this.getAvailableCells();
        if (availableCells.length > 0) {
            return availableCells[Math.floor(Math.random() * availableCells.length)];
        }
        return null;
    }

    /**
     * 检查是否有空格子
     */
    hasAvailableCells() {
        return this.getAvailableCells().length > 0;
    }

    /**
     * 获取所有方块
     */
    getAllTiles() {
        const tiles = [];
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.cells[row][col] !== null) {
                    tiles.push(this.cells[row][col]);
                }
            }
        }
        return tiles;
    }

    /**
     * 清空网格
     */
    clear() {
        this.cells = this.createEmptyGrid();
    }

    /**
     * 检查指定方向是否可以移动
     * @param {number} direction - 0: up, 1: right, 2: down, 3: left
     */
    canMove(direction) {
        const vectors = [
            { row: -1, col: 0 },  // up
            { row: 0, col: 1 },   // right
            { row: 1, col: 0 },   // down
            { row: 0, col: -1 }   // left
        ];

        const vector = vectors[direction];

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const tile = this.getCell(row, col);
                if (tile) {
                    const newRow = row + vector.row;
                    const newCol = col + vector.col;

                    if (this.isWithinBounds(newRow, newCol)) {
                        const adjacentTile = this.getCell(newRow, newCol);
                        // 相邻位置为空或数字相同
                        if (!adjacentTile || adjacentTile.value === tile.value) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * 检查是否还能移动（游戏是否结束）
     */
    isGameOver() {
        // 如果还有空格子，游戏未结束
        if (this.hasAvailableCells()) {
            return false;
        }
        
        // 检查四个方向是否还能移动
        for (let direction = 0; direction < 4; direction++) {
            if (this.canMove(direction)) {
                return false;
            }
        }
        
        return true;
    }
}

// 导出 Grid 类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Grid;
}