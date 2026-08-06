const SUPPORTED_RICH_TEXT_TAGS = new Set([
  'b',
  'blockquote',
  'br',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'strong',
  'u',
  'ul'
]);

const UNSAFE_RICH_TEXT_TAGS = new Set([
  'applet',
  'audio',
  'base',
  'button',
  'canvas',
  'embed',
  'form',
  'frame',
  'frameset',
  'iframe',
  'img',
  'input',
  'link',
  'math',
  'meta',
  'noscript',
  'object',
  'option',
  'portal',
  'script',
  'select',
  'source',
  'style',
  'svg',
  'template',
  'textarea',
  'track',
  'video'
]);

const UNSAFE_RICH_TEXT_URL_ATTRIBUTES = new Set([
  'action',
  'cite',
  'data',
  'formaction',
  'href',
  'poster',
  'src',
  'xlink:href'
]);

const UNSAFE_RICH_TEXT_URL_PATTERN = /^(?:data|javascript|vbscript):/i;

export function containsUnsafeRichTextMarkup(value: string): boolean {
  const documentElement = new DOMParser().parseFromString(value || '', 'text/html');
  const elements = Array.prototype.slice.call(documentElement.querySelectorAll('*')) as HTMLElement[];

  return elements.some((element) => {
    if (UNSAFE_RICH_TEXT_TAGS.has(element.tagName.toLowerCase())) {
      return true;
    }

    return Array.prototype.slice.call(element.attributes).some((attribute: Attr) => {
      const attributeName = attribute.name.toLowerCase();
      if (attributeName.startsWith('on') || attributeName === 'srcdoc' || attributeName === 'style') {
        return true;
      }

      if (!UNSAFE_RICH_TEXT_URL_ATTRIBUTES.has(attributeName)) {
        return false;
      }

      const compactValue = attribute.value.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
      return UNSAFE_RICH_TEXT_URL_PATTERN.test(compactValue);
    });
  });
}

export function removeUnsafeRichTextElements(documentElement: Document): void {
  const elements = Array.prototype.slice.call(documentElement.body.querySelectorAll('*')) as HTMLElement[];

  elements.forEach((element) => {
    if (UNSAFE_RICH_TEXT_TAGS.has(element.tagName.toLowerCase())) {
      element.remove();
    }
  });
}

export function sanitiseRichTextDocument(documentElement: Document): string {
  removeUnsafeRichTextElements(documentElement);

  const elements = Array.prototype.slice.call(documentElement.body.querySelectorAll('*')) as HTMLElement[];
  elements.forEach((element) => {
    if (!element.parentNode) {
      return;
    }

    const tagName = element.tagName.toLowerCase();
    if (!SUPPORTED_RICH_TEXT_TAGS.has(tagName)) {
      while (element.firstChild) {
        element.parentNode.insertBefore(element.firstChild, element);
      }
      element.remove();
      return;
    }

    const dataIndent = /^[1-6]$/.test(element.dataset.indent || '') ? element.dataset.indent : null;
    const align = /^(left|center|right|justify)$/.test(element.getAttribute('align') || '')
      ? element.getAttribute('align')
      : null;
    const listStart = tagName === 'ol' && /^\d{1,6}$/.test(element.getAttribute('start') || '')
      ? element.getAttribute('start')
      : null;

    while (element.attributes.length > 0) {
      element.removeAttribute(element.attributes[0].name);
    }

    if (dataIndent) {
      element.dataset.indent = dataIndent;
    }
    if (align) {
      element.setAttribute('align', align);
    }
    if (listStart) {
      element.setAttribute('start', listStart);
    }
  });

  return documentElement.body.innerHTML;
}

export function sanitiseRichTextHtml(value: string): string {
  const documentElement = new DOMParser().parseFromString(value || '', 'text/html');
  return sanitiseRichTextDocument(documentElement);
}
