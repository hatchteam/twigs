'use strict';

var scenarioo = require('scenarioo-js');

scenarioo.describeUseCase('Single- and Multi-Select', function () {

    beforeEach(function () {
        browser.driver.manage().window().maximize();
    });

    scenarioo.describeScenario('should be able to select single choice', function () {
        browser.get('#');

        var selectedValueElement = element(by.css('.selected-country'));

        expect(selectedValueElement.getText()).toEqual('{"id":3}');

        // open the dropdown
        element(by.id('s2id_singleCountry')).click();

        // search something and hit enter
        element(by.css('.select2-search > input')).sendKeys('Switz', protractor.Key.ENTER);

        // now, the binded value is correctly set to an id-fied object with id 1
        expect(selectedValueElement.getText()).toEqual('{"id":1}');

        // now, programmatically set the model value (by clicking a demo button)
        element(by.css('.set-single')).click();

        expect(selectedValueElement.getText()).toEqual('{"id":2}');
        expect(element(by.css('#s2id_singleCountry .select2-chosen')).getText()).toEqual('Austria');
    });


    scenarioo.describeScenario('should be able to select multiple choice', function () {
        browser.get('#');

        var selectedValueElement = element(by.css('.selected-countries'));

        expect(selectedValueElement.getText()).toEqual('[{"id":1},{"id":2}]');

        // open the dropdown
        element(by.id('s2id_multipleCountries')).click();

        // search something and hit enter
        element(by.css('#s2id_multipleCountries .select2-search-field > input')).sendKeys('germ', protractor.Key.ENTER);

        // now, the binded value is correctly set to an array with id-fied objects
        expect(selectedValueElement.getText()).toEqual('[{"id":1},{"id":2},{"id":3}]');

        // now, programmatically set the model value (by clicking a demo button)
        element(by.css('.set-multiple')).click();

        expect(selectedValueElement.getText()).toEqual('[{"id":1},{"id":3}]');

        element.all(by.css('#s2id_multipleCountries .select2-search-choice')).then(function (items) {
            expect(items.length).toBe(2);
            expect(items[0].getText()).toEqual('Switzerland');
            expect(items[1].getText()).toEqual('Germany');
        });

    });


});
