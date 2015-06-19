/// <reference path="../InputFormatter" />
'use strict';

module InputFormatter {
  /**
   * Allows HTML5 Input's to specify a format like so:
   * <input input-formatter="999-aaa-*" type="text"/>
   *
   * Where:
   *
   * 9: [0-9]
   * a: [A-Za-z]
   * *: [A-Za-z0-9]
   *
   * A custom event, 'inputFormatterExhausted', is fired when the input
   * becomes exhausted, that is, the length of the pattern and the input value
   * are equal.
   *
   * @param Formatter
   * @returns {{restrict: string, link: (function(any, any, any): void)}}
   * @constructor
   */
  export function FormatDirective(Formatter) {

    function addFormInputExhaustedListener($form) {
      if ($form.inputFormatterEvent === true) {
        return;
      }

      // wait for all the elm to get attached to the DOM
      setTimeout(() => {
        for (var i = 0; i < $form.elements.length; i++) {
          $form.elements[i].setAttribute('tabindex', (i + 1).toString());
        }
      }, 100);

      $form.addEventListener('inputFormatter.exhausted', (e) => {
        focusOnNext(e.target);
      });

      $form.inputFormatterEvent = true;
    }

    /**
     * Jumps to the next input in the form
     *
     * @param $elm
     */
    function focusOnNext($elm) {
      var $e: any = $elm.form.elements[$elm.attributes.tabindex.value];

      // It shouldn't focus on elements which are not applying the formatter.
      if (isFormatted($e)) {
        $e.focus();
      }
    }

    function isFormatted($e) {
      return $e
          && $e.attributes['input-formatter']
          && $e.attributes['input-formatter'].value.length > 0;
    }

    /**
     * Sets the state of the input element: exhausted or not!
     *  And fires the "inputFormatter.exhausted" Event.
     *
     * @param $elm
     * @param isExhausted
     * @param exhaustedEvent
     */
    function setState($elm, isExhausted, exhaustedEvent) {
      if (isExhausted) {
        $elm[0].dispatchEvent(exhaustedEvent);
        $elm.addClass('input-formatter-exhausted');
      }
      else {
        $elm.removeClass('input-formatter-exhausted');
      }
    }

    return {
      restrict: 'A',
      require:  'ngModel',
      link:     function (scope, $elm, attrs, ngModel): void {
        var formatter = new Formatter(attrs.inputFormatter);

        // Create the Input Exhausted event.
        var exhaustedEvent = document.createEvent('HTMLEvents');
        exhaustedEvent.initEvent('inputFormatter.exhausted', true, true);

        ngModel.$parsers.push(function (input) {
          $elm[0].value = formatter.make(input);

          setState($elm, formatter.isExhausted(), exhaustedEvent);

          return formatter.clean(input);
        });

        // Check if the input is a child of a form
        if ($elm[0].form) {
          addFormInputExhaustedListener($elm[0].form);
        }

        ngModel.$formatters.push(function (input) {
          return formatter.make(input || '');
        });
      }
    };
  }

}
