import app from "./index.js";

let PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


/*-- NOTA : Para correr test es "npm test"--*/