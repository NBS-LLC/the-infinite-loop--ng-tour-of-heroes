class HeroDetailComponent {
    get element() { return $('app-root app-hero-detail'); }
    get details() { return this.element.$(byTestId('hero-details')); }
}

export const heroDetailComponent = new HeroDetailComponent();