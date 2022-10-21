class HeroSearchComponent {
    get element() { return $(byTestId('hero-search')); }
    get query() { return this.element.$(byTestId('query')); }
    get results() { return this.element.$$(byTestId('result-item')); }
}

export const heroSearchComponent = new HeroSearchComponent();