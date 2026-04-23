import './style.css';
import { injectCSS, applyLetterpressGlobal, type LetterpressConfig } from '../src/letterpress';

const SAMPLE_DISPLAY = 'THE QUICK BROWN FOX';
const SAMPLE_HEADING = 'Letterpress for the web';
const SAMPLE_BODY = 'Each character is slightly rotated, displaced, and varied in opacity — mimicking the imperfection of physical type blocks pressed into paper.';
const SAMPLE_SMALL = 'ACME PUBLISHING CO. · EST. 1923';

let config: Required<LetterpressConfig> = {
  variations: 100,
  rotationRange: 1,
  translateRange: 0.35,
  opacityMin: 0.80,
  opacityMax: 1.0,
  wordMargin: 0.2,
  headingWordMargin: 0.4,
  seed: 0,
};

function apply() {
  injectCSS(config);
  // Reset all data-lp before re-applying
  document.querySelectorAll('[data-lp]').forEach(el => {
    delete (el as HTMLElement).dataset.lp;
  });
  applyLetterpressGlobal();
}

function render() {
  const app = document.getElementById('app')!;

  app.innerHTML = `
    <div class="header">
      <span class="header__title">LETTERPRESS</span>
      <span class="header__subtitle">letterpress printing effect for the web</span>
    </div>
    <div class="workspace">
      <div class="preview">
        <div class="preview__block">
          <p class="preview__label">Display</p>
          <h1 class="preview__display">${SAMPLE_DISPLAY}</h1>
        </div>
        <div class="preview__block">
          <p class="preview__label">Heading</p>
          <h2 class="preview__heading">${SAMPLE_HEADING}</h2>
        </div>
        <div class="preview__block">
          <p class="preview__label">Body</p>
          <p class="preview__body">${SAMPLE_BODY}</p>
        </div>
        <div class="preview__block">
          <p class="preview__label">Label / UI</p>
          <p class="preview__small">${SAMPLE_SMALL}</p>
        </div>
      </div>
      <aside class="panel" id="panel"></aside>
    </div>
  `;

  buildPanel();
  apply();
}

function buildPanel() {
  const panel = document.getElementById('panel')!;

  panel.innerHTML = `
    <div>
      <p class="panel__section-label">Parameters</p>

      ${slider('rotationRange', 'Rotation range', 0, 3, 0.1, '±${v}°')}
      ${slider('translateRange', 'Translate range', 0, 2, 0.05, '±${v}px')}
      ${slider('opacityMin', 'Opacity min', 0.5, 1, 0.01, '${v}')}
      ${slider('opacityMax', 'Opacity max', 0.5, 1, 0.01, '${v}')}
      ${slider('wordMargin', 'Word margin', 0, 0.6, 0.01, '${v}em')}
      ${slider('headingWordMargin', 'Heading word margin', 0, 0.8, 0.01, '${v}em')}
      ${slider('variations', 'Variations', 10, 200, 1, '${v}')}
    </div>

    <div class="panel__divider"></div>

    <div>
      <p class="panel__section-label">Seed</p>
      <div class="panel__field">
        <label class="panel__field-label">
          <span>Value</span>
          <span class="panel__field-value" id="val-seed">${config.seed === 0 ? 'random' : config.seed}</span>
        </label>
        <input class="panel__range" type="range" id="ctrl-seed" min="0" max="999" step="1" value="${config.seed}" />
      </div>
      <button class="panel__button" id="btn-regenerate">REGENERATE</button>
    </div>

    <div class="panel__divider"></div>

    <div class="panel__copy-area">
      <p class="panel__section-label">Config</p>
      <pre class="panel__code" id="config-output"></pre>
      <button class="panel__button" id="btn-copy">COPY CONFIG</button>
    </div>
  `;

  attachListeners();
  updateConfigOutput();
}

function slider(key: keyof typeof config, label: string, min: number, max: number, step: number, fmt: string): string {
  const v = config[key];
  const display = fmt.replace('${v}', String(v));
  return `
    <div class="panel__field">
      <label class="panel__field-label" for="ctrl-${key}">
        <span>${label}</span>
        <span class="panel__field-value" id="val-${key}">${display}</span>
      </label>
      <input class="panel__range" type="range" id="ctrl-${key}"
        min="${min}" max="${max}" step="${step}" value="${v}" />
    </div>
  `;
}

function attachListeners() {
  const keys: (keyof typeof config)[] = [
    'rotationRange', 'translateRange', 'opacityMin', 'opacityMax',
    'wordMargin', 'headingWordMargin', 'variations', 'seed',
  ];

  const fmts: Record<string, string> = {
    rotationRange: '±${v}°',
    translateRange: '±${v}px',
    opacityMin: '${v}',
    opacityMax: '${v}',
    wordMargin: '${v}em',
    headingWordMargin: '${v}em',
    variations: '${v}',
    seed: '${v}',
  };

  keys.forEach(key => {
    const input = document.getElementById(`ctrl-${key}`) as HTMLInputElement;
    const valueEl = document.getElementById(`val-${key}`)!;
    if (!input) return;

    input.addEventListener('input', () => {
      const raw = parseFloat(input.value);
      (config as Record<string, number>)[key] = key === 'variations' ? Math.round(raw) : raw;

      const display = key === 'seed' && raw === 0
        ? 'random'
        : fmts[key].replace('${v}', String(raw));
      valueEl.textContent = display;

      apply();
      updateConfigOutput();
    });
  });

  document.getElementById('btn-regenerate')?.addEventListener('click', () => {
    config.seed = 0;
    const seedInput = document.getElementById('ctrl-seed') as HTMLInputElement;
    const seedVal = document.getElementById('val-seed')!;
    if (seedInput) seedInput.value = '0';
    if (seedVal) seedVal.textContent = 'random';
    apply();
    updateConfigOutput();
  });

  document.getElementById('btn-copy')?.addEventListener('click', () => {
    const output = document.getElementById('config-output')!.textContent || '';
    navigator.clipboard.writeText(output).catch(() => {});
    const btn = document.getElementById('btn-copy')!;
    btn.textContent = 'COPIED';
    setTimeout(() => { btn.textContent = 'COPY CONFIG'; }, 1500);
  });
}

function updateConfigOutput() {
  const el = document.getElementById('config-output');
  if (!el) return;
  const { seed, ...rest } = config;
  const display = seed !== 0 ? config : rest;
  el.textContent = JSON.stringify(display, null, 2);
}

render();
