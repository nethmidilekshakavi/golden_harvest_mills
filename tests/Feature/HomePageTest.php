<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    public function test_home_page_renders_the_inertia_home_component(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('site.name', config('site.name'))
                ->has('site.contact.address')
                ->where('site.contact.email', config('site.contact.email'))
            );
    }
}
