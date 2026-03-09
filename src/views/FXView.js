export class FXView {
    static spawnMoneyPopup(x, y, text) {
        const el = document.createElement('div');
        el.classList.add('money-popup');
        el.textContent = `+$${text}`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.body.appendChild(el);

        setTimeout(() => el.remove(), 1000);
    }
}
