/* ================================
   MOBILE MENU
================================ */

const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");

menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("open");
});

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        navbar.classList.remove("open");
    });
});

/* ================================
   ACTIVE NAVIGATION
================================ */

const sections = document.querySelectorAll("section[id]");

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove("active");

                    if (link.getAttribute("href") === `#${entry.target.id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    },
    {
        threshold: 0.35
    }
);

sections.forEach(section => observer.observe(section));

/* ================================
   CURRENT YEAR
================================ */

document.getElementById("currentYear").textContent = new Date().getFullYear();

/* ================================
   THREE.JS GLOBE
================================ */

const globeContainer = document.getElementById("globe-container");

if (globeContainer && typeof THREE !== "undefined") {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,
        globeContainer.clientWidth / globeContainer.clientHeight,
        0.1,
        1000
    );

    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(
        globeContainer.clientWidth,
        globeContainer.clientHeight
    );

    globeContainer.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    /* Globe base */
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);

    const globeMaterial = new THREE.MeshBasicMaterial({
        color: 0x18303b,
        wireframe: true,
        transparent: true,
        opacity: 0.38
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    /* Inner sphere */
    const innerGeometry = new THREE.SphereGeometry(.94, 48, 48);

    const innerMaterial = new THREE.MeshBasicMaterial({
        color: 0x0d1c23,
        transparent: true,
        opacity: .8
    });

    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    globeGroup.add(innerSphere);

    /* Latitude and longitude rings */
    const ringMaterial = new THREE.LineBasicMaterial({
        color: 0x8fb8c4,
        transparent: true,
        opacity: .25
    });

    for (let i = 1; i < 7; i++) {
        const latitude = Math.PI * (i / 7);

        const ringGeometry = new THREE.TorusGeometry(
            Math.sin(latitude),
            0.002,
            8,
            100
        );

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = Math.cos(latitude);
        globeGroup.add(ring);
    }

    for (let i = 0; i < 6; i++) {
        const longitude = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.002, 8, 100),
            ringMaterial
        );

        longitude.rotation.y = (Math.PI / 6) * i;
        longitude.rotation.x = Math.PI / 2;
        globeGroup.add(longitude);
    }

    /* Interactive connection points */
    const globePointData = [
        { key: "telecom", position: [0.35, 0.65, 0.68] },
        { key: "web", position: [-0.55, 0.35, 0.7] },
        { key: "support", position: [0.65, -0.2, 0.7] },
        { key: "automation", position: [-0.2, -0.65, 0.7] }
    ];

    const pointMaterial = new THREE.MeshBasicMaterial({
        color: 0xe7bd88
    });

    const interactiveGlobePoints = [];

    globePointData.forEach(item => {
        const point = new THREE.Mesh(
            new THREE.SphereGeometry(.055, 20, 20),
            pointMaterial
        );

        point.position.set(...item.position).normalize().multiplyScalar(1.02);
        point.userData.globeWork = item.key;
        globeGroup.add(point);
        interactiveGlobePoints.push(point);
    });

    const points = globePointData.map(item => item.position);

    /* Connection lines */
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xe7bd88,
        transparent: true,
        opacity: .5
    });

    for (let i = 0; i < points.length - 1; i++) {
        const start = new THREE.Vector3(...points[i]).normalize();
        const end = new THREE.Vector3(...points[i + 1]).normalize();

        const curve = new THREE.QuadraticBezierCurve3(
            start,
            new THREE.Vector3(0, 0, 1.35),
            end
        );

        const curveGeometry = new THREE.BufferGeometry().setFromPoints(
            curve.getPoints(40)
        );

        const line = new THREE.Line(curveGeometry, lineMaterial);
        globeGroup.add(line);
    }

    /* Mouse interaction */
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    let targetRotationX = 0;
    let targetRotationY = 0;

    globeContainer.addEventListener("pointerdown", event => {
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    window.addEventListener("pointerup", () => {
        isDragging = false;
    });

    window.addEventListener("pointermove", event => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousMouseX;
        const deltaY = event.clientY - previousMouseY;

        targetRotationY += deltaX * 0.006;
        targetRotationX += deltaY * 0.006;

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    /* Clickable 3D points */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;

    globeContainer.addEventListener("pointerdown", event => {
        pointerDownX = event.clientX;
        pointerDownY = event.clientY;
    });

    globeContainer.addEventListener("pointerup", event => {
        const moved = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
        if (moved > 8) return;

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const hit = raycaster.intersectObjects(interactiveGlobePoints, false)[0];
        if (hit?.object?.userData?.globeWork) {
            openGlobeWorkModal(hit.object.userData.globeWork);
        }
    });

    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
            targetRotationY += 0.0015;
        }

        globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
        globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

        renderer.render(scene, camera);
    }

    animate();

    /* Responsive canvas */
    window.addEventListener("resize", () => {
        const width = globeContainer.clientWidth;
        const height = globeContainer.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });
}

/* ================================
   GLOBE WORK STORIES
================================ */
const globeWorkModal = document.getElementById("globeWorkModal");
const globeWorkClose = document.getElementById("globeWorkClose");
const globeWorkTitle = document.getElementById("globeWorkTitle");
const globeWorkKicker = document.getElementById("globeWorkKicker");
const globeWorkStory = document.getElementById("globeWorkStory");
const globeWorkGallery = document.getElementById("globeWorkGallery");
const globeWorkTags = document.getElementById("globeWorkTags");
const globeWorkProjects = document.getElementById("globeWorkProjects");

const globeWorkData = {
    telecom: {
        kicker: "01 · TELECOMUNICACIONES",
        title: "Aprendí a trabajar con la tecnología desde lo físico.",
        story: "Antes de construir interfaces y sistemas, aprendí a entender la tecnología desde el terreno: fibra óptica, mediciones, equipos y procesos técnicos. Esa etapa me enseñó a observar con detalle y a resolver problemas paso a paso.",
        images: [
            ["assets/fibra-preconectorizada-01.jpeg", "Trabajo con fibra preconectorizada"],
            ["assets/fibra-carrete-02.jpeg", "Control y revisión de carretes"],
            ["assets/fibra-tecnica-01.jpeg", "Trabajo técnico con fibra óptica"]
        ],
        tags: ["Fibra óptica", "Diagnóstico", "Procesos técnicos"]
    },
    web: {
        kicker: "02 · DESARROLLO WEB",
        title: "Después encontré una forma de convertir ideas en experiencias.",
        story: "La programación me llevó a otra manera de resolver problemas: pensar una experiencia, construirla y verla funcionar. Desde páginas web como CHIFA XING LONG hasta interfaces de sistemas como SUGE, cada proyecto me ha servido para aprender haciendo.",
        images: [
            ["assets/chifa-xing-long-interfaz.png", "Interfaz de CHIFA XING LONG"],
            ["assets/suge-interfaz.png", "Interfaz de SUGE"],
            ["assets/desarrollo-web-programacion.png", "Desarrollo web y programación"]
        ],
        tags: ["HTML", "CSS", "JavaScript", "React", "Vite"]
    },
    support: {
        kicker: "03 · SOPORTE TÉCNICO",
        title: "Aprendí que una solución también debe funcionar en la vida real.",
        story: "El soporte técnico me enseñó a escuchar, diagnosticar y buscar soluciones concretas. Trabajar con equipos, conectividad y herramientas técnicas fortaleció una parte de mi perfil que hoy llevo conmigo al desarrollar software.",
        images: [
            ["assets/gps-rastreo-securitas.png", "Plataforma de monitoreo GPS"],
            ["assets/caja-distribucion-fibra.jpeg", "Equipamiento técnico"],
            ["assets/fibra-equipo-01.jpeg", "Trabajo con equipos técnicos"]
        ],
        tags: ["Soporte", "Diagnóstico", "GPS", "Equipos"]
    },
    automation: {
        kicker: "04 · AUTOMATIZACIÓN",
        title: "Y empecé a preguntarme: ¿cómo podemos hacerlo mejor?",
        story: "La automatización apareció como el punto donde todo empezó a conectar: experiencia operativa, datos y programación. BITÁCORA, SISOFT y SUGE nacen de esa intención de convertir tareas repetitivas y procesos dispersos en herramientas que ayuden de verdad.",
        images: [
            ["assets/bitacora.png", "Dashboard BITÁCORA"],
            ["assets/sisoft-interfaz.png", "Interfaz de SISOFT"],
            ["assets/suge-interfaz.png", "Interfaz de SUGE"]
        ],
        tags: ["Python", "FastAPI", "Datos", "Automatización", "PostgreSQL"]
    }
};

let lastGlobeWorkFocus = null;

function openGlobeWorkModal(key) {
    const work = globeWorkData[key];
    if (!work || !globeWorkModal) return;

    lastGlobeWorkFocus = document.activeElement;
    globeWorkKicker.textContent = work.kicker;
    globeWorkTitle.textContent = work.title;
    globeWorkStory.textContent = work.story;
    globeWorkGallery.innerHTML = work.images.map(([src, alt]) => `<figure><img src="${src}" alt="${alt}" loading="lazy"></figure>`).join("");
    globeWorkTags.innerHTML = work.tags.map(tag => `<span>${tag}</span>`).join("");

    globeWorkModal.classList.add("open");
    globeWorkModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("globe-work-open");
    globeWorkClose?.focus();
}

function closeGlobeWorkModal() {
    if (!globeWorkModal) return;
    globeWorkModal.classList.remove("open");
    globeWorkModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("globe-work-open");
    lastGlobeWorkFocus?.focus();
}

document.querySelectorAll("[data-globe-work]").forEach(button => {
    button.addEventListener("click", () => openGlobeWorkModal(button.dataset.globeWork));
});

globeWorkClose?.addEventListener("click", closeGlobeWorkModal);
document.querySelectorAll("[data-close-globe-work]").forEach(element => {
    element.addEventListener("click", closeGlobeWorkModal);
});
globeWorkProjects?.addEventListener("click", () => {
    closeGlobeWorkModal();
    document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && globeWorkModal?.classList.contains("open")) {
        closeGlobeWorkModal();
    }
});

/* ================================
   PROJECT DETAILS MODAL
================================ */

const projectModal = document.getElementById("projectModal");
const projectModalClose = document.getElementById("projectModalClose");
const projectModalCloseSecondary = document.getElementById("projectModalCloseSecondary");
const projectModalRequest = document.getElementById("projectModalRequest");
const projectTriggers = document.querySelectorAll(".project-trigger");

const projectData = {
    sisoft: {
        type: "Sistema de gestión",
        title: "SISOFT",
        description: "Sistema de gestión SSOMA pensado para centralizar registros, evidencias y procesos que antes podían depender de formularios y archivos dispersos.",
        tags: ["Python", "FastAPI", "PostgreSQL", "React"],
        problem: "Centralizar información operativa y facilitar el registro, consulta y seguimiento de procesos SSOMA.",
        solution: "Diseñé una solución web con frontend, API y base de datos, dejando una arquitectura preparada para crecer hacia un modelo SaaS.",
        image: "assets/sisoft-interfaz.png",
        imageAlt: "Interfaz de SISOFT para registrar pruebas de alcoholemia.",
        imageCaption: "Vista de la interfaz de SISOFT — módulo de prueba de alcoholemia.",
        path: [
            "Entendimos el proceso y qué información necesitaba centralizarse.",
            "Definimos una arquitectura separando interfaz, API y base de datos.",
            "Construimos formularios, validaciones, registros y gestión de evidencias.",
            "Dejamos la base preparada para crecer hacia un sistema SaaS multiempresa."
        ]
    },
    bitacora: {
        type: "Dashboard",
        title: "BITÁCORA",
        description: "Dashboard orientado al análisis de recorridos y paradas, transformando información operativa en una visualización más útil para la toma de decisiones.",
        tags: ["Python", "Streamlit", "Pandas", "Folium"],
        problem: "Procesar grandes cantidades de registros de rutas y convertirlos en información que pueda revisarse rápidamente.",
        solution: "Construí un dashboard que consolida datos, filtra información y representa recorridos y paradas sobre mapas.",
        image: "assets/bitacora.png",
        imageAlt: "Dashboard BITÁCORA con mapa, gráficos y tabla de recorridos.",
        imageCaption: "Vista del dashboard BITÁCORA.",
        path: [
            "Partimos de los registros operativos que necesitaban ordenarse y consolidarse.",
            "Procesamos los datos para identificar y agrupar las paradas relevantes.",
            "Convertimos la información en un dashboard visual con mapas y filtros.",
            "Automatizamos tareas repetitivas para facilitar el análisis diario."
        ]
    },
    suge: {
        type: "Sistema operativo",
        title: "SUGE",
        description: "Sistema orientado a procesos de transporte y gestión de guías, desarrollado para digitalizar operaciones que requieren validación y seguimiento.",
        tags: ["React", "Vite", "JavaScript", "APIs"],
        problem: "Reducir procesos manuales y facilitar el control de información relacionada con guías y operaciones de transporte.",
        solution: "Desarrollé la interfaz y la lógica de interacción para convertir el proceso en una experiencia digital más ordenada.",
        image: "assets/suge-interfaz.png",
        imageAlt: "Interfaz de SUGE para buscar y descargar guías por fechas y placa del vehículo.",
        imageCaption: "Vista de la interfaz de SUGE.",
        path: [
            "Analizamos el flujo de trabajo y los puntos donde existía mayor carga manual.",
            "Diseñamos una interfaz para ordenar la información y facilitar la operación.",
            "Implementamos los flujos de validación y las interacciones principales.",
            "Dejamos una base preparada para conectar servicios y APIs."
        ]
    },
    web: {
        type: "Desarrollo frontend",
        title: "Páginas web",
        description: "Colección de sitios web desarrollados para practicar y demostrar diseño responsive, estructura HTML, estilos CSS y comportamiento con JavaScript.",
        tags: ["HTML", "CSS", "JavaScript", "Responsive design"],
        problem: "Convertir ideas visuales y necesidades de negocio en páginas web funcionales, claras y adaptadas a distintos dispositivos.",
        solution: "Diseñé y desarrollé interfaces completas, cuidando estructura, identidad visual, navegación e interacción.",
        image: "assets/chifa-xing-long-interfaz.png",
        imageAlt: "Interfaz de la página web de Chifa XING LONG.",
        imageCaption: "Vista de la interfaz de CHIFA XING LONG — ejemplo de desarrollo web.",
        path: [
            "Partimos de la idea y la identidad visual que debía comunicar cada página.",
            "Construimos la estructura semántica con HTML y definimos la composición visual con CSS.",
            "Adaptamos la interfaz para distintos tamaños de pantalla.",
            "Añadimos JavaScript para convertir la página en una experiencia interactiva, como CHIFA XING LONG."
        ]
    }
};

let lastProjectTrigger = null;

function openProjectModal(projectKey, trigger) {
    const project = projectData[projectKey];
    if (!project || !projectModal) return;

    lastProjectTrigger = trigger || null;

    document.getElementById("projectModalType").textContent = project.type;
    document.getElementById("projectModalTitle").textContent = project.title;
    document.getElementById("projectModalDescription").textContent = project.description;

    const screenshot = document.getElementById("projectModalScreenshot");
    const screenshotImage = document.getElementById("projectModalScreenshotImage");
    const screenshotCaption = document.getElementById("projectModalScreenshotCaption");
    if (project.image && screenshot && screenshotImage) {
        screenshot.hidden = false;
        screenshotImage.src = project.image;
        screenshotImage.alt = project.imageAlt || `Interfaz de ${project.title}`;
        if (screenshotCaption) screenshotCaption.textContent = project.imageCaption || `Vista de la interfaz de ${project.title}.`;
    } else if (screenshot) {
        screenshot.hidden = true;
        screenshotImage?.removeAttribute("src");
        screenshotImage?.setAttribute("alt", "");
        if (screenshotCaption) screenshotCaption.textContent = "";
    }

    document.getElementById("projectModalProblem").textContent = project.problem;
    document.getElementById("projectModalSolution").textContent = project.solution;

    const tags = document.getElementById("projectModalTags");
    tags.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join("");

    const features = document.getElementById("projectModalFeatures");
    features.innerHTML = project.path.map((item, index) => `<li><strong>${String(index + 1).padStart(2, "0")}</strong><span>${item}</span></li>`).join("");

    projectModal.classList.add("open");
    projectModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-modal-open");
    projectModalClose.focus();
}

function closeProjectModal() {
    if (!projectModal) return;

    projectModal.classList.remove("open");
    projectModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-modal-open");

    if (lastProjectTrigger) {
        lastProjectTrigger.focus();
    }
}

projectTriggers.forEach(trigger => {
    const projectKey = trigger.dataset.project;

    trigger.addEventListener("click", () => {
        openProjectModal(projectKey, trigger);
    });

    trigger.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProjectModal(projectKey, trigger);
        }
    });
});

projectModalClose?.addEventListener("click", closeProjectModal);
projectModalCloseSecondary?.addEventListener("click", closeProjectModal);

document.querySelectorAll("[data-close-project]").forEach(element => {
    element.addEventListener("click", closeProjectModal);
});

projectModalRequest?.addEventListener("click", () => {
    const contact = document.getElementById("contacto");
    if (!contact) return;

    closeProjectModal();
    contact.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && projectModal?.classList.contains("open")) {
        closeProjectModal();
    }
});

/* ================================
   CONTACT / CONÓCEME — HISTORIA INTERACTIVA
================================ */
const aboutModal = document.getElementById("aboutModal");
const aboutModalTrigger = document.getElementById("contactAboutTrigger");
const aboutModalClose = document.getElementById("aboutModalClose");
const aboutModalCloseSecondary = document.getElementById("aboutModalCloseSecondary");
const aboutStoryPhoto = document.getElementById("aboutStoryPhoto");
const aboutStoryPhotoCaption = document.getElementById("aboutStoryPhotoCaption");
const aboutStoryKicker = document.getElementById("aboutStoryKicker");
const aboutStoryTitle = document.getElementById("aboutStoryTitle");
const aboutStoryText = document.getElementById("aboutStoryText");
const aboutStoryQuote = document.getElementById("aboutStoryQuote");
const aboutStoryTags = document.getElementById("aboutStoryTags");
const aboutStoryPrev = document.getElementById("aboutStoryPrev");
const aboutStoryNext = document.getElementById("aboutStoryNext");
const aboutStoryProgress = document.getElementById("aboutStoryProgress");
const aboutStoryFinal = document.getElementById("aboutStoryFinal");
const aboutStoryTabs = [...document.querySelectorAll("[data-story-step]")];
let aboutModalLastFocus = null;
let aboutStoryStep = 0;

const aboutStoryData = [
    {
        kicker: "01 · EL COMIENZO",
        title: "Venezuela fue el punto de partida.",
        text: "Soy venezolana y llevo alrededor de diez años viviendo en Perú. Llegar hasta donde estoy hoy ha significado adaptarme, comenzar etapas nuevas y seguir avanzando incluso cuando el camino se sentía largo y agotador.",
        quote: "“Cada etapa me fue acercando a quien quiero ser.”",
        image: "assets/about-journey.jpeg",
        alt: "Celymar caminando por un puente durante un viaje",
        caption: "El camino también forma parte de la historia.",
        tags: ["Venezuela", "Perú", "Un nuevo comienzo"]
    },
    {
        kicker: "02 · LOS RETOS",
        title: "Aprendí a enfrentar problemas antes de aprender a programarlos.",
        text: "He trabajado con empresas que me han permitido retarme y conocer distintos rubros. Esa experiencia me enseñó a observar los procesos desde dentro, entender necesidades reales y no quedarme solamente con la teoría.",
        quote: "“Los problemas reales también enseñan a construir mejores soluciones.”",
        image: "assets/about-growth.jpeg",
        alt: "Celymar en un momento cotidiano durante su recorrido",
        caption: "Cada experiencia sumó una pieza al camino.",
        tags: ["Experiencia", "Procesos", "Nuevos retos"]
    },
    {
        kicker: "03 · MI NORTE",
        title: "Entonces encontré algo que quería seguir construyendo.",
        text: "La Ingeniería de Sistemas y la programación se convirtieron en mi norte. Empecé a estudiar, practicar y transformar necesidades reales en soluciones digitales. Ahí entendí que no quería solamente aprender tecnología: quería usarla para crear.",
        quote: "“Me gusta entender el problema, imaginar una solución y verla funcionar.”",
        image: "assets/about-passion.jpeg",
        alt: "Celymar en una sesión fotográfica con estilo creativo",
        caption: "La programación se convirtió en una dirección.",
        tags: ["Ingeniería de Sistemas", "Programación", "Crear"]
    },
    {
        kicker: "04 · HOY",
        title: "Sigo en formación. Y quiero seguir creciendo.",
        text: "Hoy continúo formándome y sé que todavía tengo muchísimo por aprender. Solo busco una oportunidad para desarrollar mis habilidades, enfrentar nuevos retos, aprender de otras personas y aportar con todo lo que ya he construido.",
        quote: "“No busco saberlo todo; busco la oportunidad de seguir creciendo.”",
        image: "assets/about-today.jpeg",
        alt: "Celymar en una fotografía profesional de perfil",
        caption: "Todavía estoy escribiendo la siguiente parte.",
        tags: ["Aprender", "Desarrollar", "Aportar"]
    }
];

function renderAboutStory(step, animate = true) {
    if (!aboutStoryPhoto || !aboutStoryData[step]) return;
    aboutStoryStep = Math.max(0, Math.min(aboutStoryData.length - 1, step));
    const story = aboutStoryData[aboutStoryStep];

    const updateContent = () => {
        aboutStoryKicker.textContent = story.kicker;
        aboutStoryTitle.textContent = story.title;
        aboutStoryText.textContent = story.text;
        aboutStoryQuote.textContent = story.quote;
        aboutStoryPhoto.src = story.image;
        aboutStoryPhoto.alt = story.alt;
        aboutStoryPhotoCaption.textContent = story.caption;
        aboutStoryTags.innerHTML = story.tags.map(tag => `<span>${tag}</span>`).join("");
        aboutStoryProgress.style.width = `${((aboutStoryStep + 1) / aboutStoryData.length) * 100}%`;
        aboutStoryPrev.disabled = aboutStoryStep === 0;
        aboutStoryPrev.setAttribute("aria-disabled", String(aboutStoryStep === 0));
        aboutStoryNext.textContent = aboutStoryStep === aboutStoryData.length - 1 ? "Conocerme un poco más →" : "Continuar →";
        aboutStoryTabs.forEach((tab, index) => {
            const active = index === aboutStoryStep;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
        });
        aboutStoryFinal.setAttribute("aria-hidden", "true");
        aboutStoryFinal.classList.remove("is-visible");
    };

    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        aboutStoryPhoto.classList.add("is-changing");
        aboutStoryTitle.classList.add("is-changing");
        window.setTimeout(() => {
            updateContent();
            aboutStoryPhoto.classList.remove("is-changing");
            aboutStoryTitle.classList.remove("is-changing");
        }, 180);
    } else {
        updateContent();
    }
}

function openAboutModal() {
    if (!aboutModal) return;
    aboutModalLastFocus = document.activeElement;
    renderAboutStory(0, false);
    aboutModal.classList.add("open");
    aboutModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-modal-open");
    aboutModalClose?.focus();
}

function closeAboutModal() {
    if (!aboutModal) return;
    aboutModal.classList.remove("open");
    aboutModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-modal-open");
    aboutStoryFinal?.classList.remove("is-visible");
    aboutStoryFinal?.setAttribute("aria-hidden", "true");
    aboutModalLastFocus?.focus();
}

aboutModalTrigger?.addEventListener("click", openAboutModal);
aboutModalClose?.addEventListener("click", closeAboutModal);
aboutModalCloseSecondary?.addEventListener("click", closeAboutModal);
document.querySelectorAll("[data-close-about]").forEach(element => {
    element.addEventListener("click", closeAboutModal);
});

aboutStoryTabs.forEach(tab => {
    tab.addEventListener("click", () => renderAboutStory(Number(tab.dataset.storyStep)));
});

aboutStoryPrev?.addEventListener("click", () => {
    if (aboutStoryStep > 0) renderAboutStory(aboutStoryStep - 1);
});

aboutStoryNext?.addEventListener("click", () => {
    if (aboutStoryStep < aboutStoryData.length - 1) {
        renderAboutStory(aboutStoryStep + 1);
        return;
    }
    aboutStoryFinal?.classList.add("is-visible");
    aboutStoryFinal?.setAttribute("aria-hidden", "false");
    aboutStoryFinal?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.addEventListener("keydown", event => {
    if (!aboutModal?.classList.contains("open")) return;
    if (event.key === "Escape") closeAboutModal();
    if (event.key === "ArrowRight") renderAboutStory(Math.min(aboutStoryStep + 1, aboutStoryData.length - 1));
    if (event.key === "ArrowLeft") renderAboutStory(Math.max(aboutStoryStep - 1, 0));
});


/* ================================
   BACKEND & API REST — INTERACTIVE DEMO
================================ */
const backendDemoModal = document.getElementById("backendDemoModal");
const backendDemoTrigger = document.getElementById("backendDemoTrigger");
const backendDemoClose = document.getElementById("backendDemoClose");
const backendDemoCloseSecondary = document.getElementById("backendDemoCloseSecondary");
const backendCode = document.getElementById("backendCode");
const backendReplay = document.getElementById("backendReplay");
const backendExplanationLabel = document.getElementById("backendExplanationLabel");
const backendExplanationTitle = document.getElementById("backendExplanationTitle");
const backendExplanationText = document.getElementById("backendExplanationText");
const backendFlow = document.getElementById("backendFlow");
const backendTabs = [...document.querySelectorAll("[data-backend-tab]")];
let backendDemoLastFocus = null;
let backendTypingTimer = null;

const backendDemoData = {
    node: {
        label: "NODE.JS · REST",
        title: "Comunicación entre frontend y backend",
        text: "Una API REST expone endpoints que permiten que una aplicación cliente solicite o envíe información al servidor.",
        code: `import express from "express";\n\nconst app = express();\napp.use(express.json());\n\napp.get("/api/users", async (req, res) => {\n  const users = await userService.getAll();\n  res.json(users);\n});`,
        flow: false
    },
    jwt: {
        label: "JWT · AUTENTICACIÓN",
        title: "Identidad mediante tokens",
        text: "JWT permite representar información de autenticación en un token firmado que el cliente puede enviar al consumir rutas protegidas.",
        code: `const token = jwt.sign(\n  { id: user.id, role: user.role },\n  process.env.JWT_SECRET,\n  { expiresIn: "1h" }\n);\n\n// El cliente envía el token\n// en las solicitudes protegidas`,
        flow: false
    },
    cors: {
        label: "CORS · CONTROL DE ORIGEN",
        title: "Qué aplicaciones pueden consumir la API",
        text: "CORS controla desde qué orígenes puede realizar solicitudes un navegador hacia una API, evitando permitir accesos web no previstos.",
        code: `app.use(cors({\n  origin: "https://celymar.dev",\n  methods: ["GET", "POST"]\n}));\n\n// El servidor define qué origen\n// puede comunicarse desde el navegador`,
        flow: false
    },
    https: {
        label: "HTTPS · TLS",
        title: "Comunicación protegida",
        text: "HTTPS utiliza TLS para proteger la comunicación entre cliente y servidor. En una arquitectura web, esa capa acompaña el recorrido de la solicitud hasta la API y los datos.",
        code: `CLIENTE\n   │\n   │ HTTPS / TLS\n   ▼\nNODE.JS API\n   │\n   │ SQL\n   ▼\nBASE DE DATOS`,
        flow: true
    },
    sql: {
        label: "SQL · DATOS RELACIONALES",
        title: "Consultar información de forma estructurada",
        text: "SQL permite consultar y manipular datos en bases relacionales. Aquí se muestra una consulta sencilla con un filtro sobre usuarios activos.",
        code: `SELECT id, nombre, email\nFROM usuarios\nWHERE activo = true;\n\n-- La API puede procesar el resultado\n-- antes de responder al cliente`,
        flow: false
    }
};

