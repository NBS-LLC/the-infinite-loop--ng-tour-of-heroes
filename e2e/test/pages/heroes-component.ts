class HeroesComponent {
    get element() { return $('app-root app-heroes'); }
    get allHeroes() { return this.element.$$(byTestId('heroes-item-', { partial: true })); }
}

export const heroesComponent = new HeroesComponent();