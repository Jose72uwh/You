import { createApp, ref } from "vue";

const API_KEY = "1076ac03cba68c1680094495c8506ad7";
const ENDPOINT = "https://api.themoviedb.org/3/search/movie";
const NO_POSTER =
  "https://cdn.jsdelivr.net/gh/ivgtr/assets@main/placeholder_movie_dark.png";

// Utilidades para obtener datos bonitos
function anioDe(fecha) {
  if (!fecha) return "Sin año";
  return fecha.slice(0, 4);
}
function ratingPretty(rating) {
  return (rating ?? 0).toFixed(1);
}
function minutosATiempo(mins) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h ? h + "h " : ""}${m}m`;
}

function safe(text) {
  return (text || "").replace(/"/g, '&quot;');
}

// Cambiado: QUITADO SANDBOX
function generarHTMLPelicula(pelicula, detalles, extra = {}) {
  // Extraer info
  const poster = pelicula.poster_path
    ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`
    : NO_POSTER;
  const backdrop = pelicula.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${pelicula.backdrop_path}`
    : poster;

  const generos =
    detalles?.genres?.map((g) => g.name).join(", ") || "Sin géneros";

  const paises =
    detalles?.production_countries?.map((c) => c.name).join(", ") ||
    "Desconocido";

  const directores =
    (detalles?.credits?.crew || [])
      .filter((p) => p.job === "Director")
      .map((p) => p.name)
      .join(", ") || "Desconocido";

  const duration =
    detalles?.runtime ? minutosATiempo(detalles.runtime) : "";

  const idioma =
    detalles?.spoken_languages?.[0]?.english_name ||
    detalles?.original_language ||
    "Desconocido";

  const overview = pelicula.overview || "Sin sinopsis.";

  const idFavorito = `${pelicula.title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/--+/g, "-")}-${anioDe(pelicula.release_date)}`;

  const tmdbId = pelicula.id;

  // Utilizar links de video proporcionados por el usuario si existen (extra)
  const jwSources = extra.jwSources || [
    {
      file: "https://example.com/video.mp4",
      type: "video/mp4",
      label: "1080p"
    },
    {
      file: "https://example.com/video720p.mp4",
      type: "video/mp4",
      label: "720p"
    }
  ];
  const externo1Url = extra.externo1Url || "https://example.com/embed1?autoplay=1";
  const externo2Url = extra.externo2Url || "https://example.com/embed2?autoplay=1";

  // PLANTILLA HTML NUEVO SIN SANDBOX
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safe(pelicula.title)} - Generador TMDB</title>

    <!-- Fuentes y estilos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- JWPlayer -->
    <script src="https://ssl.p.jwpcdn.com/player/v/8.18.4/jwplayer.js"></script>
    <script type="text/javascript">jwplayer.key = "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99";</script>

    <style>
        :root {
            --primary-color: #01b4e4;
            --secondary-color: #032541;
            --accent-color: #ff0000;
            --text-color: #ffffff;
            --bg-gradient: linear-gradient(to right, #000, #333, #222);
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #121212;
            color: var(--text-color);
            margin: 0;
            padding: 0;
        }

        .post-header::before {
            content: "";
            color: white;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 1.1)),
            url('${safe(backdrop)}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            z-index: -1;
        }

        .post-header {
            position: relative;
            padding: 30px;
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            align-items: flex-end;
            min-height: 60vh;
            margin-bottom: 50px;
        }

        .image-and-btn {
            position: relative;
            width: 300px;
            flex-shrink: 0;
        }

        .poster-img {
            width: 100%;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease;
        }

        .poster-img:hover {
            transform: scale(1.03);
        }

        .post-header__info {
            flex: 1;
            min-width: 300px;
        }

        .post-header__info h1 {
            font-size: 2.5rem;
            margin: 0 0 15px 0;
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8);
        }

        .post-header__info ul {
            list-style: none;
            padding: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
        }

        .post-header__info ul li {
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .resume {
            font-size: 1.1rem;
            line-height: 1.6;
            max-width: 800px;
        }

        .more-data {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }

        .more-data p {
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
        }

        /* Botón Reproducir */
        .reproducir-btn {
            padding: 12px 25px;
            background-color: var(--accent-color);
            color: var(--text-color);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1rem;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
            margin: 10px 0;
        }

        .reproducir-btn:hover {
            background-color: #cc0000;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
        }

        /* Ventana emergente de reproducción */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .modal-container {
            background: var(--bg-gradient);
            border: 2px solid var(--primary-color);
            border-radius: 15px;
            width: 90%;
            max-width: 700px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            animation: modalFadeIn 0.3s ease-out;
        }

        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid var(--primary-color);
        }

        .modal-title {
            margin: 0;
            color: var(--text-color);
            font-size: 1.3rem;
        }

        .close-btn {
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s;
        }

        .close-btn:hover {
            color: var(--accent-color);
        }

        .modal-content {
            padding: 15px;
        }

        /* Contenedores para reproductores */
        .player-container {
            width: 100%;
            height: 0;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            position: relative;
            background: #000;
            margin-bottom: 15px;
        }

        .player-container #megaplay,
        .player-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }

         .player-container.hidden {
             display: none;
         }


        /* Estilos para los botones de servidor */
        .servidor-btn {
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--primary-color);
            border-radius: 20px;
            color: var(--text-color);
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            width: 100%; /* Hacer botones de servidor de ancho completo */
            box-sizing: border-box;
            justify-content: center; /* Centrar contenido del botón */
        }

        .servidor-btn i {
            font-size: 1.2rem;
        }

        .servidor-btn:hover {
            background: rgba(1, 180, 228, 0.2);
        }

        .servidor-btn.active {
            background: var(--primary-color);
            color: #000;
            font-weight: bold;
        }

        .servidor-externo1 {
            background: rgba(76, 175, 80, 0.2);
            border-color: #4CAF50;
        }

        .servidor-externo1:hover {
            background: rgba(76, 175, 80, 0.4);
        }

        .servidor-externo2 {
            background: rgba(156, 39, 176, 0.2);
            border-color: #9C27B0;
        }

        .servidor-externo2:hover {
            background: rgba(156, 39, 176, 0.4);
        }

        /* Botón de favoritos */
        #favoritoBtn {
            width: 100%;
            margin-top: 15px;
            font-weight: 700;
            color: white;
            font-size: 1rem;
            background: rgba(0, 0, 0, 0.5);
            padding: 12px;
            border: 2px solid white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        #favoritoBtn:hover {
            background: rgba(121, 121, 255, 0.5);
            transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .post-header {
                padding: 20px;
                min-height: auto;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .image-and-btn {
                width: 200px;
            }

            .post-header__info h1 {
                font-size: 1.8rem;
            }

            .modal-container {
                width: 95%;
            }

            .player-container {
                padding-bottom: 56.25%; /* 16:9 en móviles */
            }
        }
    </style>
</head>
<body>
    <div class="post-header">
        <div class="image-and-btn">
            <img src="${safe(poster)}" class="poster-img" alt="${safe(pelicula.title)}" loading="lazy">

            <button id="favoritoBtn" data-identificador="${idFavorito}" onclick="toggleFavorito()">
                <i class="far fa-heart"></i> Agregar a Favoritos
            </button>

            <div id="favoritoData" style="display: none;">
                <img id="favoritoImagen" class="poster" src="${safe(
                  poster
                )}" alt="Poster de ${safe(pelicula.title)}" loading="lazy">
                <a id="favoritoEnlace" href="go:"></a>
                <span id="nombre">${safe(pelicula.title)}</span>
                <span id="tmdbId">${tmdbId}</span>
            </div>
        </div>

        <div class="post-header__info">
            <h1>${safe(pelicula.title)}</h1>
            <ul>
                <li><i class="fas fa-star"></i> ${ratingPretty(pelicula.vote_average)}/10</li>
                <li><i class="fas fa-clock"></i> ${duration}</li>
                <li><i class="fas fa-calendar-alt"></i> ${anioDe(pelicula.release_date)}</li>
                <li><i class="fas fa-closed-captioning"></i> ${safe(idioma)}</li>
            </ul>

            <p class="resume">${safe(overview)}</p>

            <div class="more-data">
                <p><i class="fas fa-film"></i> ${safe(generos)}</p>
                <p><i class="fas fa-globe"></i> ${safe(paises)}</p>
                <p><i class="fas fa-user"></i> ${safe(directores)}</p>
            </div>
        </div>
    </div>

    <center>
        <button class="reproducir-btn" id="abrirModalBtn">
            <i class="fas fa-play"></i> Reproducir
        </button>
    </center>

    <!-- Ventana modal de reproducción -->
    <div class="modal-overlay" id="modalOverlay">
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">Reproduciendo: ${safe(pelicula.title)}</h3>
                <button class="close-btn" id="cerrarModalBtn">&times;</button>
            </div>
            <div class="modal-content">
                <!-- Contenedores para reproductores -->
                <div class="player-container" id="jwContainer">
                    <div id="megaplay"></div>
                </div>

                <div class="player-container hidden" id="externo1Container">
                    <iframe id="externo1Frame" src="" allowfullscreen></iframe>
                </div>

                <div class="player-container hidden" id="externo2Container">
                    <iframe id="externo2Frame" src="" allowfullscreen></iframe>
                </div>

                <!-- Opciones de servidor -->
                <div class="servidores-container">
                    <h4 style="color: var(--primary-color); margin-bottom: 15px;">
                        <i class="fas fa-server"></i> Servidores disponibles:
                    </h4>

                    <button class="servidor-btn active" onclick="cambiarServidor('jwplayer', this)">
                        <i class="fas fa-play-circle"></i> JWPlayer HD
                    </button>

                    <button class="servidor-btn servidor-externo1" onclick="cambiarServidor('externo1', this)">
                        <i class="fas fa-external-link-alt"></i> Reproductor Externo 1
                    </button>

                    <button class="servidor-btn servidor-externo2" onclick="cambiarServidor('externo2', this)">
                        <i class="fas fa-external-link-alt"></i> Reproductor Externo 2
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Variables para el reproductor
        let jwPlayerInstance = null;
        const modalOverlay = document.getElementById('modalOverlay');
        const abrirModalBtn = document.getElementById('abrirModalBtn');
        const cerrarModalBtn = document.getElementById('cerrarModalBtn');
        const jwContainer = document.getElementById('jwContainer');
        const externo1Container = document.getElementById('externo1Container');
        const externo1Frame = document.getElementById('externo1Frame');
        const externo2Container = document.getElementById('externo2Container');
        const externo2Frame = document.getElementById('externo2Frame');

        // URLs de los videos
        const videoUrls = {
            jwplayer: {
                sources: ${JSON.stringify(jwSources)},
                image: "${safe(poster)}"
            },
            externo1: "${externo1Url}",
            externo2: "${externo2Url}"
        };

        // Abrir modal
        abrirModalBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Seleccionar el primer botón (JWPlayer) y simular clic para activar el servidor por defecto
            const primerBoton = document.querySelector('.servidores-container .servidor-btn:first-child');
            if (primerBoton) {
                 cambiarServidor(primerBoton.onclick.toString().match(/cambiarServidor\\('(\\w+)'/)[1], primerBoton);
            }
        });

        // Cerrar modal
        cerrarModalBtn.addEventListener('click', cerrarModal);

        // Cerrar al hacer clic fuera del modal
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                cerrarModal();
            }
        });

        function cerrarModal() {
            if (jwPlayerInstance) {
                jwPlayerInstance.stop();
            }
            externo1Frame.src = '';
            externo2Frame.src = '';
            modalOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Cambiar entre servidores
        function cambiarServidor(tipo, clickedButton) {
            jwContainer.classList.add('hidden');
            externo1Container.classList.add('hidden');
            externo2Container.classList.add('hidden');
            if (jwPlayerInstance) {
                jwPlayerInstance.stop();
            }
            externo1Frame.src = '';
            externo2Frame.src = '';
            switch(tipo) {
                case 'jwplayer':
                    jwContainer.classList.remove('hidden');
                    initJWPlayer();
                    break;
                case 'externo1':
                    externo1Container.classList.remove('hidden');
                    externo1Frame.src = videoUrls.externo1;
                    break;
                case 'externo2':
                    externo2Container.classList.remove('hidden');
                    externo2Frame.src = videoUrls.externo2;
                    break;
            }
            document.querySelectorAll('.servidor-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            if (clickedButton) {
                 clickedButton.classList.add('active');
            }
        }

        // Inicializar JWPlayer
        function initJWPlayer() {
            if (!jwPlayerInstance) {
                jwPlayerInstance = jwplayer("megaplay").setup({
                    sources: videoUrls.jwplayer.sources,
                    aspectratio: "16:9",
                    width: "100%",
                    height: "100%",
                    autostart: true,
                    image: videoUrls.jwplayer.image,
                    skin: {
                        name: "bekle"
                    }
                });

                jwPlayerInstance.on('error', function() {
                    alert('Error al cargar JWPlayer. Intenta con otro servidor.');
                    const activeBtn = document.querySelector('.servidor-btn.active');
                    const nextBtn = activeBtn ? activeBtn.nextElementSibling : document.querySelector('.servidor-btn');
                    if(nextBtn) {
                         const nextType = nextBtn.onclick.toString().match(/cambiarServidor\\('(\\w+)'/)[1];
                         cambiarServidor(nextType, nextBtn);
                    }
                });
            } else {
                jwPlayerInstance.load(videoUrls.jwplayer.sources);
                jwPlayerInstance.play();
            }
        }

        // Gestión de favoritos
        const favoritoBtn = document.getElementById('favoritoBtn');
        const identificador = favoritoBtn.getAttribute('data-identificador');

        function toggleFavorito() {
            const favoritoEnlace = document.getElementById('favoritoEnlace');
            const imagen = document.getElementById('favoritoImagen').src;
            const nombre = document.getElementById('nombre').textContent;
            const tmdbId = document.getElementById('tmdbId').textContent;

            const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
            const encontrado = favoritos.some(favorito => favorito.identificador === identificador);

            if (encontrado) {
                const nuevosFavoritos = favoritos.filter(favorito => favorito.identificador !== identificador);
                localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
                favoritoBtn.innerHTML = '<i class="far fa-heart"></i> Agregar a Favoritos';
                alert('Removido de favoritos');
            } else {
                favoritos.push({
                    identificador: identificador,
                    imagen: imagen,
                    enlace: favoritoEnlace.href,
                    nombre: nombre,
                    tmdbId: tmdbId,
                    fechaAgregado: new Date().toISOString()
                });

                localStorage.setItem('favoritos', JSON.stringify(favoritos));
                favoritoBtn.innerHTML = '<i class="fas fa-heart"></i> Quitar de Favoritos';
                alert('Agregado a favoritos');
            }
        }

        // Verificar estado inicial del favorito
        document.addEventListener('DOMContentLoaded', () => {
            const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
            const encontradoInicial = favoritos.some(favorito => favorito.identificador === identificador);

            if (encontradoInicial) {
                favoritoBtn.innerHTML = '<i class="fas fa-heart"></i> Quitar de Favoritos';
            } else {
                favoritoBtn.innerHTML = '<i class="far fa-heart"></i> Agregar a Favoritos';
            }
        });
    </script>
</body>
</html>
`;

}

