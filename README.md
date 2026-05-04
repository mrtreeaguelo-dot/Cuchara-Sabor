[README.md](https://github.com/user-attachments/files/27351460/README.md)
# 🥄 Cuchara & Sabor - Premium Recipe Assistant

![Cuchara & Sabor Banner](https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop)

**Cuchara & Sabor** es una plataforma web de recetas de alta gama diseñada para transformar la experiencia culinaria diaria. Con un enfoque en la diversidad cultural, la nutrición inteligente y la interactividad avanzada.

## 🚀 Características Principales

- **🌎 Catálogo Global**: Cerca de 500 recetas que abarcan culturas desde México hasta Japón, Etiopía y más.
- **🔄 Smart Substitution (Swap)**: *Próximamente* - Sistema de intercambio de ingredientes para sugerencias saludables.
- **⚖️ Escalado Dinámico**: Ajuste automático de ingredientes y macros según el número de porciones (1-12 personas).
- **🔋 PWA Ready**: Instalable en dispositivos móviles para uso offline y rendimiento nativo.
- **🎙️ Búsqueda por Voz**: Encuentra recetas sin usar las manos con tecnología Web Speech API.
- **📊 Nutri-Score Dinámico**: Cálculo en tiempo real de la calidad nutricional de cada plato.
- **🌓 Diseño Premium**: Interfaz moderna con efectos *Glassmorphism*, animaciones fluidas y modo oscuro optimizado.

## ⚠️ Limitaciones Conocidas

- **Autenticación Local**: El sistema de usuarios utiliza `localStorage`. Los datos son específicos del navegador y dispositivo actual; no es apto para entornos de producción con datos sensibles sin un backend real.
- **Persistencia**: Si borras los datos del sitio en tu navegador, se perderán las recetas favoritas, la despensa y las reseñas publicadas.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5 Semántico, CSS3 (Variables, Grid, Flexbox), Vanilla JavaScript (ES6+).
- **Audio**: Web Audio API para temporizadores sin dependencias externas.
- **PWA**: Service Workers y Web App Manifest.

## 📦 Instalación y Despliegue

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/cuchara-sabor.git
   ```
2. Abre `index.html` en tu navegador o usa un servidor local (Live Server).

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---
Desarrollado con ❤️ para amantes de la cocina saludable.
