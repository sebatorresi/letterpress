# Letterpress

Open-source letterpress printing effect for the web. Simulates the imperfection of physical metal type: characters with subtle random rotation, vertical displacement, and opacity variation — mimicking how ink and type blocks behaved in offset/letterpress printing.

## Roles

- **Seba**: Director creativo, product designer. Da todas las instrucciones de diseño.
- **Agente**: Programador senior. Ejecuta instrucciones, NO diseña, NO sugiere diseño.

## Commands

```bash
bun install       # Install dependencies
bun run dev       # Dev server (Vite)
bun run build     # Build demo
bun run generate:css  # Regenerate src/letterpress.css from current defaults
```

## Origin

Extraído del portfolio `sebatorresi/portfolio`. Los archivos originales son:
- `src/utils/printEffect.ts` → adaptado a `src/letterpress.ts`
- `src/utils/printMarkup.ts` → función `generateMarkup()` en `src/letterpress.ts`
- `src/styles/print-effect.css` → generado por `scripts/generate-css.ts`
- `scripts/generatePrintCSS.ts` → adaptado a `scripts/generate-css.ts`

En el portfolio las clases se llaman `print-char` / `print-word`. En este repo se renombraron a `lp-char` / `lp-word` para evitar colisiones.

## Structure

```
letterpress/
├── src/
│   └── letterpress.ts      # Core library (sin dependencias)
├── demo/
│   ├── main.ts             # Playground entry point
│   └── style.css           # Demo styles
├── scripts/
│   └── generate-css.ts     # Genera CSS estático con los defaults actuales
├── index.html              # Vite entry
├── package.json
└── tsconfig.json
```

## API

```ts
import {
  injectCSS,             // Inyecta <style> con las variaciones CSS
  applyLetterpress,      // Aplica efecto a un elemento con texto plano
  applyLetterpressHTML,  // Aplica efecto preservando HTML interno (links, etc.)
  applyLetterpressGlobal,// Aplica efecto a todos los elementos leaf del DOM
  generateCSS,           // Retorna el CSS como string (para SSG / build time)
  generateMarkup,        // Retorna HTML con lp-char/lp-word (para SSG / build time)
} from './src/letterpress';
```

### LetterpressConfig

```ts
interface LetterpressConfig {
  variations?: number;          // default: 100  — cantidad de nth-child rules
  rotationRange?: number;       // default: 1    — ±deg por caracter
  translateRange?: number;      // default: 0.35 — ±px vertical por caracter
  opacityMin?: number;          // default: 0.80 — opacidad mínima
  opacityMax?: number;          // default: 1.0  — opacidad máxima
  wordMargin?: number;          // default: 0.2  — em entre palabras (lp-word)
  headingWordMargin?: number;   // default: 0.4  — em entre palabras en h1-h6
  seed?: number;                // default: 0 (random) — para resultados reproducibles
}
```

### Uso básico

```html
<script type="module">
  import { injectCSS, applyLetterpressGlobal } from './src/letterpress.js';
  injectCSS();
  applyLetterpressGlobal();
</script>
```

### Uso con config custom

```ts
injectCSS({ rotationRange: 2, opacityMin: 0.7, seed: 42 });
applyLetterpressGlobal();
```

### SSG / build time (Astro, Next, etc.)

```ts
// Generar markup en build time para que el HTML inicial tenga los spans
import { generateMarkup } from './src/letterpress';
// <h1 data-lp="true" set:html={generateMarkup('My Title')} />

// Generar CSS en build time
import { generateCSS } from './src/letterpress';
const css = generateCSS({ seed: 42 }); // seed fijo = CSS reproducible en builds
```

## Demo (playground)

El demo en `demo/main.ts` tiene un panel lateral con sliders para todos los parámetros. Muestra 4 bloques tipográficos: display, heading, body, label/UI.

**Pendiente / ideas:**
- Tweakpane en lugar del panel vanilla actual (más pulido)
- Export del CSS generado como descarga
- Textarea editable para cambiar el texto de preview en vivo
- Dark/light mode toggle en el demo
- Sección "How it works" explicando el mecanismo (nth-child + transform)
- Package publicado en npm como `letterpress` o `@sebatorresi/letterpress`

## Diferencias respecto al portfolio

| Portfolio | Letterpress |
|---|---|
| `.print-char` / `.print-word` | `.lp-char` / `.lp-word` |
| `data-printed="true"` | `data-lp="true"` |
| CSS hardcodeado en `print-effect.css` | CSS generado dinámicamente vía `injectCSS()` |
| Parámetros fijos | Todos los parámetros configurables |
| Sin seed | Seed para reproducibilidad |
| Acoplado a Astro | Vanilla JS, sin dependencias |
