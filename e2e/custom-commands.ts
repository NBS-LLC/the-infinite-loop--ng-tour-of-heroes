import { ChainablePromiseElement, ChainablePromiseArray } from 'webdriverio';

declare global {
    namespace WebdriverIO {
        interface Browser {
            /**
             * Try to locate an element using a Test Id.
             * @param testId The Test Id of the element.
             */
            testId$: (testId: string) => ChainablePromiseElement<WebdriverIO.Element>

            /**
             * Try to locate a collection of elements that use the same Test Id.
             * @param testId The Test Id of the elements.
             */
            testId$$: (testId: string) => ChainablePromiseArray<WebdriverIO.ElementArray>
        }

        interface Element {
            /**
             * Use an existing element to locate another element using a Test Id.
             * @param testId The Test Id of the element.
             */
            testId$: (testId: string) => ChainablePromiseElement<WebdriverIO.Element>

            /**
             * Use an existing element to locate a collection of elements using the same Test Id.
             * @param testId The Test Id of the elements.
             */
            testId$$: (testId: string) => ChainablePromiseElement<WebdriverIO.Element>
        }
    }
}

/**
 * Add test helpers and support functions to WDIO.
 */
export function addCustomCommands(): void {
    browser.addCommand('testId$', function (testId: string) {
        return browser.$(getTestIdSelector(testId));
    });

    browser.addCommand('testId$', function (this: WebdriverIO.Element, testId: string) {
        return this.$(getTestIdSelector(testId));
    }, true);

    browser.addCommand('testId$$', function (testId: string) {
        return browser.$$(getTestIdSelector(testId));
    });

    browser.addCommand('testId$$', function (this: WebdriverIO.Element, testId: string) {
        return this.$$(getTestIdSelector(testId));
    }, true);
}

function getTestIdSelector(testId: string) {
    return `[data-testid="${testId}"]`;
}
