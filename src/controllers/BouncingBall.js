export class BouncingBall {
    constructor(gameController) {
        this.game = gameController;
        this.element = null;
        
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.vx = 1;
        this.vy = 1; 
        this.speed = 0;
        
        this.level = 0;
        this.width = 40;
        this.height = 40;
        
        this.cardCooldowns = new Map(); 
    }

    init() {
        if (this.element) return;
        
        this.element = document.createElement('div');
        this.element.className = 'bouncing-ball';
        this.element.innerHTML = '●'; 
        document.body.appendChild(this.element);
        
        this.randomizeDirection();
    }

    setLevel(levelData) {
        if (!levelData) return;
        
        if (this.level === 0 && levelData.level > 0) {
            this.init();
        }
        
        this.level = levelData.level;
        this.speed = levelData.speed;
    }

    setSize(size) {
        this.width = size;
        this.height = size;
        if (this.element) {
            this.element.style.width = size + 'px';
            this.element.style.height = size + 'px';
            this.element.style.fontSize = (size * 0.75) + 'px';
        }
    }

    update(dt) {
        if (this.level === 0 || !this.element) return;

        const moveDist = this.speed * dt;
        this.x += this.vx * moveDist;
        this.y += this.vy * moveDist;

        let maxX = window.innerWidth - this.width;
        const maxY = window.innerHeight - this.height;
        let bounced = false;

        if (this.x <= 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx);
            this.randomizeBounce('x');
            bounced = true;
        } else if (this.x >= maxX) {
            this.x = maxX;
            this.vx = -Math.abs(this.vx);
            this.randomizeBounce('x');
            bounced = true;
        }

        if (this.y <= 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy);
            this.randomizeBounce('y');
            bounced = true;
        } else if (this.y >= maxY) {
            this.y = maxY;
            this.vy = -Math.abs(this.vy);
            this.randomizeBounce('y');
            bounced = true;
        }
        
        if (bounced) {
             this.normalizeVelocity();
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        
        this.checkCollisions();
        
        for (const [id, time] of this.cardCooldowns) {
            if (time > 0) {
                this.cardCooldowns.set(id, time - dt);
            } else {
                this.cardCooldowns.delete(id);
            }
        }
    }
    
    randomizeDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    randomizeBounce(axis) {
        if (axis === 'x') {
            this.vy = (Math.random() * 2) - 1;
        } else {
            this.vx = (Math.random() * 2) - 1;
        }
    }
    
    normalizeVelocity() {
        const len = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (len === 0) {
            this.vx = 1;
            this.vy = 0;
        } else {
            this.vx /= len;
            this.vy /= len;
        }
    }

    checkCollisions() {
        const ballRect = {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };

        for (const [id, view] of this.game.cardViews) {
            if (this.cardCooldowns.has(id)) continue;

            const cardRect = view.element.getBoundingClientRect();
            
            if (this.isColliding(ballRect, cardRect)) {
                this.game.onCardClick(view.element, { 
                    clientX: this.x + this.width/2, 
                    clientY: this.y + this.height/2,
                    preventDefault: () => {},
                    isAutomated: true
                });
                
                this.cardCooldowns.set(id, 0.5);
            }
        }
    }

    isColliding(r1, r2) {
        return !(r2.left > r1.right || 
                 r2.right < r1.left || 
                 r2.top > r1.bottom || 
                 r2.bottom < r1.top);
    }
}
