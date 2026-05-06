export const mockRecipes = [
    {
        id: 'curry-lentejas',
        title: 'Curry Cremoso de Lentejas y Coco',
        description: 'Un plato reconfortante, lleno de especias cálidas y muy fácil de preparar. Ideal para entrar en calor.',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&fit=crop',
        time: '25 min',
        difficulty: 'Fácil',
        category: 'Comidas',
        tags: ['Vegano', 'Saludable', 'Legumbres', 'Alto en proteínas'],
        macros: { calories: 320, protein: 18, carbs: 45, fats: 12 },
        chefTip: 'Para un sabor más profundo, tuesta las especias en seco un minuto antes de añadir el aceite.',
        allergens: ['Sin Gluten', 'Sin lactosa', 'Sin huevo', 'Sin frutos secos'],
        ingredients: [
            '1 taza de lentejas rojas (lavadas)',
            '1 lata (400ml) de leche de coco',
            '1 cebolla grande, picada finamente',
            '2 dientes de ajo, picados',
            '1 cucharada de jengibre fresco rallado',
            '2 cucharadas de pasta de curry rojo o amarillo',
            '1 cucharadita de cúrcuma',
            '2 tazas de caldo de verduras',
            'Aceite de oliva',
            'Cilantro fresco para decorar'
        ],
        adaptation: {
            title: 'Adaptación para dieta baja en grasas',
            text: 'Si prefieres reducir las calorías, sustituye la leche de coco normal por leche de coco "light" y reduce el aceite de oliva a 1 cucharadita.'
        },
        steps: [
            { text: 'Calienta un chorrito de aceite de oliva en una olla grande a fuego medio. Añade la cebolla y sofríe hasta que esté translúcida.', image: null },
            { text: 'Incorpora el ajo, el jengibre, la pasta de curry y la cúrcuma. Cocina por 1 minuto.', image: null },
            { text: 'Añade las lentejas rojas, la leche de coco y el caldo de verduras.', image: null },
            { text: 'Lleva a ebullición, luego reduce el fuego, tapa y deja cocinar 15-20 minutos.', image: null }
        ],
        finalResult: 'Un curry espeso y vibrante.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Curry de Lentejas" }
    },
    {
        id: 'desayuno-gym-pancakes',
        title: 'Tortitas de Avena y Plátano (Gym-Ready)',
        description: 'Desayuno alto en proteínas y carbohidratos complejos, ideal para antes o después de entrenar.',
        image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&q=80&fit=crop',
        time: '15 min',
        difficulty: 'Fácil',
        category: 'Desayunos',
        tags: ['Gimnasio', 'Proteico', 'Sin Azúcar'],
        macros: { calories: 380, protein: 28, carbs: 45, fats: 8 },
        chefTip: 'Si quieres un extra de textura, añade un puñado de pepitas de chocolate 85% a la masa.',
        allergens: ['Huevo', 'Gluten'],
        ingredients: [
            '2 claras de huevo y 1 huevo entero',
            '50g de avena molida',
            '1 plátano maduro machacado',
            '1 scoop de proteína de vainilla (opcional)',
            'Canela y esencia de vainilla'
        ],
        adaptation: {
            title: 'Opción Vegana',
            text: 'Usa "huevo" de lino (1 cda lino + 3 cdas agua) y leche vegetal en lugar del huevo.'
        },
        steps: [
            { text: 'Mezcla todos los ingredientes en una batidora hasta que no queden grumos.', image: null },
            { text: 'Engrasa una sartén antiadherente y cocina a fuego medio por ambos lados.', image: null },
            { text: 'Sirve con un chorrito de crema de cacahuete o fruta fresca.', image: null }
        ],
        finalResult: 'Tortitas esponjosas y muy nutritivas.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Tortitas Avena y Plátano" }
    },
    {
        id: 'desayuno-shakshuka',
        title: 'Shakshuka Tradicional Tunecina',
        description: 'Huevos escalfados en una salsa de tomate especiada, pimientos y cebolla. Un festín internacional.',
        image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=600&q=80&fit=crop',
        time: '25 min',
        difficulty: 'Media',
        category: 'Desayunos',
        tags: ['Internacional', 'Huevos', 'Especiado'],
        macros: { calories: 290, protein: 18, carbs: 15, fats: 16 },
        chefTip: 'No cocines demasiado los huevos; la yema debe estar líquida para mojar pan.',
        allergens: ['Huevo'],
        ingredients: [
            '2 huevos frescos',
            '1 lata de tomate triturado de calidad',
            '1 pimiento rojo y 1 cebolla',
            'Comino, pimentón ahumado y harissa (opcional)',
            'Queso feta y perejil para decorar'
        ],
        adaptation: {
            title: 'Para mojar',
            text: 'Acompáñalo siempre con un buen pan de pita caliente.'
        },
        steps: [
            { text: 'Sofríe la cebolla y el pimiento hasta que estén muy tiernos.', image: null },
            { text: 'Añade las especias y el tomate. Deja reducir 10 min.', image: null },
            { text: 'Haz dos huecos en la salsa, rompe los huevos dentro y tapa hasta que la clara cuaje.', image: null }
        ],
        finalResult: 'Un plato vibrante con un sabor intenso a especias.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Shakshuka Tunecina" }
    },
    {
        id: 'desayuno-french-toast',
        title: 'French Toast con Canela y Miel',
        description: 'La versión gourmet de las tostadas francesas, perfectas para un domingo especial.',
        image: 'https://images.unsplash.com/photo-1484723088339-fe7821a10a6a?w=600&q=80&fit=crop',
        time: '20 min',
        difficulty: 'Fácil',
        category: 'Desayunos',
        tags: ['Dulce', 'Reposteria', 'Comfort Food'],
        macros: { calories: 420, protein: 14, carbs: 55, fats: 18 },
        chefTip: 'Usa pan brioche o de molde grueso de un día anterior para que absorba mejor la mezcla.',
        allergens: ['Huevo', 'Lácteos', 'Gluten'],
        ingredients: [
            '2 rebanadas de pan grueso',
            '1 huevo y 100ml de leche',
            'Canela en polvo y azúcar de coco',
            'Miel pura de abeja',
            'Mantequilla para la sartén'
        ],
        adaptation: {
            title: 'Topping extra',
            text: 'Añade nueces picadas para un toque crujiente.'
        },
        steps: [
            { text: 'Bate el huevo con la leche, canela y vainilla.', image: null },
            { text: 'Sumerge el pan en la mezcla durante 1 min por cada lado.', image: null },
            { text: 'Dora en mantequilla a fuego medio hasta que caramelice.', image: null }
        ],
        finalResult: 'Tostadas crujientes por fuera y cremosas por dentro.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "French Toast Gourmet" }
    },
    {
        id: 'desayuno-avocado-toast',
        title: 'Huevos con Aguacate y Masa Madre',
        description: 'El desayuno salado definitivo: tostada crujiente con base cremosa y huevos al punto.',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80&fit=crop',
        time: '12 min',
        difficulty: 'Fácil',
        category: 'Desayunos',
        tags: ['Salado', 'Saludable', 'Grasas Buenas'],
        macros: { calories: 340, protein: 16, carbs: 22, fats: 20 },
        chefTip: 'Añade unas escamas de sal maldon y copos de chile al final para un toque pro.',
        allergens: ['Gluten', 'Huevo'],
        ingredients: [
            '1 rebanada grande de pan de masa madre',
            '1/2 aguacate maduro',
            '2 huevos (revueltos o escalfados)',
            'Semillas de sésamo negro',
            'Zumo de lima'
        ],
        adaptation: {
            title: 'Extra de Proteína',
            text: 'Añade una loncha de salmón ahumado encima del aguacate.'
        },
        steps: [
            { text: 'Tuesta el pan hasta que esté bien crujiente.', image: null },
            { text: 'Chafa el aguacate con lima y sal. Extiende sobre el pan.', image: null },
            { text: 'Cocina los huevos y colócalos encima con cuidado.', image: null }
        ],
        finalResult: 'Una tostada equilibrada y deliciosa.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Avocado Toast Premium" }
    },
    {
        id: 'desayuno-overnight-oats',
        title: 'Overnight Oats con Frutos Rojos',
        description: 'Desayuno frío sin cocción, ideal para llevar o comer rápido por la mañana.',
        image: 'https://images.unsplash.com/photo-1516746874112-7d04e7e6005b?w=600&q=80&fit=crop',
        time: '5 min (+reposo)',
        difficulty: 'Fácil',
        category: 'Desayunos',
        tags: ['Frío', 'Rápido', 'Fibra'],
        macros: { calories: 280, protein: 12, carbs: 38, fats: 6 },
        chefTip: 'Prepáralo por la noche en un tarro de cristal para que esté listo al despertar.',
        allergens: ['Lácteos (opcional)'],
        ingredients: [
            '40g copos de avena enteros',
            '120ml de leche o bebida vegetal',
            '1 cucharada de semillas de chía',
            'Frambuesas y arándanos frescos',
            'Yogur griego'
        ],
        adaptation: {
            title: 'Más Sabor',
            text: 'Añade una cucharadita de cacao puro para una versión de chocolate.'
        },
        steps: [
            { text: 'Mezcla la avena, leche y chía en un tarro y remueve bien.', image: null },
            { text: 'Guarda en la nevera un mínimo de 4 horas.', image: null },
            { text: 'Al servir, añade el yogur y los frutos rojos por encima.', image: null }
        ],
        finalResult: 'Una base cremosa con el frescor de la fruta.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Overnight Oats" }
    },
    {
        id: 'salmon-esparragos',
        title: 'Salmón al Horno con Costra de Hierbas',
        description: 'Una cena elegante, ligera y lista en menos de media hora.',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&fit=crop',
        time: '20 min',
        difficulty: 'Fácil',
        category: 'Cenas',
        tags: ['Keto', 'Bajo en calorías', 'Alto en proteínas', 'Menos de 30 min'],
        macros: { calories: 450, protein: 35, carbs: 8, fats: 28 },
        chefTip: 'No cocines demasiado el salmón; debe quedar ligeramente rosado en el centro.',
        allergens: ['Sin Gluten', 'Sin lactosa', 'Sin huevo', 'Sin frutos secos'],
        ingredients: [
            '2 lomos de salmón fresco',
            '1 manojo de espárragos trigueros',
            '2 cucharadas de aceite de oliva virgen extra',
            '1 limón',
            'Ajo y hierbas frescas'
        ],
        adaptation: {
            title: 'Sustitución de pescado',
            text: 'Funciona perfectamente con bacalao o merluza.'
        },
        steps: [
            { text: 'Precalienta el horno a 200°C.', image: null },
            { text: 'Mezcla aceite, ajo, hierbas y limón.', image: null },
            { text: 'Hornea salmón y espárragos 12-15 minutos.', image: null }
        ],
        finalResult: 'Un plato visualmente impresionante.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Salmón al Horno" }
    },
    {
        id: 'sushi-maki',
        title: 'Maki Sushi Variado',
        description: 'Aprende a preparar los clásicos rollos de sushi japoneses en casa.',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&fit=crop',
        time: '50 min',
        difficulty: 'Media',
        category: 'Comidas',
        tags: ['Japonesa', 'Saludable', 'Pescado'],
        macros: { calories: 550, protein: 22, carbs: 75, fats: 14 },
        chefTip: 'Usa un cuchillo muy afilado y humedécelo antes de cada corte.',
        allergens: ['Sin lactosa', 'Sin huevo'],
        ingredients: [
            'Arroz para sushi (shari)',
            'Algas nori',
            'Salmón fresco, aguacate, pepino',
            'Vinagre de arroz, azúcar y sal'
        ],
        adaptation: {
            title: 'Versión Vegana',
            text: 'Usa solo vegetales como aguacate, pepino, zanahoria y rábano.'
        },
        steps: [
            { text: 'Lava y cuece el arroz, luego aderézalo con la mezcla de vinagre.', image: null },
            { text: 'Extiende el arroz sobre el alga nori dejand un borde libre.', image: null },
            { text: 'Coloca el relleno y enrolla firmemente con la esterilla.', image: null },
            { text: 'Corta en discos de 2 cm.', image: null }
        ],
        finalResult: 'Rollos de sushi perfectos.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Maki Sushi" }
    },
    {
        id: 'ramen-tonkotsu',
        title: 'Ramen Tonkotsu Casero',
        description: 'Sopa japonesa intensa con caldo de cerdo cocinado a fuego lento.',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&fit=crop',
        time: '4 h',
        difficulty: 'Difícil',
        category: 'Comidas',
        tags: ['Japonesa', 'Tradicional', 'Sopa'],
        macros: { calories: 650, protein: 28, carbs: 70, fats: 25 },
        chefTip: 'El secreto está en el "tare" (la base de sabor). No escatimes en la calidad de la soja.',
        allergens: ['Sin lactosa', 'Sin frutos secos'],
        ingredients: [
            'Huesos de cerdo',
            'Fideos ramen frescos',
            'Chashu (panceta marinada)',
            'Huevo marinado (ajitsuke tamago)',
            'Cebollino y nori'
        ],
        adaptation: {
            title: 'Versión Rápida',
            text: 'Usa caldo de huesos comprado de alta calidad para ahorrar tiempo.'
        },
        steps: [
            { text: 'Hierve los huesos durante horas hasta que el caldo esté blanco y cremoso.', image: null },
            { text: 'Prepara el chashu horneando la panceta con soja y mirin.', image: null },
            { text: 'Cuece los fideos y monta el bol con el caldo, tare y toppings.', image: null }
        ],
        finalResult: 'Un ramen de restaurante en casa.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Ramen Tonkotsu" }
    },
    {
        id: 'paella-valenciana',
        title: 'Paella Valenciana Tradicional',
        description: 'El plato más emblemático de la cocina española hecho a leña.',
        image: 'https://images.unsplash.com/photo-1534080564607-c98752441051?w=600&fit=crop',
        time: '60 min',
        difficulty: 'Media',
        category: 'Comidas',
        tags: ['Española', 'Tradicional', 'Arroz'],
        macros: { calories: 520, protein: 24, carbs: 65, fats: 18 },
        chefTip: 'No remuevas el arroz una vez distribuido para conseguir el "socarrat".',
        allergens: ['Sin Gluten', 'Sin lactosa', 'Sin huevo'],
        ingredients: [
            'Arroz bomba',
            'Pollo y conejo troceado',
            'Bajoqueta y garrofó',
            'Tomate triturado',
            'Azafrán y pimentón',
            'Aceite de oliva'
        ],
        adaptation: {
            title: 'Paella de Marisco',
            text: 'Sustituye la carne por gambas, calamares y mejillones.'
        },
        steps: [
            { text: 'Dora la carne con aceite de oliva.', image: null },
            { text: 'Añade la verdura y sofríe. Incorpora el tomate.', image: null },
            { text: 'Añade agua y deja cocer para hacer el caldo. Echa el arroz y azafrán.', image: null },
            { text: 'Cocina 18-20 min sin remover.', image: null }
        ],
        finalResult: 'Un arroz seco, suelto y lleno de sabor.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Paella Valenciana" }
    },
    {
        id: 'tacos-pastor',
        title: 'Tacos al Pastor',
        description: 'La joya de la corona de la comida callejera mexicana.',
        image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&fit=crop',
        time: '40 min',
        difficulty: 'Media',
        category: 'Comidas',
        tags: ['Mexicana', 'Tradicional', 'Picante'],
        macros: { calories: 420, protein: 28, carbs: 35, fats: 18 },
        chefTip: 'La piña asada es fundamental para equilibrar el adobo de la carne.',
        allergens: ['Sin lactosa', 'Sin huevo'],
        ingredients: [
            'Carne de cerdo (cabezada)',
            'Achiote y chiles guajillo',
            'Piña madura',
            'Tortillas de maíz',
            'Cebolla y cilantro'
        ],
        adaptation: {
            title: 'Versión Vegetariana',
            text: 'Usa setas ostra o soja texturizada marinada.'
        },
        steps: [
            { text: 'Marina la carne con la pasta de achiote y chiles.', image: null },
            { text: 'Cocina la carne en una plancha muy caliente junto con la piña.', image: null },
            { text: 'Monta los tacos con cebolla y cilantro.', image: null }
        ],
        finalResult: 'Auténtico sabor mexicano.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Tacos al Pastor" }
    },
    {
        id: 'moussaka-griega',
        title: 'Moussaka Griega de Berenjena',
        description: 'Pastel de capas con berenjena, carne picada y bechamel.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&fit=crop',
        time: '75 min',
        difficulty: 'Media',
        category: 'Comidas',
        tags: ['Griega', 'Tradicional', 'Horno'],
        macros: { calories: 580, protein: 32, carbs: 40, fats: 35 },
        chefTip: 'Escurre bien las berenjenas con sal para que no suelten agua en el pastel.',
        allergens: ['Sin frutos secos'],
        ingredients: [
            'Berenjenas grandes',
            'Carne picada de cordero o ternera',
            'Salsa de tomate con canela',
            'Bechamel espesa',
            'Patatas en rodajas'
        ],
        adaptation: {
            title: 'Moussaka Vegana',
            text: 'Usa lentejas en lugar de carne y bechamel de leche de coco.'
        },
        steps: [
            { text: 'Fríe o asa las berenjenas y patatas en rodajas.', image: null },
            { text: 'Prepara la salsa de carne con tomate y especias.', image: null },
            { text: 'Monta capas en una bandeja y cubre con bechamel. Hornea 45 min.', image: null }
        ],
        finalResult: 'Un pastel cremoso y saciante.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Moussaka Griega" }
    },
    {
        id: 'pad-thai',
        title: 'Pad Thai de Gambas',
        description: 'El plato de fideos salteados más famoso de Tailandia.',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&fit=crop',
        time: '25 min',
        difficulty: 'Fácil',
        category: 'Cenas',
        tags: ['Tailandesa', 'Fácil', 'Wok'],
        macros: { calories: 480, protein: 22, carbs: 65, fats: 14 },
        chefTip: 'No cocines demasiado los fideos antes de saltearlos; deben terminar de cocerse en el wok.',
        allergens: ['Sin Gluten', 'Sin lactosa'],
        ingredients: [
            'Fideos de arroz',
            'Gambas',
            'Tofu firme',
            'Brotes de soja y cacahuetes',
            'Salsa de tamarindo, soja y azúcar de palma'
        ],
        adaptation: {
            title: 'Sin Frutos Secos',
            text: 'Sustituye los cacahuetes por semillas de sésamo tostadas.'
        },
        steps: [
            { text: 'Hidrata los fideos en agua tibia.', image: null },
            { text: 'Saltea gambas y tofu en un wok. Añade huevo y cuájalo.', image: null },
            { text: 'Añade fideos, salsa y brotes. Saltea a fuego fuerte.', image: null }
        ],
        finalResult: 'Equilibrio perfecto entre dulce, ácido y salado.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Pad Thai" }
    },
    {
        id: 'butter-chicken',
        title: 'Butter Chicken (Murgh Makhani)',
        description: 'Pollo tierno en una salsa de tomate y mantequilla extremadamente cremosa.',
        image: 'https://images.unsplash.com/photo-1603894584134-f1c917837139?w=600&fit=crop',
        time: '45 min',
        difficulty: 'Media',
        category: 'Cenas',
        tags: ['India', 'Cremoso', 'Especias'],
        macros: { calories: 620, protein: 35, carbs: 15, fats: 48 },
        chefTip: 'Usa mantequilla clarificada (ghee) para un sabor más auténtico.',
        allergens: ['Sin Gluten', 'Sin huevo'],
        ingredients: [
            'Pechuga de pollo marinado en yogur',
            'Mantequilla y nata',
            'Tomate triturado',
            'Garam masala, jengibre y ajo',
            'Anacardos triturados'
        ],
        adaptation: {
            title: 'Versión Ligera',
            text: 'Sustituye la nata por leche de coco light o yogur griego.'
        },
        steps: [
            { text: 'Asa el pollo marinado en el horno.', image: null },
            { text: 'Prepara la salsa de tomate con especias y mantequilla.', image: null },
            { text: 'Junta el pollo con la salsa y añade la nata.', image: null }
        ],
        finalResult: 'Una explosión de sabor sedoso.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Butter Chicken" }
    },
    {
        id: 'arepas-reina',
        title: 'Arepas Reina Pepiada',
        description: 'El clásico venezolano de arepa rellena de ensalada de pollo y aguacate.',
        image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&fit=crop',
        time: '30 min',
        difficulty: 'Fácil',
        category: 'Comidas',
        tags: ['Venezolana', 'Sin Gluten', 'Aguacate'],
        macros: { calories: 480, protein: 22, carbs: 45, fats: 24 },
        chefTip: 'La masa debe estar húmeda pero no pegajosa. Déjala reposar 5 min antes de formar.',
        allergens: ['Sin Gluten', 'Sin lactosa', 'Sin huevo', 'Sin frutos secos'],
        ingredients: [
            'Harina de maíz precocida (P.A.N.)',
            'Pollo desmechado',
            'Aguacate maduro',
            'Mayonesa y cebolla',
            'Aceite de oliva'
        ],
        adaptation: {
            title: 'Arepa de Queso',
            text: 'Rellena solo con queso fresco para una opción vegetariana rápida.'
        },
        steps: [
            { text: 'Mezcla harina, agua y sal hasta formar la masa. Forma discos.', image: null },
            { text: 'Cocina en budare o sartén 5 min por lado hasta que suenen huecas.', image: null },
            { text: 'Mezcla pollo, aguacate y mayonesa. Abre la arepa y rellena.', image: null }
        ],
        finalResult: 'Un bocado crujiente por fuera y cremoso por dentro.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Arepa Reina Pepiada" }
    },
    {
        id: 'dim-sum',
        title: 'Dim Sum de Gambas (Har Gow)',
        description: 'Dumplings chinos al vapor con masa translúcida y relleno de gambas.',
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&fit=crop',
        time: '60 min',
        difficulty: 'Difícil',
        category: 'Comidas',
        tags: ['China', 'Al vapor', 'Tradicional'],
        macros: { calories: 280, protein: 18, carbs: 42, fats: 4 },
        chefTip: 'La masa de Har Gow es muy delicada. Mantén los discos bajo un paño húmedo.',
        allergens: ['Sin lactosa', 'Sin huevo', 'Sin frutos secos'],
        ingredients: [
            'Almidón de trigo y fécula de patata',
            'Gambas frescas picadas',
            'Brotes de bambú',
            'Aceite de sésamo y jengibre'
        ],
        adaptation: {
            title: 'Dim Sum de Verduras',
            text: 'Usa un relleno de setas shiitake, zanahoria y repollo.'
        },
        steps: [
            { text: 'Prepara la masa con agua hirviendo. Amasa hasta que esté elástica.', image: null },
            { text: 'Mezcla el relleno de gambas y especias.', image: null },
            { text: 'Forma pequeños saquitos y cocina al vapor 5-7 min.', image: null }
        ],
        finalResult: 'Pequeñas joyas comestibles translúcidas.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Dim Sum Har Gow" }
    },
    {
        id: 'ceviche-peruano',
        title: 'Ceviche Peruano Clásico',
        description: 'Pescado fresco marinado en cítricos, ají y cilantro.',
        image: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&fit=crop',
        time: '20 min',
        difficulty: 'Fácil',
        category: 'Comidas',
        tags: ['Peruana', 'Fresca', 'Pescado'],
        macros: { calories: 220, protein: 32, carbs: 12, fats: 4 },
        chefTip: 'Usa pescado de máxima frescura. El marinado no debe exceder los 10 minutos.',
        allergens: ['Sin Gluten', 'Sin lactosa', 'Sin huevo', 'Sin frutos secos'],
        ingredients: [
            'Corvina o lenguado en dados',
            'Limón sutil (lima)',
            'Ají limo picado',
            'Cebolla morada en pluma',
            'Cilantro y boniato cocido'
        ],
        adaptation: {
            title: 'Ceviche de Champiñones',
            text: 'Para una versión vegana, sustituye el pescado por láminas de champiñones.'
        },
        steps: [
            { text: 'Mezcla el pescado con sal y ají limo.', image: null },
            { text: 'Añade el zumo de limón y remueve. Deja marinar 2-3 min.', image: null },
            { text: 'Incorpora la cebolla y cilantro. Sirve con boniato y maíz canchita.', image: null }
        ],
        finalResult: 'Frescura cítrica y picante pura.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Ceviche Peruano" }
    },
    {
        id: 'pasta-carbonara',
        title: 'Pasta Carbonara Auténtica',
        description: 'La verdadera receta italiana: sin nata, solo huevo, pecorino, guanciale y pimienta.',
        image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80&fit=crop',
        time: '15 min',
        difficulty: 'Media',
        category: 'Comidas',
        tags: ['Italiana', 'Tradicional', 'Pasta'],
        macros: { calories: 780, protein: 32, carbs: 85, fats: 38 },
        chefTip: 'El secreto es el calor residual. Nunca cuajes el huevo con fuego directo o tendrás tortilla de pasta.',
        allergens: ['Gluten', 'Huevo', 'Lácteos'],
        ingredients: [
            '200g de pasta (Spaghetti o Rigatoni)',
            '100g de guanciale o panceta curada',
            '2 huevos grandes',
            '50g de queso Pecorino Romano rallado',
            'Pimienta negra recién molida',
            'Sal'
        ],
        adaptation: {
            title: 'Opción más ligera',
            text: 'Usa menos pasta y aumenta el queso para mantener el sabor con menos carbohidratos.'
        },
        steps: [
            { text: 'Cuece la pasta en agua con sal.', image: null },
            { text: 'Dora el guanciale en una sartén hasta que esté crujiente.', image: null },
            { text: 'Bate los huevos con el queso y mucha pimienta.', image: null },
            { text: 'Mezcla la pasta con el guanciale, añade un poco de agua de cocción y, fuera del fuego, incorpora la crema de huevo.', image: null }
        ],
        finalResult: 'Una salsa cremosa y sedosa que envuelve la pasta.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": "Pasta Carbonara" }
    }
];

