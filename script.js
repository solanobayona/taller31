// Obtener canvas
const canvas = document.getElementById("canvas");

// Contexto
const ctx = canvas.getContext("2d");

// Convertir coordenada Y
function convertY(y){

    return canvas.height - y;

}

// Dibujar cuadrado de prueba
ctx.fillStyle = "red";

ctx.fillRect(
    50,
    convertY(50),
    10,
    10
);
// Limpiar canvas
function clearCanvas(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}