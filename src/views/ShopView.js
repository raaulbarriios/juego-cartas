export class ShopView {
    constructor(containerIds, onBuyCallback, onBuyUpgradeCallback) {
        this.cardsContainer = document.getElementById('shop-items');
        this.upgradesContainer = document.getElementById('upgrades-list');
        
        this.onBuy = onBuyCallback;
        this.onBuyUpgrade = onBuyUpgradeCallback;
    }

    initTabs() {
        const tabCards = document.getElementById('tab-cards');
        const tabUpgrades = document.getElementById('tab-upgrades');
        
        const contentCards = document.getElementById('shop-content-cards');
        const contentUpgrades = document.getElementById('shop-content-upgrades');

        const tabs = [tabCards, tabUpgrades];
        const contents = [contentCards, contentUpgrades];

        const activate = (index) => {
            tabs.forEach((t, i) => {
                if(t) t.classList.toggle('active', i === index);
            });
            contents.forEach((c, i) => {
                if(c) c.style.display = i === index ? 'flex' : 'none';
            });
        };

        if(tabCards) tabCards.addEventListener('click', () => activate(0));
        if(tabUpgrades) tabUpgrades.addEventListener('click', () => activate(1));
    }

    render(cardTypes, currentMoney, upgrades = [], currentUpgradeLevels = {}) {
        this.renderCards(cardTypes, currentMoney);
        this.renderUpgrades(upgrades, currentUpgradeLevels, currentMoney);
    }

    renderCards(cardTypes, currentMoney) {
        if (this.cardsContainer.children.length === 0) {
             cardTypes.forEach(type => {
                const item = document.createElement('div');
                item.classList.add('shop-item');
                item.dataset.id = type.id;
                item.innerHTML = `
                    <img src="${type.imageSrc}" alt="${type.name}">
                    <div>
                        <strong>${type.name}</strong><br>
                        <small class="earn-display"></small>
                    </div>
                    <button class="shop-btn">Comprar</button>
                `;
                const btn = item.querySelector('button');
                btn.addEventListener('click', () => this.onBuy(type));
                this.cardsContainer.appendChild(item);
            });
        }

        Array.from(this.cardsContainer.children).forEach((item, index) => {
            const type = cardTypes[index];
            if (!type) return;

            const canAfford = currentMoney >= (type.currentCost || type.baseCost);
            const btn = item.querySelector('button');
            const earn = item.querySelector('.earn-display');
            const img = item.querySelector('img');
            
            earn.textContent = `Genera: $${type.displayEarn || '?'}/clic`;
            btn.textContent = `Comprar ($${(type.displayCost || type.baseCost)})`;
            btn.disabled = !canAfford;

            if (type.ownedCount === 0) {
                img.classList.add('not-owned');
            } else {
                img.classList.remove('not-owned');
            }
        });
    }

    renderUpgrades(upgradesData, currentLevels, currentMoney) {
        if (!this.upgradesContainer) return;
        
        this.upgradesContainer.innerHTML = '';

        Object.keys(upgradesData).forEach(key => {
            const upgradesList = upgradesData[key];
            const currentLevel = currentLevels[key] || 0;
            const nextUpgrade = upgradesList.find(u => u.level === currentLevel + 1);

            if (nextUpgrade) {
                const item = document.createElement('div');
                item.className = 'upgrade-item';
                const canAfford = currentMoney >= nextUpgrade.cost;

                item.innerHTML = `
                    <div class="upgrade-header">
                        <span class="upgrade-name">${nextUpgrade.name}</span>
                        <div class="upgrade-meta">
                            <span class="upgrade-level">Nivel ${nextUpgrade.level}</span>
                        </div>
                    </div>
                    <div class="upgrade-desc">${nextUpgrade.description}</div>
                    <div class="upgrade-actions">
                        <button class="shop-btn" ${canAfford ? '' : 'disabled'}>
                            Comprar ($${nextUpgrade.cost.toLocaleString()})
                        </button>
                    </div>
                `;
                
                item.querySelector('button').addEventListener('click', () => {
                    if (canAfford) this.onBuyUpgrade(nextUpgrade);
                });
                
                this.upgradesContainer.appendChild(item);
            } else if (currentLevel >= upgradesList.length && upgradesList.length > 0) {
                 const item = document.createElement('div');
                 item.className = 'upgrade-item maxed';
                 item.innerHTML = `
                    <div class="upgrade-header">
                        <span class="upgrade-name">${upgradesList[upgradesList.length-1].name}</span>
                        <span class="upgrade-level">MAX</span>
                    </div>
                    <div class="upgrade-desc">¡Mejora completada al máximo!</div>
                 `;
                 this.upgradesContainer.appendChild(item);
            }
        });
    }
}