async function obtenerDetallesPelicula(id) {
  // Petición a /movie/{id}?append_to_response=credits
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES&append_to_response=credits`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

createApp({
  setup() {
    const query = ref("");
    const peliculas = ref([]);
    const cargando = ref(false);
    const error = ref("");
    const noPoster = NO_POSTER;
    const codigoFuente = ref("");
    const copiado = ref(false);

    // NUEVO: Enlace para abrir el código en otra página
    const codigoFuenteEnlace = ref("");

    // NUEVO: para guardar hasta 3 links directos/embed
    const videoLink = ref("");
    const videoLink2 = ref("");
    const videoLink3 = ref("");
    const agregados = ref([]);

    function getPoster(path) {
      if (!path) return NO_POSTER;
      return `https://image.tmdb.org/t/p/w342${path}`;
    }

    function agregarLinks() {
      // Simplemente copia los tres valores como están.
      agregados.value = [
        (videoLink.value || "").trim(),
        (videoLink2.value || "").trim(),
        (videoLink3.value || "").trim(),
      ].filter(Boolean);
    }

    async function buscarPeliculas() {
      error.value = "";
      peliculas.value = [];
      codigoFuente.value = ""; // Limpiar código al buscar
      codigoFuenteEnlace.value = ""; // Limpiar link también
      if (!query.value.trim()) return;
      cargando.value = true;
      try {
        const url = `${ENDPOINT}?api_key=${API_KEY}&query=${encodeURIComponent(
          query.value
        )}&language=es-ES&include_adult=false`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("No se pudo buscar películas.");
        const data = await res.json();
        peliculas.value = (data.results || []).filter((el) => el.media_type !== "person");
      } catch (err) {
        error.value = "Error al buscar películas. Intenta más tarde.";
      } finally {
        cargando.value = false;
      }
    }

    async function seleccionarPelicula(pelicula) {
      peliculas.value = []; // Desaparecer resultados
      error.value = "";
      codigoFuente.value = "Cargando...";
      copiado.value = false;
      codigoFuenteEnlace.value = ""; // Limpiar link
      let detalles = null;
      try {
        detalles = await obtenerDetallesPelicula(pelicula.id);
      } catch {}
      // Usar links agregados por el botón, priorizando los 3 campos
      let allLinks = [
        (videoLink.value || "").trim(),
        (videoLink2.value || "").trim(),
        (videoLink3.value || "").trim(),
      ].filter(Boolean);

      // Si el usuario usó el botón "Agregar opciones", priorizar eso
      if (agregados.value.length) {
        allLinks = [...agregados.value];
      }

      // Cambios aquí: opción 3 siempre es embed para Externo 2, ¡no para JWPlayer!
      // JWPlayer: usar el primero que sea .mp4/.m3u8 que NO sea de la opción 3
      // Externo1: opción 1 o 2 (la que no se use en JW si hay varias)
      // Externo2: opción 3 siempre, y tratar como embed (extraer src si hace falta)

      let jwSources = [
        {
          file: "https://example.com/video.mp4",
          type: "video/mp4",
          label: "1080p"
        },
        {
          file: "https://example.com/video720p.mp4",
          type: "video/mp4",
          label: "720p"
        }
      ];
      let externo1Url = "https://example.com/embed1?autoplay=1";
      let externo2Url = "https://example.com/embed2?autoplay=1";

      // Opción 3: videoLink3/value 3 SIEMPRE es Externo2 (solo si existe)
      // Los otros dos quedan como antes
      let linkOpcion1 = (videoLink.value || "").trim();
      let linkOpcion2 = (videoLink2.value || "").trim();
      let linkOpcion3 = (videoLink3.value || "").trim();

      // JWPlayer: tomar el primero de los dos primeros que sea .mp4/.m3u8/directo
      let jwLink =
        [linkOpcion1, linkOpcion2].find(
          l =>
            l &&
            (l.match(/\.(mp4|m3u8)$/i) ||
              (l.startsWith("https://") && !l.startsWith("<iframe"))
            )
        ) || null;

      // Externo1: si ambos existen, toma el que no va en JWPlayer
      let externo1Link =
        [linkOpcion1, linkOpcion2].filter(l => l && l !== jwLink)[0] ||
        [linkOpcion1, linkOpcion2].find(Boolean) || "";

      // Externo2: SIEMPRE es opción 3, si existe
      let externo2Link = linkOpcion3;

      // JWPlayer sources
      if (jwLink) {
        jwSources = [
          {
            file: jwLink,
            type: jwLink.includes(".m3u8")
              ? "application/x-mpegURL"
              : "video/mp4",
            label: "HD"
          }
        ];
      }

      // Externo1: extraer src si es embed
      if (externo1Link) {
        if (externo1Link.startsWith("<iframe")) {
          const src = externo1Link.match(/src=["']([^"']+)["']/i);
          if (src && src[1]) {
            externo1Url = src[1];
          }
        } else {
          externo1Url = externo1Link;
        }
      }

      // Externo2: SIEMPRE tratar como embed. Si es iframe, sacar src, si no, poner tal cual.
      if (externo2Link) {
        if (externo2Link.startsWith("<iframe")) {
          const src = externo2Link.match(/src=["']([^"']+)["']/i);
          if (src && src[1]) {
            externo2Url = src[1];
          }
        } else {
          externo2Url = externo2Link;
        }
      }

      const nuevoCodigo = generarHTMLPelicula(pelicula, detalles, {
        jwSources,
        externo1Url,
        externo2Url,
      });
      codigoFuente.value = nuevoCodigo;

      // NUEVO: Genera un blob:text link para ver el HTML generado en otra pestaña
      try {
        // Limpia blobs anteriores si se generaron antes
        if (codigoFuenteEnlace.value && codigoFuenteEnlace.value.startsWith("blob:")) {
          URL.revokeObjectURL(codigoFuenteEnlace.value);
        }
        const blob = new Blob([nuevoCodigo], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        codigoFuenteEnlace.value = url;
      } catch (e) {
        codigoFuenteEnlace.value = "";
      }

      setTimeout(() => {
        const ta = document.getElementById("codigoFuente");
        if (ta && ta.value) {
          ta.select();
        }
      }, 350);
    }

    async function copiarCodigoFuente() {
      if (!codigoFuente.value) return;
      try {
        if (navigator && navigator.clipboard) {
          await navigator.clipboard.writeText(codigoFuente.value);
        } else {
          const ta = document.getElementById("codigoFuente");
          ta?.select();
          document.execCommand("copy");
        }
        copiado.value = true;
        setTimeout(() => (copiado.value = false), 1700);
      } catch {
        copiado.value = false;
      }
    }

    return {
      query,
      peliculas,
      cargando,
      error,
      buscarPeliculas,
      getPoster,
      noPoster,
      codigoFuente,
      seleccionarPelicula,
      copiarCodigoFuente,
      copiado,
      videoLink,
      videoLink2,
      videoLink3,
      agregarLinks,
      codigoFuenteEnlace, // NUEVO
    };
  },
}).mount("#app");