const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const socket = io(); // Connect to the server

let drawing = false;
let brushSize = 4;
let color = "#000000";

// Resize canvas to fit window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Get mouse position relative to canvas
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

// Start drawing
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const { x, y } = getMousePos(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
});

// Stop drawing
canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});

// Draw while moving mouse
canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const { x, y } = getMousePos(e);
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.beginPath();       
  ctx.moveTo(x, y);

  // Send drawing data to others
  socket.emit("draw", { x, y, color, size: brushSize });
});

// Draw when receiving data from others
socket.on("ondraw", ({ x, y, color, size }) => {
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.beginPath();       
  ctx.moveTo(x, y);
});

// Clear canvas when someone clicks clear
socket.on("onclear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();       
});

// Change brush size
document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = parseInt(e.target.value);
});

// Change brush color
document.getElementById("colorPicker").addEventListener("input", (e) => {
  color = e.target.value;
});

// Clear canvas and notify others
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();      
  socket.emit("clear");
});

// Show user ID on connect
socket.on("connect", () => {
  document.getElementById("userId").textContent = "You: " + socket.id.slice(0, 6);
});
