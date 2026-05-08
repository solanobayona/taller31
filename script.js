// ======================================================
// CANVAS
// ======================================================

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

// ======================================================
// VARIABLES DE RECORTE
// ======================================================

let xmin = 150;
let ymin = 100;

let xmax = 500;
let ymax = 350;

// ======================================================
// ESCENAS
// ======================================================

// Casos de prueba
const scenes = [

    {
        name:"Dentro",
        x1:200,
        y1:150,
        x2:450,
        y2:300
    },

    {
        name:"Fuera",
        x1:50,
        y1:50,
        x2:100,
        y2:80
    },

    {
        name:"Entrando",
        x1:50,
        y1:200,
        x2:300,
        y2:200
    },

    {
        name:"Saliendo",
        x1:250,
        y1:250,
        x2:650,
        y2:450
    },

    {
        name:"Atravesando",
        x1:50,
        y1:50,
        x2:650,
        y2:400
    }

];

// ======================================================
// CONVERSIÓN DE COORDENADAS
// ======================================================

function convertY(y){

    return canvas.height - y;

}

// ======================================================
// FUNCIÓN DDA
// ======================================================

// Función personalizada para dibujar líneas
function drawLineDDA(x1,y1,x2,y2,color){

    let dx = x2 - x1;
    let dy = y2 - y1;

    let steps = Math.max(
        Math.abs(dx),
        Math.abs(dy)
    );

    let xIncrement = dx / steps;
    let yIncrement = dy / steps;

    let x = x1;
    let y = y1;

    ctx.fillStyle = color;

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
// VIEWPORT
// ======================================================

function drawViewport(){

    drawLineDDA(
        xmin,
        ymin,
        xmax,
        ymin,
        "black"
    );

    drawLineDDA(
        xmax,
        ymin,
        xmax,
        ymax,
        "black"
    );

    drawLineDDA(
        xmax,
        ymax,
        xmin,
        ymax,
        "black"
    );

    drawLineDDA(
        xmin,
        ymax,
        xmin,
        ymin,
        "black"
    );

}

// ======================================================
// PRUEBA
// ======================================================

drawViewport();

let line = scenes[0];

drawLineDDA(
    line.x1,
    line.y1,
    line.x2,
    line.y2,
    "blue"
);