// Generador de recetas dinámicas para completar las 500
const cultures = ['Mexicana', 'Japonesa', 'Italiana', 'Española', 'India', 'Tailandesa', 'Francesa', 'Griega', 'Marroquí', 'China', 'Peruana', 'Venezolana', 'Americana', 'Libanesa', 'Etíope', 'Turca', 'Coreana', 'Vietnamita'];
const categories = ['Desayunos', 'Comidas', 'Cenas', 'Snacks', 'Postres'];
const difficulties = ['Fácil', 'Media', 'Difícil'];
const ingredientsPool = {
    'Proteínas': [
        { name: 'Salmón', cal: 208, prot: 20, fat: 13, carb: 0, allergens: ['Pescado'] },
        { name: 'Tofu', cal: 76, prot: 8, fat: 4.8, carb: 1.9, allergens: ['Soja'] },
        { name: 'Ternera', cal: 250, prot: 26, fat: 15, carb: 0, allergens: [] },
        { name: 'Pollo', cal: 165, prot: 31, fat: 3.6, carb: 0, allergens: [] },
        { name: 'Lentejas', cal: 116, prot: 9, fat: 0.4, carb: 20, allergens: ['Legumbres'] },
        { name: 'Garbanzos', cal: 164, prot: 8.9, fat: 2.6, carb: 27, allergens: ['Legumbres'] },
        { name: 'Pavo', cal: 135, prot: 30, fat: 1, carb: 0, allergens: [] },
        { name: 'Atún', cal: 130, prot: 29, fat: 0.6, carb: 0, allergens: ['Pescado'] },
        { name: 'Pescado Blanco', cal: 90, prot: 20, fat: 1, carb: 0, allergens: ['Pescado'] }
    ],
    'Base': [
        { name: 'Arroz', cal: 130, carb: 28, prot: 2.7, fat: 0.3, allergens: [] },
        { name: 'Pasta', cal: 158, carb: 31, prot: 5.8, fat: 0.9, allergens: ['Gluten'] },
        { name: 'Ensalada', cal: 15, carb: 3, prot: 1.4, fat: 0.2, allergens: [] },
        { name: 'Tacos', cal: 150, carb: 20, prot: 4, fat: 5, allergens: ['Maíz'] },
        { name: 'Pan Integral', cal: 247, carb: 41, prot: 13, fat: 3.4, allergens: ['Gluten'] },
        { name: 'Boniato', cal: 86, carb: 20, prot: 1.6, fat: 0.1, allergens: [] },
        { name: 'Quinoa', cal: 120, carb: 21, prot: 4.4, fat: 1.9, allergens: [] }
    ]
};

