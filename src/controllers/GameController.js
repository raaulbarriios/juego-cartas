import { GameDatabase, CardTypes, Upgrades } from '../database/GameDatabase.js';
import { CardView } from '../views/CardView.js';
import { ShopView } from '../views/ShopView.js';
import { formatMoney } from '../utils/Formatter.js';
import { FXView } from '../views/FXView.js';
import { BouncingBall } from './BouncingBall.js';

export class GameController {
    constructor() {
        this.db = new GameDatabase();
        

        this.money = 0;
        this.cards = []; 
        this.upgrades = { ballSpeed: 0, click: 0, ballSize: 0 }; 
        this.audioSettings = { volume: 1, muted: false };
        
        this.cardTypes = CardTypes;
        this.upgradesData = Upgrades;

        this.moneyEl = document.getElementById('money-value');
        
        this.boardEl = document.getElementById('game-board');
        this.shopEl = document.querySelector('.shop');
        this.shopHandle = document.getElementById('shop-handle');
        this.bgMusic = document.getElementById('bg-music');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.musicVolume = document.getElementById('music-volume');
        this.muteMusicBtn = document.getElementById('mute-music-btn');
        this.hardResetBtn = document.getElementById('hard-reset-btn');
        this.creditsBtn = document.getElementById('credits-btn');
        this.winModal = document.getElementById('win-modal');
        this.closeWinBtn = document.getElementById('close-win-btn');

        this.nextInstanceId = 1;
        this.draggedCardId = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isResetting = false;

        this.konamiString = '';
        this.konamiTarget = 'ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightKeyBKeyAEnter';

        this.bouncingBall = new BouncingBall(this);

        this.shopView = new ShopView(
            null, 
            (type) => this.buyCard(type),
            (upgrade) => this.buyUpgrade(upgrade)
        );
        this.shopView.initTabs();
        this.cardViews = new Map();

        this.init();
    }

    init() {
        this.loadGame();
        this.setupEventListeners();
        this.renderUI();
        
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    gameLoop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.bouncingBall.update(dt);

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    
    get clickMultiplier() {
        const level = this.upgrades.click || 0;
        if (level === 0) return 1;
        
        const upgrade = this.upgradesData.click.find(u => u.level === level);
        return upgrade ? upgrade.power : 1;
    }

    getCardCount(typeId) {
        return this.cards.filter(c => c.typeId === typeId).length;
    }

    getCardCost(typeId) {
        const type = this.cardTypes.find(t => t.id === typeId);
        if (!type) return 0;
        const count = this.getCardCount(typeId);
        return type.baseCost * Math.pow(1.15, count);
    }


    setupEventListeners() {
        window.addEventListener('mousedown', (e) => this.onDragStart(e));
        window.addEventListener('mousemove', (e) => this.onDragMove(e));
        window.addEventListener('mouseup', (e) => this.onDragEnd(e));
        
        window.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: false });
        window.addEventListener('touchend', (e) => this.onDragEnd(e));

