// ======================================================
// CONFIGURACIÓN DE CANVAS Y VARIABLES GLOBALES
// ======================================================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let xmin, ymin, xmax, ymax;

// Definición de códigos de región (4 bits: TBRL)
const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

// ======================================================
// FUNCIONES DE APOYO Y CONVERSIÓN
// ======================================================

// Convierte coordenada Y para que (0,0) sea abajo a la izquierda
function convertY(y) {
    return canvas.height - y;
}

// Calcula el código de región de un punto (x, y)
function computeCode(x, y) {
    let code = INSIDE;
    if (x < xmin)      code |= LEFT;
    else if (x > xmax) code |= RIGHT;
    if (y < ymin)      code |= BOTTOM;
    else if (y > ymax) code |= TOP;
    return code;
}

// ======================================================
// REQUISITO: FUNCIÓN DE TRAZADO NO PRIMITIVA (DDA)
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
        // Dibujamos con un grosor de 3x3 para mejor visibilidad
        ctx.fillRect(Math.round(x) - 1, Math.round(convertY(y)) - 1, 3, 3);
        x += xInc;
        y += yInc;
    }
}

// ======================================================
// ALGORITMO DE RECORTE DE COHEN-SUTHERLAND
// ======================================================
function drawClippedLine(x1, y1, x2, y2, color) {
    let code1 = computeCode(x1, y1);
    let code2 = computeCode(x2, y2);
    let accept = false;

    // Guardamos originales para dibujar la línea "fantasma" de fondo
    let origX1 = x1, origY1 = y1, origX2 = x2, origY2 = y2;

    while (true) {
        if (!(code1 | code2)) { 
            // Aceptación trivial
            accept = true; 
            break; 
        } else if (code1 & code2) { 
            // Rechazo trivial
            break; 
        } else {
            // Recorte necesario: elegir un punto fuera
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
                x1 = x; y1 = y;
                code1 = computeCode(x1, y1);
            } else {
                x2 = x; y2 = y;
                code2 = computeCode(x2, y2);
            }
        }
    }

    // Dibujar línea original en gris muy claro
    drawLineDDA(origX1, origY1, origX2, origY2, "#f0f0f0");
    
    // Dibujar la parte aceptada en el color del caso
    if (accept) {
        drawLineDDA(x1, y1, x2, y2, color);
    }
}

// ======================================================
// DEFINICIÓN DE ESCENAS (5 CASOS)
// ======================================================
const scenes = [
    {
        name: "1. Dentro del Viewport",
        coords: () => ({ x1: xmin + 50, y1: ymin + 50, x2: xmax - 50, y2: ymax - 50 }),
        color: "#10b981" // Verde
    },
    {
        name: "2. Fuera del Viewport",
        coords: () => ({ x1: xmin - 100, y1: ymin - 100, x2: xmin - 20, y2: ymin - 20 }),
        color: "#ef4444" // Rojo
    },
    {
        name: "3. Tocando una Esquina",
        coords: () => ({ x1: xmin - 50, y1: ymin - 50, x2: xmin, y2: ymin }),
        color: "#f59e0b" // Naranja
    },
    {
        name: "4. Atraviesa de Arriba a Abajo",
        coords: () => ({ x1: (xmin + xmax) / 2, y1: ymin - 50, x2: (xmin + xmax) / 2, y2: ymax + 50 }),
        color: "#8b5cf6" // Morado
    },
    {
        name: "5. Superior y Lateral",
        coords: () => ({ x1: xmin - 50, y1: ymax - 50, x2: xmin + 50, y2: ymax + 50 }),
        color: "#3b82f6" // Azul
    }
];

let currentScene = 0;

// ======================================================
// LÓGICA DE CONTROL Y RENDER
// ======================================================

function updateBounds() {
    xmin = parseInt(document.getElementById("xmin").value);
    ymin = parseInt(document.getElementById("ymin").value);
    xmax = parseInt(document.getElementById("xmax").value);
    ymax = parseInt(document.getElementById("ymax").value);
}

function drawViewport() {
    // Dibujamos el marco del viewport usando DDA
    drawLineDDA(xmin, ymin, xmax, ymin, "black");
    drawLineDDA(xmax, ymin, xmax, ymax, "black");
    drawLineDDA(xmax, ymax, xmin, ymax, "black");
    drawLineDDA(xmin, ymax, xmin, ymin, "black");
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateBounds();
    drawViewport();

    const scene = scenes[currentScene];
    const pts = scene.coords(); // Obtener coordenadas dinámicas
    
    document.getElementById("caseName").innerText = scene.name;
    
    // Llamada principal al algoritmo de recorte
    drawClippedLine(pts.x1, pts.y1, pts.x2, pts.y2, scene.color);
}

// Asignación de eventos a botones
document.getElementById("updateBtn").onclick = render;
document.getElementById("nextBtn").onclick = () => { currentScene = (currentScene + 1) % scenes.length; render(); };
document.getElementById("prevBtn").onclick = () => { currentScene = (currentScene - 1 + scenes.length) % scenes.length; render(); };
document.getElementById("firstBtn").onclick = () => { currentScene = 0; render(); };
document.getElementById("lastBtn").onclick = () => { currentScene = scenes.length - 1; render(); };

// Ejecución inicial
render();