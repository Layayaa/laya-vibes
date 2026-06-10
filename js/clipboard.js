/* ===========================================
   CLIPBOARD — Copy to clipboard with feedback
   =========================================== */
class ClipboardCopy {
    constructor() {
        this.methods = document.querySelectorAll('.contact-method[data-copy]');
        this.init();
    }

    init() {
        this.methods.forEach(method => {
            method.addEventListener('click', async () => {
                const text = method.dataset.copy;
                const label = method.querySelector('.contact-method-label');
                const original = label.textContent;
                try {
                    await navigator.clipboard.writeText(text);
                    label.textContent = 'COPIED ✓';
                    label.style.color = 'var(--cyan)';
                    setTimeout(() => {
                        label.textContent = original;
                        label.style.color = '';
                    }, 1200);
                } catch {
                    label.textContent = 'FAILED';
                    label.style.color = 'var(--pink)';
                    setTimeout(() => {
                        label.textContent = original;
                        label.style.color = '';
                    }, 1200);
                }
            });
        });
    }
}
