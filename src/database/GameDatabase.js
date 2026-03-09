import { CardType } from '../types/CardType.js';

const K=1e3, M=1e6, B=1e9, T=1e12, P=1e15, E=1e18, Z=1e21, Y=1e24;

export const CardTypes = [
    new CardType('jeffrey', 'Jeffrey The Epstein', 50, 1, 'src/img/Jeffrey.png'),
    new CardType('dorita', 'Dorita', 1000, 5, 'src/img/Dorita.png'),
    new CardType('pollos', 'Los Inombrables', 25*K, 50, 'src/img/lospollos.png'),
    new CardType('Goku', 'Kekarottus', 1*M, 500, 'src/img/cartaque.png'),
    new CardType('virgil', 'Virgilius, Soberano del Plastico', 50*M, 5*K, 'src/img/virgilsilla.png'),
    new CardType('red', 'El Oyente', 2.5*B, 50*K, 'src/img/angryred.png'),
    
    new CardType('pepsiman', 'El Heraldo de la Eferbescencia', 150*B, 1*M, 'src/img/pepsiman.png'),
    new CardType('gustavoS', 'Gustavus, El llamado ineludible', 10*T, 25*M, 'src/img/gustavoperro.png'),
    new CardType('si', 'El Oráculo de la afirmación', 800*T, 1*B, 'src/img/perrosi.png'),
    new CardType('freddy', 'El Curseado', 50*P, 50*B, 'src/img/fredi.png'),
    
    new CardType('juan', 'El Testigo', 5*E, 2*T, 'src/img/juan.png'),
    new CardType('santi', 'El Devorador', 500*E, 100*T, 'src/img/santiago.png'),
    new CardType('jose', 'Lociento Jose', 75*Z, 5*P, 'src/img/lociento.png'),
    new CardType('Leon', 'Leonus, El gesto del Autismo', 10*Y, 250*P, 'src/img/leon.png'),
    new CardType('eggman', 'I\'ve come to make an announcement', 500*Y, 15*E, 'src/img/eggman.png'),
    
    new CardType('bob', 'Lagrimus', 25*K*Y, 1*Z, 'src/img/bob.png'),
    new CardType('walter', 'Walter el Perro', 1*M*Y, 50*Z, 'src/img/walter.png'),
    new CardType('pou', 'Poulla', 100*M*Y, 5*Y, 'src/img/pou.png'),
    new CardType('kalaka', 'El Kalakas', 1*B*Y, 250*Y, 'src/img/kalaka.png'),
    new CardType('emoji', 'Facies Suprema', 1*T*Y, 10*K*Y, 'src/img/emoji.png'),
];

const BallSpeedUpgrades = [
    { id: 'ballSpeed', level: 1, name: "Bola Rebotadora", cost: 10_000, speed: 200, description: "Desbloquea una bola que rebota y hace clic por ti." },
    { id: 'ballSpeed', level: 2, name: "Bola Veloz I", cost: 75_000, speed: 300, description: "Aumenta la velocidad de la bola." },
    { id: 'ballSpeed', level: 3, name: "Bola Veloz II", cost: 500_000, speed: 450, description: "¡Más rápido!" },
    { id: 'ballSpeed', level: 4, name: "Bola Sónica", cost: 5_000_000, speed: 700, description: "La bola se mueve a velocidades increíbles." },
    { id: 'ballSpeed', level: 5, name: "Bola Hiper", cost: 75_000_000, speed: 1200, description: "¡Casi no se puede ver!" },
    { id: 'ballSpeed', level: 6, name: "Bola Cuántica", cost: 1*B, speed: 2500, description: "Está en todas partes a la vez." },
    { id: 'ballSpeed', level: 7, name: "Bola Divina", cost: 500*B, speed: 5000, description: "Velocidad divina." }
];

const ClickUpgrades = [
    { id: 'click', level: 1, name: "Guantes de Poder", cost: 250_000, power: 2, description: "Tus clics valen x2." },
    { id: 'click', level: 2, name: "Martillo Digital", cost: 2_000_000, power: 5, description: "Tus clics valen x5." },
    { id: 'click', level: 3, name: "Click Sónico", cost: 25_000_000, power: 10, description: "Tus clics valen x10." },
    { id: 'click', level: 4, name: "Dedo de Midas", cost: 500_000_000, power: 25, description: "Tus clics valen x25." },
    { id: 'click', level: 5, name: "Click Divino", cost: 10*B, power: 100, description: "Tus clics valen x100." }
];

const BallSizeUpgrades = [
    { id: 'ballSize', level: 1, name: "Bola Grande", cost: 15_000, size: 60, description: "Aumenta el tamaño de la bola." },
    { id: 'ballSize', level: 2, name: "Bola Gigante", cost: 250_000, size: 80, description: "¡Más grande es mejor!" },
    { id: 'ballSize', level: 3, name: "Bola Colosal", cost: 5_000_000, size: 120, description: "Golpea más cartas a la vez." },
    { id: 'ballSize', level: 4, name: "Sol en Miniatura", cost: 150*M, size: 200, description: "Ocupa gran parte de la pantalla." }
];

export const Upgrades = {
    ballSpeed: BallSpeedUpgrades,
    click: ClickUpgrades,
    ballSize: BallSizeUpgrades
};
export { BallSpeedUpgrades };

export class GameDatabase {
    constructor() {
        this.STORAGE_KEY = 'card_clicker_save_v1';
    }

    save(state) {
        try {
            const serialized = JSON.stringify(state);
            localStorage.setItem(this.STORAGE_KEY, serialized);
        } catch (e) {
            console.error("Failed to save game:", e);
        }
    }

    load() {
        try {
            const serialized = localStorage.getItem(this.STORAGE_KEY);
            return serialized ? JSON.parse(serialized) : null;
        } catch (e) {
            console.error("Failed to load game:", e);
            return null;
        }
    }

    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
