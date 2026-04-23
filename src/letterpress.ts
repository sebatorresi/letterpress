export interface LetterpressConfig {
  variations?: number;
  rotationRange?: number;
  translateRange?: number;
  opacityMin?: number;
  opacityMax?: number;
  wordMargin?: number;
  headingWordMargin?: number;
  seed?: number;
}

const DEFAULTS: Required<LetterpressConfig> = {
  variations: 100,
  rotationRange: 1,
  translateRange: 0.35,
  opacityMin: 0.80,
  opacityMax: 1.0,
  wordMargin: 0.2,
  headingWordMargin: 0.4,
  seed: 0,
};

function seededRandom(seed: number): () => number {
  let s = seed || Math.random() * 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateCSS(config?: LetterpressConfig): string {
  const cfg = { ...DEFAULTS, ...config };
  const rand = seededRandom(cfg.seed);

  let css = '.lp-char {\n  display: inline-block;\n}\n\n';
  css += `.lp-word {\n  display: inline-block;\n  white-space: nowrap;\n  margin-right: ${cfg.wordMargin}em;\n}\n\n`;
  css += `h1 .lp-word, h2 .lp-word, h3 .lp-word,\nh4 .lp-word, h5 .lp-word, h6 .lp-word {\n  margin-right: ${cfg.headingWordMargin}em;\n}\n\n`;

  for (let i = 1; i <= cfg.variations; i++) {
    const rotation = ((rand() - 0.5) * cfg.rotationRange * 2).toFixed(2);
    const translateY = ((rand() - 0.5) * cfg.translateRange * 2).toFixed(2);
    const opacity = (cfg.opacityMin + rand() * (cfg.opacityMax - cfg.opacityMin)).toFixed(2);

    css += `.lp-word .lp-char:nth-child(${i}) {\n`;
    css += `  transform: rotate(${rotation}deg) translateY(${translateY}px);\n`;
    css += `  opacity: ${opacity};\n`;
    css += '}\n\n';
  }

  return css;
}

let injectedStyle: HTMLStyleElement | null = null;

export function injectCSS(config?: LetterpressConfig): void {
  if (!injectedStyle) {
    injectedStyle = document.createElement('style');
    injectedStyle.id = 'letterpress-css';
    document.head.appendChild(injectedStyle);
  }
  injectedStyle.textContent = generateCSS(config);
}

export function applyLetterpress(el: HTMLElement, text: string): void {
  const wrapper = document.createElement('span');
  wrapper.className = 'lp-word';

  text.split('').forEach(char => {
    if (char === ' ') {
      wrapper.appendChild(document.createTextNode(' '));
    } else {
      const span = document.createElement('span');
      span.className = 'lp-char';
      span.textContent = char;
      wrapper.appendChild(span);
    }
  });

  el.innerHTML = '';
  el.appendChild(wrapper);
}

export function applyLetterpressHTML(el: HTMLElement): void {
  if (el.dataset.lp) return;

  function wrapText(textNode: Text): DocumentFragment {
    const fragment = document.createDocumentFragment();
    textNode.textContent!.split(/(\s+)/).forEach(word => {
      if (/^\s+$/.test(word)) {
        fragment.appendChild(document.createTextNode(word));
      } else {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'lp-word';
        word.split('').forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.className = 'lp-char';
          charSpan.textContent = char;
          wordSpan.appendChild(charSpan);
        });
        fragment.appendChild(wordSpan);
      }
    });
    return fragment;
  }

  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      node.parentNode?.replaceChild(wrapText(node as Text), node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  Array.from(el.childNodes).forEach(processNode);
  el.dataset.lp = 'true';
}

export function applyLetterpressGlobal(): void {
  const elements = document.querySelectorAll(
    'p, a, span, h1, h2, h3, h4, h5, h6, li, button'
  );

  elements.forEach(el => {
    const htmlEl = el as HTMLElement;

    if (
      el.closest('script') ||
      el.closest('style') ||
      htmlEl.dataset.lp !== undefined ||
      el.closest('[data-lp]') ||
      el.querySelector('.lp-char') ||
      htmlEl.children.length > 0
    ) return;

    htmlEl.dataset.lp = 'true';
    const words = (htmlEl.textContent || '').split(/(\s+)/);
    htmlEl.innerHTML = '';

    words.forEach(word => {
      if (/^\s+$/.test(word)) {
        htmlEl.appendChild(document.createTextNode(word));
      } else {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'lp-word';
        word.split('').forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.className = 'lp-char';
          charSpan.textContent = char;
          wordSpan.appendChild(charSpan);
        });
        htmlEl.appendChild(wordSpan);
      }
    });
  });
}

export function generateMarkup(text: string): string {
  return text.split(/(\s+)/).map(word => {
    if (/^\s+$/.test(word)) return word;
    const chars = word.split('').map(char => {
      const escaped = char
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<span class="lp-char">${escaped}</span>`;
    }).join('');
    return `<span class="lp-word">${chars}</span>`;
  }).join('');
}
