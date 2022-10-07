export class Hero {
    static readonly TEST_TARGET: Hero = { id: 15, name: 'Magneta' };
    static readonly TEST_RENAME: Hero = { id: 15, name: 'MagnetaX' };

    constructor(public id: number, public name: string) { }

    /**
     * Create a Hero from a list <li> element.
     * @param li The list HTML element.
     */
    static async fromLi(li: WebdriverIO.Element): Promise<Hero> {
        return this.fromHeroElem(li);
    }

    /**
     * Create a Hero from a "detail" page element.
     * @param detail The "detail" page element.
     */
    static async fromDetail(detail: WebdriverIO.Element): Promise<Hero> {
        return this.fromHeroElem(detail);
    }

    /**
     * Create a Hero from a "hero" page element.
     * @param elem An HTML element that contains "id" and "name" data-testid attributes.
     * @returns 
     */
    private static async fromHeroElem(elem: WebdriverIO.Element) {
        const id = await elem.$('[data-testid="id"]').getText();
        const name = await elem.$('[data-testid="name"]').getText();
        return { id: +id, name: name };
    }
}
