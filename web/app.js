import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { mockRecipes } from "./recipes.js";

// [BLOQUE-CONFIG] Reemplazar con tu config real de Firebase Console
const firebaseConfig = {
    apiKey: "API_KEY_PLACEHOLDER",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

class App {
    constructor() {
        // Robust initialization
        try {
            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            this.db = getFirestore(this.app);
        } catch (e) {
            console.error("Firebase initialization failed. Ensure firebaseConfig is correct.", e);
        }
        
        this.contentDiv = document.getElementById('app-content');
        this.nav = document.getElementById('main-nav');
        this.schemaScript = document.getElementById('schema-markup');
        
        // Estado local reactivo
        this.activeUser = null;
        this.userProfile = null;
        this.opinions = {};
        try {
            this.favorites = JSON.parse(localStorage.getItem('cuchara_favorites')) || [];
            this.shoppingList = JSON.parse(localStorage.getItem('cuchara_shopping')) || [];
            this.pantry = JSON.parse(localStorage.getItem('cuchara_pantry')) || [];
            this.userStats = JSON.parse(localStorage.getItem('cuchara_stats')) || { recipesCooked: 0, streak: 0, lastCookedDate: null };
        } catch (storageErr) {
            console.warn("Storage access denied or failed", storageErr);
            this.favorites = [];
            this.shoppingList = [];
            this.pantry = [];
            this.userStats = { recipesCooked: 0, streak: 0, lastCookedDate: null };
        }
        this.isImperial = false;
        
        this.activeFilters = {
            category: [], time: [], diet: [], allergen: [], searchQuery: '', goal: [], sort: 'default'
        };
        this.listenToAuth();
        this.listenToOpinions();
        
        // Wait for DOM to be fully ready before initial render
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    listenToAuth() {
        onAuthStateChanged(this.auth, async (user) => {
            if (user) {
                this.activeUser = user;
                await this.syncUserProfile();
                this.showToast(`Bienvenido/a, ${this.userProfile?.name || user.email}`, 'fa-user-check');
            } else {
                this.activeUser = null;
                this.userProfile = null;
                this.favorites = [];
                this.shoppingList = [];
            }
            this.updateUserUI();
            this.updateShoppingBadge();
            this.renderRoute(window.location.hash.replace('#', '').split('/')[0] || 'home');
        });
    }

    async syncUserProfile() {
        if (!this.activeUser) return;
        const userDoc = await getDoc(doc(this.db, "users", this.activeUser.uid));
        if (userDoc.exists()) {
            this.userProfile = userDoc.data();
            this.favorites = this.userProfile.favorites || [];
            this.shoppingList = this.userProfile.shoppingList || [];
            this.userStats = this.userProfile.stats || { recipesCooked: 0, streak: 0, lastCookedDate: null };
            this.pantry = this.userProfile.pantry || [];
        } else {
            // Inicializar perfil si es nuevo
            this.userProfile = {
                name: this.activeUser.displayName || 'Usuario',
                favorites: [],
                shoppingList: [],
                stats: { recipesCooked: 0, streak: 0, lastCookedDate: null }
            };
            await setDoc(doc(this.db, "users", this.activeUser.uid), this.userProfile);
        }
    }

    listenToOpinions() {
        onSnapshot(collection(this.db, "opinions"), (snapshot) => {
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!this.opinions[data.recipeId]) this.opinions[data.recipeId] = [];
                // Evitar duplicados en local
                if (!this.opinions[data.recipeId].find(op => op.id === doc.id)) {
                    this.opinions[data.recipeId].push({ id: doc.id, ...data });
                }
            });
            // Si estamos en una vista de receta, refrescar opiniones
            const route = window.location.hash.split('/')[0];
            if (route === '#recipe') {
                const opinionsGrid = document.getElementById('opinions-container');
                if (opinionsGrid) opinionsGrid.innerHTML = this.renderOpinions(window.location.hash.split('/')[1]);
            }
        });
    }
    init() {
        // Evento cambio de Hash
        window.addEventListener('hashchange', () => {
            const route = window.location.hash.replace('#', '').split('/')[0] || 'home';
            const params = window.location.hash.replace('#', '').split('/')[1];
            this.renderRoute(route, params);
            this.updateNavHighlight(route);
        });

        // Listener de Scroll para barra de progreso y efectos
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const scrollBar = document.getElementById('scroll-progress');
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolledPercent = (winScroll / height) * 100;
            if (scrollBar) scrollBar.style.width = scrolledPercent + "%";

            // Revelar elementos al hacer scroll
            document.querySelectorAll('.reveal-on-scroll').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 100) {
                    el.classList.add('revealed');
                }
            });
        });

        // Inicializar UI y decoración
        this.updateShoppingBadge();
        this.initBackgroundDecor();
        
        // Estado de paginación
        this.recipesToShow = 12;
        this.allRecipes = mockRecipes;

        // Ocultar pantalla de carga
        setTimeout(() => {
            try {
                const loader = document.getElementById('global-loader');
                if (loader) {
                    loader.classList.add('loader-hidden');
                }
                // Primera carga de ruta
                const route = window.location.hash.replace('#', '').split('/')[0] || 'home';
                const params = window.location.hash.replace('#', '').split('/')[1] || null;
                
                console.log("Initializing route:", route);
                this.renderRoute(route, params);
            } catch (err) {
                console.error("Initialization error:", err);
                if (this.contentDiv) {
                    this.contentDiv.innerHTML = '<div style="text-align:center; padding:5rem;"><h2>Error al cargar la página</h2><p>Por favor, recarga el navegador.</p></div>';
                }
            }
        }, 800);
    }

    initBackgroundDecor() {
        const icons = ['fa-lemon', 'fa-pepper-hot', 'fa-carrot', 'fa-apple-whole', 'fa-leaf', 'fa-shrimp', 'fa-egg', 'fa-fish', 'fa-ice-cream', 'fa-cookie', 'fa-seedling', 'fa-pizza-slice'];
        this.bgContainer = document.body;
        
        // Animated Blobs for depth
        for (let i = 0; i < 5; i++) {
            const blob = document.createElement('div');
            blob.className = 'blob';
            blob.style.top = `${Math.random() * 100}%`;
            blob.style.left = `${Math.random() * 100}%`;
            blob.style.width = `${200 + Math.random() * 300}px`;
            blob.style.height = blob.style.width;
            blob.style.opacity = '0.05';
            blob.style.animationDuration = `${20 + Math.random() * 20}s`;
            document.body.appendChild(blob);
        }

        for (let i = 0; i < 60; i++) {
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const size = Math.random() * (2.5 - 1.0) + 1.0; 
            const blur = Math.random() > 0.8 ? (Math.random() * 3) : 0;
            const duration = 20 + Math.random() * 30;
            const rotation = Math.random() * 360;
            
            const icon = document.createElement('i');
            icon.className = `fa-solid ${icons[Math.floor(Math.random() * icons.length)]} bg-ingredient`;
            icon.style.left = `${posX}%`;
            icon.style.top = `${posY}%`;
            icon.style.transform = `rotate(${rotation}deg)`;
            icon.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 400}px`);
            icon.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 400}px`);
            icon.style.setProperty('--size', `${size}rem`);
            icon.style.setProperty('--blur', `${blur}px`);
            icon.style.setProperty('--duration', `${duration}s`);
            
            this.bgContainer.appendChild(icon);
        }
    }



    updateUserUI() {
        const container = document.getElementById('user-dropdown-container');
        if (!container) return;

        if (this.activeUser) {
            const userName = this.activeUser.name || this.activeUser.username;
            const initials = this.activeUser.avatar || userName.substring(0, 2).toUpperCase();
            container.innerHTML = `
                <div class="user-avatar-btn" onclick="app.toggleUserDropdown(event)">
                    ${initials}
                </div>
                <div id="user-dropdown-menu" class="user-dropdown-menu">
                    <div class="user-dropdown-header">
                        <h4 style="margin:0;">${userName}</h4>
                        <p style="margin:0; font-size:0.8rem; color:var(--text-light);">${this.activeUser.email || ''}</p>
                    </div>
                    <a class="user-dropdown-item" onclick="app.navigate('profile')">
                        <i class="fa-solid fa-circle-user"></i> Mi Perfil
                    </a>
                    <a class="user-dropdown-item" onclick="app.navigate('favorites')">
                        <i class="fa-solid fa-heart"></i> Favoritos
                    </a>
                    <a class="user-dropdown-item" onclick="app.navigate('despensa')">
                        <i class="fa-solid fa-box-open"></i> Mi Despensa
                    </a>
                    <div style="border-top: 1px solid var(--border-color); margin: 0.5rem 0;"></div>
                    <a class="user-dropdown-item" onclick="app.logout()" style="color: #e74c3c;">
                        <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                    </a>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="header-icon-btn" id="login-nav-btn" onclick="app.showAuthModal('login')" title="Iniciar Sesión">
                    <i class="fa-solid fa-user"></i>
                </button>
            `;
        }
    }

    toggleUserDropdown(e) {
        if (e) e.stopPropagation();
        const menu = document.getElementById('user-dropdown-menu');
        if (menu) {
            menu.classList.toggle('show');
            
            if (menu.classList.contains('show')) {
                const closeHandler = (event) => {
                    if (!menu.contains(event.target) && !event.target.classList.contains('user-avatar-btn')) {
                        menu.classList.remove('show');
                        document.removeEventListener('click', closeHandler);
                    }
                };
                document.addEventListener('click', closeHandler);
            }
        }
    }

    updateShoppingBadge() {
        const badge = document.getElementById('shopping-badge');
        if (badge) {
            if (this.shoppingList.length > 0) {
                badge.style.display = 'flex';
                badge.textContent = this.shoppingList.length;
            } else {
                badge.style.display = 'none';
            }
        }
    }

    updateNavHighlight(route) {
        document.querySelectorAll('.nav-list a').forEach(a => a.classList.remove('active'));
        const navLink = document.getElementById(`nav-${route}`);
        if (navLink) navLink.classList.add('active');
    }

    escapeHTML(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    initMacrosAndRecipes() {
        const macrosMap = {
            'curry-lentejas': { calories: 380, protein: 18, carbs: 50, fats: 12 },
            'salmon-esparragos': { calories: 420, protein: 35, carbs: 10, fats: 25 },
            'carbonara-tradicional': { calories: 650, protein: 22, carbs: 70, fats: 30 },
            'pancakes-almendra': { calories: 350, protein: 15, carbs: 15, fats: 25 },
            'bowl-mediterraneo': { calories: 450, protein: 15, carbs: 65, fats: 15 },
            'pollo-limon-bandeja': { calories: 380, protein: 40, carbs: 25, fats: 12 },
            'tacos-al-pastor': { calories: 550, protein: 30, carbs: 55, fats: 20 },
            'ensalada-cesar': { calories: 320, protein: 35, carbs: 12, fats: 15 },
            'smoothie-bowl': { calories: 280, protein: 8, carbs: 55, fats: 4 },
            'lasana-vegetariana': { calories: 520, protein: 20, carbs: 60, fats: 22 },
            'galletas-avena': { calories: 220, protein: 5, carbs: 30, fats: 10 },
            'sopa-tomate': { calories: 210, protein: 4, carbs: 35, fats: 8 },
            'tostada-aguacate': { calories: 340, protein: 12, carbs: 28, fats: 20 },
            'risotto-champinones': { calories: 580, protein: 14, carbs: 75, fats: 22 },
            'tarta-queso': { calories: 450, protein: 8, carbs: 40, fats: 30 },
            'hummus-casero': { calories: 180, protein: 6, carbs: 20, fats: 10 },
            'fajitas-pollo': { calories: 480, protein: 35, carbs: 45, fats: 16 },
            'porridge-avena': { calories: 310, protein: 10, carbs: 55, fats: 6 },
            'berenjenas-rellenas': { calories: 350, protein: 18, carbs: 30, fats: 18 },
            'brownie-saludable': { calories: 280, protein: 6, carbs: 35, fats: 14 },
            'guacamole-casero': { calories: 200, protein: 3, carbs: 12, fats: 16 }
        };

        mockRecipes.forEach(r => r.macros = macrosMap[r.id]);

        mockRecipes.push(
            {
                id: 'batido-ganador',
                title: 'Batido Ganador de Masa Muscular',
                description: 'Alto en calorías y proteínas, ideal para volumen.',
                image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=1000&auto=format&fit=crop',
                time: '5 min',
                difficulty: 'Fácil',
                category: 'Desayunos',
                tags: ['Menos de 15 min', 'Alto en proteínas', 'Ganar peso'],
                allergens: ['Sin Gluten'],
                macros: { calories: 800, protein: 45, carbs: 100, fats: 25 },
                ingredients: ['1 plátano', '1 taza avena', '2 cacitos proteína whey', 'Crema de cacahuete', 'Leche entera'],
                adaptation: { title: 'Vegano', text: 'Usa proteína vegetal y leche de soja.' },
                steps: [{ text: 'Licúa todo hasta que quede suave.', image: null }],
                finalResult: 'Un batido denso y nutritivo.',
                seoSchema: {}
            },
            {
                id: 'arroz-pollo-cacahuetes',
                title: 'Arroz con Pollo y Salsa de Cacahuete',
                description: 'Plato calórico y delicioso para después de entrenar.',
                image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000&auto=format&fit=crop',
                time: '25 min',
                difficulty: 'Fácil',
                category: 'Comidas',
                tags: ['Menos de 30 min', 'Alto en proteínas', 'Ganar peso'],
                allergens: ['Sin lactosa'],
                macros: { calories: 750, protein: 50, carbs: 80, fats: 25 },
                ingredients: ['200g arroz', '150g pechuga pollo', 'Verduras variadas', 'Salsa de soja', 'Crema de cacahuete'],
                adaptation: { title: 'Bajo en calorías', text: 'Reduce el arroz a 100g y omite el cacahuete.' },
                steps: [{ text: 'Cocina el pollo, verduras y mezcla con arroz y la salsa.', image: null }],
                finalResult: 'Un bol sabroso y muy contundente.',
                seoSchema: {}
            },
            {
                id: 'ensalada-verde-atun',
                title: 'Ensalada Verde Proteica con Atún',
                description: 'Muy baja en calorías pero saciante, ideal para definición.',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
                time: '10 min',
                difficulty: 'Fácil',
                category: 'Cenas',
                tags: ['Menos de 15 min', 'Alto en proteínas', 'Perder peso'],
                allergens: ['Sin Gluten', 'Sin lactosa', 'Sin frutos secos'],
                macros: { calories: 250, protein: 30, carbs: 10, fats: 10 },
                ingredients: ['Espinacas baby', '1 lata de atún al natural', 'Tomates cherry', 'Pepino', 'Vinagreta ligera'],
                adaptation: { title: 'Vegano', text: 'Usa tofu ahumado o edamame en lugar de atún.' },
                steps: [{ text: 'Mezcla todos los ingredientes en un bol grande y aliña.', image: null }],
                finalResult: 'Fresco, nutritivo y muy ligero.',
                seoSchema: {}
            }
        );

        const proteins = ['Pollo', 'Ternera', 'Salmón', 'Tofu', 'Pavo', 'Atún', 'Huevo', 'Heura'];
        const carbs = ['Arroz Integral', 'Quinoa', 'Boniato', 'Patata Asada', 'Cuscús', 'Pasta'];
        const veggies = ['Brócoli', 'Espárragos', 'Espinacas', 'Calabacín', 'Pimientos', 'Champiñones'];
        const flavors = ['Ajo', 'Limón', 'Salsa Barbacoa', 'Curry', 'Chocolate', 'Vainilla', 'Queso', 'Bacon'];

        const imageDB = {
            'Pollo': [
                'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&fit=crop',
                'https://images.unsplash.com/photo-1598514982205-f36b96d1e8dd?w=600&fit=crop',
                'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&fit=crop'
            ],
            'Ternera': [
                'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=600&fit=crop',
                'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&fit=crop',
                'https://images.unsplash.com/photo-1558030006-450675393462?w=600&fit=crop'
            ],
            'Salmón': [
                'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&fit=crop',
                'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop',
                'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&fit=crop'
            ],
            'Tofu': [
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&fit=crop',
                'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&fit=crop',
                'https://images.unsplash.com/photo-1555243896-771a80b18128?w=600&fit=crop'
            ],
            'Pavo': [
                'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600&fit=crop',
                'https://images.unsplash.com/photo-1514516345957-556ca8d90a29?w=600&fit=crop'
            ],
            'Atún': [
                'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?w=600&fit=crop',
                'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&fit=crop'
            ],
            'Huevo': [
                'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&fit=crop',
                'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&fit=crop'
            ],
            'Heura': [
                'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&fit=crop',
                'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&fit=crop'
            ],
            'Postres': [
                'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&fit=crop',
                'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&fit=crop',
                'https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=600&fit=crop'
            ],
            'Batidos': [
                'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&fit=crop',
                'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&fit=crop'
            ],
            'Default': [
                'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&fit=crop',
                'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&fit=crop'
            ]
        };

        // Deterministic pick based on index to keep images consistent across reloads
        const pick = (arr, seed) => arr[seed % arr.length];
        const rand = (min, max, seed) => min + (seed % (max - min + 1));

        for (let i = 1; i <= 100; i++) {
            const isFit = i <= 50;
            const p = pick(proteins, i);
            const c = pick(carbs, i + 3);
            const v = pick(veggies, i + 7);
            const f = pick(flavors, i + 11);
            
            let title = isFit ? `Bowl Nutritivo de ${p} con ${v}` : `Plato Casero de ${p} y ${c} al ${f}`;
            if (i > 80) title = `Postre Indulgente de ${f}`;
            if (i > 40 && i <= 50) title = `Batido Proteico de ${f}`;

            const calories = isFit ? rand(250, 450, i * 13) : rand(600, 1100, i * 17);
            const protein = isFit ? rand(25, 50, i * 19) : rand(15, 35, i * 23);
            const carbsNum = isFit ? rand(10, 40, i * 29) : rand(60, 120, i * 31);
            const fatsNum = isFit ? rand(5, 15, i * 37) : rand(25, 55, i * 41);

            // Determinar tipo de receta para la imagen
            let imageCategory = p;
            if (i > 80) imageCategory = 'Postres';
            if (i > 40 && i <= 50) imageCategory = 'Batidos';
            
            const categoryImages = imageDB[imageCategory] || imageDB['Default'];
            const uniqueImg = categoryImages[i % categoryImages.length];

            let detailedSteps = [];
            if (imageCategory === 'Postres') {
                detailedSteps = [
                    { text: `Precalienta el horno a 180°C y prepara un molde untándolo con un poco de aceite de oliva.`, image: null },
                    { text: `En un bol grande, mezcla ${c.toLowerCase()} con el toque especial de ${f.toLowerCase()} hasta obtener una masa homogénea.`, image: null },
                    { text: `Integra suavemente ${p.toLowerCase()} y ${v.toLowerCase()} finamente picados para darle la textura perfecta al postre.`, image: null },
                    { text: `Vierte la masa en el molde y hornea durante 25-30 minutos. Comprueba con un palillo que el centro esté cocido.`, image: null },
                    { text: `Deja enfriar a temperatura ambiente antes de desmoldar y servir.`, image: null }
                ];
            } else if (imageCategory === 'Batidos') {
                detailedSteps = [
                    { text: `Lava y pela ${v.toLowerCase()}. Córtalo en trozos pequeños para facilitar el batido.`, image: null },
                    { text: `Coloca en el vaso de la batidora ${p.toLowerCase()}, junto con ${c.toLowerCase()} para darle consistencia.`, image: null },
                    { text: `Añade la medida de líquido deseada y el toque dulce/aromático de ${f.toLowerCase()}.`, image: null },
                    { text: `Bate a máxima potencia durante 1-2 minutos hasta que la textura sea completamente sedosa y sin grumos.`, image: null },
                    { text: `Sirve inmediatamente en un vaso grande, preferiblemente muy frío.`, image: null }
                ];
            } else {
                detailedSteps = [
                    { text: `Lava cuidadosamente los vegetales. Corta ${v.toLowerCase()} en dados medianos o tiras y resérvalos.`, image: null },
                    { text: `En una sartén amplia, pon a calentar una cucharada de aceite de oliva a fuego medio-alto.`, image: null },
                    { text: `Añade ${p.toLowerCase()} a la sartén. Condimenta con especias al gusto y el toque distintivo de ${f.toLowerCase()}. Cocina de 5 a 8 minutos hasta que dore por ambos lados.`, image: null },
                    { text: `Incorpora ${v.toLowerCase()} a la sartén junto con un cuarto de vaso de agua o caldo. Saltea y tapa durante 5 minutos para que la verdura se haga al vapor.`, image: null },
                    { text: `Mientras, prepara la base de ${c.toLowerCase()} cociéndolo al punto deseado. Una vez escurrido, júntalo todo en la sartén.`, image: null },
                    { text: `Remueve a fuego lento 2 minutos para que los sabores se integren a la perfección. Retira y sirve caliente.`, image: null }
                ];
            }

            let detailedDescription = '';
            if (imageCategory === 'Postres') {
                detailedDescription = `Un postre irresistible donde la suavidad de ${c.toLowerCase()} se funde con las notas dulces de ${f.toLowerCase()}. Una propuesta de nivel profesional que no dejará a nadie indiferente.`;
            } else if (imageCategory === 'Batidos') {
                detailedDescription = `Una bebida vibrante y llena de vida. La frescura natural de ${v.toLowerCase()} se equilibra perfectamente con la textura de ${c.toLowerCase()}, creando una mezcla tan nutritiva como refrescante.`;
            } else {
                detailedDescription = `Un plato ${isFit ? 'ligero y equilibrado' : 'contundente y sabroso'} que conquista al primer bocado. La jugosidad de ${p.toLowerCase()} destaca frente al crujiente de ${v.toLowerCase()}, todo ello elevado por el inconfundible aroma a ${f.toLowerCase()}.`;
            }

            mockRecipes.push({
                id: `gen-${isFit ? 'fit' : 'com'}-${i}`,
                title: title,
                description: detailedDescription,
                image: uniqueImg,
                time: rand(10, 45, i * 43) + ' min',
                difficulty: pick(['Fácil', 'Media'], i + 5),
                category: i > 80 ? 'Postres' : (i > 40 && i <= 50 ? 'Desayunos' : (isFit ? 'Cenas' : 'Almuerzos')),
                tags: isFit ? ['Alto en proteínas', 'Perder peso'] : ['Ganar peso', 'Para todos'],
                allergens: [],
                macros: { calories, protein, carbs: carbsNum, fats: fatsNum },
                internalGoal: isFit ? 'fitness' : 'comfort', // internal category
                ingredients: [p, c, v, f, 'Aceite de oliva', 'Especias al gusto'],
                adaptation: { title: 'A tu gusto', text: 'Puedes variar las especias según prefieras.' },
                steps: detailedSteps,
                finalResult: 'Listo para disfrutar.',
                seoSchema: {}
            });
        }
    }

    initTheme() {
        const savedTheme = localStorage.getItem('cuchara_theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            const toggleBtn = document.getElementById('theme-toggle');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const toggleBtn = document.getElementById('theme-toggle');
        if (current === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('cuchara_theme', 'light');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('cuchara_theme', 'dark');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    }

    toggleMobileMenu() {
        this.nav.classList.toggle('active');
        const icon = document.getElementById('mobile-menu-icon');
        if (icon) {
            icon.className = this.nav.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        }
    }

    async toggleFavorite(id, event) {
        if (event) event.stopPropagation();
        if (!this.activeUser) {
            this.showAuthModal('login');
            return;
        }
        
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showToast('Eliminada de favoritos', 'fa-heart-crack');
        } else {
            this.favorites.push(id);
            this.showToast('Añadida a favoritos', 'fa-heart');
        }

        await updateDoc(doc(this.db, "users", this.activeUser.uid), {
            favorites: this.favorites
        });
        
        this.updateFavoriteUI(id);
    }

    updateFavoriteUI(id) {
        const currentRoute = window.location.hash.split('/')[0].replace('#', '') || 'home';
        const isFav = this.favorites.includes(id);
        if (currentRoute === 'recipe') {
            const btn = document.getElementById('recipe-fav-btn');
            if (btn) {
                btn.innerHTML = isFav ? '<i class="fa-solid fa-heart"></i> Guardado' : '<i class="fa-regular fa-heart"></i> Guardar';
                btn.classList.toggle('active', isFav);
            }
        }
        const cardBtns = document.querySelectorAll(`[data-fav="${id}"]`);
        cardBtns.forEach(btn => {
            btn.innerHTML = isFav ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
            btn.style.color = isFav ? 'var(--primary-color)' : 'inherit';
        });
        if (currentRoute === 'favorites') {
            this.renderFavorites();
        }
    }

    async addToShoppingList(recipeId, event) {
        if (event) event.stopPropagation();
        if (!this.activeUser) {
            this.showAuthModal('login');
            return;
        }
        
        const recipe = mockRecipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        let addedCount = 0;
        recipe.ingredients.forEach(ing => {
            const shopItem = `${ing}`;
            if (!this.shoppingList.includes(shopItem)) {
                this.shoppingList.push(shopItem);
                addedCount++;
            }
        });
        
        await updateDoc(doc(this.db, "users", this.activeUser.uid), {
            shoppingList: this.shoppingList
        });
        
        this.updateShoppingBadge();
        this.showToast(`${addedCount} ingredientes añadidos`, 'fa-cart-plus');
    }

    updateShoppingBadge() {
        const badge = document.getElementById('shopping-badge');
        if (!badge) return;
        const count = this.shoppingList.length;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }



    removeFromShoppingList(index) {
        if (!this.checkAuth()) return;
        this.shoppingList.splice(index, 1);
        localStorage.setItem(`cuchara_shop_${this.activeUser.username}`, JSON.stringify(this.shoppingList));
        this.updateShoppingBadge();
        this.renderShoppingList();
    }

    showToast(message, icon) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid ${icon}" style="color:var(--primary-color)"></i> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }


    slugify(text) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.observeElements = () => {
            const elements = document.querySelectorAll('.reveal-on-scroll');
            elements.forEach(el => {
                if (!el.classList.contains('reveal-visible')) {
                    observer.observe(el);
                }
            });
        };

        // MutationObserver to detect new content and observe it
        const mutationObserver = new MutationObserver(() => {
            this.observeElements();
        });

        mutationObserver.observe(this.contentDiv, { childList: true, subtree: true });
        
        // Initial observe
        this.observeElements();
    }

    initAdvancedAnimations() {
        // Mouse Parallax for background ingredients
        window.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.005;
            
            document.querySelectorAll('.bg-ingredient').forEach((icon, idx) => {
                const depth = 0.3 + (idx % 10) * 0.05;
                icon.style.transform = `translate(${moveX * depth}px, ${moveY * depth}px) rotate(${moveX * 0.2}deg)`;
            });
        });

        // Magnetic Buttons Effect
        document.addEventListener('mousemove', (e) => {
            const magnetics = document.querySelectorAll('.btn-action.active, .auth-btn, .fab-chefibot');
            magnetics.forEach(btn => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);
                const distance = Math.sqrt(x*x + y*y);
                
                if (distance < 120) {
                    btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
                } else {
                    btn.style.transform = `translate(0, 0)`;
                }
            });
        });
    }

    init() {
        this.initScrollAnimations();
        this.initAdvancedAnimations();
        window.addEventListener('popstate', (e) => {
            const route = e.state?.route || 'home';
            const params = e.state?.params || null;
            this.renderRoute(route, params, false);
        });

        // Offline Handling
        const offlineBanner = document.getElementById('offline-banner');
        window.addEventListener('online', () => {
            if (offlineBanner) offlineBanner.style.display = 'none';
        });
        window.addEventListener('offline', () => {
            if (offlineBanner) offlineBanner.style.display = 'block';
        });
        if (!navigator.onLine && offlineBanner) {
            offlineBanner.style.display = 'block';
        }

        this.navigate('home');
    }

    navigate(route, params = null) {
        window.history.pushState({ route, params }, '', `#${route}${params ? '/' + params : ''}`);
        
        if (this.nav.classList.contains('active')) {
            this.nav.classList.remove('active');
            const icon = document.getElementById('mobile-menu-icon');
            if (icon) icon.className = 'fa-solid fa-bars';
        }

        window.scrollTo(0, 0);
        this.updateNavHighlight(route);
        this.renderRoute(route, params);
    }

    renderRoute(route, params = null, isPush = true) {
        this.contentDiv.classList.add('route-changing');
        
        setTimeout(() => {
            switch (route) {
                case 'home':
                    this.renderHome();
                    this.updateSchema({});
                    break;
                case 'explore':
                    // Si params trae una categoría (ej: "Desayunos"), limpiar y aplicarla
                    this.activeFilters = { category: [], time: [], diet: [], allergen: [], searchQuery: '', goal: [] };
                    if (params && params !== 'all') {
                        if (params.startsWith('?q=')) {
                            this.activeFilters.searchQuery = decodeURIComponent(params.substring(3));
                        } else if (['Vegano', 'Keto', 'Alto en proteínas'].includes(params)) {
                            // Si el parámetro es una dieta/etiqueta conocida, la añadimos a diet
                            this.activeFilters.diet.push(params);
                        } else {
                            // Por defecto lo tratamos como categoría
                            this.activeFilters.category.push(params);
                        }
                    }
                    this.renderExplore();
                    this.updateSchema({});
                    break;
                case 'favorites':
                    if (!this.checkAuth()) return;
                    this.renderFavorites();
                    this.updateSchema({});
                    break;
                case 'shopping':
                    if (!this.checkAuth()) return;
                    this.renderShoppingList();
                    this.updateSchema({});
                    break;
                case 'planner':
                    this.renderPlanner();
                    this.updateSchema({});
                    break;
                case 'despensa':
                    if (!this.checkAuth()) return;
                    this.renderDespensa();
                    this.updateSchema({});
                    break;
                case 'evaluacion':
                    this.renderEvaluation();
                    this.updateSchema({});
                    break;
                case 'profile':
                    if (!this.checkAuth()) return;
                    this.renderProfile();
                    this.updateSchema({});
                    break;
                case 'recipe':
                    this.renderRecipe(params);
                    break;
                case 'about':
                    this.renderAbout();
                    this.updateSchema({});
                    break;
                case 'contact':
                    this.renderContact();
                    this.updateSchema({});
                    break;
                default:
                    this.renderHome();
            }
            
            window.scrollTo(0, 0);
            this.contentDiv.classList.remove('route-changing');
            this.contentDiv.classList.add('route-ready');
            setTimeout(() => this.contentDiv.classList.remove('route-ready'), 600);
        }, 300);
    }

    updateSchema(data) {
        if (this.schemaScript) {
            this.schemaScript.textContent = JSON.stringify(data);
        }
    }

    renderPersonalizedSection() {
        if (!this.activeUser || !this.userProfile || !this.userProfile.goal) return '';
        
        const goal = this.userProfile.goal;
        const recs = mockRecipes.filter(r => r.tags.includes(goal)).slice(0, 4);
        
        if (recs.length === 0) return '';
        
        const recsHtml = recs.map((r, i) => this.createRecipeCard(r, i)).join('');
        
        return `
            <section class="reveal-on-scroll" style="max-width:1400px; margin: 0 auto 6rem; padding: 0 2rem;">
                <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:3rem;">
                    <div>
                        <h2 style="margin:0; font-size:2.8rem; line-height:1.2;">Especialmente para <span style="color:var(--primary-color);">${this.userProfile.name}</span></h2>
                        <p style="color:var(--text-light); margin-top:0.5rem; font-size:1.1rem;">Selección basada en tu objetivo de <strong>${goal}</strong>.</p>
                    </div>
                </div>
                <div class="recipes-grid">
                    ${recsHtml}
                </div>
            </section>
        `;
    }


    surpriseMe() {
        const randomRecipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
        this.showToast('¡He seleccionado algo especial para ti!', 'fa-magic-wand-sparkles');
        setTimeout(() => this.navigate('recipe', randomRecipe.id), 500);
    }

    handleSearch(inputId = 'main-search') {
        const query = document.getElementById(inputId)?.value;
        if (query) {
            this.navigate('explore', '?q=' + encodeURIComponent(query));
        } else {
            this.showToast('Introduce algo para buscar', 'fa-magnifying-glass');
        }
    }

    showQuickView(recipeId, event) {
        if (event) event.stopPropagation();
        const recipe = mockRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

        modal.innerHTML = `
            <div class="modal-content glass-effect" style="max-width: 800px; padding: 0; overflow: hidden; display: flex; text-align: left;">
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()"><i class="fa-solid fa-xmark"></i></button>
                <div style="flex: 1; min-height: 400px;">
                    <img src="${recipe.image}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; padding: 2.5rem; display: flex; flex-direction: column;">
                    <span class="tag" style="background:var(--primary-color); color:white; width:fit-content; margin-bottom:1rem;">${recipe.category}</span>
                    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${recipe.title}</h2>
                    <p style="color:var(--text-light); font-size: 0.95rem; margin-bottom: 1.5rem;">${recipe.description}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: var(--bg-color); padding: 0.8rem; border-radius: var(--radius-md); text-align: center;">
                            <i class="fa-regular fa-clock" style="color: var(--primary-color);"></i>
                            <div style="font-weight: 700;">${recipe.time}</div>
                        </div>
                        <div style="background: var(--bg-color); padding: 0.8rem; border-radius: var(--radius-md); text-align: center;">
                            <i class="fa-solid fa-fire" style="color: var(--primary-color);"></i>
                            <div style="font-weight: 700;">${recipe.macros?.calories || '?'} kcal</div>
                        </div>
                    </div>

                    <div style="margin-top: auto; display: flex; gap: 1rem;">
                        <button class="auth-btn" style="flex: 1; margin: 0;" onclick="app.navigate('recipe', '${recipe.id}'); this.closest('.modal-overlay').remove();">Ver Receta Completa</button>
                        <button class="header-icon-btn" onclick="app.toggleFavorite('${recipe.id}', event)" style="width: 50px; height: 50px; border-radius: var(--radius-md);">
                            <i class="fa-solid fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderExplore() {
        this.contentDiv.innerHTML = `
            <div class="explore-layout">

                <aside class="filters-sidebar glass-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                        <h3 style="margin:0; font-family:var(--font-heading);">Filtros</h3>
                        <button class="btn-action" onclick="app.clearFilters()" style="padding:0.4rem 0.8rem; font-size:0.8rem;"><i class="fa-solid fa-rotate"></i> Reset</button>
                    </div>

                    <div class="filter-group">
                        <label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.8rem; font-weight:700; color:var(--primary-color);">
                            <i class="fa-solid fa-arrow-down-wide-short"></i> Ordenar por
                        </label>
                        <div class="custom-select-wrapper" style="position:relative;">
                            <select onchange="app.activeFilters.sort = this.value; app.updateExploreGrid();" style="width:100%; padding:0.9rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--card-bg); font-family:var(--font-body); cursor:pointer; appearance:none; box-shadow:var(--shadow-sm);">
                                <option value="default">✨ Relevancia</option>
                                <option value="calories-low">🥗 Menos Calorías</option>
                                <option value="time-low">⏱️ Más Rápidas</option>
                                <option value="protein-high">💪 Más Proteína</option>
                                <option value="difficulty-easy">🍳 Más Fáciles</option>
                            </select>
                            <i class="fa-solid fa-chevron-down" style="position:absolute; right:1rem; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--text-light); font-size:0.8rem;"></i>
                        </div>
                    </div>

                    <div class="filter-group">
                        <h3>Categorías</h3>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('category', 'Desayunos')" ${this.activeFilters.category.includes('Desayunos') ? 'checked' : ''}> Desayunos
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('category', 'Comidas')" ${this.activeFilters.category.includes('Comidas') ? 'checked' : ''}> Comidas
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('category', 'Cenas')" ${this.activeFilters.category.includes('Cenas') ? 'checked' : ''}> Cenas
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('category', 'Postres')" ${this.activeFilters.category.includes('Postres') ? 'checked' : ''}> Postres
                        </label>
                    </div>

                    <div class="filter-group">
                        <h4>Tiempo</h4>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('time', 'Menos de 15 min')" ${this.activeFilters.time.includes('Menos de 15 min') ? 'checked' : ''}> Menos de 15 min
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('time', 'Menos de 30 min')" ${this.activeFilters.time.includes('Menos de 30 min') ? 'checked' : ''}> 15 - 30 min
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('time', 'Más de 30 min')" ${this.activeFilters.time.includes('Más de 30 min') ? 'checked' : ''}> Más de 30 min
                        </label>
                    </div>

                    <div class="filter-group">
                        <h4>Dietas</h4>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('diet', 'Vegano')" ${this.activeFilters.diet.includes('Vegano') ? 'checked' : ''}> Vegano
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('diet', 'Keto')" ${this.activeFilters.diet.includes('Keto') ? 'checked' : ''}> Keto
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('diet', 'Alto en proteínas')" ${this.activeFilters.diet.includes('Alto en proteínas') ? 'checked' : ''}> Alto en proteínas
                        </label>
                    </div>

                    <div class="filter-group">
                        <h4>Objetivo / Método</h4>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('goal', 'Ganar peso')" ${this.activeFilters.goal.includes('Ganar peso') ? 'checked' : ''}> Ganar Masa (Volumen)
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('goal', 'Perder peso')" ${this.activeFilters.goal.includes('Perder peso') ? 'checked' : ''}> Perder Peso (Definición)
                        </label>
                        <label class="filter-label">
                            <input type="checkbox" onchange="app.toggleFilter('goal', 'Para todos')" ${this.activeFilters.goal.includes('Para todos') ? 'checked' : ''}> Mantenimiento Saludable
                        </label>
                    </div>
                    <div class="sidebar-decor" style="position:absolute; bottom:20px; right:20px; opacity:0.1; font-size:4rem; pointer-events:none;"><i class="fa-solid fa-carrot"></i></div>
                    <div class="sidebar-decor" style="position:absolute; top:20px; left:20px; opacity:0.1; font-size:3rem; pointer-events:none; transform:rotate(-45deg);"><i class="fa-solid fa-leaf"></i></div>
                </aside>

                    <div class="recipes-content">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; flex-wrap:wrap; gap:1rem;">
                            <h2 class="section-title" style="text-align: left; margin:0;">Descubrir Recetas</h2>
                            <div id="active-filters-list" style="display:flex; gap:0.5rem; flex-wrap:wrap;"></div>
                        </div>
                        <div class="recipes-grid" id="explore-grid">
                            <!-- Rendered by updateExploreGrid() -->
                        </div>
                        <div id="load-more-container" style="text-align:center; margin-top:4rem; margin-bottom:2rem;">
                            <button class="btn-action" onclick="app.loadMoreRecipes()" id="load-more-btn" style="padding:1rem 3rem;">
                                <i class="fa-solid fa-plus"></i> Cargar más recetas
                            </button>
                        </div>
                    </div>
            </div>
        `;
        
        this.updateExploreGrid();
    }

    clearFilters() {
        this.activeFilters = { category: [], time: [], diet: [], allergen: [], searchQuery: '', goal: [], sort: 'default' };
        this.recipesToShow = 12;
        this.renderExplore();
    }

    loadMoreRecipes() {
        this.recipesToShow += 12;
        this.updateExploreGrid();
    }

    toggleFilter(category, value) {
        const index = this.activeFilters[category].indexOf(value);
        if (index === -1) {
            this.activeFilters[category].push(value);
        } else {
            this.activeFilters[category].splice(index, 1);
        }
        this.updateExploreGrid();
    }

    updateExploreGrid() {
        const grid = document.getElementById('explore-grid');
        if (!grid) return;

        // [SKELETON] Show skeletons briefly for premium feel
        grid.innerHTML = Array(6).fill(0).map(() => `
            <div class="skeleton-card">
                <div class="skeleton-img skeleton"></div>
                <div class="skeleton-line skeleton"></div>
                <div class="skeleton-line skeleton short"></div>
            </div>
        `).join('');

        setTimeout(() => {
            let filtered = mockRecipes.filter(recipe => {
                // Search Query filter (Multi-word support for pantry/search)
                if (this.activeFilters.searchQuery) {
                    const q = this.activeFilters.searchQuery.toLowerCase();
                    
                    // ChefiBot Intent Logic: Map natural language to tags
                    const intents = {
                        'ligero': ['Bajo en calorías', 'Saludable', 'Vegano'],
                        'perder peso': ['Bajo en calorías', 'Perder peso'],
                        'gym': ['Alto en proteínas', 'Ganar peso'],
                        'músculo': ['Alto en proteínas', 'Ganar peso'],
                        'rápido': ['Menos de 15 min', 'Menos de 30 min'],
                        'facil': ['Fácil'],
                        'sano': ['Saludable', 'Vegano'],
                        'cena': ['Cenas'],
                        'comida': ['Comidas'],
                        'desayuno': ['Desayunos']
                    };

                    // Check if query matches an intent
                    let intentMatch = false;
                    for (const [key, tags] of Object.entries(intents)) {
                        if (q.includes(key)) {
                            if (recipe.tags.some(t => tags.includes(t)) || tags.includes(recipe.category)) {
                                intentMatch = true;
                                break;
                            }
                        }
                    }

                    const matchTitle = recipe.title.toLowerCase().includes(q);
                    const matchIngredient = recipe.ingredients.some(ing => ing.toLowerCase().includes(q));
                    const matchCategory = recipe.category.toLowerCase().includes(q);
                    
                    if (!matchTitle && !matchIngredient && !matchCategory && !intentMatch) return false;
                }
                // Category filter
                if (this.activeFilters.category.length > 0) {
                    if (!this.activeFilters.category.includes(recipe.category)) return false;
                }
                // Time filter
                if (this.activeFilters.time.length > 0) {
                    if (!this.activeFilters.time.some(t => recipe.tags.includes(t))) return false;
                }
                // Diet filter
                if (this.activeFilters.diet.length > 0) {
                    if (!this.activeFilters.diet.some(d => recipe.tags.includes(d))) return false;
                }
                // Goal filter
                if (this.activeFilters.goal.length > 0) {
                    if (!this.activeFilters.goal.some(g => recipe.tags.includes(g))) return false;
                }
                return true;
            });

            // Sorting Logic
            if (this.activeFilters.sort === 'calories-low') {
                filtered.sort((a, b) => (a.macros?.calories || 0) - (b.macros?.calories || 0));
            } else if (this.activeFilters.sort === 'time-low') {
                const parseTime = t => parseInt(String(t).match(/\d+/)?.[0] || 30);
                filtered.sort((a, b) => parseTime(a.time) - parseTime(b.time));
            } else if (this.activeFilters.sort === 'protein-high') {
                filtered.sort((a, b) => (b.macros?.protein || 0) - (a.macros?.protein || 0));
            } else if (this.activeFilters.sort === 'difficulty-easy') {
                const diffMap = { 'Fácil': 1, 'Media': 2, 'Difícil': 3 };
                filtered.sort((a, b) => (diffMap[a.difficulty] || 2) - (diffMap[b.difficulty] || 2));
            }

            // Update Filter Tags UI
            this.renderFilterTags();

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="reveal-on-scroll" style="grid-column: 1/-1; text-align: center; padding: 5rem 2rem;">
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 4rem; color: var(--border-color); margin-bottom: 2rem; display: block;"></i>
                        <h3 style="font-size: 2rem; margin-bottom: 1rem;">No hemos encontrado recetas</h3>
                        <p style="color: var(--text-light); font-size: 1.1rem; margin-bottom: 2rem;">Prueba a cambiar los filtros o el término de búsqueda.</p>
                        <button class="btn-action active" onclick="app.clearFilters()" style="margin: 0 auto; padding: 1rem 3rem;">Limpiar filtros</button>
                    </div>
                `;
                const loadMoreBtn = document.getElementById('load-more-btn');
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                return;
            }

            const displayList = filtered.slice(0, this.recipesToShow);
            grid.innerHTML = displayList.map((recipe, index) => this.createRecipeCard(recipe, index)).join('');

            const loadMoreBtn = document.getElementById('load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = filtered.length > this.recipesToShow ? 'inline-block' : 'none';
            }
        }, 400); 
    }

    launchConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = ['#d35400', '#f1c40f', '#2ecc71', '#3498db', '#e74c3c'][Math.floor(Math.random() * 5)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '10001';
            confetti.style.borderRadius = '2px';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(confetti);

            const animation = confetti.animate([
                { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate3d(${(Math.random() - 0.5) * 200}px, 100vh, 0) rotate(${Math.random() * 1000}deg)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 3000,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            });

            animation.onfinish = () => confetti.remove();
        }
    }

    renderFilterTags() {
        const container = document.getElementById('active-filters-list');
        if (!container) return;
        
        let tagsHtml = '';
        const sortNames = { 
            'calories-low': 'Menos Calorías', 
            'time-low': 'Más Rápidas', 
            'protein-high': 'Más Proteína',
            'difficulty-easy': 'Más Fáciles'
        };

        Object.entries(this.activeFilters).forEach(([key, values]) => {
            if (key === 'searchQuery' && values) {
                tagsHtml += this.createTagHtml('Búsqueda', values, 'searchQuery');
            } else if (key === 'sort' && values !== 'default') {
                tagsHtml += this.createTagHtml('Orden', sortNames[values], 'sort');
            } else if (Array.isArray(values)) {
                values.forEach(v => tagsHtml += this.createTagHtml(key, v, key));
            }
        });

        container.innerHTML = tagsHtml;
    }

    createTagHtml(type, value, key) {
        return `
            <div class="filter-tag" style="background:var(--primary-color); color:white; padding:0.4rem 1rem; border-radius:50px; font-size:0.85rem; display:flex; align-items:center; gap:0.6rem; animation:fadeIn 0.3s ease; box-shadow:var(--shadow-sm); border:1px solid rgba(255,255,255,0.1);">
                <span style="font-weight:600;">${value}</span>
                <i class="fa-solid fa-circle-xmark" style="cursor:pointer; opacity:0.9; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" onclick="app.removeSpecificFilter('${key}', '${value}')"></i>
            </div>
        `;
    }

    removeSpecificFilter(key, value) {
        if (key === 'searchQuery') {
            this.activeFilters[key] = '';
            const input = document.getElementById('explore-search') || document.getElementById('home-search');
            if (input) input.value = '';
        } else if (key === 'sort') {
            this.activeFilters[key] = 'default';
        } else {
            this.activeFilters[key] = this.activeFilters[key].filter(v => v !== value);
        }
        this.recipesToShow = 12;
        this.updateExploreGrid();
    }

    renderIngredientLabel(label) {
        const baseText = label.getAttribute('data-base');
        if (!baseText) return;

        const factor = this.currentPortions / (this.currentRecipe.servings || 1);

        let scaledText = baseText.replace(/^([\d\.\/]+)/, (match) => {
            let num = 0;
            if (match.includes('/')) {
                const parts = match.split('/');
                num = (parseInt(parts[0]) / parseInt(parts[1])) * factor;
            } else {
                num = parseFloat(match) * factor;
            }
            return num % 1 === 0 ? num : num.toFixed(1);
        });

        if (this.isImperial) {
            scaledText = scaledText.replace(/(\d+(?:\.\d+)?)\s*(g|gramos)/gi, (match, num) => `${(parseFloat(num) * 0.035274).toFixed(1)} oz`);
            scaledText = scaledText.replace(/(\d+(?:\.\d+)?)\s*(ml|mililitros)/gi, (match, num) => `${(parseFloat(num) * 0.033814).toFixed(1)} fl oz`);
            scaledText = scaledText.replace(/(\d+(?:\.\d+)?)\s*(kg|kilos)/gi, (match, num) => `${(parseFloat(num) * 2.20462).toFixed(1)} lbs`);
        }

        label.textContent = scaledText;
    }

    toggleUnits() {
        this.isImperial = !this.isImperial;
        const labels = document.querySelectorAll('.ingredient-item-alt label');
        labels.forEach(label => this.renderIngredientLabel(label));
        this.showToast(this.isImperial ? 'Sistema Imperial (oz, cups)' : 'Sistema Métrico (g, ml)', 'fa-scale-balanced');
    }

    showCommentForm() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content glass-effect" style="max-width:500px; padding:3rem;">
                <h3 style="margin-bottom:1rem;">Tu opinión nos importa</h3>
                <form onsubmit="event.preventDefault(); app.showToast('¡Gracias por tu comentario! Será revisado pronto.', 'fa-check'); this.closest('.modal').remove();">
                    <div style="margin-bottom:1.5rem;">
                        <label style="display:block; margin-bottom:0.5rem; font-size:0.9rem;">Valoración</label>
                        <div style="color:#f1c40f; font-size:1.5rem;">
                            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-regular fa-star"></i>
                        </div>
                    </div>
                    <textarea required placeholder="¿Qué te ha parecido la receta?" style="width:100%; padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-color); min-height:100px; margin-bottom:1.5rem;"></textarea>
                    <button type="submit" class="btn-action active" style="width:100%; justify-content:center;">Publicar Opinión</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    calculateNutriScore(recipe) {
        let score = 0; // Lower is better
        if (recipe.tags.includes('Vegano')) score -= 2;
        if (recipe.tags.includes('Bajo en calorías')) score -= 3;
        if (recipe.tags.includes('Alto en proteínas')) score -= 2;
        if (recipe.macros) {
            if (recipe.macros.calories < 400) score -= 2;
            if (recipe.macros.protein > 20) score -= 2;
            if (recipe.macros.fats > 25) score += 3;
            if (recipe.macros.calories > 700) score += 4;
        }
        if (recipe.category === 'Postres') score += 5;

        if (score <= -2) return 'A';
        if (score <= 1) return 'B';
        if (score <= 4) return 'C';
        if (score <= 7) return 'D';
        return 'E';
    }

    renderHome(append = false) {
        if (!append) this.recipesToShow = 12;
        
        const recipes = mockRecipes.slice(0, this.recipesToShow);
        const featuredRecipes = [
            { id: 'curry-lentejas', img: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80&fit=crop' },
            { id: 'salmon-esparragos', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80&fit=crop' },
            { id: 'sushi-maki', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80&fit=crop' },
            { id: 'shakshuka-tunecina', img: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&q=80&fit=crop' },
            { id: 'tacos-pastor', img: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80&fit=crop' },
            { id: 'pasta-carbonara', img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80&fit=crop' }
        ];

        const featuredHtml = featuredRecipes.map((item, index) => {
            const recipe = mockRecipes.find(r => r.id === item.id) || mockRecipes[index];
            return this.createRecipeCard(recipe, index);
        }).join('');

        if (append) {
            const grid = document.querySelector('.recipes-grid');
            if (grid) {
                grid.innerHTML = featuredHtml;
                const loadMoreBtn = document.getElementById('load-more-btn');
                if (this.recipesToShow >= mockRecipes.length) {
                    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                }
                return;
            }
        }

        this.contentDiv.innerHTML = `
            <div class="blob" style="top:10%; left:-5%;"></div>
            <div class="blob" style="bottom:10%; right:-5%; background:radial-gradient(circle, rgba(231,76,60,0.05) 0%, rgba(231,76,60,0) 70%);"></div>

            <section class="hero glass-card" style="position:relative; overflow:hidden; border-radius: var(--radius-xl); margin: 1rem 0 3rem; padding: 6rem 2rem;">
                <div class="hero-decor" style="top:-100px; left:-100px;"></div>
                <div class="hero-decor" style="bottom:-100px; right:-100px;"></div>
                
                <div class="fade-in" style="position:relative; z-index:10;">
                    <span class="goal-badge mantener float" style="margin-bottom: 1.5rem; font-size: 0.9rem; padding: 0.5rem 1.5rem; box-shadow: var(--shadow-sm); display: inline-flex; align-items:center;">
                        <i class="fa-solid fa-sparkles"></i> Tu compañero de cocina inteligente
                    </span>
                    <h1 class="shimmer-text" style="font-size: 4.5rem; margin-bottom: 1rem;">Cuchara <em>&</em> Sabor</h1>
                    <p style="max-width:700px; margin: 0 auto 2.5rem; font-size: 1.25rem;">Descubre recetas saludables adaptadas a tus objetivos, gestiona tu despensa y cocina con ChefiBot.</p>
                    
                    <div class="search-bar glass-effect" style="max-width: 700px; margin: 0 auto; box-shadow: var(--shadow-lg);">
                        <i class="fa-solid fa-magnifying-glass" style="margin-left:1.5rem; color:var(--text-light);"></i>
                        <input type="text" id="home-search" placeholder="¿Qué te apetece cocinar hoy?..." onkeypress="if(event.key==='Enter') app.handleSearch('home-search')">
                        <button onclick="app.handleSearch('home-search')" style="padding: 0 2.5rem;">Buscar</button>
                    </div>

                    <div style="margin-top: 2.5rem; display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
                        <button class="btn-action active" onclick="app.navigate('explore')" style="padding: 1rem 2.5rem; font-size: 1.05rem;">
                            <i class="fa-solid fa-compass"></i> Explorar Catálogo
                        </button>
                    </div>
                </div>
            </section>

            <section class="reveal-on-scroll animated-gradient-border" style="max-width:1400px; margin: 0 auto 5rem; padding: 0;">
                <div class="inner-card daily-recipe-card" onclick="app.navigate('recipe', '${mockRecipes[0].id}')">
                    <div class="daily-label">Receta del Día</div>
                    <div style="display:grid; grid-template-columns: 1fr 1.5fr; gap:3rem; align-items:center;">
                        <div class="daily-img-wrapper">
                            <img src="${mockRecipes[0].image}" alt="${mockRecipes[0].title}">
                            <div class="trending-badge"><i class="fa-solid fa-fire"></i> Tendencia</div>
                        </div>
                        <div class="daily-content">
                            <h2 style="font-size:3rem; margin-bottom:1rem;">${mockRecipes[0].title}</h2>
                            <p style="font-size:1.2rem; color:var(--text-light); line-height:1.7; margin-bottom:2rem;">${mockRecipes[0].description}</p>
                            <div style="display:flex; gap:2rem; margin-bottom:2rem;">
                                <div class="daily-stat">
                                    <i class="fa-regular fa-clock"></i>
                                    <span>${mockRecipes[0].time}</span>
                                </div>
                                <div class="daily-stat">
                                    <i class="fa-solid fa-chart-simple"></i>
                                    <span>${mockRecipes[0].difficulty}</span>
                                </div>
                                <div class="daily-stat">
                                    <i class="fa-solid fa-fire"></i>
                                    <span>${mockRecipes[0].macros?.calories || '450'} kcal</span>
                                </div>
                            </div>
                            <button class="btn-action active" onclick="app.navigate('recipe', '${mockRecipes[0].id}')" style="padding:1.2rem 3rem; font-size:1.1rem; border-radius:var(--radius-lg);">
                                Cocinar ahora <i class="fa-solid fa-chevron-right" style="margin-left:1rem;"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="categories-carousel fade-in-stagger" style="margin-bottom: 5rem;">
                <button class="category-btn" onclick="app.navigate('explore', 'Desayunos')"><i class="fa-solid fa-mug-hot"></i> Desayunos</button>
                <button class="category-btn" onclick="app.navigate('explore', 'Almuerzos')"><i class="fa-solid fa-utensils"></i> Almuerzos</button>
                <button class="category-btn" onclick="app.navigate('explore', 'Cenas')"><i class="fa-solid fa-moon"></i> Cenas</button>
                <button class="category-btn" onclick="app.navigate('explore', 'Postres')"><i class="fa-solid fa-ice-cream"></i> Postres</button>
                <button class="category-btn" onclick="app.navigate('explore', 'Vegano')"><i class="fa-solid fa-leaf"></i> Vegano</button>
            </section>


            <section class="reveal-on-scroll" style="max-width:1400px; margin: 0 auto 6rem; padding: 0 2rem;">
                <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:3rem;">
                    <div>
                        <h2 class="reveal-on-scroll" style="margin:0; font-size:2.8rem; line-height:1.2;">Selección <span style="color:var(--primary-color);">Premium</span></h2>
                        <p class="reveal-on-scroll" style="color:var(--text-light); margin-top:0.5rem; font-size:1.1rem;">Recetas curadas por expertos para tu bienestar.</p>
                    </div>
                    <a href="#" onclick="app.navigate('explore'); return false;" class="reveal-on-scroll" style="color:var(--primary-color); font-weight:700; font-size:1.1rem; display:flex; align-items:center; gap:0.5rem;">Explorar todas <i class="fa-solid fa-chevron-right"></i></a>
                </div>
            </section>
        `;
    }


    renderRecipe(id) {
        const recipe = mockRecipes.find(r => r.id === id);
        if (!recipe) {
            this.navigate('home');
            return;
        }

        this.currentRecipe = recipe;
        this.currentPortions = 1;

        this.updateSchema(recipe.seoSchema);

        const ingredientsHtml = recipe.ingredients.map(ing => {
            return `
                <div class="ingredient-item-alt" style="display:flex; align-items:center; gap:0.5rem; padding: 0.5rem 0;">
                    <input type="checkbox" id="ing-${ing.replace(/\s+/g, '-')}" class="custom-checkbox">
                    <label for="ing-${ing.replace(/\s+/g, '-')}" data-base="${ing}" style="font-size:1.1rem; cursor:pointer; color:var(--text-dark); flex:1;">${ing}</label>
                </div>
            `;
        }).join('');

        window.onscroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            const bar = document.getElementById('scroll-progress');
            if (bar) bar.style.width = scrolled + "%";
        };

        const stepsHtml = recipe.steps.map((step, idx) => `
            <div class="step-item">
                <span class="step-number">${idx + 1}</span>
                <p>${step.text}</p>
                ${step.image ? '<img src="' + step.image + '" alt="Paso ' + (idx + 1) + '" class="step-img" loading="lazy">' : ''}
            </div>
        `).join('');

        const tagsHtml = recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        const nutriScore = this.calculateNutriScore(recipe);
        const nutriScoreHtml = `
            <div class="nutriscore-container">
                <span class="nutriscore-label">Nutri-Score</span>
                <span class="nutriscore nutriscore-${nutriScore.toLowerCase()}">${nutriScore}</span>
            </div>
        `;

        this.contentDiv.innerHTML = `
            <article class="recipe-detail">
                <div class="recipe-header">
                    <span class="category-badge" style="display:inline-block; background:var(--secondary-color); color:white; padding:0.4rem 1rem; border-radius:20px; font-weight:bold; margin-bottom:1rem;">${recipe.category}</span>
                    <h1>${recipe.title}</h1>
                    <p style="color: var(--text-light); font-size: 1.2rem; max-width: 700px; margin: 0 auto 1.5rem;">${recipe.description}</p>
                    <div class="card-tags" style="position: relative; justify-content: center; left:0; top:0; margin-bottom: 1rem;">
                        ${tagsHtml}
                    </div>
                    ${nutriScoreHtml}
                </div>

                <div class="recipe-actions">
                    <button class="btn-action" style="background:var(--primary-color); color:white; border-color:var(--primary-color);" onclick="app.enterCookingMode('${recipe.id}')">
                        <i class="fa-solid fa-fire-burner"></i> Modo Cocina
                    </button>
                    <button id="recipe-fav-btn" class="btn-action ${this.favorites.includes(recipe.id) ? 'active' : ''}" onclick="app.toggleFavorite('${recipe.id}')">
                        <i class="${this.favorites.includes(recipe.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i> ${this.favorites.includes(recipe.id) ? 'Guardado' : 'Guardar'}
                    </button>
                    <button class="btn-action" onclick="app.addToShoppingList('${recipe.id}')">
                        <i class="fa-solid fa-cart-plus"></i> Añadir Ingredientes
                    </button>
                    <button class="btn-action" onclick="app.toggleUnits()">
                        <i class="fa-solid fa-scale-balanced"></i> Convertir Medidas
                    </button>
                    <button class="btn-action" onclick="window.print()">
                        <i class="fa-solid fa-print"></i> Imprimir
                    </button>
                    <button class="btn-action" onclick="navigator.clipboard.writeText(window.location.href); app.showToast('Enlace copiado', 'fa-link')">
                        <i class="fa-solid fa-share-nodes"></i> Compartir
                    </button>
                </div>

                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-hero-img">

                <div class="recipe-info-grid">
                    <div class="info-item">
                        <i class="fa-regular fa-clock"></i>
                        <span class="label">Tiempo</span>
                        <span class="value">${recipe.time}</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-chart-simple"></i>
                        <span class="label">Dificultad</span>
                        <span class="value">${recipe.difficulty}</span>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-users"></i>
                        <span class="label">Porciones</span>
                        <div style="display:flex; align-items:center; gap:0.5rem; justify-content:center; margin-top:0.2rem;">
                            <button onclick="app.updatePortions(-1)" class="btn-portion" title="Menos comensales"><b>-</b></button>
                            <span id="recipe-portions-val" style="font-weight:bold; font-size:1.5rem; min-width:2.5rem; text-align:center; color:var(--primary-color);">1</span>
                            <button onclick="app.updatePortions(1)" class="btn-portion" title="Más comensales"><b>+</b></button>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fa-solid fa-leaf"></i>
                        <span class="label">Categoría</span>
                        <span class="value">${recipe.category}</span>
                    </div>
                </div>

                ${recipe.macros ? `
                <div class="macros-editorial glass-effect">
                    <div class="macro-stat">
                        <span class="val">${recipe.macros.calories}</span>
                        <span class="unit">Kcal</span>
                        <span class="title">Calorías</span>
                    </div>
                    <div class="macro-stat">
                        <span class="val">${recipe.macros.protein}</span>
                        <span class="unit">g</span>
                        <span class="title">Proteínas</span>
                    </div>
                    <div class="macro-stat">
                        <span class="val">${recipe.macros.carbs}</span>
                        <span class="unit">g</span>
                        <span class="title">Carbohidratos</span>
                    </div>
                    <div class="macro-stat">
                        <span class="val">${recipe.macros.fats}</span>
                        <span class="unit">g</span>
                        <span class="title">Grasas</span>
                    </div>
                </div>
                
                <div class="nutrition-radar glass-effect" style="margin-top: 2rem; padding: 2rem; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 3rem; background: linear-gradient(135deg, rgba(211,84,0,0.05) 0%, rgba(255,255,255,0.02) 100%);">
                    <div class="radar-visual" style="position:relative; width:120px; height:120px; flex-shrink:0;">
                        <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="3" />
                            <path id="radar-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary-color)" stroke-width="3" stroke-dasharray="75, 100" style="transition: stroke-dasharray 1s ease;" />
                        </svg>
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; width:100%;">
                            <strong style="font-size:1.4rem; display:block; line-height:1;">${recipe.macros.calories}</strong>
                            <small style="font-size:0.6rem; color:var(--text-light); text-transform:uppercase; letter-spacing:1px;">Kcal</small>
                        </div>
                    </div>
                    <div class="radar-info" style="flex:1;">
                        <h4 style="margin-bottom:0.8rem; font-family:var(--font-heading);">Balance Nutricional</h4>
                        <div style="display:flex; flex-direction:column; gap:0.6rem;">
                            <div style="display:flex; align-items:center; gap:0.8rem;">
                                <span style="font-size:0.85rem; min-width:80px;">Proteínas</span>
                                <div style="flex:1; height:6px; background:rgba(0,0,0,0.05); border-radius:3px; overflow:hidden;">
                                    <div style="width:${Math.min(100, (recipe.macros.protein/50)*100)}%; height:100%; background:#27ae60;"></div>
                                </div>
                                <span style="font-size:0.85rem; font-weight:700;">${recipe.macros.protein}g</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:0.8rem;">
                                <span style="font-size:0.85rem; min-width:80px;">Carbohidratos</span>
                                <div style="flex:1; height:6px; background:rgba(0,0,0,0.05); border-radius:3px; overflow:hidden;">
                                    <div style="width:${Math.min(100, (recipe.macros.carbs/100)*100)}%; height:100%; background:#f1c40f;"></div>
                                </div>
                                <span style="font-size:0.85rem; font-weight:700;">${recipe.macros.carbs}g</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:0.8rem;">
                                <span style="font-size:0.85rem; min-width:80px;">Grasas</span>
                                <div style="flex:1; height:6px; background:rgba(0,0,0,0.05); border-radius:3px; overflow:hidden;">
                                    <div style="width:${Math.min(100, (recipe.macros.fats/30)*100)}%; height:100%; background:#e67e22;"></div>
                                </div>
                                <span style="font-size:0.85rem; font-weight:700;">${recipe.macros.fats}g</span>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <div class="chef-callout glass-effect">
                    <div class="chef-icon"><i class="fa-solid fa-hat-chef"></i></div>
                    <div class="chef-text">
                        <strong>Tip del Chef</strong>
                        <p>${recipe.chefTip || 'Para un sabor más profundo, tuesta ligeramente las especias secas antes de añadir los líquidos.'}</p>
                    </div>
                </div>

                <div class="recipe-body-editorial">
                    <section class="ingredients-editorial">
                        <h2><i class="fa-solid fa-basket-shopping"></i> Ingredientes</h2>
                        <div class="ingredients-list-alt">
                            ${ingredientsHtml}
                        </div>
                        
                    </section>

                    <section class="instructions-editorial">
                        <h2><i class="fa-solid fa-fire-burner"></i> Preparación</h2>
                        <div class="steps-timeline">
                            ${stepsHtml}
                        </div>
                    </section>
                </div>
            </article>

            <section class="community-section" style="max-width:1000px; margin: 4rem auto;">
                <h2 style="text-align:center; font-family:var(--font-heading); margin-bottom:1rem;">Opiniones de la Comunidad</h2>
                <!-- [BLOQUE3] Encabezado de Reseñas Rediseñado -->
                <div class="reviews-header">
                    <h2 style="margin:0; font-family:var(--font-heading);">Comunidad <em>&</em> Sabor</h2>
                    <div class="avg-rating-big">
                        ${this.renderAvgStars(recipe.id)}
                    </div>
                </div>

                <div id="opinions-section">
                    ${this.activeUser ? `
                        <div class="review-form-card" id="review-form-container">
                            <h3 style="margin-bottom:1.5rem;">Comparte tu experiencia</h3>
                            <div class="star-rating-input" id="star-rating-selector">
                                ${[1, 2, 3, 4, 5].map(i => `<i class="fa-regular fa-star" data-star="${i}" onclick="app.setRating(${i})" onmouseover="app.hoverStars(${i})" onmouseout="app.resetStars()"></i>`).join('')}
                            </div>
                            <div id="rating-error" style="color:var(--primary-color); font-size:0.8rem; margin-bottom:1rem; display:none;">Por favor, selecciona al menos una estrella</div>
                            
                            <input type="text" id="review-title" placeholder="Título de tu reseña (ej: ¡Increíble sabor!)" maxlength="60" oninput="app.updateCounter('title-count', this)" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-md); margin-bottom:0.5rem;">
                            <span class="char-counter" id="title-count">60 caracteres restantes</span>
                            
                            <textarea id="review-text" placeholder="¿Qué te ha parecido la receta? Cuéntanos los detalles..." maxlength="500" oninput="app.updateCounter('text-count', this)" style="width:100%; min-height:120px; padding:1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); margin-top:1rem; margin-bottom:0.5rem;"></textarea>
                            <span class="char-counter" id="text-count">500 caracteres restantes</span>

                            <button class="btn-submit-review" onclick="app.submitReview('${recipe.id}')" style="margin-top:1.5rem;">
                                <span>Publicar Reseña</span>
                            </button>
                        </div>
                    ` : `
                        <div class="auth-banner-reviews">
                            <i class="fa-solid fa-comments" style="font-size:3rem; color:var(--primary-color); margin-bottom:1rem; display:block;"></i>
                            <h3>¿Te ha gustado la receta?</h3>
                            <p style="color:var(--text-light); margin-bottom:1.5rem;">Inicia sesión para compartir tu opinión con la comunidad.</p>
                            <button class="btn-action active" onclick="app.showAuthModal('login')" style="margin:0 auto;">Iniciar Sesión</button>
                        </div>
                    `}

                    <div id="opinions-container">
                        ${this.renderOpinions(recipe.id)}
                    </div>
                </div>
            </section>
        `;
    }

    renderAvgStars(recipeId) {
        const ops = this.opinions[recipeId] || [];
        if (ops.length === 0) return '<span style="font-size:1rem; color:var(--text-light);">Sin valorar</span>';
        
        const avg = ops.reduce((acc, op) => acc + op.rating, 0) / ops.length;
        return `
            <span style="color:#f1c40f;"><i class="fa-solid fa-star"></i> ${avg.toFixed(1)}</span>
            <span style="font-size:0.9rem; color:var(--text-light); font-weight:400;">(${ops.length} opiniones)</span>
        `;
    }

    renderOpinions(recipeId) {
        const ops = (this.opinions[recipeId] || []).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        
        if (ops.length === 0) {
            return `
                <div style="text-align:center; padding:4rem 0; opacity:0.6;">
                    <i class="fa-regular fa-comment-dots" style="font-size:3rem; margin-bottom:1rem; display:block;"></i>
                    <p>Sé el primero en valorar esta receta</p>
                </div>
            `;
        }

        return ops.map(op => `
            <div class="review-card-alt reveal-on-scroll">
                <div class="review-user-info">
                    <div class="review-avatar" style="background:${op.color || 'var(--primary-color)'}">${op.avatar || 'U'}</div>
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center;">
                            <strong style="font-size:1rem;">${op.user}</strong>
                            ${op.verified ? '<span class="verified-badge"><i class="fa-solid fa-circle-check"></i> Verificado</span>' : ''}
                        </div>
                        <small style="color:var(--text-light);">${this.formatRelativeDate(op.date)}</small>
                    </div>
                    <div style="color:#f1c40f; font-size:0.85rem;">
                        ${Array(5).fill(0).map((_, i) => `<i class="fa-${i < op.rating ? 'solid' : 'regular'} fa-star"></i>`).join('')}
                    </div>
                </div>
                <h4 style="margin-bottom:0.5rem; font-weight:700;">${op.title || 'Sin título'}</h4>
                <p style="color:var(--text-dark); line-height:1.6;">${op.text}</p>
            </div>
        `).join('');
    }

    formatRelativeDate(dateStr) {
        if (!dateStr) return 'Recientemente';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'Hoy';
        if (diff === 1) return 'Ayer';
        if (diff < 7) return `Hace ${diff} días`;
        return date.toLocaleDateString();
    }

    // [BLOQUE3] Lógica de Formulario de Reseñas
    selectedRating = 0;

    setRating(rating) {
        this.selectedRating = rating;
        const stars = document.querySelectorAll('#star-rating-selector i');
        stars.forEach((s, i) => {
            s.className = i < rating ? 'fa-solid fa-star active' : 'fa-regular fa-star';
        });
        document.getElementById('rating-error').style.display = 'none';
    }

    hoverStars(rating) {
        const stars = document.querySelectorAll('#star-rating-selector i');
        stars.forEach((s, i) => {
            if (i < rating) {
                s.className = 'fa-solid fa-star active';
                s.style.transform = 'scale(1.1)';
            }
        });
    }

    resetStars() {
        this.setRating(this.selectedRating);
        const stars = document.querySelectorAll('#star-rating-selector i');
        stars.forEach(s => s.style.transform = 'scale(1)');
    }

    updateCounter(id, el) {
        const remaining = el.maxLength - el.value.length;
        document.getElementById(id).textContent = `${remaining} caracteres restantes`;
    }

    async submitReview(recipeId) {
        if (!this.activeUser) {
            this.showAuthModal('login');
            return;
        }
        if (this.selectedRating === 0) {
            document.getElementById('rating-error').style.display = 'block';
            return;
        }

        const title = document.getElementById('review-title').value.trim();
        const text = document.getElementById('review-text').value.trim();
        const btn = document.querySelector('.btn-submit-review');

        if (text.length < 20) {
            this.showToast('El comentario debe tener al menos 20 caracteres', 'fa-exclamation-triangle');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';

        try {
            await addDoc(collection(this.db, "opinions"), {
                recipeId,
                userId: this.activeUser.uid,
                user: this.userProfile?.name || 'Cocinilla',
                avatar: (this.userProfile?.name || 'U')[0].toUpperCase(),
                rating: this.selectedRating,
                title: this.escapeHTML(title),
                text: this.escapeHTML(text),
                date: new Date().toISOString(),
                verified: (this.userStats.recipesCooked > 0),
                createdAt: serverTimestamp()
            });

            btn.innerHTML = '<i class="fa-solid fa-check success-check"></i> ¡Publicado!';
            btn.style.background = '#27ae60';
            setTimeout(() => this.renderRecipe(recipeId), 800);
        } catch (error) {
            this.showToast('Error al publicar', 'fa-circle-exclamation');
            btn.disabled = false;
            btn.innerHTML = 'Publicar Reseña';
        }
    }

    renderOpinions(recipeId) {
        const recipeOpinions = this.opinions[recipeId] || [
            { user: 'Alex Lopez', avatar: 'AL', text: '¡Me ha quedado espectacular! El toque de especias es clave.', color: '#e67e22', likes: 24 },
            { user: 'Marta Ruiz', avatar: 'MR', text: 'Muy fácil de seguir, incluso para alguien que no cocina mucho.', color: '#27ae60', likes: 12 }
        ];

        return `
            <div class="community-grid">
                ${recipeOpinions.map(op => `
                    <div class="community-post">
                        <div class="post-header">
                            <div class="post-avatar" style="background:${op.color || '#d35400'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold;">${op.avatar || 'U'}</div>
                            <div style="display:flex; flex-direction:column;">
                                <span class="post-user">${op.user} ${op.verified ? '<i class="fa-solid fa-circle-check" style="color:#3498db; font-size:0.8rem; margin-left:4px;" title="Cocinero Verificado"></i>' : ''}</span>
                                <small style="font-size:0.7rem; color:var(--text-light);">${op.date || 'Recientemente'}</small>
                            </div>
                        </div>
                        <div class="post-footer">
                            <div style="color:#f1c40f; font-size:0.8rem; margin-bottom:0.4rem;">
                                ${Array(5).fill(0).map((_, i) => `<i class="fa-${i < (op.rating || 5) ? 'solid' : 'regular'} fa-star"></i>`).join('')}
                            </div>
                            <div class="post-caption">"${op.text}"</div>
                            <div class="post-actions" style="margin-top:1rem; font-size:0.9rem;">
                                <i class="fa-solid fa-heart" style="color:#e74c3c;"></i> ${op.likes || 0} 
                                <i class="fa-regular fa-comment" style="margin-left:1rem;"></i> 0
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showCommentForm(recipeId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'comment-modal';
        
        modal.innerHTML = `
            <div class="auth-card" style="max-width:500px; padding:2.5rem;">
                <h2 style="font-family:var(--font-heading); margin-bottom:1rem;">Comparte tu opinión</h2>
                <p style="color:var(--text-light); margin-bottom:2rem;">Cuéntales a otros qué tal te ha salido la receta.</p>
                
                <div style="margin-bottom:1.5rem;">
                    <label style="display:block; margin-bottom:0.5rem; font-weight:bold;">Tu Nombre</label>
                    <input type="text" id="comment-user" placeholder="Ej: Cocinilla Experto" style="width:100%; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
                </div>

                <div style="margin-bottom:1.5rem; display:flex; align-items:center; gap:1rem;">
                    <label style="font-weight:bold;">Tu Valoración:</label>
                    <div id="star-rating" style="color:#f1c40f; font-size:1.5rem; cursor:pointer;">
                        <i class="fa-solid fa-star" onclick="app.setRating(1)"></i>
                        <i class="fa-regular fa-star" onclick="app.setRating(2)"></i>
                        <i class="fa-regular fa-star" onclick="app.setRating(3)"></i>
                        <i class="fa-regular fa-star" onclick="app.setRating(4)"></i>
                        <i class="fa-regular fa-star" onclick="app.setRating(5)"></i>
                    </div>
                </div>

                <div style="margin-bottom:2rem;">
                    <label style="display:block; margin-bottom:0.5rem; font-weight:bold;">Tu Experiencia</label>
                    <textarea id="comment-text" placeholder="¿Qué te ha parecido? ¿Algún truco?" style="width:100%; height:120px; padding:0.8rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); resize:none;"></textarea>
                </div>

                <div style="display:flex; gap:1rem;">
                    <button class="btn-action" style="flex:1;" onclick="app.submitOpinion('${recipeId}')">Publicar</button>
                    <button class="btn-action" style="flex:1; background:#eee; color:#333; border:none;" onclick="document.getElementById('comment-modal').remove()">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    submitOpinion(recipeId) {
        const user = document.getElementById('comment-user').value;
        const text = document.getElementById('comment-text').value;

        if (!user || !text) {
            this.showToast('Por favor, rellena todos los campos', 'fa-triangle-exclamation');
            return;
        }

        if (!this.opinions[recipeId]) this.opinions[recipeId] = [];
        
        const newOpinion = {
            user: user,
            avatar: user.substring(0, 2).toUpperCase(),
            text: text,
            rating: this.tempRating || 5,
            color: '#d35400',
            likes: 0
        };

        this.opinions[recipeId].push(newOpinion);
        localStorage.setItem('cuchara_opinions', JSON.stringify(this.opinions));

        document.getElementById('comment-modal').remove();
        this.showToast('¡Gracias por tu opinión!', 'fa-comment-check');
        
        // Refresh opinions container
        const container = document.getElementById('opinions-container');
        if (container) container.innerHTML = this.renderOpinions(recipeId);
    }

    setRating(val) {
        this.tempRating = val;
        const stars = document.querySelectorAll('#star-rating i');
        stars.forEach((star, i) => {
            if (i < val) {
                star.classList.replace('fa-regular', 'fa-solid');
            } else {
                star.classList.replace('fa-solid', 'fa-regular');
            }
        });
    }

    startVoiceSearch() {
        if (!this.recognition) {
            this.showToast('Búsqueda por voz no disponible en este navegador', 'fa-circle-exclamation');
            return;
        }
        
        this.showToast('Escuchando...', 'fa-microphone');
        this.recognition.start();
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const searchInput = document.getElementById('home-search') || document.getElementById('explore-search');
            if (searchInput) {
                searchInput.value = transcript;
                this.handleSearch(searchInput.id);
            }
            this.recognition.stop();
        };

        this.recognition.onerror = () => {
            this.showToast('No he podido entenderte, inténtalo de nuevo', 'fa-microphone-slash');
            this.recognition.stop();
        };
    }

    renderFavorites() {
        const favRecipes = mockRecipes.filter(r => this.favorites.includes(r.id));
        let contentHtml = '';
        
        if (favRecipes.length === 0) {
            contentHtml = `
                <div style="text-align:center; padding:6rem 2rem; position:relative; overflow:hidden; border-radius:var(--radius-lg); background:var(--card-bg); box-shadow:var(--shadow-sm);">
                    <div style="position:absolute; top:-20px; left:-20px; opacity:0.03; font-size:12rem; transform:rotate(-15deg); pointer-events:none;"><i class="fa-solid fa-heart"></i></div>
                    <div style="font-size:5rem; color:#e74c3c; margin-bottom:1.5rem; opacity:0.3;"><i class="fa-regular fa-heart"></i></div>
                    <h2 style="color:var(--text-dark); margin-bottom:1rem; font-family:var(--font-heading);">Tu recetario está esperando</h2>
                    <p style="color:var(--text-light); margin-bottom:2.5rem; max-width:400px; margin-left:auto; margin-right:auto; font-size:1.1rem;">Guarda aquí las recetas que más te gusten para cocinarlas cuando quieras.</p>
                    <button class="btn-action" style="padding:1rem 2rem; font-size:1.1rem;" onclick="app.navigate('explore')"><i class="fa-solid fa-compass"></i> Descubrir Recetas</button>
                </div>
            `;
        } else {
            contentHtml = `
                <div class="recipes-grid">
                    ${favRecipes.map((recipe, index) => this.createRecipeCard(recipe, index)).join('')}
                </div>
            `;
        }

        this.contentDiv.innerHTML = `
            <div class="page-container" style="max-width: 1200px;">
                <h1 style="margin-bottom:3rem;">Mis Favoritos</h1>
                ${contentHtml}
            </div>
        `;
    }

    renderAbout() {
        this.contentDiv.innerHTML = `
            <div class="page-container">
                <h1>Sobre Nosotros</h1>
                <p style="font-size: 1.2rem; line-height: 1.8; color: var(--text-dark); margin-bottom: 2rem;">En <strong>Cuchara y Sabor</strong>, empoderamos tu cocina con recetas claras y adaptables.</p>
            </div>
        `;
    }

    renderPlanner() {
        this.contentDiv.innerHTML = `
            <div class="page-container" style="max-width: 1000px;">
                <h1>Tu Plan Nutricional</h1>
                <p style="font-size: 1.2rem; color: var(--text-light); margin-bottom: 2rem;">
                    Selecciona tu objetivo y te propondremos un menú diario adaptado a tus necesidades, basado en nuestras recetas.
                </p>

                <div class="planner-options">
                    <div class="planner-card" onclick="app.generateMealPlan('perder', event)">
                        <i class="fa-solid fa-weight-scale"></i>
                        <h3>Perder Peso</h3>
                        <p>Déficit calórico, recetas ligeras y saciantes.</p>
                    </div>
                    <div class="planner-card" onclick="app.generateMealPlan('mantener', event)">
                        <i class="fa-solid fa-heart-pulse"></i>
                        <h3>Mantenerse</h3>
                        <p>Equilibrio perfecto de macronutrientes.</p>
                    </div>
                    <div class="planner-card" onclick="app.generateMealPlan('ganar', event)">
                        <i class="fa-solid fa-dumbbell"></i>
                        <h3>Ganar Masa</h3>
                        <p>Superávit calórico, alto en proteínas y energía.</p>
                    </div>
                </div>

                <div id="meal-plan-container"></div>
            </div>
        `;
    }

    async generateMealPlan(goal, event) {
        document.querySelectorAll('.planner-card').forEach(card => card.classList.remove('active'));
        if(event) event.currentTarget.classList.add('active');

        // Sync goal to profile
        if (this.activeUser) {
            const mappedGoal = goal === 'perder' ? 'Perder peso' : (goal === 'ganar' ? 'Ganar peso' : 'Para todos');
            await updateDoc(doc(this.db, "users", this.activeUser.uid), { goal: mappedGoal });
            this.userProfile.goal = mappedGoal;
            this.showToast('Objetivo actualizado en tu nube', 'fa-cloud-arrow-up');
        }

        let breakfast, lunch, dinner, snack;

        if (goal === 'perder') {
            breakfast = mockRecipes.find(r => r.category === 'Desayunos' && r.macros && r.macros.calories <= 350);
            lunch = mockRecipes.find(r => r.category === 'Comidas' && r.macros && r.macros.calories <= 450);
            dinner = mockRecipes.find(r => r.category === 'Cenas' && r.macros && r.macros.calories <= 300);
            snack = mockRecipes.find(r => r.id === 'hummus-casero' || (r.category === 'Snacks' && r.macros && r.macros.calories <= 250));
        } else if (goal === 'ganar') {
            breakfast = mockRecipes.find(r => r.id === 'batido-ganador');
            lunch = mockRecipes.find(r => r.id === 'arroz-pollo-cacahuetes');
            dinner = mockRecipes.find(r => r.category === 'Cenas' && r.macros && r.macros.calories > 500);
            snack = mockRecipes.find(r => r.category === 'Postres' && r.macros && r.macros.calories > 300);
        } else {
            breakfast = mockRecipes.find(r => r.category === 'Desayunos' && r.macros && r.macros.calories > 300 && r.macros.calories <= 400);
            lunch = mockRecipes.find(r => r.category === 'Comidas' && r.macros && r.macros.calories > 450 && r.macros.calories <= 600);
            dinner = mockRecipes.find(r => r.category === 'Cenas' && r.macros && r.macros.calories > 300 && r.macros.calories <= 500);
            snack = mockRecipes.find(r => r.category === 'Snacks');
        }

        const totalCalories = [breakfast, lunch, dinner, snack].reduce((acc, curr) => acc + (curr?.macros?.calories || 0), 0);
        const totalProtein = [breakfast, lunch, dinner, snack].reduce((acc, curr) => acc + (curr?.macros?.protein || 0), 0);

        const container = document.getElementById('meal-plan-container');
        container.innerHTML = `
            <div class="meal-plan-result">
                <h2 style="text-align: center; margin-bottom: 1rem;">Tu Menú Diario Recomendado</h2>
                <div style="text-align: center; margin-bottom: 2rem; color: var(--primary-color); font-weight: 600; font-size: 1.2rem;">
                    Total Aprox: ${totalCalories} kcal | ${totalProtein}g Proteína
                </div>
                
                ${this.createMealSlotHtml('Desayuno', breakfast)}
                ${this.createMealSlotHtml('Comida', lunch)}
                ${this.createMealSlotHtml('Snack', snack)}
                ${this.createMealSlotHtml('Cena', dinner)}
            </div>
        `;
    }

    createMealSlotHtml(mealName, recipe) {
        if (!recipe) return '';
        return `
            <div class="meal-slot" onclick="app.navigate('recipe', '${recipe.id}')" style="cursor: pointer;">
                <h3>${mealName}</h3>
                <div style="flex: 1; display: flex; align-items: center; gap: 1.5rem;">
                    <img src="${recipe.image}" alt="${recipe.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-md);">
                    <div>
                        <h4 style="font-size: 1.2rem; margin-bottom: 0.5rem; transition: var(--transition);" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='inherit'">${recipe.title}</h4>
                        <p style="color: var(--text-light); font-size: 0.9rem;">
                            <i class="fa-regular fa-clock"></i> ${recipe.time} &nbsp;|&nbsp; 
                            <i class="fa-solid fa-fire"></i> ${recipe.macros?.calories || '?'} kcal &nbsp;|&nbsp;
                            <i class="fa-solid fa-dumbbell"></i> ${recipe.macros?.protein || '?'}g prot
                        </p>
                    </div>
                </div>
            </div>
        `;
    }


    async clearShoppingList() {
        if (!this.activeUser) return;
        if(confirm("¿Estás seguro de querer vaciar toda la lista?")) {
            this.shoppingList = [];
            await updateDoc(doc(this.db, "users", this.activeUser.uid), {
                shoppingList: []
            });
            this.updateShoppingBadge();
            this.showToast('Lista vaciada', 'fa-broom');
            this.renderShoppingList();
        }
    }

    renderShoppingList() {
        let contentHtml = '';
        if (this.shoppingList.length === 0) {
            contentHtml = `
                <div style="text-align:center; padding:6rem 2rem; position:relative; overflow:hidden; border-radius:var(--radius-lg); background:var(--card-bg); box-shadow:var(--shadow-sm);">
                    <div style="position:absolute; bottom:-30px; right:-30px; opacity:0.03; font-size:15rem; transform:rotate(10deg); pointer-events:none;"><i class="fa-solid fa-cart-shopping"></i></div>
                    <div style="font-size:5rem; color:var(--primary-color); margin-bottom:1.5rem; opacity:0.3;"><i class="fa-solid fa-basket-shopping"></i></div>
                    <h2 style="color:var(--text-dark); margin-bottom:1rem; font-family:var(--font-heading);">Todo bajo control</h2>
                    <p style="color:var(--text-light); margin-bottom:2.5rem; max-width:450px; margin-left:auto; margin-right:auto; font-size:1.1rem;">Añade ingredientes desde cualquier receta y los organizaremos aquí para que no te olvides de nada en el súper.</p>
                    <button class="btn-action" style="padding:1rem 2rem; font-size:1.1rem;" onclick="app.navigate('explore')"><i class="fa-solid fa-magnifying-glass"></i> Buscar Ingredientes</button>
                </div>
            `;
        } else {
            const itemsHtml = this.shoppingList.map((item, idx) => `
                <div class="ingredient-item" style="background:var(--card-bg); padding:1rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm); display:flex; justify-content:space-between; align-items:center; border:none; margin-bottom:0.5rem;">
                    <div style="display:flex; align-items:center;">
                        <input type="checkbox" id="shop-${idx}" onchange="this.nextElementSibling.style.textDecoration = this.checked ? 'line-through' : 'none'; this.nextElementSibling.style.color = this.checked ? 'var(--text-light)' : 'var(--text-dark)';">
                        <label for="shop-${idx}" style="margin-left:0.5rem; cursor:pointer;">${this.escapeHTML(item)}</label>
                    </div>
                    <button onclick="app.removeFromShoppingList(${idx})" style="background:none; border:none; color:var(--text-light); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');
            contentHtml = `
                <div style="max-width:600px; margin:0 auto;">
                    <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;">
                        <button class="btn-action" onclick="app.clearShoppingList()"><i class="fa-solid fa-broom"></i> Vaciar</button>
                    </div>
                    ${itemsHtml}
                </div>
            `;
        }
        this.contentDiv.innerHTML = `
            <div class="page-container">
                <h1 style="margin-bottom:2rem;">Lista de la Compra</h1>
                ${contentHtml}
            </div>
        `;
    }

    renderContact() {
        this.contentDiv.innerHTML = `
            <div class="page-container">
                <div style="text-align:center; margin-bottom:3rem;">
                    <h1 style="font-size:3rem; margin-bottom:1rem;">Contacto</h1>
                    <p style="color:var(--text-light); font-size:1.2rem;">¿Tienes alguna duda o sugerencia? ¡Nos encantaría escucharte!</p>
                </div>
                
                <div style="max-width:600px; margin:0 auto; background:var(--card-bg); padding:3rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); position:relative; overflow:hidden;">
                    <div style="position:absolute; top:-20px; right:-20px; opacity:0.1; font-size:8rem; transform:rotate(15deg);"><i class="fa-solid fa-envelope-open-text"></i></div>
                    
                    <form class="contact-form" onsubmit="event.preventDefault(); app.showToast('¡Mensaje enviado correctamente!', 'fa-paper-plane'); app.navigate('home');">
                        <div style="margin-bottom:1.5rem;">
                            <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Nombre Completo</label>
                            <input type="text" required placeholder="Tu nombre" style="width:100%; padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-color);">
                        </div>
                        <div style="margin-bottom:1.5rem;">
                            <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Email</label>
                            <input type="email" required placeholder="email@ejemplo.com" style="width:100%; padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-color);">
                        </div>
                        <div style="margin-bottom:2rem;">
                            <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Mensaje</label>
                            <textarea required placeholder="¿En qué podemos ayudarte?" style="width:100%; padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-color); min-height:150px; resize:vertical;"></textarea>
                        </div>
                        <button type="submit" class="btn-action" style="width:100%;"><i class="fa-solid fa-paper-plane"></i> Enviar Mensaje</button>
                    </form>
                </div>
            </div>
        `;
    }

    checkAuth() {
        if (!this.activeUser) {
            this.showAuthModal('login');
            return false;
        }
        return true;
    }

    showAuthModal(mode = 'login') {
        const modal = document.getElementById('auth-modal');
        const container = document.getElementById('auth-form-container');
        if(!modal || !container) return;

        const loginActive = mode === 'login' ? 'active' : '';
        const registerActive = mode === 'register' ? 'active' : '';

        container.innerHTML = `
            <div style="position:absolute; top:0; right:0; opacity:0.1; font-size:10rem; pointer-events:none;"><i class="fa-solid fa-cookie-bite"></i></div>
            <div style="display:flex; gap:0; margin-bottom:2rem; border-bottom:2px solid var(--border-color); position:relative; z-index:1;">
                <button class="auth-tab ${loginActive}" onclick="app.showAuthModal('login')" style="flex:1; padding:0.8rem; border:none; background:none; font-size:1rem; font-weight:600; cursor:pointer; color:${mode === 'login' ? 'var(--primary-color)' : 'var(--text-light)'}; border-bottom:${mode === 'login' ? '3px solid var(--primary-color)' : 'none'}; transition:all 0.2s;">
                    <i class="fa-solid fa-right-to-bracket"></i> Iniciar Sesión
                </button>
                <button class="auth-tab ${registerActive}" onclick="app.showAuthModal('register')" style="flex:1; padding:0.8rem; border:none; background:none; font-size:1rem; font-weight:600; cursor:pointer; color:${mode === 'register' ? 'var(--primary-color)' : 'var(--text-light)'}; border-bottom:${mode === 'register' ? '3px solid var(--primary-color)' : 'none'}; transition:all 0.2s;">
                    <i class="fa-solid fa-user-plus"></i> Registrarse
                </button>
            </div>
            <div style="position:relative; z-index:1;">
                ${mode === 'login' ? this.getLoginFormHtml() : this.getRegisterFormHtml()}
            </div>
        `;
        modal.style.display = 'flex';
    }

    getLoginFormHtml() {
        return `
            <div style="text-align:center; margin-bottom:1.5rem;">
                <div style="width:70px; height:70px; border-radius:50%; background:linear-gradient(135deg, var(--primary-color), var(--secondary-color)); margin:0 auto 1rem; display:flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-user" style="font-size:2rem; color:white;"></i>
                </div>
                <h2 style="margin-bottom:0.3rem; color:var(--primary-color);">¡Bienvenido de vuelta!</h2>
                <p style="color:var(--text-light); font-size:0.9rem;">Accede a tus recetas favoritas y planes.</p>
            </div>
            <form onsubmit="event.preventDefault(); app.handleLogin();">
                <input type="email" id="login-email" class="auth-input" placeholder="Correo electrónico" required>
                <input type="password" id="login-pass" class="auth-input" placeholder="Contraseña" required>
                <div id="login-error" class="auth-error"></div>
                <button type="submit" class="auth-btn">Entrar</button>
            </form>
            <div class="auth-divider"><span>O continúa con</span></div>
            <button class="google-btn" onclick="app.handleGoogleLogin()">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                Iniciar sesión con Google
            </button>
        `;
    }

    getRegisterFormHtml() {
        return `
            <div style="text-align:center; margin-bottom:1.5rem;">
                <div style="width:70px; height:70px; border-radius:50%; background:linear-gradient(135deg, var(--accent-color), var(--secondary-color)); margin:0 auto 1rem; display:flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-user-plus" style="font-size:2rem; color:white;"></i>
                </div>
                <h2 style="margin-bottom:0.3rem; color:var(--primary-color);">Crear tu cuenta</h2>
                <form onsubmit="event.preventDefault(); app.handleRegister();">
                    <input type="text" id="reg-name" class="auth-input" placeholder="Nombre completo" required maxlength="50">
                    <input type="email" id="reg-email" class="auth-input" placeholder="Correo electrónico" required maxlength="50">
                    <input type="password" id="reg-pass" class="auth-input" placeholder="Contraseña (mín. 8 caracteres)" required minlength="8" maxlength="50" oninput="app.updatePasswordStrength(this.value)">
                    
                    <div class="password-strength-meter">
                        <div id="strength-bar" class="strength-bar"></div>
                    </div>
                    <div id="strength-text" class="strength-text">Fuerza: -</div>

                    <input type="password" id="reg-pass-confirm" class="auth-input" placeholder="Confirmar contraseña" required minlength="8" maxlength="50">
                    <div id="reg-error" class="auth-error"></div>
                    <button type="submit" class="auth-btn">Crear Cuenta</button>
                </form>
            </div>
            <div class="auth-divider"><span>O regístrate con</span></div>
            <button class="google-btn" onclick="app.handleGoogleLogin()">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                Registrarse con Google
            </button>
        `;
    }

    // [BLOQUE1] Seguridad: Hash con sal aleatoria por usuario
    async hashPassword(password, salt = 'cuchara_salt_2026') {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + salt);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    updatePasswordStrength(pass) {
        const bar = document.getElementById('strength-bar');
        const text = document.getElementById('strength-text');
        if (!bar || !text) return;

        let strength = 0;
        if (pass.length >= 8) strength++;
        if (/[A-Z]/.test(pass)) strength++;
        if (/[0-9]/.test(pass)) strength++;
        if (/[^A-Za-z0-9]/.test(pass)) strength++;

        bar.className = 'strength-bar';
        if (strength <= 1) {
            bar.classList.add('strength-weak');
            text.textContent = 'Fuerza: Débil';
        } else if (strength === 2 || strength === 3) {
            bar.classList.add('strength-medium');
            text.textContent = 'Fuerza: Media';
        } else {
            bar.classList.add('strength-strong');
            text.textContent = 'Fuerza: Fuerte';
        }
    }

    async handleRegister() {
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-pass').value;
        const passConfirm = document.getElementById('reg-pass-confirm').value;
        const errDiv = document.getElementById('reg-error');

        if (pass !== passConfirm) {
            errDiv.textContent = 'Las contraseñas no coinciden';
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
            const user = userCredential.user;
            
            // Perfil inicial en Firestore
            this.userProfile = {
                name: this.escapeHTML(name),
                email: email,
                favorites: [],
                shoppingList: [],
                stats: { recipesCooked: 0, streak: 0, lastCookedDate: null },
                createdAt: serverTimestamp()
            };
            
            await setDoc(doc(this.db, "users", user.uid), this.userProfile);
            this.closeAuthModal();
            this.showToast(`¡Bienvenido/a, ${name}!`, 'fa-user-check');
        } catch (error) {
            errDiv.textContent = 'Error: ' + error.message;
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-pass').value;
        const errDiv = document.getElementById('login-error');

        try {
            await signInWithEmailAndPassword(this.auth, email, pass);
            this.closeAuthModal();
        } catch (error) {
            errDiv.textContent = 'Email o contraseña incorrectos';
        }
    }

    async handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(this.auth, provider);
            this.closeAuthModal();
        } catch (error) {
            console.error("Google Login Error", error);
            this.showToast('Error al iniciar sesión con Google', 'fa-triangle-exclamation');
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
            this.showToast('Sesión cerrada correctamente', 'fa-right-from-bracket');
            this.navigate('home');
        } catch (error) {
            this.showToast('Error al cerrar sesión', 'fa-circle-exclamation');
        }
    }


    showSubstitutions(ingredient, event) {
        if (event) event.stopPropagation();
        
        // Dictionary with smart recommendations (macros and functionality)
        const smartSubstitutes = {
            'huevo': [
                { name: 'Puré de manzana', info: 'Reduce grasa y aporta humedad natural' },
                { name: 'Semillas de lino', info: 'Alto en fibra y Omega-3 (Vegano)' },
                { name: 'Yogur natural', info: 'Más proteína y textura esponjosa' }
            ],
            'leche': [
                { name: 'Bebida de almendras', info: 'Bajo en calorías y sin lactosa' },
                { name: 'Bebida de soja', info: 'Misma proteína que la vaca (Vegetal)' },
                { name: 'Bebida de avena', info: 'Energía de absorción lenta y fibra' }
            ],
            'mantequilla': [
                { name: 'Aguacate machacado', info: 'Grasas saludables y menos calorías' },
                { name: 'Aceite de oliva', info: 'Grasas monoinsaturadas (Cardioprotector)' },
                { name: 'Mantequilla de coco', info: 'Sabor tropical y apto para veganos' }
            ],
            'harina': [
                { name: 'Harina de avena', info: 'Más fibra y saciedad prolongada' },
                { name: 'Harina de almendras', info: 'Bajo en carbos (Keto) y alta en grasa' },
                { name: 'Harina integral', info: 'Mantiene el grano completo (Nutritivo)' }
            ],
            'azúcar': [
                { name: 'Eritritol', info: '0 calorías, no afecta la insulina' },
                { name: 'Pasta de dátiles', info: 'Endulzante natural con potasio' },
                { name: 'Miel pura', info: 'Aporte enzimático y energía rápida' }
            ],
            'pollo': [
                { name: 'Heura', info: 'Textura idéntica, 100% vegetal' },
                { name: 'Tofu firme', info: 'Proteína completa y bajo en grasas' },
                { name: 'Seitán', info: 'Textura carnosa y altísima proteína' }
            ],
            'carne': [
                { name: 'Soja texturizada', info: 'Bajo en grasas, alta en hierro' },
                { name: 'Lentejas cocidas', info: 'Aporta hierro, fibra y ácido fólico' }
            ],
            'queso': [
                { name: 'Levadura nutricional', info: 'Sabor a queso, rico en Vitamina B12' },
                { name: 'Tofu marinado', info: 'Menos grasa saturada que el queso' }
            ],
            'arroz': [
                { name: 'Quinoa', info: 'Proteína completa y menor carga glucémica' },
                { name: 'Arroz de coliflor', info: 'Extremadamente bajo en calorías' }
            ]
        };

        const key = Object.keys(smartSubstitutes).find(k => ingredient.toLowerCase().includes(k));
        const list = key ? smartSubstitutes[key] : [];

        // Create Side Drawer
        const drawer = document.createElement('div');
        drawer.id = 'substitution-drawer';
        drawer.className = 'side-drawer glass-effect active';
        drawer.innerHTML = `
            <div class="drawer-header">
                <div style="background:var(--primary-color); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;">
                    <i class="fa-solid fa-lightbulb"></i>
                </div>
                <h3>Sugerencias</h3>
                <button onclick="app.closeDrawer()" class="close-drawer-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <div class="drawer-content">
                <div class="target-ingredient">
                    <span>Para:</span>
                    <strong>${ingredient}</strong>
                </div>
                
                <div class="substitutes-list">
                    ${list.map(s => `
                        <div class="substitute-item glass-effect" onclick="app.applySubstitution('${ingredient.replace(/'/g, "\\'")}', '${s.name}')">
                            <div class="sub-name-row">
                                <span class="sub-name">${s.name}</span>
                                <i class="fa-solid fa-circle-plus"></i>
                            </div>
                            <p class="sub-info">${s.info}</p>
                        </div>
                    `).join('')}
                    
                    ${list.length === 0 ? `
                        <div class="no-suggestions">
                            <i class="fa-solid fa-robot"></i>
                            <p>No tengo sugerencias predefinidas, pero puedes usar tu propia alternativa:</p>
                        </div>
                    ` : ''}
                </div>

                <div class="custom-sub-section">
                    <label>Escribe tu alternativa:</label>
                    <div class="custom-input-row">
                        <input type="text" id="custom-substitute" placeholder="Ej. Tomate cherry...">
                        <button onclick="const val = document.getElementById('custom-substitute').value; if(val) app.applySubstitution('${ingredient.replace(/'/g, "\\'")}', val);">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="drawer-footer">
                <button onclick="app.applySubstitution('${ingredient.replace(/'/g, "\\'")}', '')" class="btn-reset-sub">
                    <i class="fa-solid fa-rotate-left"></i> Resetear Ingrediente
                </button>
            </div>
        `;

        // Overlay to close drawer
        const overlay = document.createElement('div');
        overlay.id = 'drawer-overlay';
        overlay.className = 'modal-overlay active';
        overlay.onclick = () => app.closeDrawer();

        document.body.appendChild(overlay);
        document.body.appendChild(drawer);
        
        // Trigger entrance animation
        setTimeout(() => drawer.classList.add('visible'), 10);
    }

    closeDrawer() {
        const drawer = document.getElementById('substitution-drawer');
        const overlay = document.getElementById('drawer-overlay');
        if (drawer) {
            drawer.classList.remove('visible');
            setTimeout(() => drawer.remove(), 300);
        }
        if (overlay) overlay.remove();
    }

    applySubstitution(originalBase, substitute) {
        const labels = document.querySelectorAll('.ingredient-item-alt label');
        labels.forEach(label => {
            if (label.getAttribute('data-base') === originalBase) {
                if (substitute) {
                    label.setAttribute('data-substitute', substitute);
                    this.showToast(`Sustituido por ${substitute}`, 'fa-arrows-rotate');
                } else {
                    label.removeAttribute('data-substitute');
                    this.showToast('Restaurado ingrediente original', 'fa-rotate-left');
                }
                this.renderIngredientLabel(label);
            }
        });
        this.closeDrawer();
    }

    toggleTimerPanel() {
        let panel = document.getElementById('timer-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'timer-panel';
            panel.className = 'glass-effect';
            panel.style = 'position:fixed; bottom:100px; right:20px; width:320px; padding:2rem; border-radius:var(--radius-xl); z-index:1000; box-shadow:var(--shadow-xl); display:none; flex-direction:column; gap:1rem;';
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;"><i class="fa-solid fa-stopwatch"></i> Temporizador</h3>
                    <button onclick="app.toggleTimerPanel()" style="background:none; border:none; color:var(--text-light); cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                    <input type="number" id="timer-minutes" placeholder="Min" min="1" max="120" style="flex:1; padding:0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-color);">
                    <button class="btn-action active" onclick="app.addTimer()" style="padding:0.8rem 1.2rem;"><i class="fa-solid fa-play"></i></button>
                </div>
                <div id="timers-container" style="display:flex; flex-direction:column; gap:0.8rem; margin-top:1rem; max-height:200px; overflow-y:auto;">
                    <p id="no-timers-msg" style="color:var(--text-light); font-size:0.9rem; text-align:center;">No hay temporizadores activos.</p>
                </div>
            `;
            document.body.appendChild(panel);
            this.activeTimers = [];
        }
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    }

    addTimer() {
        const minInput = document.getElementById('timer-minutes');
        const minutes = parseInt(minInput.value);
        if (!minutes || minutes < 1) return;
        
        minInput.value = '';
        
        const timerId = Date.now();
        const duration = minutes * 60;
        
        const timerObj = {
            id: timerId,
            duration: duration,
            remaining: duration,
            interval: null
        };
        
        this.activeTimers.push(timerObj);
        
        document.getElementById('no-timers-msg').style.display = 'none';
        
        const container = document.getElementById('timers-container');
        const timerEl = document.createElement('div');
        timerEl.id = `timer-${timerId}`;
        timerEl.className = 'glass-effect';
        timerEl.style = 'padding:1rem; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; background:rgba(211, 84, 0, 0.05);';
        
        timerEl.innerHTML = `
            <div style="font-weight:700; font-size:1.2rem; color:var(--primary-color);" id="time-display-${timerId}">
                ${this.formatTime(duration)}
            </div>
            <button onclick="app.removeTimer(${timerId})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(timerEl);
        
        timerObj.interval = setInterval(() => {
            timerObj.remaining--;
            const display = document.getElementById(`time-display-${timerId}`);
            if (display) {
                display.textContent = this.formatTime(timerObj.remaining);
            }
            
            if (timerObj.remaining <= 0) {
                clearInterval(timerObj.interval);
                this.showToast('¡Temporizador terminado!', 'fa-bell');
                if (display) {
                    display.style.color = '#e74c3c';
                    display.textContent = '¡Tiempo!';
                }
                // Play sound
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play();
                } catch(e) {}
            }
        }, 1000);
        
        this.showToast(`Temporizador de ${minutes}m iniciado`, 'fa-clock');
    }

    removeTimer(id) {
        const index = this.activeTimers.findIndex(t => t.id === id);
        if (index > -1) {
            clearInterval(this.activeTimers[index].interval);
            this.activeTimers.splice(index, 1);
            const el = document.getElementById(`timer-${id}`);
            if (el) el.remove();
            
            if (this.activeTimers.length === 0) {
                document.getElementById('no-timers-msg').style.display = 'block';
            }
        }
    }

    formatTime(seconds) {
        if (seconds <= 0) return "00:00";
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }





    // Cooking Mode

    updatePortions(change) {
        if (!this.currentRecipe) return;
        this.currentPortions += change;
        if (this.currentPortions < 1) this.currentPortions = 1;
        if (this.currentPortions > 12) this.currentPortions = 12;
        
        const portionsVal = document.getElementById('recipe-portions-val');
        if (portionsVal) portionsVal.innerText = this.currentPortions;

        // Trigger reactive label updates
        const labels = document.querySelectorAll('.ingredient-item-alt label');
        labels.forEach(label => this.renderIngredientLabel(label));

        // Update macros
        const macroStats = document.querySelectorAll('.macro-stat .val');
        if (macroStats.length >= 4 && this.currentRecipe.macros) {
            const factor = this.currentPortions / (this.currentRecipe.servings || 1);
            macroStats[0].innerText = Math.round(this.currentRecipe.macros.calories * factor);
            macroStats[1].innerText = Math.round(this.currentRecipe.macros.protein * factor);
            macroStats[2].innerText = Math.round(this.currentRecipe.macros.carbs * factor);
            macroStats[3].innerText = Math.round(this.currentRecipe.macros.fats * factor);
        }

        this.showToast(`Ajustado para ${this.currentPortions} personas`, 'fa-users');

        // Update Nutrition Radar Bars
        if (this.currentRecipe.macros) {
            const factor = this.currentPortions / (this.currentRecipe.servings || 1);
            const calText = document.querySelector('.radar-visual strong');
            if (calText) calText.innerText = Math.round(this.currentRecipe.macros.calories * factor);
            
            const progressCircle = document.getElementById('radar-progress');
            if (progressCircle) {
                const percent = Math.min(100, (this.currentRecipe.macros.calories * factor / 1000) * 100);
                progressCircle.style.strokeDasharray = `${percent}, 100`;
            }

            // Update mini-bars
            const bars = document.querySelectorAll('.radar-info div > div > div');
            if (bars.length >= 3) {
                bars[0].style.width = `${Math.min(100, (this.currentRecipe.macros.protein * factor / 50) * 100)}%`;
                bars[1].style.width = `${Math.min(100, (this.currentRecipe.macros.carbs * factor / 100) * 100)}%`;
                bars[2].style.width = `${Math.min(100, (this.currentRecipe.macros.fats * factor / 40) * 100)}%`;
                
                const barVals = document.querySelectorAll('.radar-info span[style*="font-weight:700"]');
                if (barVals.length >= 3) {
                    barVals[0].innerText = `${Math.round(this.currentRecipe.macros.protein * factor)}g`;
                    barVals[1].innerText = `${Math.round(this.currentRecipe.macros.carbs * factor)}g`;
                    barVals[2].innerText = `${Math.round(this.currentRecipe.macros.fats * factor)}g`;
                }
            }
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if(modal) modal.style.display = 'none';
    }

    // Legacy login kept as redirect for any old references
    login(username) {
        // Redirect to new auth flow
        this.showAuthModal('login');
    }

    async logout() {
        await signOut(this.auth);
        this.showToast('Sesión cerrada correctamente', 'fa-right-from-bracket');
        this.navigate('home');
    }

    renderDespensa() {
        const pantryHtml = this.pantry.map((item, idx) => `
            <div class="ingredient-item" style="background:var(--card-bg); padding:1rem; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; box-shadow:var(--shadow-sm);">
                <span><i class="fa-solid fa-leaf" style="color:var(--primary-color); margin-right:0.5rem;"></i> ${this.escapeHTML(item)}</span>
                <button onclick="app.removeFromPantry(${idx})" style="background:none; border:none; color:var(--text-light); cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');

        this.contentDiv.innerHTML = `
            <div class="page-container" style="max-width:800px; margin:0 auto;">
                <h1 style="text-align:center; margin-bottom:1rem;"><i class="fa-solid fa-box-open" style="color:var(--primary-color);"></i> Mi Despensa</h1>
                <p style="text-align:center; color:var(--text-light); margin-bottom:2rem;">Ingredientes que tienes en casa.</p>
                
                <form onsubmit="event.preventDefault(); app.addToPantry(document.getElementById('pantry-input').value);" style="display:flex; gap:1rem; margin-bottom:2rem;">
                    <input type="text" id="pantry-input" placeholder="Añadir ingrediente..." required style="flex:1; padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                    <button type="submit" class="btn-action active">Añadir</button>
                </form>

                <div id="pantry-list">
                    ${this.pantry.length === 0 ? '<p style="text-align:center; color:var(--text-light);">Tu despensa está vacía.</p>' : pantryHtml}
                </div>
            </div>
        `;
    }

    async addToPantry(item) {
        if (!item.trim() || !this.activeUser) return;
        this.pantry.push(item.trim());
        await updateDoc(doc(this.db, "users", this.activeUser.uid), { pantry: this.pantry });
        this.renderDespensa();
        this.showToast('Ingrediente añadido', 'fa-check');
    }

    async removeFromPantry(index) {
        this.pantry.splice(index, 1);
        await updateDoc(doc(this.db, "users", this.activeUser.uid), { pantry: this.pantry });
        this.renderDespensa();
    }

    searchByPantry() {
        if (this.pantry.length === 0) return;
        // Map pantry to searchQuery joined by space (our search filter does 'some' match)
        this.activeFilters = { category: [], time: [], diet: [], allergen: [], searchQuery: this.pantry.join(' '), goal: [] };
        this.navigate('explore');
        this.showToast('Filtrando por tu despensa', 'fa-box-open');
    }

    renderProfile() {
        if (!this.checkAuth()) return;
        const favRecipes = mockRecipes.filter(r => this.favorites.includes(r.id));
        const totalCals = favRecipes.reduce((sum, r) => sum + (r.macros?.calories || 0), 0);
        const avgCals = favRecipes.length ? Math.round(totalCals / favRecipes.length) : 0;
        const totalPro = favRecipes.reduce((sum, r) => sum + (r.macros?.protein || 0), 0);
        const avgPro = favRecipes.length ? Math.round(totalPro / favRecipes.length) : 0;

        const userName = this.activeUser.name || this.activeUser.username;
        const userEmail = this.activeUser.email || '';
        const userAvatar = this.activeUser.avatar || userName.substring(0, 2).toUpperCase();
        const memberSince = this.activeUser.createdAt ? new Date(this.activeUser.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Hoy';

        this.contentDiv.innerHTML = `
            <div class="page-container" style="max-width: 800px; text-align: center;">
                <div style="width:90px; height:90px; border-radius:50%; background:linear-gradient(135deg, var(--primary-color), var(--secondary-color)); margin:0 auto 1rem; display:flex; align-items:center; justify-content:center; font-size:2.2rem; color:white; font-weight:700; box-shadow: 0 4px 20px rgba(217,119,54,0.4);">
                    ${userAvatar}
                </div>
                <h1 style="text-transform: capitalize; margin-bottom:0.3rem;">${this.escapeHTML(userName)}</h1>
                ${userEmail ? `<p style="color: var(--text-light); font-size:0.95rem;"><i class="fa-solid fa-envelope" style="color:var(--primary-color);"></i> ${this.escapeHTML(userEmail)}</p>` : ''}
                <p style="color: var(--text-light); margin-bottom: 2.5rem; font-size:0.85rem;"><i class="fa-solid fa-calendar" style="color:var(--secondary-color);"></i> Miembro desde ${memberSince}</p>
                
                <div style="display:flex; gap:1.5rem; justify-content:center; margin-bottom:3rem; flex-wrap:wrap;">
                    <div class="stat-card" style="background:var(--card-bg); padding:1.5rem 2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); min-width:140px;">
                        <i class="fa-solid fa-heart" style="color:var(--primary-color); font-size:1.8rem; margin-bottom:0.8rem;"></i>
                        <span class="amount" style="font-size:2rem; display:block;">${this.favorites.length}</span>
                        <span class="name" style="color:var(--text-light); font-size:0.85rem;">Favoritas</span>
                    </div>
                    <div class="stat-card" style="background:var(--card-bg); padding:1.5rem 2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); min-width:140px;">
                        <i class="fa-solid fa-cart-shopping" style="color:#27ae60; font-size:1.8rem; margin-bottom:0.8rem;"></i>
                        <span class="amount" style="font-size:2rem; display:block;">${this.shoppingList.length}</span>
                        <span class="name" style="color:var(--text-light); font-size:0.85rem;">En Lista</span>
                    </div>
                    <div class="stat-card" style="background:var(--card-bg); padding:1.5rem 2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); min-width:140px;">
                        <i class="fa-solid fa-fire" style="color:#e67e22; font-size:1.8rem; margin-bottom:0.8rem;"></i>
                        <span class="amount" style="font-size:2rem; display:block;">${avgCals}</span>
                        <span class="name" style="color:var(--text-light); font-size:0.85rem;">Kcal Prom.</span>
                    </div>
                    <div class="stat-card" style="background:var(--card-bg); padding:1.5rem 2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-sm); min-width:140px;">
                        <i class="fa-solid fa-box-open" style="color:#3498db; font-size:1.8rem; margin-bottom:0.8rem;"></i>
                        <span class="amount" style="font-size:2rem; display:block;">${this.pantry ? this.pantry.length : 0}</span>
                        <span class="name" style="color:var(--text-light); font-size:0.85rem;">Despensa</span>
                    </div>
                </div>

                <div style="display:flex; gap:1.5rem; justify-content:center; margin-bottom:3rem; flex-wrap:wrap;">
                    <div class="stat-card" style="background:linear-gradient(135deg, var(--primary-color), #f39c12); color:white; padding:1.8rem 2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); min-width:220px; position:relative; overflow:hidden;">
                        <div style="position:absolute; top:-10px; right:-10px; opacity:0.1; font-size:5rem;"><i class="fa-solid fa-trophy"></i></div>
                        <span class="amount" style="font-size:3rem; display:block; font-weight:900; line-height:1;">${this.userStats ? this.userStats.recipesCooked : 0}</span>
                        <span class="name" style="font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:0.5rem; display:block;">
                            ${(this.userStats?.recipesCooked || 0) === 1 ? 'Receta Cocinada' : 'Recetas Cocinadas'}
                        </span>
                    </div>
                    <div class="stat-card" style="background:linear-gradient(135deg, #e74c3c, #c0392b); color:white; padding:1.8rem 2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); min-width:220px; position:relative; overflow:hidden;">
                        <div style="position:absolute; top:-10px; right:-10px; opacity:0.1; font-size:5rem;"><i class="fa-solid fa-fire"></i></div>
                        <span class="amount" style="font-size:3rem; display:block; font-weight:900; line-height:1;">${this.userStats ? this.userStats.streak : 0}</span>
                        <span class="name" style="font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:0.5rem; display:block;">
                            ${(this.userStats?.streak || 0) === 1 ? 'Día de Racha' : 'Días de Racha'}
                        </span>
                        <div style="font-size:0.75rem; opacity:0.9; margin-top:0.4rem; font-weight:600;"><i class="fa-solid fa-fire-flame-simple"></i> ¡Racha de Fuego!</div>
                    </div>
                </div>

                ${this.activePlan ? `
                <div style="margin-top: 2rem; background: var(--card-bg); padding: 1.5rem; border-radius: var(--radius-lg); border: 2px solid var(--primary-color);">
                    <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;"><i class="fa-solid fa-bullseye"></i> Tu Objetivo Actual</h3>
                    <p style="font-size: 1.1rem; font-weight:600;">${this.activePlan.goal === 'perder' ? 'Déficit (Perder Grasa)' : (this.activePlan.goal === 'ganar' ? 'Superávit (Ganar Masa)' : 'Mantenimiento')}</p>
                    <h2 style="margin: 1rem 0; font-size:2rem;">${this.activePlan.calories} kcal/día</h2>
                    <p style="color: var(--text-light); font-size: 0.9rem;">Establecido el: ${this.activePlan.date}</p>
                    <button class="btn-action" style="margin-top:1rem;" onclick="app.navigate('planner')">Ver mi menú diario adaptado</button>
                </div>
                ` : `
                <div style="margin-top: 2rem; background: var(--card-bg); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
                    <p style="color: var(--text-light); margin-bottom: 1rem;">No tienes ningún objetivo físico configurado todavía.</p>
                    <button class="btn-action" style="margin:0 auto;" onclick="app.navigate('evaluacion')"><i class="fa-solid fa-stethoscope"></i> Hacer Evaluación</button>
                </div>
                `}

                <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 3rem; flex-wrap:wrap;">
                    <button class="btn-action" onclick="app.showEditProfile()" style="background:var(--primary-color); color:white;">
                        <i class="fa-solid fa-user-pen"></i> Editar Perfil
                    </button>
                    <button class="btn-action" onclick="app.navigate('favorites')" style="background:var(--secondary-color); color:white;">
                        <i class="fa-solid fa-bookmark"></i> Favoritos
                    </button>
                    <button class="btn-action" onclick="app.logout()" style="background: none; border: 2px solid var(--text-light); color: var(--text-dark);">
                        <i class="fa-solid fa-right-from-bracket"></i> Salir
                    </button>
                </div>
            </div>
        `;
    }

    showEditProfile() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content glass-effect" style="max-width:400px; padding:3rem;">
                <h3 style="margin-bottom:1.5rem;">Editar Perfil</h3>
                <form onsubmit="event.preventDefault(); app.updateProfile();">
                    <div style="margin-bottom:1rem;">
                        <label style="display:block; margin-bottom:0.4rem; font-size:0.9rem;">Nombre</label>
                        <input type="text" id="edit-name" value="${this.activeUser.name}" style="width:100%; padding:0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-color);">
                    </div>
                    <div style="margin-bottom:2rem;">
                        <label style="display:block; margin-bottom:0.4rem; font-size:0.9rem;">Email</label>
                        <input type="email" id="edit-email" value="${this.activeUser.email || ''}" style="width:100%; padding:0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-color); background:var(--bg-color);">
                    </div>
                    <button type="submit" class="btn-action active" style="width:100%; justify-content:center;">Guardar Cambios</button>
                    <button type="button" onclick="this.closest('.modal').remove()" style="width:100%; margin-top:1rem; background:none; border:none; color:var(--text-light); cursor:pointer;">Cerrar</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async updateProfile() {
        const newName = document.getElementById('edit-name').value.trim();
        const newEmail = document.getElementById('edit-email').value.trim();
        
        if (this.activeUser) {
            await updateDoc(doc(this.db, "users", this.activeUser.uid), {
                name: newName,
                email: newEmail
            });
            this.userProfile.name = newName;
            this.userProfile.email = newEmail;
            this.showToast('Perfil actualizado', 'fa-user-check');
            document.querySelector('.modal.active').remove();
            this.renderProfile();
        }
    }

    renderEvaluation() {
        this.contentDiv.innerHTML = `
            <div class="page-container" style="max-width: 800px; margin: 0 auto; animation: fadeIn 0.4s ease;">
                <h1 style="color:var(--primary-color); margin-bottom:0.5rem; text-align:center;"><i class="fa-solid fa-stethoscope"></i> Evaluación Física y Nutricional</h1>
                <p style="color:var(--text-light); margin-bottom:2rem; text-align:center;">Calcula tu estado físico aproximado y obtén un plan de recomendaciones de ChefiBot.</p>
                
                <div class="form-container" style="background:var(--card-bg); padding:2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-md);">
                    <div style="display:grid; grid-template-columns: 1fr; gap:1.5rem; margin-bottom:1.5rem;">
                        <div>
                            <label style="color:var(--text-light); font-size:0.9rem; margin-bottom:0.5rem; display:block;">Género</label>
                            <select id="eval-gender" class="auth-input">
                                <option value="hombre">Hombre</option>
                                <option value="mujer">Mujer</option>
                            </select>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:0.8rem;">
                                <label style="color:var(--text-light); font-size:0.9rem;">Peso</label>
                                <span style="color:var(--primary-color); font-weight:bold; font-size:1.1rem;"><span id="val-weight">75</span> kg</span>
                            </div>
                            <input type="range" id="eval-weight" class="styled-slider" min="40" max="150" value="75" oninput="document.getElementById('val-weight').innerText = this.value">
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:0.8rem;">
                                <label style="color:var(--text-light); font-size:0.9rem;">Altura</label>
                                <span style="color:var(--primary-color); font-weight:bold; font-size:1.1rem;"><span id="val-height">175</span> cm</span>
                            </div>
                            <input type="range" id="eval-height" class="styled-slider" min="120" max="230" value="175" oninput="document.getElementById('val-height').innerText = this.value">
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; margin-bottom:0.8rem;">
                                <label style="color:var(--text-light); font-size:0.9rem;">Edad</label>
                                <span style="color:var(--primary-color); font-weight:bold; font-size:1.1rem;"><span id="val-age">25</span> años</span>
                            </div>
                            <input type="range" id="eval-age" class="styled-slider" min="14" max="100" value="25" oninput="document.getElementById('val-age').innerText = this.value">
                        </div>
                    </div>
                    
                    <label style="color:var(--text-light); font-size:0.9rem;">Nivel de Actividad / Gimnasio</label>
                    <select id="eval-activity" class="auth-input">
                        <option value="1.2">Sedentario (Poco o ningún ejercicio)</option>
                        <option value="1.375">Ligero (Ejercicio 1-3 días/semana)</option>
                        <option value="1.55">Moderado (Gimnasio 3-5 días/semana)</option>
                        <option value="1.725">Activo (Gimnasio intenso 6-7 días)</option>
                    </select>

                    <label style="color:var(--text-light); font-size:0.9rem;">Objetivo Principal</label>
                    <select id="eval-goal" class="auth-input">
                        <option value="perder">Perder Grasa (Déficit Calórico)</option>
                        <option value="mantener">Mantener Peso</option>
                        <option value="ganar">Ganar Masa Muscular (Superávit)</option>
                    </select>

                    <button class="btn-action" style="width:100%; justify-content:center; margin-top:1.5rem;" onclick="app.calculateEvaluation()">Generar Diagnóstico</button>
                </div>
                
                <div id="eval-result" style="margin-top:2rem; display:none; animation: fadeIn 0.4s ease;"></div>
            </div>
        `;
    }

    calculateEvaluation() {
        const gender = document.getElementById('eval-gender').value;
        const weight = parseFloat(document.getElementById('eval-weight').value);
        const height = parseFloat(document.getElementById('eval-height').value);
        const age = parseInt(document.getElementById('eval-age').value);
        const activity = parseFloat(document.getElementById('eval-activity').value);
        const goal = document.getElementById('eval-goal').value;

        if (!weight || !height || !age) {
            this.showToast('Por favor, completa todos los campos', 'fa-triangle-exclamation');
            return;
        }

        let tmb = (10 * weight) + (6.25 * height) - (5 * age);
        tmb += (gender === 'hombre') ? +5 : -161;

        const maintenance = tmb * activity;
        let targetCalories = maintenance;
        let recommendationText = "";
        let filterTag = "";

        const bmi = (weight / ((height/100) * (height/100))).toFixed(1);
        let bmiCategory = "";
        if(bmi < 18.5) bmiCategory = "Bajo peso";
        else if(bmi < 25) bmiCategory = "Peso saludable";
        else if(bmi < 30) bmiCategory = "Sobrepeso";
        else bmiCategory = "Obesidad";

        if (goal === 'perder') {
            targetCalories -= 500;
            filterTag = "Perder peso";
            recommendationText = "Para perder grasa saludablemente, hemos calculado un déficit calórico. Con tu nivel de actividad, necesitas unas <strong>" + Math.round(targetCalories) + " kcal/día</strong>. Te recomendaremos recetas altas en proteínas para mantener la masa muscular y saciarte.";
        } else if (goal === 'ganar') {
            targetCalories += 400;
            filterTag = "Ganar peso";
            recommendationText = "Para ganar masa muscular, hemos calculado un superávit. Con tu nivel de actividad, apunta a <strong>" + Math.round(targetCalories) + " kcal/día</strong>. Si vas al gimnasio regularmente, estas recetas hipercalóricas te darán la energía necesaria para la hipertrofia.";
        } else {
            filterTag = "Para todos";
            recommendationText = "Tu objetivo es mantener tu estado actual. Te recomendamos un consumo de <strong>" + Math.round(targetCalories) + " kcal/día</strong>. Te ofreceremos comidas equilibradas y nutritivas para sustentar tus actividades diarias y entrenamientos.";
        }

        let breakfast, lunch, dinner, snack;
        if (goal === 'perder') {
            breakfast = mockRecipes.find(r => r.category === 'Desayunos' && r.macros && r.macros.calories <= 350);
            lunch = mockRecipes.find(r => r.category === 'Comidas' && r.macros && r.macros.calories <= 450);
            dinner = mockRecipes.find(r => r.category === 'Cenas' && r.macros && r.macros.calories <= 300);
            snack = mockRecipes.find(r => r.id === 'hummus-casero' || (r.category === 'Snacks' && r.macros && r.macros.calories <= 250));
        } else if (goal === 'ganar') {
            breakfast = mockRecipes.find(r => r.id === 'batido-ganador' || r.category === 'Desayunos');
            lunch = mockRecipes.find(r => r.id === 'arroz-pollo-cacahuetes' || r.category === 'Comidas');
            dinner = mockRecipes.find(r => r.category === 'Cenas' && r.macros && r.macros.calories > 500);
            snack = mockRecipes.find(r => r.category === 'Postres' && r.macros && r.macros.calories > 300);
        } else {
            breakfast = mockRecipes.find(r => r.category === 'Desayunos' && r.macros && r.macros.calories > 300 && r.macros.calories <= 400);
            lunch = mockRecipes.find(r => r.category === 'Comidas' && r.macros && r.macros.calories > 450 && r.macros.calories <= 600);
            dinner = mockRecipes.find(r => r.category === 'Cenas' && r.macros && r.macros.calories > 300 && r.macros.calories <= 500);
            snack = mockRecipes.find(r => r.category === 'Snacks' || r.category === 'Postres');
        }

        if(!breakfast) breakfast = mockRecipes.find(r => r.category === 'Desayunos');
        if(!lunch) lunch = mockRecipes.find(r => r.category === 'Comidas');
        if(!dinner) dinner = mockRecipes.find(r => r.category === 'Cenas');
        if(!snack) snack = mockRecipes.find(r => r.category === 'Postres');

        const resultDiv = document.getElementById('eval-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="background:var(--card-bg); padding:2rem; border-radius:var(--radius-lg); border-left:4px solid var(--primary-color); position:relative; overflow:hidden;">
                <div style="position:absolute; top:-20px; right:-20px; opacity:0.1; font-size:10rem; transform:rotate(15deg); pointer-events:none;"><i class="fa-solid fa-chart-line"></i></div>
                <h3 style="position:relative; z-index:1;"><i class="fa-solid fa-clipboard-check"></i> Tu Diagnóstico Físico</h3>
                <p style="margin-top:1rem; color:var(--text-light); position:relative; z-index:1;"><strong>Índice de Masa Corporal (IMC):</strong> ${bmi} (${bmiCategory})</p>
                <p style="color:var(--text-light); position:relative; z-index:1;"><strong>Metabolismo Basal (en reposo):</strong> ${Math.round(tmb)} kcal</p>
                <h2 style="color:var(--primary-color); margin:1.5rem 0; position:relative; z-index:1;">Objetivo Diario: ${Math.round(targetCalories)} kcal</h2>
                <p style="margin-bottom:1.5rem; line-height:1.6; position:relative; z-index:1;">${recommendationText}</p>
                
                <h3 style="margin-top:2rem; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">Menú Propuesto para tu Objetivo</h3>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:2rem;">
                    <div class="chefi-card" onclick="app.navigate('recipe', '${breakfast.id}')">
                        <p style="font-size:0.8rem; color:var(--text-light); text-transform:uppercase;">Desayuno</p>
                        <h4 style="margin:0.2rem 0; font-size:1rem;">${breakfast.title}</h4>
                    </div>
                    <div class="chefi-card" onclick="app.navigate('recipe', '${lunch.id}')">
                        <p style="font-size:0.8rem; color:var(--text-light); text-transform:uppercase;">Comida</p>
                        <h4 style="margin:0.2rem 0; font-size:1rem;">${lunch.title}</h4>
                    </div>
                    <div class="chefi-card" onclick="app.navigate('recipe', '${snack.id}')">
                        <p style="font-size:0.8rem; color:var(--text-light); text-transform:uppercase;">Snack/Postre</p>
                        <h4 style="margin:0.2rem 0; font-size:1rem;">${snack.title}</h4>
                    </div>
                    <div class="chefi-card" onclick="app.navigate('recipe', '${dinner.id}')">
                        <p style="font-size:0.8rem; color:var(--text-light); text-transform:uppercase;">Cena</p>
                        <h4 style="margin:0.2rem 0; font-size:1rem;">${dinner.title}</h4>
                    </div>
                </div>

                <button class="btn-action" style="width:100%; justify-content:center; background:var(--primary-color); color:white;" onclick="app.savePlan('${goal}', ${Math.round(targetCalories)})">
                    <i class="fa-solid fa-bullseye"></i> Aceptar este Menú como Objetivo
                </button>
            </div>
        `;
        
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }

    async savePlan(goal, calories) {
        if (!this.activeUser) return;
        const plan = { goal, calories, date: new Date().toLocaleDateString() };
        await updateDoc(doc(this.db, "users", this.activeUser.uid), { activePlan: plan });
        this.userProfile.activePlan = plan;
        this.showToast('¡Plan guardado!', 'fa-bullseye');
        this.navigate('profile');
    }

    toggleChefibot() {
        const modal = document.getElementById('chefibot-modal');
        if (modal) modal.classList.toggle('active');
    }

    askChefibot() {
        const ingredients = document.getElementById('chefi-ing').value.toLowerCase();
        const goal = document.getElementById('chefi-goal').value;
        const resultDiv = document.getElementById('chefi-result');

        if (!ingredients && !goal) {
            this.showToast('¡Dime algo para poder ayudarte!', 'fa-robot');
            return;
        }

        resultDiv.innerHTML = `
            <div style="text-align:center; padding:1.5rem;">
                <div class="typing-dots"><span></span><span></span><span></span></div>
                <p style="font-size:0.85rem; color:var(--text-light); margin-top:0.5rem;">ChefiBot está analizando el catálogo...</p>
            </div>
        `;

        setTimeout(() => {
            const userIngs = ingredients.split(',').map(i => i.trim()).filter(i => i);
            
            // Score all recipes
            let scored = mockRecipes.map(recipe => {
                let score = 0;
                let goalMatch = true;
                
                // Objective match (High priority)
                if (goal) {
                    const recipeGoal = recipe.tags.includes('Perder peso') ? 'Perder peso' : (recipe.tags.includes('Ganar peso') ? 'Ganar peso' : 'Para todos');
                    if (recipeGoal !== goal) goalMatch = false;
                }

                // Ingredient/Title match
                userIngs.forEach(userIng => {
                    if (recipe.ingredients.some(ri => ri.toLowerCase().includes(userIng)) || recipe.title.toLowerCase().includes(userIng)) {
                        score += 10;
                    }
                });

                return { recipe, score: goalMatch ? score : score - 100 };
            });

            // Filter out non-matches and sort
            const bestMatches = scored
                .filter(s => s.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            if (bestMatches.length > 0) {
                resultDiv.innerHTML = `
                    <div style="margin-top:1.5rem; animation:fadeIn 0.4s ease;">
                        <p style="font-size:0.9rem; margin-bottom:1rem; font-weight:600; color:var(--primary-color);">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> He encontrado ${bestMatches.length} opciones ideales:
                        </p>
                        <div style="display:flex; flex-direction:column; gap:0.8rem;">
                            ${bestMatches.map(s => `
                                <div class="chefi-card" onclick="app.navigate('recipe', '${s.recipe.id}')" style="margin:0;">
                                    <h4 style="margin:0; font-size:0.95rem; color:var(--text-dark);">${s.recipe.title}</h4>
                                    <p style="font-size:0.75rem; color:var(--text-light); margin-top:0.2rem;">${s.recipe.time} • ${s.recipe.macros?.calories || '?'} kcal</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div style="margin-top:1.5rem; text-align:center; animation:fadeIn 0.4s ease;">
                        <i class="fa-solid fa-face-frown" style="font-size:2rem; color:var(--text-light); margin-bottom:1rem;"></i>
                        <p style="font-size:0.9rem; color:var(--text-light);">No he encontrado nada exacto para esos ingredientes, pero te invito a explorar la sección de recetas.</p>
                    </div>
                `;
            }
        }, 1200);
    }

    calculateMatch(recipeIngredients) {
        if(!this.pantryItems || this.pantryItems.length === 0) return null;
        let matchCount = 0;
        recipeIngredients.forEach(ing => {
            const hasIt = this.pantryItems.some(pItem => ing.toLowerCase().includes(pItem.toLowerCase()));
            if(hasIt) matchCount++;
        });
        return Math.round((matchCount / recipeIngredients.length) * 100);
    }

    createRecipeCard(recipe, index = 0) {
        let goal = 'mantener';
        if (recipe.tags.includes('Perder peso')) goal = 'perder';
        else if (recipe.tags.includes('Ganar peso')) goal = 'ganar';

        let goalBadge = '';
        if (goal === 'perder') {
            goalBadge = '<span class="goal-badge perder"><i class="fa-solid fa-weight-scale"></i> Definición</span>';
        } else if (goal === 'ganar') {
            goalBadge = '<span class="goal-badge ganar"><i class="fa-solid fa-dumbbell"></i> Volumen</span>';
        } else {
            goalBadge = '<span class="goal-badge mantener"><i class="fa-solid fa-heart-pulse"></i> Salud</span>';
        }

        const nutriScore = this.calculateNutriScore(recipe);
        const isFav = this.favorites.includes(recipe.id);
        const matchPercent = this.calculateMatch(recipe.ingredients);

        let idHash = 0;
        for(let i=0; i<recipe.id.length; i++) idHash += recipe.id.charCodeAt(i);
        const rating = (4.2 + (idHash % 8) / 10).toFixed(1);
        const reviews = 15 + (idHash % 350);

        return `
            <article class="recipe-card reveal-on-scroll" data-goal="${goal}" style="animation-delay: ${index * 0.05}s" onclick="app.navigate('recipe', '${recipe.id}')">
                <div class="card-img-container">
                    ${matchPercent !== null ? `<div class="match-badge">${matchPercent}% Match</div>` : ''}
                    <img src="${recipe.image}" alt="${recipe.title}" loading="lazy" onload="this.classList.add('loaded')" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600&auto=format&fit=crop'; this.classList.add('loaded')">
                    
                    <div class="card-tags" style="top: 0.8rem; left: 0.8rem;">
                        <span class="tag tag-${this.slugify(recipe.category)} glass-effect">${recipe.category}</span>
                    </div>

                    <div style="position:absolute; top:0.8rem; right:0.8rem; display:flex; flex-direction:column; gap:0.5rem; z-index:10;">
                        <button data-fav="${recipe.id}" onclick="app.toggleFavorite('${recipe.id}', event)" class="glass-effect" title="Guardar" style="width:36px; height:36px; border-radius:50%; border:none; cursor:pointer; color:${isFav ? 'var(--primary-color)' : 'var(--text-dark)'}; display:flex; align-items:center; justify-content:center; font-size:1rem; transition:var(--transition);">
                            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                        <button onclick="app.showQuickView('${recipe.id}', event)" class="glass-effect" title="Vista rápida" style="width:36px; height:36px; border-radius:50%; border:none; cursor:pointer; color:var(--text-dark); display:flex; align-items:center; justify-content:center; font-size:1rem; transition:var(--transition);">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>

                    <div class="card-rating glass-effect" style="position:absolute; bottom:12px; right:12px; color:var(--text-dark); padding:0.4rem 0.8rem; border-radius:30px; font-size:0.8rem; display:flex; align-items:center; gap:0.4rem; z-index:5; font-weight:700; border:none;">
                        <i class="fa-solid fa-star" style="color:#f39c12;"></i> ${rating}
                    </div>
                </div>
                <div class="card-content">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        ${goalBadge}
                        <span class="nutri-badge nutri-${nutriScore.toLowerCase()}" style="position:static; margin-left:auto; width:24px; height:24px; font-size:0.8rem;">${nutriScore}</span>
                    </div>
                    <h3 style="margin: 0.8rem 0 0.5rem; font-size:1.25rem;">${recipe.title}</h3>
                    <div class="card-meta" style="margin-bottom: 0.8rem;">
                        <span><i class="fa-regular fa-clock"></i> ${recipe.time}</span>
                        <span><i class="fa-solid fa-fire"></i> ${recipe.macros?.calories || '?'} kcal</span>
                    </div>
                    <p class="card-desc" style="font-size:0.85rem; line-height:1.5; height: 3em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${recipe.description}</p>
                    
                    <div style="margin-top:1.2rem; display:flex; gap:0.5rem;">
                        <button onclick="app.addToShoppingList('${recipe.id}', event)" class="btn-action" style="flex:1; font-size:0.8rem; padding:0.6rem; border-radius:var(--radius-md); background:rgba(211, 84, 0, 0.05); border-color:transparent;">
                            <i class="fa-solid fa-basket-shopping"></i> Lista
                        </button>
                        <button class="btn-action active" style="flex:1.5; font-size:0.8rem; padding:0.6rem; border-radius:var(--radius-md);">
                            Cocinar <i class="fa-solid fa-chevron-right" style="font-size:0.7rem;"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    loadMoreRecipes() {
        this.recipesToShow += 12;
        this.renderHome(true);
    }

    enterCookingMode(recipeId) {
        const recipe = mockRecipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        this.currentRecipe = recipe;
        this.currentCookingStep = 0;
        
        const cookingMode = document.getElementById('cooking-mode-overlay');
        if (cookingMode) {
            this.updateCookingStep();
            cookingMode.classList.remove('cooking-mode-hidden');
            document.body.style.overflow = 'hidden';
            
            // Start Voice Control
            if(this.recognition) {
                try {
                    this.recognition.onresult = (e) => {
                        const transcript = e.results[e.results.length-1][0].transcript.toLowerCase();
                        if(transcript.includes('siguiente') || transcript.includes('avanzar')) {
                            this.nextCookingStep();
                        } else if(transcript.includes('anterior') || transcript.includes('atrás')) {
                            this.prevCookingStep();
                        } else if(transcript.includes('salir') || transcript.includes('cerrar')) {
                            this.exitCookingMode();
                        }
                    };
                    this.recognition.start();
                    document.getElementById('voice-feedback')?.classList.add('active');
                } catch(e) {}
            }
            this.showToast('Modo cocina activado. ¡Puedes usar tu voz!', 'fa-fire-burner');
        }
    }

    exitCookingMode() {
        const cookingMode = document.getElementById('cooking-mode-overlay');
        if (cookingMode) {
            cookingMode.classList.add('cooking-mode-hidden');
            document.body.style.overflow = 'auto';
            if(this.recognition) {
                try { 
                    this.recognition.stop(); 
                    document.getElementById('voice-feedback')?.classList.remove('active');
                } catch(e) {}
            }
        }
    }

    updateCookingStep() {
        if (!this.currentRecipe) return;
        
        const container = document.getElementById('cooking-content');
        const indicator = document.getElementById('cooking-step-indicator');
        const progressBar = document.getElementById('cooking-progress-bar');
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');
        
        if (!container || !indicator || !prevBtn || !nextBtn) return;
        
        const step = this.currentRecipe.steps[this.currentCookingStep];
        const stepImage = step.image || this.currentRecipe.image;

        // Smart Timer Detect
        const timeMatch = step.text.match(/(\d+)\s*(minuto|minutos|min)/i);
        let timerHtml = '';
        if (timeMatch) {
            const minutes = parseInt(timeMatch[1]);
            timerHtml = `
                <div style="margin-top:2rem;">
                    <button class="btn-action" style="background:var(--primary-color); color:white; width:100%; justify-content:center; height:50px;" onclick="app.startSmartTimer(${minutes}, this)">
                        <i class="fa-solid fa-stopwatch"></i> Iniciar Temporizador ${minutes} min
                    </button>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="step-image-container" style="margin-bottom: 2rem;">
                <img src="${stepImage}" style="max-width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
            </div>
            <h3 style="font-size: 2.2rem; margin-bottom: 1.5rem; color: var(--primary-color);">Paso ${this.currentCookingStep + 1}</h3>
            <p style="font-size: 1.4rem; line-height: 1.7; max-width: 800px; color: var(--text-dark); margin-bottom: 2rem;">${step.text}</p>
            ${timerHtml}
            <div style="margin-top:2rem; padding:1.5rem; background:rgba(217,119,54,0.05); border-left:5px solid var(--primary-color); border-radius:var(--radius-md); text-align:left;">
                <strong style="display:block; margin-bottom:0.5rem; color:var(--text-dark); font-size:1.1rem;"><i class="fa-solid fa-lightbulb"></i> Tip del Chef</strong>
                <p style="font-size:1rem; color:var(--text-light); margin:0;">${this.currentRecipe.chefTip || 'Cocina a fuego lento para potenciar los sabores naturales.'}</p>
            </div>
        `;
        
        indicator.textContent = `Paso ${this.currentCookingStep + 1} de ${this.currentRecipe.steps.length}`;
        
        if (progressBar) {
            progressBar.style.width = `${((this.currentCookingStep + 1) / this.currentRecipe.steps.length) * 100}%`;
        }
        
        prevBtn.disabled = this.currentCookingStep === 0;
        if (this.currentCookingStep === this.currentRecipe.steps.length - 1) {
            nextBtn.innerHTML = '¡Finalizar! <i class="fa-solid fa-trophy"></i>';
        } else {
            nextBtn.innerHTML = 'Siguiente <i class="fa-solid fa-chevron-right"></i>';
        }
    }

    startSmartTimer(minutes, btn) {
        if (this.cookingTimerInterval) clearInterval(this.cookingTimerInterval);
        let seconds = minutes * 60;
        btn.disabled = true;
        btn.style.background = 'var(--secondary-color)';
        
        this.cookingTimerInterval = setInterval(() => {
            seconds--;
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            btn.innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${m}:${s.toString().padStart(2, '0')}`;
            if (seconds <= 0) {
                clearInterval(this.cookingTimerInterval);
                btn.innerHTML = `<i class="fa-solid fa-bell fa-shake"></i> ¡Listo!`;
                btn.style.background = '#27ae60';
                this.showToast('¡El tiempo ha terminado!', 'fa-bell');
                // [BLOQUE4] Audio sintetizado con Web Audio API (CSP fix)
                this.playAlarmSound();
            }
        }, 1000);
    }

    playAlarmSound() {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.start(); osc.stop(ctx.currentTime + 1);
    }

    prevCookingStep() {
        if (this.currentCookingStep > 0) {
            this.currentCookingStep--;
            this.updateCookingStep();
        }
    }

    async nextCookingStep() {
        if (!this.currentRecipe) return;
        
        if (this.currentCookingStep < this.currentRecipe.steps.length - 1) {
            this.currentCookingStep++;
            this.updateCookingStep();
        } else {
            // Gamification Logic
            this.userStats.recipesCooked++;
            const today = new Date().toDateString();
            if(this.userStats.lastCookedDate !== today) {
                this.userStats.streak++;
                this.userStats.lastCookedDate = today;
            }
            if (this.activeUser) {
                await updateDoc(doc(this.db, "users", this.activeUser.uid), {
                    stats: this.userStats
                });
            }
            
            this.exitCookingMode();
            this.launchConfetti(); // Celebration!
            this.showToast(`¡Receta completada! Llevas ${this.userStats.recipesCooked} recetas. Racha: ${this.userStats.streak} 🔥`, 'fa-trophy');
        }
    }
}

// Robust Initialization
function initApp() {
    if (window.appInstance) return;
    try {
        console.log("Cuchara & Sabor: Inyectando motor principal...");
        window.appInstance = new App();
        window.app = window.appInstance; // Legacy compatibility
    } catch (e) {
        console.error("Critical: App failed to instantiate", e);
        var content = document.getElementById('app-content');
        if (content) {
            content.innerHTML = `
                <div style="background:#fff5f5; color:#c53030; padding:2rem; border-radius:1rem; text-align:center; margin:2rem; border:2px solid #feb2b2;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; margin-bottom:1rem;"></i>
                    <h3>Error de Inicialización</h3>
                    <p>${e.message}</p>
                    <button onclick="location.reload()" style="background:#c53030; color:white; border:none; padding:0.8rem 1.5rem; border-radius:0.5rem; cursor:pointer; margin-top:1rem;">Reintentar carga</button>
                </div>
            `;
        }
    }
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}
// Fallback extra para navegadores lentos
window.addEventListener('load', initApp);

// Quitar la pantalla de carga global de forma segura
function removeLoader() {
    const loader = document.getElementById('global-loader');
    if (loader && loader.style.display !== 'none') {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.6s ease';
        setTimeout(() => loader.style.display = 'none', 600);
    }
}

// Ejecutar al DOMContentLoaded para no depender de imágenes lentas
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(removeLoader, 500);
});

// Fallback por si DOMContentLoaded ya saltó (al usar script defer)
setTimeout(removeLoader, 800);
window.addEventListener('load', removeLoader);
