/**
 * auto-translator.js
 * Traduce automáticamente todos los textos visibles de la página
 * llamando DIRECTAMENTE a Google Cloud Translation API v2.
 * No requiere backend.
 */

const ITERA_TRANSLATION_API_KEY = 'AIzaSyCxn5YeVAEKAx4Qt6mg1WX1edbiqfHPPHc';
const ITERA_GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

// Tags que nunca se deben traducir
const ITERA_SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'IMG',
    'INPUT', 'TEXTAREA', 'SELECT', 'META', 'LINK', 'CODE', 'PRE'
]);

// Clases que indican un ícono (no texto real)
const ITERA_SKIP_CLASSES = ['material-symbols-outlined', 'material-icons'];

// IDs de elementos del sistema de idioma (no traducir)
const ITERA_SKIP_IDS = ['lang-dropdown', 'current-lang-display'];

// Strings exactos que nunca se deben traducir
const ITERA_NEVER_TRANSLATE = new Set(['Itera', 'ITERA', 'MVP', 'Google', 'ES', 'EN', 'PT', 'FR', 'DE', 'ZH', 'JA']);

/**
 * Determina si un nodo de texto debe ser ignorado
 */
function shouldSkipNode(textNode) {
    let el = textNode.parentElement;
    while (el && el !== document.body) {
        if (ITERA_SKIP_TAGS.has(el.tagName)) return true;
        if (ITERA_SKIP_CLASSES.some(c => el.classList && el.classList.contains(c))) return true;
        if (ITERA_SKIP_IDS.some(id => el.id === id)) return true;
        // Saltar contenido generado por JS con template strings (datos de la API)
        if (el.hasAttribute('data-no-translate')) return true;
        el = el.parentElement;
    }
    return false;
}

/**
 * Recolecta todos los nodos de texto puros del DOM
 */
function collectTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                const text = node.textContent.trim();
                if (!text || text.length < 2) return NodeFilter.FILTER_SKIP;
                if (/^\d+[\d\s\.,:%]*$/.test(text)) return NodeFilter.FILTER_SKIP; // solo números
                if (ITERA_NEVER_TRANSLATE.has(text)) return NodeFilter.FILTER_SKIP;
                if (shouldSkipNode(node)) return NodeFilter.FILTER_SKIP;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    let node;
    while ((node = walker.nextNode())) {
        nodes.push(node);
    }
    return nodes;
}

/**
 * Llama directamente a Google Cloud Translation API
 */
async function callGoogleTranslate(texts, targetLang) {
    const response = await fetch(
        `${ITERA_GOOGLE_TRANSLATE_URL}?key=${ITERA_TRANSLATION_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                q: texts,
                target: targetLang.toLowerCase(),
                format: 'text'
            })
        }
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Google Translate API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    if (data.data && data.data.translations) {
        return data.data.translations.map(t => t.translatedText);
    }
    return texts;
}

/**
 * Muestra una barra de progreso animada en la parte superior de la página
 */
function showLoadingBar() {
    const existing = document.getElementById('itera-lang-loader');
    if (existing) return existing;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes itera-slide {
            0%   { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }
        #itera-lang-loader {
            position: fixed; top: 0; left: 0; right: 0; height: 3px;
            z-index: 999999;
            background: linear-gradient(90deg, #0058bf, #38bdf8, #0058bf);
            background-size: 200% 100%;
            animation: itera-slide 1s linear infinite;
        }
    `;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'itera-lang-loader';
    document.body.prepend(bar);
    return bar;
}

function hideLoadingBar(bar) {
    if (!bar) return;
    bar.style.transition = 'opacity 0.4s ease';
    bar.style.opacity = '0';
    setTimeout(() => bar.remove(), 400);
}

/**
 * Función principal: traduce toda la página
 */
window.autoTranslatePage = async function(targetLang) {
    if (!targetLang) return;
    const lang = targetLang.toLowerCase();
    // Español es el idioma base del HTML. Si se pide ES, recargar para restaurar el DOM original.
    if (lang === 'es') {
        window.location.reload();
        return;
    }

    const bar = showLoadingBar();

    try {
        const textNodes = collectTextNodes(document.body);
        
        // Colectar también elementos con placeholders que tengan texto sustancial
        const placeholderEls = Array.from(document.querySelectorAll('input[placeholder], textarea[placeholder]'))
            .filter(el => {
                const text = el.placeholder.trim();
                if (!text || text.length < 2) return false;
                if (/^\d+[\d\s\.,:%]*$/.test(text)) return false;
                if (ITERA_NEVER_TRANSLATE.has(text)) return false;
                // Para el placeholder permitimos el tag INPUT/TEXTAREA aunque esté en ITERA_SKIP_TAGS
                return true; 
            });

        const allToTranslate = [...textNodes, ...placeholderEls];

        if (allToTranslate.length === 0) {
            console.warn('[auto-translator] No se encontraron textos para traducir.');
            return;
        }

        console.log(`[auto-translator] Traduciendo ${textNodes.length} textos y ${placeholderEls.length} placeholders al idioma: ${lang}`);

        const BATCH_SIZE = 100; // Google permite hasta 128 en un request
        for (let i = 0; i < allToTranslate.length; i += BATCH_SIZE) {
            const batch = allToTranslate.slice(i, i + BATCH_SIZE);
            const batchTexts = batch.map(item => {
                if (item.nodeType === Node.TEXT_NODE) return item.textContent.trim();
                return item.placeholder.trim();
            });

            const translated = await callGoogleTranslate(batchTexts, lang);

            batch.forEach((item, idx) => {
                const translatedText = translated[idx];
                if (translatedText && translatedText !== batchTexts[idx]) {
                    if (item.nodeType === Node.TEXT_NODE) {
                        // Preservar espacios al inicio y fin del nodo original
                        const leadingSpace = item.textContent.match(/^\s*/)[0];
                        const trailingSpace = item.textContent.match(/\s*$/)[0];
                        item.textContent = leadingSpace + translatedText + trailingSpace;
                    } else {
                        // Es un elemento con placeholder
                        item.placeholder = translatedText;
                    }
                }
            });
        }

        console.log(`[auto-translator] Traducción completada.`);
    } catch (err) {
        console.error('[auto-translator] Error al traducir:', err);
    } finally {
        hideLoadingBar(bar);
    }
};

/**
 * Se ejecuta automáticamente al cargar la página
 * si el idioma guardado no es español
 */
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('itera_lang') || 'es';

    // Actualizar el indicador de idioma y bandera en el header
    const display = document.getElementById('current-lang-display');
    const flagImg = document.getElementById('current-lang-flag');
    
    if (display) display.textContent = savedLang.toUpperCase();
    if (flagImg) {
        const codeMap = {
            'en': 'us',
            'pt': 'br',
            'zh': 'cn',
            'ja': 'jp'
        };
        const flagCode = codeMap[savedLang.toLowerCase()] || savedLang.toLowerCase();
        flagImg.src = `https://flagcdn.com/w20/${flagCode}.png`;
    }

    if (savedLang.toLowerCase() !== 'es') {
        // Esperamos 1 segundo para que el JS dinámico termine de renderizar el contenido
        setTimeout(function() {
            window.autoTranslatePage(savedLang);
        }, 1000);
    }
});
