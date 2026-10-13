# Trabajo práctico 04

## Descripción
Aplicación web renderizada en el servidor con Node.js, Express, EJS y express-ejs-layouts para consultar un catálogo de mascotas en adopción y registrar temporalmente nuevas mascotas mediante un formulario HTML con validación y conservación de valores.

## Instalación
1. Clonar el repositorio y ubicarse en el directorio raíz del proyecto.
2. Instalar las dependencias declaradas en package.json:
npm install

## Ejecución
Para iniciar el servidor luego de cargar de forma asíncrona los datos iniciales desde datos/mascotas.json:
npm start

El servidor quedará disponible en http://localhost:3000.

Para comprobar la sintaxis de src/index.js y src/archivos.js:
npm run check

## Páginas y rutas
El contrato HTTP obligatorio produce páginas HTML renderizadas:
- GET / : Responde estado 200 y renderiza views/inicio.ejs con el título principal, explicación del refugio y enlace visible a /mascotas.
- GET /mascotas : Responde estado 200 y renderiza views/mascotas/lista.ejs recorriendo el arreglo con forEach, mostrando tarjetas con nombre, especie, edad, estado, enlace al detalle /mascotas/:id, enlace al formulario /mascotas/nueva y mensaje alternativo cuando la colección está vacía.
- GET /mascotas/nueva : Declarada antes de GET /mascotas/:id. Responde estado 200 y renderiza views/mascotas/nueva.ejs con el formulario HTML (action="/mascotas" y method="post").
- GET /mascotas/:id : Convierte req.params.id a número y busca con find. Si existe, responde 200 y renderiza views/mascotas/detalle.ejs con todos los datos, imagen con alt y enlace de regreso. Si no existe, responde 404 y renderiza la página HTML views/no-encontrado.ejs.
- POST /mascotas : Procesa los datos del formulario enviados mediante req.body.

## Estructura de vistas
- Diferencia entre layout, vista y parcial:
  - Layout (views/layouts/main.ejs): Define la estructura HTML5 global compartida por todas las páginas (<!doctype html>, <html lang="es">, <meta charset="utf-8">, viewport, <title><%= title %></title> escapado, hoja /css/estilos.css, inclusión de parciales, <main class="contenedor"><%- body %></main> y <script src="/js/app.js"></script>).
  - Vista (inicio.ejs, no-encontrado.ejs, mascotas/lista.ejs, mascotas/detalle.ejs, mascotas/nueva.ejs): Representa el contenido específico de cada pantalla que se inyecta en <%- body %>. Todas las propiedades de las mascotas se imprimen escapadas con <%= ... %>.
  - Parcial (views/partials/encabezado.ejs y views/partials/pie.ejs): Fragmentos reutilizables incluidos con <%- include(...) %> para mostrar la barra de navegación (enlaces a /, /mascotas y /mascotas/nueva) y el pie de página en todo el sitio.
- Datos enviados mediante res.render: Cada ruta invoca res.render(nombreVista, datos) pasando un objeto con title y los datos necesarios (mascotas, mascota, error, valores) para que EJS genere el HTML final.

## Recursos estáticos
- Función de express.static: Configura la carpeta public/ como raíz de archivos estáticos (app.use(express.static(path.join(__dirname, '..', 'public')))), permitiendo servir archivos directamente al navegador sin anteponer /public en las URLs del HTML:
  - /css/estilos.css: Define variables de color, tipografía, contenedor de ancho máximo, navegación, grilla adaptable (.grilla-mascotas), tarjetas (.tarjeta), formulario, botón principal, alerta de error y estilo :focus-visible.
  - /img/mascota.svg: Ilustración vectorial SVG local asignada a cada mascota.
  - /js/app.js: Script estático del cliente con mensaje en consola (console.log).

## Formulario
- Función de express.urlencoded({ extended: false }): Middleware de Express que lee el cuerpo de las solicitudes POST enviadas por formularios HTML (application/x-www-form-urlencoded) y lo transforma en el objeto req.body.
- Controles y validación: El formulario en views/mascotas/nueva.ejs usa action="/mascotas" y method="post". Incluye etiquetas <label for="..."> asociadas a controles con id y name para nombre, especie, edad, estado (<select> con "En adopción", "Reservada" y "Adoptada") y descripcion.
- Recorrido POST, redirección y GET:
  1. El usuario completa el formulario en GET /mascotas/nueva y envía POST /mascotas.
  2. El servidor lee req.body, convierte edad a número con Number(...) y comprueba que todos los campos estén completos, que edad sea numérica igual o mayor que 0 y que estado sea uno de los valores permitidos.
  3. Si hay error: Responde con código 400, vuelve a renderizar mascotas/nueva, muestra el mensaje dentro de un contenedor con role="alert" y conserva los valores ingresados en valores.
  4. Si es válido: Calcula el nuevo id numérico a partir del último elemento, asigna /img/mascota.svg, agrega la mascota al arreglo en memoria con mascotas.push(...) y ejecuta res.redirect('/mascotas') (estado 302), provocando una nueva solicitud GET /mascotas donde se visualiza la tarjeta recién creada.

## Persistencia de los datos
Los datos iniciales se leen una única vez desde datos/mascotas.json al iniciar el servidor y se mantienen en un arreglo en la memoria RAM del proceso de Node.js. Cuando se registra una nueva mascota mediante POST /mascotas, el objeto se agrega únicamente al arreglo en memoria y no se escribe en el archivo JSON. Por lo tanto, los nuevos registros permanecen visibles mientras el servidor continúe activo, pero desaparecen al detener y reiniciar el proceso con npm start, volviendo a los cinco registros iniciales.

### Matriz de pruebas verificada
- Inicio (GET /): Responde 200, título principal y enlace al catálogo.
- Listado (GET /mascotas): Responde 200 y muestra las 5 mascotas iniciales con sus tarjetas y enlaces.
- Estado vacío: Al pasar un arreglo vacío [] a la vista mascotas/lista, responde 200 y muestra el mensaje alternativo (código restaurado luego de la prueba).
- Detalle válido (GET /mascotas/1): Responde 200, muestra todos los datos de la mascota, imagen SVG con alt y enlace de regreso.
- Detalle inexistente (GET /mascotas/999): Responde 404 y renderiza views/no-encontrado.ejs.
- Formulario (GET /mascotas/nueva): Responde 200 con todos los campos etiquetados (id y name).
- Envío incompleto o edad inválida (POST /mascotas): Responde 400, muestra alerta con role="alert" y conserva los valores ingresados.
- Envío válido (POST /mascotas): Redirige (302) a GET /mascotas (200) mostrando la nueva tarjeta con /img/mascota.svg.
- Recursos estáticos (/css/estilos.css, /img/mascota.svg, /js/app.js): Responden 200 y se aplican correctamente.
- Reinicio del servidor: Al reiniciar con npm start, el listado regresa a las 5 mascotas originales.
