const mockRecipes = [
    {
        id: 'curry-lentejas',
        title: 'Curry Cremoso de Lentejas y Coco',
        description: 'Un plato reconfortante, lleno de especias cálidas y muy fácil de preparar. Ideal para entrar en calor.',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&fit=crop',
        time: '25 min',
        difficulty: 'Fácil',
        category: 'Cenas',
        tags: ['Vegano', 'Bajo en calorías', 'Menos de 30 min', 'Alto en proteínas'],
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
        id: 'salmon-esparragos',
        title: 'Salmón al Horno con Costra de Hierbas',
        description: 'Una cena elegante, ligera y lista en menos de media hora.',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&fit=crop',
        time: '20 min',
        difficulty: 'Fácil',
        category: 'Cenas',
        tags: ['Keto', 'Bajo en calorías', 'Alto en proteínas', 'Menos de 30 min'],
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
        category: 'Almuerzos',
        tags: ['Japonesa', 'Saludable', 'Pescado'],
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
        category: 'Cenas',
        tags: ['Japonesa', 'Tradicional', 'Sopa'],
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
        category: 'Almuerzos',
        tags: ['Española', 'Tradicional', 'Arroz'],
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
        category: 'Cenas',
        tags: ['Mexicana', 'Tradicional', 'Picante'],
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
        category: 'Almuerzos',
        tags: ['Griega', 'Tradicional', 'Horno'],
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
        category: 'Desayunos',
        tags: ['Venezolana', 'Sin Gluten', 'Aguacate'],
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
        category: 'Almuerzos',
        tags: ['China', 'Al vapor', 'Tradicional'],
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
        category: 'Almuerzos',
        tags: ['Peruana', 'Fresca', 'Pescado'],
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
    }
];

// Generador de recetas dinámicas para completar las 500
const cultures = ['Mexicana', 'Japonesa', 'Italiana', 'Española', 'India', 'Tailandesa', 'Francesa', 'Griega', 'Marroquí', 'China', 'Peruana', 'Venezolana', 'Americana', 'Libanesa', 'Etíope', 'Turca', 'Coreana', 'Vietnamita'];
const categories = ['Desayunos', 'Almuerzos', 'Cenas', 'Snacks', 'Postres'];
const difficulties = ['Fácil', 'Media', 'Difícil'];

const ingredientsPool = {
    'Proteínas': ['Pollo', 'Ternera', 'Cerdo', 'Salmón', 'Tofu', 'Garbanzos', 'Lentejas', 'Gambas', 'Huevos'],
    'Base': ['Arroz', 'Pasta', 'Quinoa', 'Cuscús', 'Patatas', 'Pan', 'Tortillas', 'Harina'],
    'Vegetales': ['Cebolla', 'Ajo', 'Tomate', 'Espárragos', 'Pimientos', 'Brócoli', 'Espinacas', 'Aguacate'],
    'Sabor': ['Aceite de oliva', 'Limón', 'Salsa de soja', 'Curry', 'Cilantro', 'Albahaca', 'Queso', 'Miel']
};

for (let i = 1; i <= 488; i++) {
    const culture = cultures[i % cultures.length];
    const category = categories[i % categories.length];
    const id = `recipe-${i}`;
    const prot = ingredientsPool['Proteínas'][i % ingredientsPool['Proteínas'].length];
    const base = ingredientsPool['Base'][i % ingredientsPool['Base'].length];
    
    mockRecipes.push({
        id: id,
        title: `${prot} con ${base} al estilo ${culture}`,
        description: `Una deliciosa combinación de ${prot.toLowerCase()} preparada siguiendo las tradiciones de la cocina ${culture.toLowerCase()}.`,
        image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=600&fit=crop&q=60`,
        time: `${15 + (i % 45)} min`,
        difficulty: difficulties[i % difficulties.length],
        category: category,
        tags: [culture, category, 'Diversidad'],
        chefTip: 'Asegúrate de que los ingredientes estén a temperatura ambiente antes de empezar.',
        allergens: ['Sin frutos secos'],
        ingredients: [
            `200g de ${prot}`,
            `150g de ${base}`,
            'Especias seleccionadas',
            'Aceite y sal'
        ],
        adaptation: {
            title: 'Opción Vegetariana',
            text: 'Simplemente cambia la proteína animal por tofu o legumbres.'
        },
        steps: [
            { text: `Prepara el ${base.toLowerCase()} según las instrucciones del paquete.`, image: null },
            { text: `Cocina el ${prot.toLowerCase()} en una sartén con especias.`, image: null },
            { text: 'Junta todos los elementos y sirve caliente.', image: null }
        ],
        finalResult: 'Un plato equilibrado y lleno de matices culturales.',
        seoSchema: { "@context": "https://schema.org/", "@type": "Recipe", "name": `Receta Diversa ${i}` }
    });
}
