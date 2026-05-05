# 🛠️ Protocolo /SOLVE: Reparación de Carga y Despliegue

Este documento contiene el protocolo de actuación definitivo para solucionar el error de "pantalla en blanco" o "carga infinita" en **Cuchara & Sabor**, tanto en local como en GitHub Pages.

## 🚨 El Error: Pantalla en Blanco / Atascada
**Causa:** Generalmente un error de sintaxis en el motor de renderizado (`app.js`), una política de seguridad restrictiva (CSP) o un Service Worker (`sw.js`) cacheando código antiguo roto.

---

## 🛠️ Procedimiento de Reparación (Skill /SOLVE)

### 1. Limpieza de Caché del Service Worker
Si el código está arreglado pero el usuario sigue viendo el error, es culpa del caché.
- **Acción:** Incrementar la versión de `CACHE_NAME` en `sw.js` (ej: `v3` -> `v4`).
- **Estrategia:** Cambiar a `Network-First` para asegurar que el navegador siempre intente bajar el código nuevo antes de usar la memoria.

### 2. Motor de Inicialización Robusto
Evitar que el script falle si se carga antes que el HTML.
- **Implementación en `app.js`:**
  ```javascript
  function initApp() {
      if (window.appInstance) return;
      try {
          window.appInstance = new App();
      } catch (e) {
          showVisualError(e);
      }
  }
  // Triple comprobación de carga
  if (document.readyState === 'complete') initApp();
  else document.addEventListener('DOMContentLoaded', initApp);
  window.addEventListener('load', initApp);
  ```

### 3. Bypass de CSP para Despliegue
GitHub Pages puede bloquear recursos externos si el meta-tag CSP es muy estricto.
- **Solución:** Durante la depuración, relajar el CSP en `index.html`:
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;">
  ```

### 4. Sistema de Alerta Visual (Fail-Safe)
Si el JavaScript falla, el usuario debe saberlo en lugar de ver una pantalla blanca.
- **Inyectar en `index.html`:**
  ```javascript
  window.onerror = function(msg, url, line) {
      // Mostrar banner rojo con el error
  };
  ```

### 5. Validación de Sintaxis Async/Await
Revisar siempre que cualquier `await` esté dentro de una función marcada como `async`. Un solo `await` mal puesto mata toda la aplicación al ser un módulo ES.

---

## 🖥️ Cómo probar localmente sin fallos
1. **NO abrir el archivo directamente** (Doble clic en `index.html` NO funciona por seguridad de módulos).
2. **Usar el servidor local:** Ejecutar el script `serve.ps1` en PowerShell.
3. **Acceder vía URL:** Entrar a `http://localhost:8765`.

---

> [!TIP]
> **Comando de Emergencia:** Si después de aplicar estos pasos sigue fallando, borra el registro de Service Workers en la pestaña "Application" de las herramientas de desarrollador y haz un Hard Reload (`Ctrl + F5`).
