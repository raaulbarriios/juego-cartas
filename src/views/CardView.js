export class CardView {
    constructor(cardModel, cardType) {
        this.model = cardModel;
        this.type = cardType;
        this.element = this.createHTMLElement();
        this.updatePosition();
    }

    createHTMLElement() {
        const el = document.createElement('div');
        el.classList.add('card');
        el.id = `card-${this.model.instanceId}`;
        
        const imgSrc = this.type.imageSrc;

        el.innerHTML = `
            <img src="${imgSrc}" alt="${this.type.name}" draggable="false">
            <div class="card-info">+$${this.type.clickValue}</div>
        `;

        el.dataset.instanceId = this.model.instanceId;
        
        return el;
    }

    updatePosition() {
        this.element.style.left = `${this.model.x}px`;
        this.element.style.top = `${this.model.y}px`;
    }

    updateImage(newSrc) {
        const img = this.element.querySelector('img');
        if (img) img.src = newSrc;
    }
}
