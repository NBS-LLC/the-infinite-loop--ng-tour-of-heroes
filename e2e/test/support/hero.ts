export class Hero {
    static readonly TEST_TARGET: Hero = { id: 15, name: 'Magneta' };
    static readonly TEST_RENAME: Hero = { id: 15, name: 'MagnetaX' };

    constructor(public id: number, public name: string) { }

    /**
     * Create a Hero from a list <li> element.
     * @param li The list HTML element.
     */
    static async fromLi(li: WebdriverIO.Element): Promise<Hero> {
        return await this.fromHeroElem(li);
    }

    /**
     * Create a Hero from a "detail" page element.
     * @param detail The "detail" page element.
     */
    static async fromDetail(detail: WebdriverIO.Element): Promise<Hero> {
        return await this.fromHeroElem(detail);
    }

    /**
     * Create a Hero from a "hero" page element.
     * @param elem An HTML element that contains "id" and "name" data-testid attributes.
     */
    private static async fromHeroElem(elem: WebdriverIO.Element): Promise<Hero> {
        // const id = await elem.testId$('id').getText();
        // const name = await elem.testId$('name').getText();
        const id = await elem.$('testid=id').getText();
        const name = await elem.$('testid=name').getText();
        return { id: +id, name: name };
    }
}
