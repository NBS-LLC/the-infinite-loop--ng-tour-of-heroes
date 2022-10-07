export class Hero {
    static readonly TEST_TARGET: Hero = { id: 15, name: 'Magneta' };
    static readonly TEST_RENAME: Hero = { id: 15, name: 'MagnetaX' };

    constructor(public id: number, public name: string) { }

    // Hero from hero list <li> element.
    static async fromLi(li: WebdriverIO.Element): Promise<Hero> {
        const id = await li.$('[data-testid="id"]').getText();
        const name = await li.$('[data-testid="name"]').getText();
        return { id: +id, name: name };
    }

    // Hero id and name from the given detail element.
    static async fromDetail(detail: WebdriverIO.Element): Promise<Hero> {
        // Get hero id from the first <div>
        const id = await (await detail.$$('div'))[0].getText();
        // Get name from the h2
        const name = await detail.$('h2').getText();
        return {
            id: +id.slice(id.indexOf(' ') + 1),
            name: name.substring(0, name.lastIndexOf(' '))
        };
    }
}
