class NavigationComponent {
    get element() { return $('nav'); }
    get allLinks() { return $$(byTestId('nav-link-', { partial: true })); }
    get heroesLink() { return $(byTestId('nav-link-heroes')); }

    async goToHeroesPage() {
        await this.heroesLink.click();
    }
}

export const navigationComponent = new NavigationComponent();