/**
 * 2048 游戏 - Node.js 测试运行器（完整版）
 */

const fs = require('fs');
const path = require('path');

// 模拟 localStorage
global.localStorage = {
    store: {},
    getItem: function(key) {
        return this.store[key] || null;
    },
    setItem: function(key, value) {
        this.store[key] = value;
    },
    removeItem: function(key) {
        delete this.store[key];
    }
};

// 模拟 DOM
global.document = {
    getElementById: () => null,
    addEventListener: () => {},
    createElement: () => ({ className: '', style: {}, textContent: '', appendChild: () => {}, classList: { add: () => {} } }),
    querySelectorAll: () => [],
    documentElement: { style: { setProperty: () => {} } }
};
global.window = global;

// 读取源代码内容
const gridCode = fs.readFileSync(path.join(__dirname, '../src/js/grid.js'), 'utf8');
const tileCode = fs.readFileSync(path.join(__dirname, '../src/js/tile.js'), 'utf8');
const scoreCode = fs.readFileSync(path.join(__dirname, '../src/js/score.js'), 'utf8');
const leaderboardCode = fs.readFileSync(path.join(__dirname, '../src/js/leaderboard.js'), 'utf8');
const testCode = fs.readFileSync(path.join(__dirname, 'test.js'), 'utf8');
const v020TestCode = fs.readFileSync(path.join(__dirname, 'test-v0.2.0.js'), 'utf8');
const v030TestCode = fs.readFileSync(path.join(__dirname, 'test-v0.3.0.js'), 'utf8');

// 使用 vm 模块执行
const vm = require('vm');
const context = vm.createContext({
    localStorage: global.localStorage,
    document: global.document,
    window: global,
    console: console,
    Math: Math,
    Array: Array,
    Object: Object,
    Set: Set,
    parseInt: parseInt
});

// 执行源代码
vm.runInContext(gridCode, context);
vm.runInContext(tileCode, context);
vm.runInContext(scoreCode, context);
vm.runInContext(leaderboardCode, context);
vm.runInContext(testCode, context);
vm.runInContext(v020TestCode, context);
vm.runInContext(v030TestCode, context);

// 运行所有测试
console.log('\n');
console.log('══════════════════════════════════════════════════');
console.log('          2048 游戏 - 完整测试报告                ');
console.log('══════════════════════════════════════════════════\n');

// v0.1.0 测试
console.log('【v0.1.0 核心功能测试】\n');
const v010Results = vm.runInContext('runAllTests()', context);

// v0.2.0 测试
console.log('\n【v0.2.0 游戏体验测试】\n');
let v020Passed = 0;
let v020Failed = 0;
const v020Details = [];

const v020Tests = vm.runInContext('v020Tests', context);
v020Tests.forEach((test, index) => {
    try {
        const result = test.fn();
        if (result.passed) {
            v020Passed++;
            console.log(`✅ v020-${index + 1}: ${test.name} - 通过`);
        } else {
            v020Failed++;
            console.log(`❌ v020-${index + 1}: ${test.name} - 失败: ${result.message}`);
            v020Details.push({ name: test.name, message: result.message });
        }
    } catch (e) {
        v020Failed++;
        console.log(`❌ v020-${index + 1}: ${test.name} - 异常: ${e.message}`);
        v020Details.push({ name: test.name, message: e.message });
    }
});

// v0.3.0 测试
console.log('\n【v0.3.0 增强功能测试】\n');
let v030Passed = 0;
let v030Failed = 0;
const v030Details = [];

const v030Tests = vm.runInContext('v030Tests', context);
v030Tests.forEach((test, index) => {
    try {
        const result = test.fn();
        if (result.passed) {
            v030Passed++;
            console.log(`✅ v030-${index + 1}: ${test.name} - 通过`);
        } else {
            v030Failed++;
            console.log(`❌ v030-${index + 1}: ${test.name} - 失败: ${result.message}`);
            v030Details.push({ name: test.name, message: result.message });
        }
    } catch (e) {
        v030Failed++;
        console.log(`❌ v030-${index + 1}: ${test.name} - 异常: ${e.message}`);
        v030Details.push({ name: test.name, message: e.message });
    }
});

// 汇总
const totalPassed = v010Results.passed + v020Passed + v030Passed;
const totalFailed = v010Results.failed + v020Failed + v030Failed;
const totalTests = v010Results.total + v020Tests.length + v030Tests.length;

console.log('\n══════════════════════════════════════════════════');
console.log('               总体测试结果                        ');
console.log('══════════════════════════════════════════════════');
console.log(`v0.1.0: ${v010Results.passed}/${v010Results.total} 通过`);
console.log(`v0.2.0: ${v020Passed}/${v020Tests.length} 通过`);
console.log(`v0.3.0: ${v030Passed}/${v030Tests.length} 通过`);
console.log(`─────────────────────────────────────────────────`);
console.log(`总计: ${totalPassed}/${totalTests} 通过 (${((totalPassed/totalTests)*100).toFixed(1)}%)`);

const allFailed = [...v020Details, ...v030Details];
if (allFailed.length > 0) {
    console.log('\n【失败详情】');
    allFailed.forEach((d, i) => {
        console.log(`${i + 1}. ${d.name}: ${d.message}`);
    });
}

console.log('\n══════════════════════════════════════════════════');

// 返回结果
process.exit(totalFailed > 0 ? 1 : 0);