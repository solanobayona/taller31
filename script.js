// ======================================================
// CONFIGURACIÓN INICIAL Y CANVAS
// ======================================================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Límites del Viewport (Modificables por el usuario)
let xmin, ymin, xmax, ymax;

// Códigos de región para Cohen-Sutherland
const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

// ======================================================
// DEFINICIÓN DE LOS 5 CASOS ESPECÍFICOS
// ======================================================
const scenes = [
    {
        name: "Dentro del Viewport",
        x1: 200, y1: 150, x2: 400, y2: 300,
        color: "#2ecc71" // Verde
    },
    {
        name: "Fuera del Viewport",
        x1: 50, y1: 50, x2: 100, y2: 80,
        color: "#e74c3c" // Rojo
    },
    {
        name: "Tocando una Esquina",
        x1: 100, y1: 50, x2: 150, y2: 100, // Toca esquina inferior izquierda
        color: "#f1c40f" // Amarillo/Naranja
    },
    {
        name: "Atravesando Arriba a Abajo",
        x1: 300, y1: 50, x2: 300, y2: 450,
        color: "#9b59b6" // Morado
    },
    {
        name: "Superior y Lateral",
        x1: 100, y1: 300, x2: 400, y2: 450, // Cruza lateral izquierdo y parte superior
        color: "#3498db" // Azul
    }
];

let currentScene = 0;

// ======================================================
// FUNCIONES DE APOYO (Matemáticas y Conversión)
// ======================================================

function convertY(y) {
    return canvas.height - y;
}

function computeCode(x, y) {
    let code = INSIDE;
    if (x < xmin) code |= LEFT;
    else if (x > xmax) code |= RIGHT;
    if (y < ymin) code |= BOTTOM;
    else if (y > ymax) code |= TOP;
    return code;
}

// ======================================================
// REQUISITO: FUNCIÓN NO PRIMITIVA (DDA)
// ======================================================
function drawLineDDA(x1, y1, x2, y2, color) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));
    let xInc = dx / steps;
    let yInc = dy / steps;
    let x = x1;
    let y = y1;

    ctx.fillStyle = color;
    for (let i = 0; i <= steps; i++) {
        // CAMBIO: Cambiamos 1, 1 por 3, 3 para dar grosor
        ctx.fillRect(
            Math.round(x) - 1, 
            Math.round(convertY(y)) - 1, 
            3, 
            3
        );
        x += xInc;
        y += yInc;
    }
}
// ======================================================
// REQUISITO: LAS 2 FUNCIONES PRINCIPALES (Viewport y Línea)
// ======================================================

// 1. Función para el Viewport
function drawViewport() {
    // Dibujamos el rectángulo usando la función DDA personalizada
    drawLineDDA(xmin, ymin, xmax, ymin, "black");
    drawLineDDA(xmax, ymin, xmax, ymax, "black");
    drawLineDDA(xmax, ymax, xmin, ymax, "black");
    drawLineDDA(xmin, ymax, xmin, ymin, "black");
}

// 2. Función para la Línea con Algoritmo Cohen-Sutherland
function drawClippedLine(x1, y1, x2, y2, color) {
    let code1 = computeCode(x1, y1);
    let code2 = computeCode(x2, y2);
    let accept = false;

    // Dibujar línea original en gris muy claro para referencia (opcional)
    drawLineDDA(x1, y1, x2, y2, "#eeeeee");

    while (true) {
        if (!(code1 | code2)) {
            accept = true; break;
        } else if (code1 & code2) {
            break;
        } else {
            let codeOut = code1 ? code1 : code2;
            let x, y;

            if (codeOut & TOP) {
                x = x1 + (x2 - x1) * (ymax - y1) / (y2 - y1);
                y = ymax;
            } else if (codeOut & BOTTOM) {
                x = x1 + (x2 - x1) * (ymin - y1) / (y2 - y1);
                y = ymin;
            } else if (codeOut & RIGHT) {
                y = y1 + (y2 - y1) * (xmax - x1) / (x2 - x1);
                x = xmax;
            } else if (codeOut & LEFT) {
                y = y1 + (y2 - y1) * (xmin - x1) / (x2 - x1);
                x = xmin;
            }

            if (codeOut === code1) {
                x1 = x; y1 = y; code1 = computeCode(x1, y1);
            } else {
                x2 = x; y2 = y; code2 = computeCode(x2, y2);
            }
        }
    }
    if (accept) {
        drawLineDDA(x1, y1, x2, y2, color);
    }
}

// ======================================================
// LÓGICA DE CONTROL Y NAVEGACIÓN
// ======================================================

function updateBounds() {
    xmin = parseInt(document.getElementById("xmin").value);
    ymin = parseInt(document.getElementById("ymin").value);
    xmax = parseInt(document.getElementById("xmax").value);
    ymax = parseInt(document.getElementById("ymax").value);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBounds();
    drawViewport();

    const line = scenes[currentScene];
    drawClippedLine(line.x1, line.y1, line.x2, line.y2, line.color);
}

// Eventos de Botones
document.getElementById("updateBtn").onclick = render;
document.getElementById("nextBtn").onclick = () => {
    currentScene = (currentScene + 1) % scenes.length;
    render();
};
document.getElementById("prevBtn").onclick = () => {
    currentScene = (currentScene - 1 + scenes.length) % scenes.length;
    render();
};
document.getElementById("firstBtn").onclick = () => { currentScene = 0; render(); };
document.getElementById("lastBtn").onclick = () => { currentScene = scenes.length - 1; render(); };

// Inicio
render();