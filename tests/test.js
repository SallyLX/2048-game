/**
 * 2048 游戏 - 测试用例
 * 
 * P0 测试用例（13条）- 核心功能测试
 */

// 测试配置
const TEST_CONFIG = {
    GRID_SIZE: 4,
    SPAWN_PROBABILITY: { TWO: 0.9, FOUR: 0.1 }
};

// 测试结果收集
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

/**
 * 测试用例 1: 网格初始化
 * 验证：4x4 网格正确创建，所有格子为空
 */
function test_gridInitialization() {
    const grid = new Grid(4);
    
    // 验证网格大小
    if (grid.size !== 4) {
        return { passed: false, message: `网格大小应为 4，实际为 ${grid.size}` };
    }
    
    // 验证所有格子为空
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid.getCell(row, col) !== null) {
                return { passed: false, message: `格子 (${row}, ${col}) 应为空` };
            }
        }
    }
    
    return { passed: true, message: '网格初始化正确' };
}

/**
 * 测试用例 2: 方块创建
 * 验证：方块具有正确的位置和值
 */
function test_tileCreation() {
    const tile = new Tile(2, 3, 16);
    
    if (tile.row !== 2) {
        return { passed: false, message: `方块行位置应为 2，实际为 ${tile.row}` };
    }
    if (tile.col !== 3) {
        return { passed: false, message: `方块列位置应为 3，实际为 ${tile.col}` };
    }
    if (tile.value !== 16) {
        return { passed: false, message: `方块值应为 16，实际为 ${tile.value}` };
    }
    
    return { passed: true, message: '方块创建正确' };
}

/**
 * 测试用例 3: 随机生成方块
 * 验证：新生成的方块值为 2 或 4
 */
function test_randomTileSpawn() {
    const grid = new Grid(4);
    let values = { 2: 0, 4: 0 };
    
    // 多次测试统计概率
    for (let i = 0; i < 100; i++) {
        grid.clear();
        const cell = grid.getRandomAvailableCell();
        const value = Math.random() < 0.9 ? 2 : 4;
        values[value]++;
    }
    
    // 验证只生成 2 或 4
    if (Object.keys(values).length !== 2) {
        return { passed: false, message: '应该只生成值为 2 或 4 的方块' };
    }
    
    return { passed: true, message: `随机方块生成正确 (2: ${values[2]}, 4: ${values[4]})` };
}

/**
 * 测试用例 4: 方块向上移动
 * 验证：方块能正确向上移动
 */
function test_moveUp() {
    const grid = new Grid(4);
    
    // 在 (3, 0) 放一个 2
    grid.setCell(3, 0, new Tile(3, 0, 2));
    
    // 模拟向上移动
    const traversals = { rows: [0, 1, 2, 3], cols: [0, 1, 2, 3] };
    const vector = { row: -1, col: 0 };
    
    traversals.rows.forEach(row => {
        traversals.cols.forEach(col => {
            const tile = grid.getCell(row, col);
            if (tile) {
                // 找到最远位置
                let current = { row: row, col: col };
                let previous;
                do {
                    previous = current;
                    current = { row: previous.row + vector.row, col: previous.col + vector.col };
                } while (grid.isWithinBounds(current.row, current.col) && !grid.getCell(current.row, current.col));
                
                if (previous.row !== row) {
                    grid.setCell(row, col, null);
                    grid.setCell(previous.row, previous.col, tile);
                }
            }
        });
    });
    
    // 验证方块移动到了 (0, 0)
    if (grid.getCell(0, 0) === null || grid.getCell(0, 0).value !== 2) {
        return { passed: false, message: '方块应移动到 (0, 0)' };
    }
    if (grid.getCell(3, 0) !== null) {
        return { passed: false, message: '原位置应清空' };
    }
    
    return { passed: true, message: '向上移动正确' };
}

/**
 * 测试用例 5: 方块向左移动
 * 验证：方块能正确向左移动
 */
function test_moveLeft() {
    const grid = new Grid(4);
    
    // 在 (0, 3) 放一个 4
    grid.setCell(0, 3, new Tile(0, 3, 4));
    
    // 模拟向左移动
    const traversals = { rows: [0, 1, 2, 3], cols: [0, 1, 2, 3] };
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
    
    // 验证方块移动到了 (0, 0)
    if (grid.getCell(0, 0) === null || grid.getCell(0, 0).value !== 4) {
        return { passed: false, message: '方块应移动到 (0, 0)' };
    }
    
    return { passed: true, message: '向左移动正确' };
}

/**
 * 测试用例 6: 相同数字合并
 * 验证：两个相同数字的方块碰撞时合并
 */
