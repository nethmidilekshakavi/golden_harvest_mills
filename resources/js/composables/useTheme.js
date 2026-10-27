import { ref } from 'vue';
import { prefersReducedMotion } from '@/lib/motion';

// Initial value comes from the inline script in app.blade.php.
const isDark = ref(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

function apply(dark) {
    isDark.value = dark;
    document.documentElement.classList.toggle('dark', dark);
    try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch (e) {
        // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
}

export function useTheme() {
    /**
     * Toggle the theme. Where the View Transitions API exists, the new theme
     * expands as a circle from the button that was pressed.
     */
    function toggle(event) {
        const next = !isDark.value;

        if (!document.startViewTransition || prefersReducedMotion()) {
            apply(next);
            return;
        }

        const rect = event?.currentTarget?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top + rect.height / 2 : 0;
        const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const transition = document.startViewTransition(() => apply(next));
        transition.ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
            );
        });
    }

    return { isDark, toggle };
}
