class NavigationComponent {
    get allLinks() { return $$(byTestId('navlink-', { partial: true })); }
    get heroesLink() { return $(byTestId('navlink-heroes')); }

    async goToHeroesPage() {
        browser.waitUntil
        await this.heroesLink.click();
    }
}

export const navigationComponent = new NavigationComponent();