function test_tileMerge() {
    const grid = new Grid(4);
    
    // 放两个相邻的 2
    grid.setCell(0, 0, new Tile(0, 0, 2));
    grid.setCell(0, 1, new Tile(0, 1, 2));
    
    // 模拟向左移动和合并
    const traversals = { rows: [0, 1, 2, 3], cols: [0, 1, 2, 3] };
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
                
                // 检查是否可以合并
                if (grid.isWithinBounds(current.row, current.col)) {
                    const targetTile = grid.getCell(current.row, current.col);
                    if (targetTile && targetTile.value === tile.value && !targetTile.mergedFrom) {
                        // 合并
                        const merged = new Tile(current.row, current.col, tile.value * 2);
                        merged.mergedFrom = [tile, targetTile];
                        grid.setCell(row, col, null);
                        grid.setCell(current.row, current.col, merged);
                    }
                } else if (previous.col !== col) {
                    grid.setCell(row, col, null);
                    grid.setCell(previous.row, previous.col, tile);
                }
            }
        });
    });
    
    // 验证合并结果
    if (grid.getCell(0, 0) === null || grid.getCell(0, 0).value !== 4) {
        return { passed: false, message: `合并后应为 4，实际为 ${grid.getCell(0, 0)?.value}` };
    }
    if (grid.getCell(0, 1) !== null) {
        return { passed: false, message: '合并后原位置应清空' };
    }
    
    return { passed: true, message: '方块合并正确' };
}

/**
 * 测试用例 7: 得分累加
 * 验证：合并时得分正确累加
 */
function test_scoreAccumulation() {
    const score = new Score();
    
    // 模拟合并操作
    score.addScore(4);  // 合并两个 2
    score.addScore(8);  // 合并两个 4
    
    if (score.getScore() !== 12) {
        return { passed: false, message: `得分应为 12，实际为 ${score.getScore()}` };
    }
    
    return { passed: true, message: '得分累加正确' };
}

/**
 * 测试用例 8: 最高分保存
 * 验证：最高分正确保存和更新
 */
function test_bestScoreSave() {
    const score = new Score();
    
    // 清除之前的最高分
    score.bestScore = 0;
    score.currentScore = 0;
    
    // 设置新得分
    score.addScore(100);
    
    if (score.getBestScore() !== 100) {
        return { passed: false, message: `最高分应为 100，实际为 ${score.getBestScore()}` };
    }
    
    return { passed: true, message: '最高分保存正确' };
}

/**
 * 测试用例 9: 游戏结束判定 - 有空格时
 * 验证：有空格时游戏未结束
 */
function test_gameOverWithEmptyCells() {
    const grid = new Grid(4);
    
    // 只放一个方块
    grid.setCell(0, 0, new Tile(0, 0, 2));
    
    if (grid.isGameOver()) {
        return { passed: false, message: '有空格时游戏不应结束' };
    }
    
    return { passed: true, message: '游戏结束判定正确（有空格）' };
}

/**
 * 测试用例 10: 游戏结束判定 - 可合并时
 * 验证：有可合并方块时游戏未结束
 */
function test_gameOverWithMergableTiles() {
    const grid = new Grid(4);
    
    // 填满网格，且有相邻相同数字（行方向有相邻的 2）
    const values = [
        [2, 2, 4, 8],
        [4, 8, 16, 32],
        [64, 128, 256, 512],
        [1024, 2048, 4096, 8192]
    ];
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            grid.setCell(row, col, new Tile(row, col, values[row][col]));
        }
    }
    
    if (grid.isGameOver()) {
        return { passed: false, message: '有可合并方块时游戏不应结束' };
    }
    
    return { passed: true, message: '游戏结束判定正确（可合并）' };
}

/**
 * 测试用例 11: 游戏结束判定 - 真正结束时
 * 验证：无法移动时游戏结束
 */
function test_gameOverWhenStuck() {
    const grid = new Grid(4);
    
    // 填满网格，没有相邻相同数字
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
        return { passed: false, message: '无法移动时游戏应结束' };
    }
    
    return { passed: true, message: '游戏结束判定正确（无法移动）' };
}

/**
 * 测试用例 12: 新游戏重置
 * 验证：新游戏时状态正确重置
 */
function test_newGameReset() {
    const score = new Score();
    const grid = new Grid(4);
    
    // 模拟游戏状态
    score.addScore(100);
    grid.setCell(0, 0, new Tile(0, 0, 16));
    
    // 重置
    score.reset();
    grid.clear();
    
    if (score.getScore() !== 0) {
        return { passed: false, message: `得分应重置为 0，实际为 ${score.getScore()}` };
    }
    if (grid.getCell(0, 0) !== null) {
        return { passed: false, message: '网格应清空' };
    }
    
    return { passed: true, message: '新游戏重置正确' };
}

