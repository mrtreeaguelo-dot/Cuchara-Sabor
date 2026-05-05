# 🤖 Protocolos y Comandos del Agente

Este documento registra los comandos personalizados (atajos) diseñados para agilizar el flujo de trabajo en este proyecto. Cualquier desarrollador o usuario puede escribir estos comandos en el chat para disparar automáticamente rutinas de asistencia específicas.

---

## 🛠️ Lista de Comandos

### 1. `/solvE` (Reparación de Carga y Despliegue)
**Uso:** Cuando la aplicación no carga (pantalla en blanco), se queda en un bucle infinito o hay problemas con la caché en producción (GitHub Pages).
**Acción del agente:** 
- Ejecuta el protocolo de emergencia de limpieza de Service Workers.
- Verifica bloqueos por CORS o CSP.
- Comprueba que el script de inicialización (`app.js`) esté a prueba de fallos.
*(Para más detalles técnicos, ver `web/SOLVE.md`)*.

### 2. `/mejora` (Optimización y UI/UX)
**Uso:** Cuando se busca hacer que un componente se vea más profesional, rápido o atractivo.
**Acción del agente:**
- Refactoriza el código de la interfaz para aplicar estilos "Premium" (sombras, animaciones suaves, *glassmorphism*).
- Optimiza pequeños fragmentos de código para mejorar el rendimiento sin romper la lógica.
- Añade micro-interacciones (hover states, transiciones).

### 3. `/upgradE` (Actualización y Refactorización Profunda)
**Uso:** Para escalar la aplicación, actualizar tecnologías o implementar patrones de diseño avanzados.
**Acción del agente:**
- Analiza la arquitectura actual y sugiere/aplica cambios mayores.
- Transforma código legacy (ej. de Vanilla JS a módulos modernos o web components).
- Integra funcionalidades complejas como PWA completas, bases de datos locales (IndexedDB) o llamadas a APIs complejas.

### 4. `/reviE` (Revisión y Auditoría)
**Uso:** Antes de hacer un commit o desplegar cambios importantes.
**Acción del agente:**
- Realiza una revisión estática (Code Review) sin modificar el código.
- Busca posibles bugs, vulnerabilidades de seguridad o malas prácticas.
- Verifica que el código cumpla con los estándares de accesibilidad y SEO.
- Entrega un informe detallado con sugerencias de cambio.

### 5. `/Error` (Depuración Inmediata)
**Uso:** Cuando aparece un error inesperado en la consola o durante la ejecución.
**Acción del agente:**
- Pide y analiza el *stacktrace* (rastro del error).
- Localiza la línea exacta o función que causa el conflicto.
- Explica el porqué del error de forma sencilla y aplica el parche necesario inmediatamente.

---

> **💡 Nota para usuarios futuros:** Para usar cualquiera de estos comandos, simplemente escríbelo como primer texto en el mensaje dirigido a la IA (por ejemplo: `"/mejora el diseño de la tarjeta de recetas"`). El agente adoptará inmediatamente el rol correspondiente.