const styles = ['Crujiente', 'Braiseado', 'al Horno', 'Salteado', 'Marinado', 'al Vapor', 'Rústico', 'Imperial', 'Zen', 'Vibrante'];

for (let i = 1; i <= 488; i++) {
    const culture = cultures[i % cultures.length];
    const style = styles[i % styles.length];
    const difficulty = difficulties[i % difficulties.length];
    let category = 'Comidas';
    
    if (i % 8 === 0) category = 'Desayunos';
    else if (i % 11 === 0) category = 'Postres';
    else if (i % 14 === 0) category = 'Snacks';
    else if (i % 3 === 0) category = 'Cenas';

    let title, description, ingredients, protObj, baseObj, flavor;
    let finalMacros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    let allergens = [];

    if (category === 'Postres') {
        flavor = dessertIngredients['Toppings'][i % dessertIngredients['Toppings'].length];
        const baseName = dessertIngredients['Bases'][i % dessertIngredients['Bases'].length];
        title = `${style} de ${baseName} y ${flavor}`;
        description = `Un postre delicado al estilo ${culture} que combina ${baseName.toLowerCase()} con un toque de ${flavor.toLowerCase()}.`;
        ingredients = [`200g de ${baseName}`, `${flavor} para decorar`, 'Esencia de vainilla', 'Miel'];
        finalMacros = { calories: 250 + (i % 150), protein: 5 + (i % 5), carbs: 40 + (i % 30), fats: 10 + (i % 10) };
        if (baseName === 'Chocolate') allergens.push('Lácteos');
        if (baseName === 'Yogur' || baseName === 'Mascarpone') allergens.push('Lácteos');
        if (baseName === 'Avena' || baseName === 'Hojaldre') allergens.push('Gluten');
    } else if (category === 'Desayunos') {
        const isEgg = i % 2 === 0;
        title = `Desayuno ${culture}: ${isEgg ? 'Huevos' : 'Avena'} con ${isEgg ? 'Tostadas' : 'Fruta'}`;
        ingredients = isEgg ? ['2 Huevos', 'Pan integral', 'Aguacate'] : ['Avena', 'Leche de almendras', 'Frutos rojos'];
        finalMacros = isEgg ? { calories: 350, protein: 18, carbs: 25, fats: 20 } : { calories: 280, protein: 12, carbs: 45, fats: 8 };
        allergens = isEgg ? ['Huevo', 'Gluten'] : ['Frutos Secos'];
        description = `Empieza el día con energía al estilo ${culture}.`;
    } else if (category === 'Snacks') {
        const snackBase = snackIngredients['Bases'][i % snackIngredients['Bases'].length];
        flavor = snackIngredients['Dips'][i % snackIngredients['Dips'].length];
        title = `Bocado de ${snackBase} con ${flavor}`;
        ingredients = [`100g de ${snackBase}`, `${flavor}`, 'Especias'];
        finalMacros = { calories: 150 + (i % 100), protein: 5 + (i % 10), carbs: 10 + (i % 20), fats: 5 + (i % 10) };
        if (snackBase === 'Queso' || flavor === 'Crema de Queso' || flavor === 'Tzatziki') allergens.push('Lácteos');
        if (snackBase === 'Frutos Secos') allergens.push('Frutos Secos');
        description = `Un snack ligero y equilibrado.`;
    } else {
        protObj = ingredientsPool['Proteínas'][i % ingredientsPool['Proteínas'].length];
        baseObj = ingredientsPool['Base'][i % ingredientsPool['Base'].length];
        flavor = ingredientsPool['Sabor'][i % ingredientsPool['Sabor'].length];
        
        title = `${protObj.name} ${style} sobre ${baseObj.name} al estilo ${culture}`;
        description = `Una exquisita combinación de ${protObj.name.toLowerCase()} preparado con técnica ${style.toLowerCase()}, acompañado de ${baseObj.name.toLowerCase()}.`;
        ingredients = [`200g de ${protObj.name}`, `150g de ${baseObj.name}`, `${flavor}`, 'Aceite de oliva', 'Sal'];
        
        // CÁLCULO REAL BASADO EN PESOS (200g proteína + 150g base)
        finalMacros.calories = Math.round((protObj.cal * 2) + (baseObj.cal * 1.5) + 90); // +90 por aceite
        finalMacros.protein = Math.round((protObj.prot * 2) + (baseObj.prot * 1.5));
        finalMacros.carbs = Math.round((protObj.carb * 2) + (baseObj.carb * 1.5));
        finalMacros.fats = Math.round((protObj.fat * 2) + (baseObj.fat * 1.5) + 10);
        
        allergens = [...protObj.allergens, ...baseObj.allergens];
    }
    
    const generatedRecipe = {
        id: `recipe-${i}`,
        title: title,
        description: description,
        image: `https://images.unsplash.com/photo-${1500000000000 + (i * 123) % 100000}?w=600&fit=crop&q=60`,
        time: (category === 'Postres' || category === 'Snacks') ? `${15 + (i % 15)} min` : `${25 + (i % 35)} min`,
        difficulty: difficulty,
        category: category,
        tags: [culture, category, style, 'Gourmet'],
        macros: finalMacros,
        chefTip: `Para este plato ${culture.toLowerCase()}, el secreto es el toque ${style.toLowerCase()} que realza el sabor de la base. ¡Disfrútalo caliente!`,
        allergens: allergens.length > 0 ? allergens : ['Sin alérgenos comunes'],
        ingredients: ingredients,
        adaptation: {
            title: 'Tip de Salud',
            text: 'Puedes reducir las calorías sustituyendo el aceite por spray de cocina o usando una base de verduras.'
        },
        steps: [
            { text: `Prepara los ingredientes principales frescos.`, image: null },
            { text: `Cocina siguiendo el estilo ${style.toLowerCase()} tradicional.`, image: null },
            { text: 'Sirve inmediatamente y disfruta.', image: null }
        ],
        finalResult: 'Un resultado equilibrado y apetitoso.',
        seoSchema: { 
            "@context": "https://schema.org/", 
            "@type": "Recipe", 
            "name": title,
            "recipeCategory": category,
            "recipeCuisine": culture
        }
    };

    if (generatedRecipe.macros.calories > 550) generatedRecipe.tags.push('Ganar peso');
    else if (generatedRecipe.macros.calories < 400) generatedRecipe.tags.push('Perder peso');

    mockRecipes.push(generatedRecipe);
}
