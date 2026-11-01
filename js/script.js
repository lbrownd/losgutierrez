/* ============================================================
   BAR & GRILL LOS GUTIERREZ — Lógica de interfaz (JS Vanilla)
   1. Filtro del menú por categorías (con animación suave)
   2. Navbar que cambia al hacer scroll
   3. Indicador deslizante de pestañas
   4. Menú móvil (hamburguesa)
   5. Animaciones de aparición al hacer scroll
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* ----------------------------------------------------------
     1. NAVBAR: cambia de estilo al bajar en la página
     ---------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const UMBRAL_SCROLL = 40; // píxeles a partir de los cuales se activa

  const actualizarNavbar = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > UMBRAL_SCROLL);
  };

  // Listener pasivo para no bloquear el scroll
  window.addEventListener("scroll", actualizarNavbar, { passive: true });
  actualizarNavbar(); // estado inicial (por si se recarga a mitad de página)


  /* ----------------------------------------------------------
     2. FILTRO DEL MENÚ con animación suave
     ---------------------------------------------------------- */
  const tabs = document.querySelectorAll(".menu__tab");
  const cards = document.querySelectorAll("#menuGrid .card");
  const indicator = document.querySelector(".menu__tab-indicator");
  const DURACION_SALIDA = 380; // debe coincidir con la transición CSS

  let temporizadores = []; // para cancelar animaciones si el usuario filtra rápido

  const limpiarTemporizadores = () => {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
  };

  const filtrarMenu = (categoria) => {
    limpiarTemporizadores();
    let indiceVisible = 0; // para el efecto escalonado (stagger)

    cards.forEach((card) => {
      const coincide = categoria === "todo" || card.dataset.category === categoria;

      if (coincide) {
        // MOSTRAR: quitar ocultamiento y animar la entrada escalonada
        card.classList.remove("is-hidden", "is-filtered-out");
        card.style.animationDelay = `${indiceVisible * 45}ms`;
        // Reiniciar la animación de entrada
        card.classList.remove("is-filtered-in");
        void card.offsetWidth; // fuerza reflow para reiniciar el keyframe
        card.classList.add("is-filtered-in");
        indiceVisible++;
      } else {
        // OCULTAR: primero la transición de salida, luego display:none
        card.classList.remove("is-filtered-in");
        card.classList.add("is-filtered-out");
        temporizadores.push(
          setTimeout(() => card.classList.add("is-hidden"), DURACION_SALIDA)
        );
      }
    });
  };

  /* ----------------------------------------------------------
     3. INDICADOR DESLIZANTE de la pestaña activa
     ---------------------------------------------------------- */
  const moverIndicador = (tab) => {
    // Posiciona la píldora exactamente detrás de la pestaña activa
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.height = `${tab.offsetHeight}px`;
    indicator.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
  };

  const tabActiva = () => document.querySelector(".menu__tab.is-active");

  // Posición inicial del indicador (esperando a que carguen las fuentes)
  const iniciarIndicador = () => moverIndicador(tabActiva());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(iniciarIndicador);
  } else {
    window.addEventListener("load", iniciarIndicador);
  }
  window.addEventListener("resize", iniciarIndicador);

  // Clic en cada pestaña: activar + filtrar + mover indicador
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("is-active")) return;

      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      moverIndicador(tab);
      filtrarMenu(tab.dataset.filter);
    });
  });


  /* ----------------------------------------------------------
     4. MENÚ MÓVIL (hamburguesa)
     ---------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  navToggle.addEventListener("click", () => {
    const abierto = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", abierto);
    navToggle.setAttribute("aria-expanded", abierto);
    navToggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });

  // Cerrar el panel al pulsar cualquier enlace
  navLinks.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });


  /* ----------------------------------------------------------
     5. APARICIÓN AL HACER SCROLL (IntersectionObserver)
     ---------------------------------------------------------- */
  const elementosRevelar = document.querySelectorAll(".reveal");

  // Pequeño retardo escalonado para elementos hermanos (hero, encabezados…)
  elementosRevelar.forEach((el, i) => {
    el.style.setProperty("--reveal-delay", `${(i % 4) * 0.08}s`);
  });

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("in-view");
          observador.unobserve(entrada.target); // animar solo una vez
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  elementosRevelar.forEach((el) => observador.observe(el));
});