function typeBackendCode(code) {
    if (!backendCode) return;
    window.clearInterval(backendTypingTimer);
    backendCode.textContent = "";
    let index = 0;
    const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 14;

    if (speed === 0) {
        backendCode.textContent = code;
        return;
    }

    backendTypingTimer = window.setInterval(() => {
        backendCode.textContent += code[index];
        index += 1;
        if (index >= code.length) window.clearInterval(backendTypingTimer);
    }, speed);
}

function renderBackendDemo(key, animate = true) {
    const item = backendDemoData[key];
    if (!item) return;

    backendTabs.forEach(tab => {
        const active = tab.dataset.backendTab === key;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
    });

    backendExplanationLabel.textContent = item.label;
    backendExplanationTitle.textContent = item.title;
    backendExplanationText.textContent = item.text;
    backendFlow.hidden = !item.flow;

    if (animate) typeBackendCode(item.code);
    else backendCode.textContent = item.code;
}

function openBackendDemo() {
    if (!backendDemoModal) return;
    backendDemoLastFocus = document.activeElement;
    renderBackendDemo("node", false);
    backendDemoModal.classList.add("open");
    backendDemoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("backend-demo-open");
    backendDemoClose?.focus();
    window.setTimeout(() => typeBackendCode(backendDemoData.node.code), 120);
}

function closeBackendDemo() {
    if (!backendDemoModal) return;
    backendDemoModal.classList.remove("open");
    backendDemoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("backend-demo-open");
    window.clearInterval(backendTypingTimer);
    backendDemoLastFocus?.focus();
}

backendDemoTrigger?.addEventListener("click", openBackendDemo);
backendDemoClose?.addEventListener("click", closeBackendDemo);
backendDemoCloseSecondary?.addEventListener("click", closeBackendDemo);
document.querySelectorAll("[data-close-backend-demo]").forEach(element => {
    element.addEventListener("click", closeBackendDemo);
});

backendTabs.forEach(tab => {
    tab.addEventListener("click", () => renderBackendDemo(tab.dataset.backendTab));
});

backendReplay?.addEventListener("click", () => {
    const activeTab = backendTabs.find(tab => tab.classList.contains("is-active"));
    if (activeTab) typeBackendCode(backendDemoData[activeTab.dataset.backendTab].code);
});

document.addEventListener("keydown", event => {
    if (!backendDemoModal?.classList.contains("open")) return;
    if (event.key === "Escape") closeBackendDemo();
});
