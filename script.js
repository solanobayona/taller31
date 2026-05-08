// Configuración inicial del Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Variables globales del viewport
let xmin, ymin, xmax, ymax;

// Códigos de región Cohen-Sutherland (TBRL)
const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

// Convierte coordenadas para que (0,0) esté en la esquina inferior izquierda
function convertY(y) {
    return canvas.height - y;
}

// Calcula el outcode de un punto
function computeCode(x, y) {
    let code = INSIDE;
    if (x < xmin) code |= LEFT;
    else if (x > xmax) code |= RIGHT;
    if (y < ymin) code |= BOTTOM;
    else if (y > ymax) code |= TOP;
    return code;
}

// REQUISITO: Función de trazado NO PRIMITIVA (Algoritmo DDA)
function drawLineDDA(x1, y1, x2, y2, color) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) return; // Evitar división por cero

    let xInc = dx / steps;
    let yInc = dy / steps;
    let x = x1;
    let y = y1;

    ctx.fillStyle = color;
    for (let i = 0; i <= steps; i++) {
        // Dibujamos con grosor de 3x3 píxeles
        ctx.fillRect(Math.round(x) - 1, Math.round(convertY(y)) - 1, 3, 3);
        x += xInc;
        y += yInc;
    }
}

// REQUISITO: Función para el Viewport (marco de la ventana)
function drawViewport() {
    drawLineDDA(xmin, ymin, xmax, ymin, "black"); // Abajo
    drawLineDDA(xmax, ymin, xmax, ymax, "black"); // Derecha
    drawLineDDA(xmax, ymax, xmin, ymax, "black"); // Arriba
    drawLineDDA(xmin, ymax, xmin, ymin, "black"); // Izquierda
}

// ALGORITMO COHEN-SUTHERLAND
function drawClippedLine(x1, y1, x2, y2, color) {
    let c1 = computeCode(x1, y1);
    let c2 = computeCode(x2, y2);
    let accept = false;

    // Coordenadas de trabajo
    let curX1 = x1, curY1 = y1, curX2 = x2, curY2 = y2;

    // Línea de referencia (fantasma) en gris muy claro
    drawLineDDA(x1, y1, x2, y2, "#f1f1f1");

    while (true) {
        if (!(c1 | c2)) { // Aceptación trivial
            accept = true;
            break;
        } else if (c1 & c2) { // Rechazo trivial
            break;
        } else {
            let codeOut = c1 ? c1 : c2;
            let x, y;

            if (codeOut & TOP) {
                x = curX1 + (curX2 - curX1) * (ymax - curY1) / (curY2 - curY1);
                y = ymax;
            } else if (codeOut & BOTTOM) {
                x = curX1 + (curX2 - curX1) * (ymin - curY1) / (curY2 - curY1);
                y = ymin;
            } else if (codeOut & RIGHT) {
                y = curY1 + (curY2 - curY1) * (xmax - curX1) / (curX2 - curX1);
                x = xmax;
            } else if (codeOut & LEFT) {
                y = curY1 + (curY2 - curY1) * (xmin - curX1) / (curX2 - curX1);
                x = xmin;
            }

            if (codeOut === c1) {
                curX1 = x; curY1 = y;
                c1 = computeCode(curX1, curY1);
            } else {
                curX2 = x; curY2 = y;
                c2 = computeCode(curX2, curY2);
            }
        }
    }

    if (accept) {
        drawLineDDA(curX1, curY1, curX2, curY2, color);
    }
}

// DEFINICIÓN DE LOS 5 CASOS PEDIDOS (Relativos al Viewport)
const scenes = [
    {
        name: "1. Totalmente Dentro",
        coords: () => ({ x1: xmin + 50, y1: ymin + 50, x2: xmax - 50, y2: ymax - 50 }),
        color: "#10b981"
    },
    {
        name: "2. Totalmente Fuera",
        coords: () => ({ x1: xmin - 120, y1: ymin - 120, x2: xmin - 40, y2: ymin - 40 }),
        color: "#ef4444"
    },
    {
        name: "3. Toca una Esquina",
        coords: () => ({ x1: xmin - 60, y1: ymin - 60, x2: xmin, y2: ymin }),
        color: "#f59e0b"
    },
    {
        name: "4. Atraviesa (Vertical)",
        coords: () => ({ x1: (xmin + xmax) / 2, y1: ymax + 60, x2: (xmin + xmax) / 2, y2: ymin - 60 }),
        color: "#8b5cf6"
    },
    {
        name: "5. Superior y Lateral",
        coords: () => ({ x1: xmin - 60, y1: ymax - 40, x2: xmin + 120, y2: ymax + 60 }),
        color: "#3b82f6"
    }
];

let currentScene = 0;

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

    const scene = scenes[currentScene];
    const pts = scene.coords();
    
    document.getElementById("caseName").innerText = scene.name;
    drawClippedLine(pts.x1, pts.y1, pts.x2, pts.y2, scene.color);
}

// Control de botones
document.getElementById("updateBtn").onclick = render;
document.getElementById("nextBtn").onclick = () => { currentScene = (currentScene + 1) % scenes.length; render(); };
document.getElementById("prevBtn").onclick = () => { currentScene = (currentScene - 1 + scenes.length) % scenes.length; render(); };
document.getElementById("firstBtn").onclick = () => { currentScene = 0; render(); };
document.getElementById("lastBtn").onclick = () => { currentScene = scenes.length - 1; render(); };

// Inicio automático al cargar
window.onload = render;