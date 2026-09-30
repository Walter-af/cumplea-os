// ============================================================
//  PERSONALIZA AQUI
// ============================================================
const NOMBRE = "MILENA";              // <-- pon el nombre de tu amiga
const MENSAJE = "FELIZ CUMPLEAÑOS";   // <-- tu mensaje

// Busca el elemento <canvas> del HTML
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;

// Tamano base que se adapta a pantallas pequenas (celular) y grandes
const unit = Math.min(W, H) / 700;

// ------------------------------------------------------------
//  TEXTO (se dibuja una vez para leer sus pixeles)
// ------------------------------------------------------------
ctx.fillStyle = "white";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

ctx.font = `bold ${Math.min(70 * unit, W / 9)}px Georgia`;
ctx.fillText(MENSAJE, W / 2, H * 0.80);

ctx.font = `bold ${Math.min(50 * unit, W / 12)}px Georgia`;
ctx.fillText(NOMBRE, W / 2, H * 0.80 + 70 * unit);

const imageData = ctx.getImageData(0, 0, W, H);
ctx.clearRect(0, 0, W, H);

// ------------------------------------------------------------
//  ARRAYS
// ------------------------------------------------------------
const particles = [];
const stars = [];

// Estrellas del fondo
for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        radius: Math.random() * 1.5,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random(),
        alphaSpeed: Math.random() * 0.02 + 0.005
    });
}

// Mouse
const mouse = { x: -9999, y: -9999, radius: 100 };

window.addEventListener("mousemove", function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// En celular: el dedo tambien mueve las particulas
window.addEventListener("touchmove", function (event) {
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
});
window.addEventListener("touchend", function () {
    mouse.x = -9999;
    mouse.y = -9999;
});

// ------------------------------------------------------------
//  FLORES
//  x, y  -> posicion de la flor (0 a 1 respecto a la pantalla)
//  size  -> tamano de los petalos
//  petals-> cantidad de petalos
//  color -> color de los petalos
//  center-> color del centro
//  bend  -> curvatura del tallo
// ------------------------------------------------------------
const stemBase = { x: 0.5, y: 0.74 };

const flowers = [
    { x: 0.50, y: 0.30, size: 105, petals: 8, color: [335, 100, 68], center: [45, 100, 60], bend: 0 },
    { x: 0.30, y: 0.42, size: 78, petals: 6, color: [45, 100, 65], center: [20, 100, 55], bend: -60 },
    { x: 0.70, y: 0.42, size: 78, petals: 6, color: [270, 90, 75], center: [45, 100, 60], bend: 60 },
    { x: 0.16, y: 0.56, size: 52, petals: 5, color: [190, 90, 68], center: [45, 100, 60], bend: -90 },
    { x: 0.84, y: 0.56, size: 52, petals: 5, color: [15, 100, 70], center: [50, 100, 65], bend: 90 }
];

// Convierte [h, s, l] a texto de color, con una pequena variacion
function hsl(c, variation) {
    const l = Math.max(30, Math.min(90, c[2] + variation));
    return `hsl(${c[0]}, ${c[1]}%, ${l}%)`;
}

function createFlowers() {
    flowers.forEach((f, index) => {

        const cx = W * f.x;
        const cy = H * f.y;
        const R = f.size * unit;
        const phase = index * 1.3;

        // ---------- TALLO ----------
        const sx = W * stemBase.x;
        const sy = H * stemBase.y;

        // punto de control de la curva del tallo
        const ctrlX = (sx + cx) / 2 + f.bend * unit;
        const ctrlY = (sy + cy) / 2 + 30 * unit;

        const stemCount = Math.floor(160 * (f.size / 100) + 60);

        for (let i = 0; i < stemCount; i++) {
            const t = Math.random();

            // Curva de Bezier cuadratica
            const px = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * ctrlX + t * t * cx;
            const py = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * ctrlY + t * t * cy;

            const jx = (Math.random() - 0.5) * 4;
            const jy = (Math.random() - 0.5) * 4;

            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                baseX: px + jx,
                baseY: py + jy,
                targetX: px + jx,
                targetY: py + jy,
                type: "stem",
                sway: t,                 // mas movimiento cerca de la flor
                phase: phase,
                color: hsl([135, 55, 45], Math.random() * 14 - 7)
            });
        }

        // ---------- HOJA en el tallo ----------
        const leafT = 0.55;
        const lx = (1 - leafT) * (1 - leafT) * sx + 2 * (1 - leafT) * leafT * ctrlX + leafT * leafT * cx;
        const ly = (1 - leafT) * (1 - leafT) * sy + 2 * (1 - leafT) * leafT * ctrlY + leafT * leafT * cy;
        const dir = f.bend >= 0 ? 1 : -1;

        for (let i = 0; i < 90; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random());
            // elipse inclinada = hoja
            const ex = Math.cos(a) * r * 26 * unit;
            const ey = Math.sin(a) * r * 10 * unit;
            const rot = -0.5 * dir;
            const hx = lx + dir * 22 * unit + ex * Math.cos(rot) - ey * Math.sin(rot);
            const hy = ly + ex * Math.sin(rot) + ey * Math.cos(rot);

            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                baseX: hx,
                baseY: hy,
                targetX: hx,
                targetY: hy,
                type: "stem",
                sway: 0.5,
                phase: phase,
                color: hsl([140, 55, 42], Math.random() * 14 - 7)
            });
        }

        // ---------- PETALOS ----------
        const petalCount = Math.floor(350 + f.size * 6);

        for (let i = 0; i < petalCount; i++) {
            const angle = Math.random() * Math.PI * 2;

            // Borde con forma de petalos: ondula segun la cantidad de petalos
            const edge = R * (0.55 + 0.45 * Math.abs(Math.cos((f.petals * angle) / 2)));

            // sqrt para que las particulas se repartan parejo
            const dist = Math.sqrt(Math.random()) * edge;

            const ox = Math.cos(angle) * dist;
            const oy = Math.sin(angle) * dist;

            // Centro de la flor con otro color
            const isCenter = dist < R * 0.2;
            const base = isCenter ? f.center : f.color;

            // Mas claro hacia el borde del petalo
            const shade = isCenter ? Math.random() * 10 - 5 : (dist / edge) * 12 - 6;

            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                baseX: cx + ox,
                baseY: cy + oy,
                targetX: cx + ox,
                targetY: cy + oy,
                centerX: cx,
                centerY: cy,
                type: "flower",
                phase: phase,
                color: hsl(base, shade)
            });
        }
    });
}

