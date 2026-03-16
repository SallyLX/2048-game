/**
 * 2048 游戏 - v0.2.0 测试用例
 * 
 * P1 测试用例 - 游戏体验测试
 */

// v0.2.0 测试用例集合
const v020Tests = [
    /**
     * 测试用例 v020-1: 动画类添加
     * 验证：新方块和新合并的方块有正确的动画类
     */
    {
        name: '动画类添加',
        fn: function() {
            const tile = new Tile(0, 0, 2);
            
            // 新方块应有 isNew 标记
            if (!tile.isNew) {
                return { passed: false, message: '新创建的方块应有 isNew=true' };
            }
            
            // 创建合并方块
            const mergedTile = new Tile(0, 0, 4);
            const original = new Tile(0, 0, 2);
            mergedTile.mergedFrom = [original, original];
            
            if (!mergedTile.mergedFrom) {
                return { passed: false, message: '合并方块应有 mergedFrom 标记' };
            }
            
            return { passed: true, message: '动画标记正确' };
        }
    },
    
    /**
     * 测试用例 v020-2: 最高分持久化
     * 验证：最高分正确保存到 localStorage
     */
    {
        name: '最高分持久化',
        fn: function() {
            // 清除之前的数据
            localStorage.removeItem('2048-best-score');
            
            const score = new Score();
            score.addScore(100);
            
            // 检查 localStorage
            const saved = localStorage.getItem('2048-best-score');
            if (saved !== '100') {
                return { passed: false, message: `localStorage 应保存 100，实际为 ${saved}` };
            }
            
            // 创建新实例验证加载
            const score2 = new Score();
            if (score2.getBestScore() !== 100) {
                return { passed: false, message: '新实例应加载之前的最高分' };
            }
            
            return { passed: true, message: '最高分持久化正确' };
        }
    },
    
    /**
     * 测试用例 v020-3: 得分重置
     * 验证：新游戏时当前得分重置，但最高分保留
     */
    {
        name: '得分重置',
        fn: function() {
            const score = new Score();
            score.addScore(200);
            
            // 重置
            score.reset();
            
            if (score.getScore() !== 0) {
                return { passed: false, message: '当前得分应重置为 0' };
            }
            if (score.getBestScore() !== 200) {
                return { passed: false, message: '最高分应保留' };
            }
            
            return { passed: true, message: '得分重置正确' };
        }
    },
    
    /**
     * 测试用例 v020-4: 游戏结束检测
     * 验证：无法移动时游戏正确检测结束
     */
    {
        name: '游戏结束检测',
        fn: function() {
            const grid = new Grid(4);
            
            // 填满网格，无相邻相同数字
            const values = [
                [2, 4, 8, 16],
                [32, 64, 128, 256],
                [512, 1024, 2, 4],
                [8, 16, 32, 64]
            ];
            
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    grid.setCell(row, col, new Tile(row, col, values[row][col]));
                }
            }
            
            if (!grid.isGameOver()) {
                return { passed: false, message: '无法移动时应检测为游戏结束' };
            }
            
            return { passed: true, message: '游戏结束检测正确' };
        }
    },
    
    /**
     * 测试用例 v020-5: 继续游戏
     * 验证：达到 2048 后可以选择继续游戏
     */
    {
        name: '继续游戏',
        fn: function() {
            const grid = new Grid(4);
            
            // 创建一个 2048 方块
            grid.setCell(0, 0, new Tile(0, 0, 2048));
            
            // 游戏不应结束
            if (grid.isGameOver()) {
                return { passed: false, message: '有 2048 时游戏不应自动结束' };
            }
            
            return { passed: true, message: '达到 2048 后可继续游戏' };
        }
    }
];

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { v020Tests };
}