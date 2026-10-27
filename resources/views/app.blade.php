<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Golden Harvest Mills supplies bulk wheat flour to bakeries, manufacturers and wholesalers across Sri Lanka.">
        <meta name="theme-color" content="#FBFAF7" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#15110C" media="(prefers-color-scheme: dark)">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">

        {{-- Apply the saved or system theme before first paint to avoid a flash. --}}
        <script>
            (function () {
                try {
                    var saved = localStorage.getItem('theme');
                    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', dark);
                } catch (e) {}
            })();
        </script>

        <title inertia>{{ config('app.name', 'Golden Harvest Mills') }}</title>

        @fonts
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