        window.addEventListener('keydown', (e) => {

            if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) {
                
                let keyName = e.code;
                console.log("Pressed code:", keyName);
                this.konamiString += keyName;
                

                if (this.konamiString.length > 300) {
                    this.konamiString = this.konamiString.slice(-150);
                }
                
                if (this.konamiString.includes(this.konamiTarget)) {
                    this.konamiString = '';
                    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
                }
            }

            if (e.key === 'º') {
                const input = prompt("Establecer cantidad de dinero:", this.money);
                if (input !== null) {
                    const amount = parseFloat(input);
                    if (!isNaN(amount)) {
                        this.money = amount;
                        this.renderUI();
                        this.saveGame();
                    }
                }
            }
        });

        this.boardEl.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.card');
            if (cardEl && !this.isDragging) {
                this.onCardClick(cardEl, e);
            }
        });

        this.shopHandle.addEventListener('click', () => {
            this.shopEl.classList.toggle('open');
        });

        if (this.settingsBtn && this.settingsModal) {
            this.settingsBtn.addEventListener('click', () => {
                this.settingsModal.style.display = 'flex';
            });
        }
        
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => {
                this.settingsModal.style.display = 'none';
            });
        }

        if (this.bgMusic) {
            
            const playOnInteraction = () => {
                if (this.bgMusic.paused && !this.audioSettings.muted) {
                    this.bgMusic.play().catch(() => {});
                }
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
            };
            document.addEventListener('click', playOnInteraction);
            document.addEventListener('touchstart', playOnInteraction);

            if (this.muteMusicBtn) {
                this.muteMusicBtn.addEventListener('click', () => {
                   if (this.bgMusic.paused && !this.audioSettings.muted) {
                       this.bgMusic.play().catch(e => console.log('Audio error:', e));
                   }

                   this.audioSettings.muted = !this.audioSettings.muted;
                   this.bgMusic.muted = this.audioSettings.muted;
                   
                   this.muteMusicBtn.textContent = this.audioSettings.muted ? 'Activar Música' : 'Silenciar Música';
                   this.muteMusicBtn.style.opacity = this.audioSettings.muted ? '0.6' : '1';
                   this.saveGame();
                });
            }

            if (this.musicVolume) {
                this.musicVolume.addEventListener('input', (e) => {
                    this.audioSettings.volume = parseFloat(e.target.value);
                    this.bgMusic.volume = this.audioSettings.volume;
                    if (this.bgMusic.paused && this.audioSettings.volume > 0 && !this.audioSettings.muted) {
                        this.bgMusic.play().catch(err => console.log('Autoplay error', err));
                    }
                    this.saveGame();
                });
            }
        }

        if (this.hardResetBtn) {
            this.hardResetBtn.addEventListener('click', () => {
                this.settingsModal.style.display = 'none';
                this.attemptReset();
            });
        }


        if (this.creditsBtn) {
            this.creditsBtn.addEventListener('click', () => {
                alert("Créditos\n\nDesarrollador: Raúl Barrios Fuentes \nCartas: Raúl Barrios Fuentes \nFondo: Antonio Francisco Suárez Torres \nMúsica: Santiago Aparicio Fernández");
            });
        }

        if (this.closeWinBtn) {
            this.closeWinBtn.addEventListener('click', () => {
                this.winModal.style.display = 'none';
                this.isResetting = true;
                this.db.reset();
                location.reload();
            });
        }

        window.addEventListener('beforeunload', () => this.saveGame());
    }

    attemptReset() {
         if(confirm('¿Deseas reiniciar el juego? Esto borrará todo tu progreso. ¿Estás seguro?')) {
            this.isResetting = true;
            this.db.reset();
            location.reload();
        }
    }

    loadGame() {
        const saved = this.db.load();
        if (saved) {
            this.money = saved.money || 0;
            this.cards = saved.cards || [];
            this.nextInstanceId = saved.nextInstanceId || 1;
            this.upgrades = saved.upgrades || { ballSpeed: 0, click: 0, ballSize: 0 };
            
            if (saved.audioSettings) {
                this.audioSettings = saved.audioSettings;
            }
            
            this.cards.forEach(cardModel => {
                this.createCardView(cardModel);
            });

            this.reapplyUpgrades();
        }
        
        if (this.bgMusic) {
            this.bgMusic.volume = this.audioSettings.volume;
            this.bgMusic.muted = this.audioSettings.muted;
        }
        
        if (this.musicVolume) {
            this.musicVolume.value = this.audioSettings.volume;
        }
        
        if (this.muteMusicBtn) {
            this.muteMusicBtn.textContent = this.audioSettings.muted ? 'Activar Música' : 'Silenciar Música';
            this.muteMusicBtn.style.opacity = this.audioSettings.muted ? '0.6' : '1';
        }
        
        if (this.cards.length === 0) {
            this.addStarterCard();
        }
    }

    addStarterCard() {
        const starterCard = {
            instanceId: this.nextInstanceId++,
            typeId: 'jeffrey',
            x: 100,
            y: 100
        };
        this.cards.push(starterCard);
        this.createCardView(starterCard);
        this.saveGame();
    }

    saveGame() {
        if (this.isResetting) return;
        const state = {
            money: this.money,
            cards: this.cards,
            nextInstanceId: this.nextInstanceId,
            upgrades: this.upgrades,
            audioSettings: this.audioSettings
        };
        this.db.save(state);
    }

    reapplyUpgrades() {
        if (this.upgrades.ballSpeed > 0) {
            const levelData = this.upgradesData.ballSpeed.find(u => u.level === this.upgrades.ballSpeed);
            this.bouncingBall.setLevel(levelData);
        }
        
        if (this.upgrades.ballSize > 0) {
            const levelData = this.upgradesData.ballSize.find(u => u.level === this.upgrades.ballSize);
            this.bouncingBall.setSize(levelData.size);
        }
    }

    buyCard(type) {
        const cost = this.getCardCost(type.id);
        if (this.money >= cost) {
            this.money -= cost;
            
            const newCard = {
                instanceId: this.nextInstanceId++,
                typeId: type.id,
                x: 50 + (Math.random() * 200),
                y: 50 + (Math.random() * 200),
            };

            this.cards.push(newCard);
            this.createCardView(newCard);
            this.renderUI();
            this.saveGame();
            
            if (type.id === 'emoji' && this.winModal) {
                setTimeout(() => {
                    this.winModal.style.display = 'flex';
                }, 15000);
            }
        }
    }

    buyUpgrade(upgrade) {
        if (this.money >= upgrade.cost) {
            this.money -= upgrade.cost;
            
            this.upgrades[upgrade.id] = upgrade.level;
            
            if (upgrade.id === 'ballSpeed') {
                this.bouncingBall.setLevel(upgrade);
            } else if (upgrade.id === 'ballSize') {
                this.bouncingBall.setSize(upgrade.size);
            }

            this.renderUI();
            this.saveGame();
        }
    }

    createCardView(cardModel) {
        const type = this.cardTypes.find(t => t.id === cardModel.typeId);
        if (!type) return;

        const view = new CardView(cardModel, type);
        

        const infoEl = view.element.querySelector('.card-info');
        if (infoEl) {
            infoEl.textContent = `+$${formatMoney(type.clickValue)}`;
        }

        this.boardEl.appendChild(view.element);
        this.cardViews.set(cardModel.instanceId, view);
    }

    onCardClick(cardEl, event) {
        const id = parseInt(cardEl.dataset.instanceId);
        const cardModel = this.cards.find(c => c.instanceId === id);
        if (!cardModel) return;

        const type = this.cardTypes.find(t => t.id === cardModel.typeId);
        
        const earned = type.clickValue * this.clickMultiplier;
        this.money += earned;
        this.renderUI();

        FXView.spawnMoneyPopup(event.clientX, event.clientY, formatMoney(earned));
    }


    getEventPos(e) {
        if (e.type.startsWith('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            return { x: touch.clientX, y: touch.clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    onDragStart(e) {
        const cardEl = e.target.closest('.card');
        
        if (e.type === 'touchstart' && cardEl) {
            e.preventDefault();
        }

        if (!cardEl) return;
        
        this.draggedCardId = parseInt(cardEl.dataset.instanceId);
        const cardModel = this.cards.find(c => c.instanceId === this.draggedCardId);
        
        if (cardModel) {
            this.isDragging = true;
            this.hasMoved = false;
            const pos = this.getEventPos(e);
            this.dragStartPos = pos;
            
            const rect = cardEl.getBoundingClientRect();
            this.dragOffset.x = pos.x - rect.left;
            this.dragOffset.y = pos.y - rect.top;
        }
    }

    onDragMove(e) {
        if (!this.isDragging || !this.draggedCardId) return;
        e.preventDefault();
        
        const pos = this.getEventPos(e);
        if (this.dragStartPos) {
            const dx = pos.x - this.dragStartPos.x;
            const dy = pos.y - this.dragStartPos.y;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                this.hasMoved = true;
            }
        } else {
            this.hasMoved = true;
        }
        
        const cardView = this.cardViews.get(this.draggedCardId);
        if (cardView) {
            const pos = this.getEventPos(e);
            const boardRect = this.boardEl.getBoundingClientRect();
            
            let newX = pos.x - boardRect.left - this.dragOffset.x;
            let newY = pos.y - boardRect.top - this.dragOffset.y;
            
            newX = Math.max(0, Math.min(newX, boardRect.width - 180)); 
            newY = Math.max(0, Math.min(newY, boardRect.height - 252)); 
            
            cardView.model.x = newX;
            cardView.model.y = newY;
            cardView.updatePosition();
        }
    }

    onDragEnd(e) {
        if (this.isDragging && this.draggedCardId) {
            const isTouch = e.type.startsWith('touch');
            
            if (this.hasMoved || isTouch) {
                const cardEl = document.querySelector(`.card[data-instance-id="${this.draggedCardId}"]`);
                if (cardEl) {
                    const rect = cardEl.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    this.onCardClick(cardEl, {
                        clientX: centerX,
                        clientY: centerY,
                        isAutomated: false
                    });
                }
                
                setTimeout(() => {
                    this.isDragging = false;
                    this.draggedCardId = null;
                }, 50);
            } else {
                this.isDragging = false;
                this.draggedCardId = null;
            }

            this.saveGame();
        }
    }


    renderUI() {
        this.moneyEl.textContent = formatMoney(this.money);
        
        const shopList = this.cardTypes.map(t => ({
            ...t,
            currentCost: this.getCardCost(t.id),
            displayCost: formatMoney(this.getCardCost(t.id)),
            displayEarn: formatMoney(t.clickValue),
            ownedCount: this.getCardCount(t.id)
        }));
        
        this.shopView.render(
            shopList, 
            this.money, 
            this.upgradesData,
            this.upgrades
        );
    }
}
