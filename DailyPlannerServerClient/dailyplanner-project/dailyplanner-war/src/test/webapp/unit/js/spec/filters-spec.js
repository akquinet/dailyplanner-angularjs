/*global
    jasmine,
    describe, it, expect,
    beforeEach, afterEach,
    module, inject,
    angular
 */

(function (jasmine, describe, it, expect, beforeEach, afterEach, module, inject, angular) {
    "use strict";

    describe("filters", function () {

        beforeEach(module("filters"));

        describe("formatDuration filter", function () {
            it("should format 150 minutes to '02h 30m'", inject(function ($filter) {
                var input, formattedInput;
                input = 150;
                formattedInput = $filter("formatDuration")(input);
                expect(formattedInput).toEqual("02h 30m");
            }));
        });

    });
}(jasmine, describe, it, expect, beforeEach, afterEach, module, inject, angular));