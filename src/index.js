const express = require('express');
const path = require('node:path');
const expressLayouts = require('express-ejs-layouts');
const { leerDatosJson } = require('./archivos.js');

const ESTADOS_PERMITIDOS = ['En adopción', 'Reservada', 'Adoptada'];

async function main() {
    try {
        const rutaDatos = path.join(__dirname, '..', 'datos', 'mascotas.json');
        const mascotas = await leerDatosJson(rutaDatos);

        const app = express();

        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, '..', 'views'));
        app.use(expressLayouts);
        app.set('layout', 'layouts/main');

        app.use(express.static(path.join(__dirname, '..', 'public')));
        app.use(express.urlencoded({ extended: false }));

        app.get('/', (req, res) => {
            res.status(200).render('inicio', {
                title: 'Inicio | Refugio Huellas'
            });
        });

        app.get('/mascotas', (req, res) => {
            res.status(200).render('mascotas/lista', {
                title: 'Catálogo de Mascotas en Adopción',
                mascotas: mascotas
            });
        });

        app.get('/mascotas/nueva', (req, res) => {
            res.status(200).render('mascotas/nueva', {
                title: 'Registrar Nueva Mascota',
                error: null,
                valores: {
                    nombre: '',
                    especie: '',
                    edad: '',
                    estado: 'En adopción',
                    descripcion: ''
                }
            });
        });

        app.get('/mascotas/:id', (req, res) => {
            const idBuscado = Number(req.params.id);
            const mascota = mascotas.find(item => item.id === idBuscado);

            if (!mascota) {
                return res.status(404).render('no-encontrado', {
                    title: 'Mascota no encontrada'
                });
            }

            res.status(200).render('mascotas/detalle', {
                title: `Detalle de ${mascota.nombre}`,
                mascota: mascota
            });
        });

        app.post('/mascotas', (req, res) => {
            const nombre = req.body.nombre ? req.body.nombre.trim() : '';
            const especie = req.body.especie ? req.body.especie.trim() : '';
            const edadTexto = req.body.edad !== undefined ? String(req.body.edad).trim() : '';
            const estado = req.body.estado ? req.body.estado.trim() : '';
            const descripcion = req.body.descripcion ? req.body.descripcion.trim() : '';

            const edadNumero = Number(edadTexto);
            const edadValida = edadTexto !== '' && !Number.isNaN(edadNumero) && edadNumero >= 0;
            const estadoValido = ESTADOS_PERMITIDOS.includes(estado);

            if (!nombre || !especie || !descripcion || !edadValida || !estadoValido) {
                return res.status(400).render('mascotas/nueva', {
                    title: 'Registrar Nueva Mascota',
                    error: 'Por favor completá todos los campos obligatorios, ingresá una edad igual o mayor que cero y seleccioná un estado válido.',
                    valores: {
                        nombre: req.body.nombre || '',
                        especie: req.body.especie || '',
                        edad: req.body.edad || '',
                        estado: req.body.estado || '',
                        descripcion: req.body.descripcion || ''
                    }
                });
            }

            const ultimoId = mascotas.length > 0 ? mascotas[mascotas.length - 1].id : 0;
            const nuevaMascota = {
                id: ultimoId + 1,
                nombre,
                especie,
                descripcion,
                edad: edadNumero,
                estado,
                imagen: '/img/mascota.svg'
            };

            mascotas.push(nuevaMascota);
            res.redirect('/mascotas');
        });

        app.use((req, res) => {
            res.status(404).render('no-encontrado', {
                title: 'Página no encontrada'
            });
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor web escuchando en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación: no se pudo leer o interpretar datos/mascotas.json.');
        console.error(error.message);
        process.exitCode = 1;
    }
}

main();
