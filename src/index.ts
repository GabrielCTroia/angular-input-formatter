/// <reference path="./vendor.d.ts" />
/// <reference path="./InputFormatter" />
/// <reference path="./directives/FormatDirective" />
'use strict';

import InputFormatterModule = InputFormatter;

angular.module('InputFormatter', [])

    .directive('inputFormatter', [() => {
      return InputFormatterModule.FormatDirective(InputFormatterModule.Formatter);
    }]);