createFlowers();

// ------------------------------------------------------------
//  PARTICULAS DEL TEXTO
// ------------------------------------------------------------
for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {

        const index = (y * W + x) * 4;
        const alpha = imageData.data[index + 3];

        if (alpha > 128) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                targetX: x,
                targetY: y,
                type: "text",
                color: "#fff3c4"
            });
        }
    }
}

// ------------------------------------------------------------
//  ANIMACION
// ------------------------------------------------------------
function animate() {

    ctx.clearRect(0, 0, W, H);

    const time = Date.now();

    // Las flores "respiran" suavemente
    const beat = 1 + Math.sin(time * 0.003) * 0.04;

    // ---- Estrellas ----
    ctx.shadowBlur = 0;

    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        star.alpha += star.alphaSpeed;

        if (star.alpha >= 1 || star.alpha <= 0.2) {
            star.alphaSpeed *= -1;
        }

        star.y += star.speed;

        if (star.y > H) {
            star.y = 0;
            star.x = Math.random() * W;
        }
    }

    // ---- Particulas ----
    for (let particle of particles) {

        if (particle.type === "flower") {
            // Se escala desde el centro de su flor + un balanceo suave
            const sway = Math.sin(time * 0.0015 + particle.phase) * 6 * unit;

            particle.targetX = particle.centerX + (particle.baseX - particle.centerX) * beat + sway;
            particle.targetY = particle.centerY + (particle.baseY - particle.centerY) * beat;
        }

        if (particle.type === "stem") {
            // Los tallos se mueven mas cerca de la flor y casi nada en la base
            const sway = Math.sin(time * 0.0015 + particle.phase) * 6 * unit * particle.sway;

            particle.targetX = particle.baseX + sway;
        }

        // Efecto del mouse: empuja las particulas
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            particle.x += dx / 10;
            particle.y += dy / 10;
        }

        // Se mueve poco a poco hacia su destino
        particle.x += (particle.targetX - particle.x) * 0.12;
        particle.y += (particle.targetY - particle.y) * 0.12;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
    }

    requestAnimationFrame(animate);
}

animate();
