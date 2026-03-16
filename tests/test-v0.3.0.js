/**
 * 2048 游戏 - v0.3.0 测试用例
 * 
 * P2 测试用例 - 增强功能测试
 */

const v030Tests = [
    /**
     * 测试用例 v030-1: 不同网格大小
     * 验证：3x3, 5x5, 6x6 网格正确创建
     */
    {
        name: '不同网格大小',
        fn: function() {
            const sizes = [3, 4, 5, 6];
            
            for (const size of sizes) {
                const grid = new Grid(size);
                
                if (grid.size !== size) {
                    return { passed: false, message: `网格大小应为 ${size}，实际为 ${grid.size}` };
                }
                
                // 检查格子数量
                const tiles = grid.getAllTiles();
                if (tiles.length !== 0) {
                    return { passed: false, message: `${size}x${size} 网格初始应为空` };
                }
            }
            
            return { passed: true, message: '所有网格大小正确创建' };
        }
    },
    
    /**
     * 测试用例 v030-2: 撤销功能
     * 验证：撤销可以恢复上一步状态
     */
    {
        name: '撤销功能',
        fn: function() {
            const grid = new Grid(4);
            
            // 放一个方块
            grid.setCell(0, 0, new Tile(0, 0, 2));
            
            // 模拟保存状态
            const savedState = {
                grid: grid.cells.map(row => row.map(cell => cell ? { value: cell.value } : null))
            };
            
            // 移动方块
            grid.setCell(0, 0, null);
            grid.setCell(3, 0, new Tile(3, 0, 2));
            
            // 验证状态改变
            if (grid.getCell(0, 0) !== null) {
                return { passed: false, message: '方块应已移动' };
            }
            
            // 模拟撤销
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const cell = savedState.grid[row][col];
                    if (cell) {
                        grid.setCell(row, col, new Tile(row, col, cell.value));
                    } else {
                        grid.setCell(row, col, null);
                    }
                }
            }
            
            // 验证撤销成功
            if (grid.getCell(0, 0) === null || grid.getCell(0, 0).value !== 2) {
                return { passed: false, message: '撤销应恢复原状态' };
            }
            
            return { passed: true, message: '撤销功能正确' };
        }
    },
    
    /**
     * 测试用例 v030-3: 排行榜保存
     * 验证：分数正确保存到排行榜
     */
    {
        name: '排行榜保存',
        fn: function() {
            // 清除旧数据
            localStorage.removeItem('2048-leaderboard');
            
            const leaderboard = new Leaderboard();
            
            // 添加分数
            leaderboard.addScore(4, 100);
            leaderboard.addScore(4, 200);
            leaderboard.addScore(4, 50);
            
            // 获取排行榜
            const scores = leaderboard.getScores(4);
            
            if (scores.length !== 3) {
                return { passed: false, message: `应有 3 条记录，实际为 ${scores.length}` };
            }
            
            // 验证排序（降序）
            if (scores[0].score !== 200) {
                return { passed: false, message: '最高分应在第一位' };
            }
            
            return { passed: true, message: '排行榜保存正确' };
        }
    },
    
    /**
     * 测试用例 v030-4: 排行榜限制
     * 验证：排行榜只保留前 10 名
     */
    {
        name: '排行榜限制',
        fn: function() {
            localStorage.removeItem('2048-leaderboard');
            
            const leaderboard = new Leaderboard();
            
            // 添加 15 条记录
            for (let i = 1; i <= 15; i++) {
                leaderboard.addScore(4, i * 10);
            }
            
            const scores = leaderboard.getScores(4);
            
            if (scores.length !== 10) {
                return { passed: false, message: `应只保留 10 条，实际为 ${scores.length}` };
            }
            
            // 验证最高分
            if (scores[0].score !== 150) {
                return { passed: false, message: `最高分应为 150，实际为 ${scores[0].score}` };
            }
            
            return { passed: true, message: '排行榜限制正确' };
        }
    },
    
    /**
     * 测试用例 v030-5: 不同网格的排行榜
     * 验证：不同网格大小有独立的排行榜
     */
    {
        name: '独立排行榜',
        fn: function() {
            localStorage.removeItem('2048-leaderboard');
            
            const leaderboard = new Leaderboard();
            
            // 不同网格添加不同分数
            leaderboard.addScore(3, 300);
            leaderboard.addScore(4, 400);
            leaderboard.addScore(5, 500);
            leaderboard.addScore(6, 600);
            
            // 验证各网格独立
            if (leaderboard.getHighScore(3) !== 300) {
                return { passed: false, message: '3x3 最高分应为 300' };
            }
            if (leaderboard.getHighScore(4) !== 400) {
                return { passed: false, message: '4x4 最高分应为 400' };
            }
            if (leaderboard.getHighScore(5) !== 500) {
                return { passed: false, message: '5x5 最高分应为 500' };
            }
            if (leaderboard.getHighScore(6) !== 600) {
                return { passed: false, message: '6x6 最高分应为 600' };
            }
            
            return { passed: true, message: '不同网格排行榜独立' };
        }
    },
    
    /**
     * 测试用例 v030-6: 3x3 网格游戏结束
     * 验证：小网格更容易结束
     */
    {
        name: '3x3 网格游戏结束',
        fn: function() {
            const grid = new Grid(3);
            
            // 填满 3x3 网格，无相邻相同
            const values = [
                [2, 4, 8],
                [16, 32, 64],
                [128, 256, 512]
            ];
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    grid.setCell(row, col, new Tile(row, col, values[row][col]));
                }
            }
            
            if (!grid.isGameOver()) {
                return { passed: false, message: '3x3 无法移动时应结束' };
            }
            
            return { passed: true, message: '3x3 游戏结束判定正确' };
        }
    },
    
    /**
     * 测试用例 v030-7: 6x6 网格移动
     * 验证：大网格移动正确
     */
    {
        name: '6x6 网格移动',
        fn: function() {
            const grid = new Grid(6);
            
            // 在角落放一个方块
            grid.setCell(5, 5, new Tile(5, 5, 2));
            
            // 模拟向左移动
            const traversals = { rows: [0, 1, 2, 3, 4, 5], cols: [0, 1, 2, 3, 4, 5] };
            const vector = { row: 0, col: -1 };
            
            traversals.rows.forEach(row => {
                traversals.cols.forEach(col => {
                    const tile = grid.getCell(row, col);
                    if (tile) {
                        let current = { row: row, col: col };
                        let previous;
                        do {
                            previous = current;
                            current = { row: previous.row + vector.row, col: previous.col + vector.col };
                        } while (grid.isWithinBounds(current.row, current.col) && !grid.getCell(current.row, current.col));
                        
                        if (previous.col !== col) {
                            grid.setCell(row, col, null);
                            grid.setCell(previous.row, previous.col, tile);
                        }
                    }
                });
            });
            
            // 验证方块移动到 (5, 0)
            if (grid.getCell(5, 0) === null || grid.getCell(5, 0).value !== 2) {
                return { passed: false, message: '方块应移动到 (5, 0)' };
            }
            
            return { passed: true, message: '6x6 网格移动正确' };
        }
    }
];

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { v030Tests };
}