// ======================================================
// CANVAS
// ======================================================

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

// ======================================================
// CONVERTIR COORDENADAS
// ======================================================

// Convierte coordenadas matemáticas
// a coordenadas del canvas
function convertY(y){

    return canvas.height - y;

}

// ======================================================
// DDA
// ======================================================

// Función personalizada para dibujar líneas
// usando rasterización manual
function drawLineDDA(x1,y1,x2,y2,color){

    // Diferencias
    let dx = x2 - x1;
    let dy = y2 - y1;

    // Cantidad de pasos
    let steps = Math.max(
        Math.abs(dx),
        Math.abs(dy)
    );

    // Incrementos
    let xIncrement = dx / steps;
    let yIncrement = dy / steps;

    // Punto inicial
    let x = x1;
    let y = y1;

    // Color
    ctx.fillStyle = color;

    // Dibujar pixel a pixel
    for(let i = 0; i <= steps; i++){

        ctx.fillRect(

            Math.round(x),

            Math.round(convertY(y)),

            1,

            1

        );

        x += xIncrement;
        y += yIncrement;

    }

}

// ======================================================
// PRUEBA
// ======================================================

drawLineDDA(
    100,
    100,
    400,
    300,
    "blue"
);