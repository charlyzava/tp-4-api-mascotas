const express = require("express");
const path = require("node:path");

const expressLayouts = require("express-ejs-layouts");

const { leerJson } = require("./archivos");
const PORT = 3000;
const rutaDatos = path.join(__dirname, "..", "datos", "mascotas.json");

async function main() {
 const mascotas = await leerJson(rutaDatos);
 const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(expressLayouts);
app.set("layout", "layouts/main");
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/api/mascotas", (req, res) => {
res.json(mascotas);
});
 
app.get("/", (req, res) => {
 res.render("inicio", { titulo: "Mascotas" });
});

app.get("/mascotas", (req, res) => {
 res.render("mascotas/lista", {
 titulo: "Mascotas",
 mascotas,
 });
});

app.get("/mascotas/nuevo", (req, res) => {
 res.render("mascotas/nuevo", {
    titulo: "Nueva mascota",
    error: null,
    valores: {},
 });
});

app.post("/mascotas", (req, res) => {
 const { nombre, especie, edad, descripcion, estado } = req.body;
 const nombreLimpio = String(nombre ?? "").trim();
 const especieLimpia = String(especie ?? "").trim();
 const descripcionLimpia = String(descripcion ?? "").trim();
 const estadoLimpia = String(estado ?? "").trim();
 const edadLimpia = String(edad ?? "").trim();
 if (
 !nombreLimpio ||
 !especieLimpia ||
 !descripcionLimpia ||
 !edadLimpia || 
 !estadoLimpia
 ) 
 {
 return res.status(400).render("mascotas/nuevo", {
 titulo: "Nueva mascota",
 error: "Completá todos los campos con valores válidos.",
 valores: req.body,
 });
 }
 const ultimoId = mascotas.reduce(
 (mayorId, mascota) => Math.max(mayorId, mascota.id),
 0,
 );
 mascotas.push({
 id: ultimoId + 1,
 nombre: nombreLimpio,
 especie: especieLimpia,
 edad: edadLimpia,
 descripcion: descripcionLimpia,
 estado: estadoLimpia,
 });
 res.redirect("/mascotas");
})

app.get("/mascotas/:id", (req, res) => {
 const id = Number(req.params.id);
 const mascota = mascotas.find((elemento) => elemento.id === id);
 if (!mascota) {
 return res.status(404).render("no-encontrado", {
 titulo: "Mascota no encontrada",
 mensaje: "No existe una mascota con ese identificador.",
 });
 }
 res.render("mascotas/detalle", {
 titulo: mascota.nombre,
 mascota,
 });
});

 app.listen(PORT, () => {
 console.log(`Aplicación disponible en http://localhost:${PORT}`);
 });
}
main().catch((error) => {
 console.error("No se pudo iniciar la aplicación:", error);
 process.exitCode = 1;
});