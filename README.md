# Golden Harvest Mills

Marketing site for Golden Harvest Mills, a Sri Lankan bulk wheat flour miller.

**Stack:** Laravel 13, Inertia.js 3, Vue 3, Tailwind CSS 4, GSAP (ScrollTrigger), Lenis smooth scroll and Three.js.

## Getting started

```sh
composer install
npm install
cp .env.example .env   # first run only
php artisan key:generate
composer run dev       # Laravel server + Vite
```

The site runs at http://localhost:8000.

Run the tests with `php artisan test`.

## Where things live

| Path | What it is |
| --- | --- |
| `config/site.php` | Company name, address, phone and email (shared to every page as the `site` prop) |
| `resources/js/Pages/Home.vue` | The homepage, composed from section components |
| `resources/js/Components/Home/` | Homepage sections (hero, welcome, mill, community, products, quality) |
| `resources/js/three/grainField.js` | The Three.js floating wheat-kernel scene in the hero (lazy-loaded) |
| `resources/js/lib/motion.js` | GSAP and Lenis setup, plus scroll helpers |
| `resources/js/lib/images.js` | Placeholder photo ids (Unsplash). Swap these for real assets |
| `resources/css/app.css` | Light and dark theme tokens and base styles |

Motion is skipped when the visitor has "reduce motion" turned on.