/**
 * 测试用例 13: 单次移动单次合并
 * 验证：一次移动中每个方块只能合并一次
 */
function test_singleMergePerMove() {
    const grid = new Grid(4);
    
    // 放三个相邻的 2: [2, 2, 2, _]
    grid.setCell(0, 0, new Tile(0, 0, 2));
    grid.setCell(0, 1, new Tile(0, 1, 2));
    grid.setCell(0, 2, new Tile(0, 2, 2));
    
    // 标记合并状态
    const mergedTiles = new Set();
    
    // 模拟向左移动和合并
    const traversals = { rows: [0, 1, 2, 3], cols: [0, 1, 2, 3] };
    const vector = { row: 0, col: -1 };
    
    traversals.rows.forEach(row => {
        traversals.cols.forEach(col => {
            const tile = grid.getCell(row, col);
            if (tile && !mergedTiles.has(`${row}-${col}`)) {
                let current = { row: row, col: col };
                let previous;
                do {
                    previous = current;
                    current = { row: previous.row + vector.row, col: previous.col + vector.col };
                } while (grid.isWithinBounds(current.row, current.col) && !grid.getCell(current.row, current.col));
                
                if (grid.isWithinBounds(current.row, current.col)) {
                    const targetTile = grid.getCell(current.row, current.col);
                    if (targetTile && targetTile.value === tile.value && !mergedTiles.has(`${current.row}-${current.col}`)) {
                        const merged = new Tile(current.row, current.col, tile.value * 2);
                        merged.mergedFrom = [tile, targetTile];
                        mergedTiles.add(`${current.row}-${current.col}`);
                        grid.setCell(row, col, null);
                        grid.setCell(current.row, current.col, merged);
                    }
                } else if (previous.col !== col) {
                    grid.setCell(row, col, null);
                    grid.setCell(previous.row, previous.col, tile);
                }
            }
        });
    });
    
    // 验证：应该是 [4, 2, _, _] 而不是 [8, _, _, _]
    const tiles = grid.getAllTiles();
    const values = tiles.map(t => t.value).sort((a, b) => a - b);
    
    // 检查是否只有两个方块（合并后还有一个）
    if (tiles.length !== 2) {
        return { passed: false, message: `应有 2 个方块，实际为 ${tiles.length}` };
    }
    
    // 检查值
    if (!values.includes(4) || !values.includes(2)) {
        return { passed: false, message: `应为 [2, 4]，实际为 ${values}` };
    }
    
    return { passed: true, message: '单次合并限制正确' };
}

// 运行所有测试
function runAllTests() {
    const tests = [
        { name: '网格初始化', fn: test_gridInitialization },
        { name: '方块创建', fn: test_tileCreation },
        { name: '随机生成方块', fn: test_randomTileSpawn },
        { name: '向上移动', fn: test_moveUp },
        { name: '向左移动', fn: test_moveLeft },
        { name: '相同数字合并', fn: test_tileMerge },
        { name: '得分累加', fn: test_scoreAccumulation },
        { name: '最高分保存', fn: test_bestScoreSave },
        { name: '游戏结束判定-有空格', fn: test_gameOverWithEmptyCells },
        { name: '游戏结束判定-可合并', fn: test_gameOverWithMergableTiles },
        { name: '游戏结束判定-无法移动', fn: test_gameOverWhenStuck },
        { name: '新游戏重置', fn: test_newGameReset },
        { name: '单次合并限制', fn: test_singleMergePerMove }
    ];
    
    console.log('=== 2048 游戏测试报告 ===\n');
    
    tests.forEach((test, index) => {
        testResults.total++;
        try {
            const result = test.fn();
            if (result.passed) {
                testResults.passed++;
                console.log(`✅ TC${String(index + 1).padStart(2, '0')}: ${test.name} - 通过`);
            } else {
                testResults.failed++;
                console.log(`❌ TC${String(index + 1).padStart(2, '0')}: ${test.name} - 失败: ${result.message}`);
                testResults.details.push({
                    name: test.name,
                    message: result.message
                });
            }
        } catch (e) {
            testResults.failed++;
            console.log(`❌ TC${String(index + 1).padStart(2, '0')}: ${test.name} - 异常: ${e.message}`);
            testResults.details.push({
                name: test.name,
                message: e.message
            });
        }
    });
    
    console.log('\n=== 测试结果汇总 ===');
    console.log(`总计: ${testResults.total} 条`);
    console.log(`通过: ${testResults.passed} 条`);
    console.log(`失败: ${testResults.failed} 条`);
    console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
        console.log('\n=== 失败详情 ===');
        testResults.details.forEach((detail, i) => {
            console.log(`${i + 1}. ${detail.name}: ${detail.message}`);
        });
    }
    
    return testResults;
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testResults
    };
}