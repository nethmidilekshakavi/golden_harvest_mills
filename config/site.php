<?php

/*
|--------------------------------------------------------------------------
| Public Site Details
|--------------------------------------------------------------------------
|
| Company details shown across the public website. Shared with every
| Inertia page as the `site` prop, so update them here only.
|
*/

return [

    'name' => env('SITE_NAME', 'Golden Harvest Mills'),

    'tagline' => 'Quality you can trust',

    'contact' => [
        'address' => [
            '38/1/1 Right Wing, Second Floor',
            'Negombo Road, Wattala',
            'Sri Lanka',
        ],
        'phone' => env('SITE_PHONE', '+94 77 784 0777'),
        'email' => env('SITE_EMAIL', 'info@ghf.lk'),
    ],

];
