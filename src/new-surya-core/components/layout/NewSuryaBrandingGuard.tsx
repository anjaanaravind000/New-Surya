import { useLayoutEffect, type ReactNode } from 'react';
import { replaceVisibleBranding, sanitizeExportFilename } from '@/lib/visibleBranding';

/**
 * Keeps compatibility identifiers and database values unchanged while ensuring
 * every user-facing surface uses New Surya terminology. This covers React
 * content, portal content, native dialogs, print windows and downloaded files.
 */
export default function NewSuryaBrandingGuard({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const rewrite = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const current = node.textContent ?? '';
        const next = replaceVisibleBranding(current);
        if (next !== current) node.textContent = next;
        return;
      }

      if (!(node instanceof HTMLElement)) return;
      if (node.matches('script, style, code, pre')) return;

      for (const attribute of ['aria-label', 'title', 'placeholder', 'alt', 'content']) {
        const current = node.getAttribute(attribute);
        if (!current) continue;
        const next = replaceVisibleBranding(current);
        if (next !== current) node.setAttribute(attribute, next);
      }

      node.childNodes.forEach(rewrite);
    };

    rewrite(document.documentElement);

    const originalWindowOpen = window.open.bind(window);
    const originalAlert = window.alert.bind(window);
    const originalConfirm = window.confirm.bind(window);
    const originalPrompt = window.prompt.bind(window);
    const originalAnchorClick = HTMLAnchorElement.prototype.click;

    window.open = ((...args: Parameters<typeof window.open>) => {
      const opened = originalWindowOpen(...args);
      if (opened) {
        const originalWrite = opened.document.write.bind(opened.document);
        opened.document.write = (...chunks: string[]) => originalWrite(...chunks.map(replaceVisibleBranding));
      }
      return opened;
    }) as typeof window.open;

    window.alert = (message?: unknown) => originalAlert(replaceVisibleBranding(String(message ?? '')));
    window.confirm = (message?: string) => originalConfirm(replaceVisibleBranding(message ?? ''));
    window.prompt = (message?: string, defaultValue?: string) => originalPrompt(replaceVisibleBranding(message ?? ''), defaultValue);

    HTMLAnchorElement.prototype.click = function newSuryaDownloadClick() {
      if (this.download) this.download = sanitizeExportFilename(this.download);
      return originalAnchorClick.call(this);
    };

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(rewrite);
        if (record.type === 'characterData') rewrite(record.target);
        if (record.type === 'attributes') rewrite(record.target);
      });
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title', 'placeholder', 'alt', 'content'],
    });

    return () => {
      observer.disconnect();
      window.open = originalWindowOpen;
      window.alert = originalAlert;
      window.confirm = originalConfirm;
      window.prompt = originalPrompt;
      HTMLAnchorElement.prototype.click = originalAnchorClick;
    };
  }, []);

  return <>{children}</>;
}
