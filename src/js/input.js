/**
 * 输入管理模块
 * 负责键盘和触摸事件的监听
 */

class Input {
    constructor(onMove, onNewGame) {
        this.onMove = onMove;
        this.onNewGame = onNewGame;
        
        this.init();
    }

    /**
     * 初始化事件监听
     */
    init() {
        // 键盘事件
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        const retryBtn = document.getElementById('retry-btn');
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.onNewGame());
        }
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.onNewGame());
        }
        
        // 触摸事件（移动端支持）
        this.initTouch();
    }

    /**
     * 处理键盘事件
     */
    handleKeyDown(event) {
        // 方向键映射
        const keyMap = {
            'ArrowUp': 0,
            'ArrowDown': 2,
            'ArrowLeft': 3,
            'ArrowRight': 1,
            'w': 0,
            'W': 0,
            's': 2,
            'S': 2,
            'a': 3,
            'A': 3,
            'd': 1,
            'D': 1
        };

        const direction = keyMap[event.key];
        
        if (direction !== undefined) {
            event.preventDefault();
            this.onMove(direction);
        }
    }

    /**
     * 初始化触摸事件
     */
    initTouch() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const gameContainer = document.querySelector('.game-container');
        
        if (!gameContainer) return;
        
        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        gameContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }

    /**
     * 处理滑动手势
     */
    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const threshold = 50; // 最小滑动距离
        
        // 判断滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.onMove(1); // right
                } else {
                    this.onMove(3); // left
                }
            }
        } else {
            // 垂直滑动
            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0) {
                    this.onMove(2); // down
                } else {
                    this.onMove(0); // up
                }
            }
        }
    }
}

// 导出 Input 类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Input;
}