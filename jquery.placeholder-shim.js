/*
Another lightweight HTML5 placeholder shim for jQuery.
*/
;(function ($, window, document) {

// Class applied to placeholder shim elements.
var placeholderClass = 'placeholder-shim';

// Store of all elements with a placeholder shim.
var shimmedElements = [];

// Style block prepended to head for placeholder shims.
var placeholderSharedStyles;

var placeholderSupported = 'placeholder' in document.createElement('input');
var UID = 0;
var NS = 'placeholderShim';
var eventNS = '.' + NS;

function placeholderShim (element) {

    var $element = $(element);
    var $placeholder = $element.data(NS);
    var initialized = !! $placeholder;

    if (! initialized) {

        // Create placeholder element with unique ID.
        var placeholderID = NS + ++UID;
        $placeholder = $('<span aria-hidden="true"></span>')
            .addClass(placeholderClass)
            .attr('id', placeholderID);

        // Store $placeholder on $element and link with ARIA.
        $element
            .data(NS, $placeholder)
            .attr('aria-describedby', placeholderID)

        // Bind trigger events.
        $element
            .off(eventNS)
            .on('focus' + eventNS, focus)
            .on('blur' + eventNS, blur);
        $placeholder.on('click' + eventNS, focus);
    }

    // State handlers.
    function blur (e) {
        var currentValue = $.trim($element.val());
        if (currentValue.length) {
            $placeholder.hide();
        }
        else {
            $placeholder.appendTo(document.body).show();
        }
    }
    function focus (e) {
        $placeholder.hide();
        if (e && (e.type !== 'focus') && (e.type !== 'focusin')) {
            $element.focus();
        }
    }

    // If an ID is set on $element store it on $placeholder so it can be targeted
    // individually with CSS.
    if ($element.attr('id')) {
        $placeholder.attr('for', $element.attr('id'));
    }

    // Copy position and styles from $element to $placeholder so it sits directly above.
    var elementOffset = $element.offset();
    $placeholder
        .html($element.attr('placeholder'))
        .css({
            left: elementOffset.left,
            top: elementOffset.top,
            maxWidth: $element.width()
        });
    $.each([
        'box-sizing',
        'border-top-width',
        'border-left-width',
        'border-right-width',
        'padding-top',
        'padding-left',
        'padding-right',
        'font-size',
        'font-family',
        'line-height',
        'text-align'
        ], function (index, property) {
            var element = $element[0];
            // Workaround incorrect reported line-height in IE.
            if (
                property == 'line-height' &&
                element.currentStyle &&
                property in element.currentStyle
            ) {
                $placeholder.css(property, element.currentStyle[property]);
            }
            else {
                $placeholder.css(property, $element.css(property));
            }
        });

    // Set initial state.
    blur();
}

function placeholderShimRefresh (options) {

    $.each(shimmedElements, function (index, element) {
        var $element = $(element);
        var $placeholder = $element.data(NS);

        // Only update elements that are in the DOM.
        if ($placeholder && $placeholder[0].parentNode) {
            placeholderShim(element, options);
        }
    });
}


$.fn.placeholderShim = function (options) {

    if (placeholderSupported) {
        return this;
    }

    if (! placeholderSharedStyles) {
        placeholderSharedStyles = $(
            '<style id="placeholder-shim-styles" type="text/css">' +
            '.placeholder-shim {' +
                'position: absolute !important;' +
                'white-space: nowrap !important;' +
                'overflow: hidden !important;' +
                'background: 0 !important;' +
                'border: 0 solid transparent;' +
                // Default placeholder color.
                'color: #777;' +
            '}' +
            '</style>')[0];

        // Add shared styles before any other style definition so overriding is easy.
        $('head link[rel="stylesheet"], head style').first().before(placeholderSharedStyles);
    }

    // Reduce collection to feasible elements.
    var $elements = this.filter('input[placeholder], textarea[placeholder]');

    // Update placeholder element cache.
    shimmedElements = $.unique(shimmedElements.concat($elements.get()));

    // Bind refresh trigger events.
    $(window).off(eventNS).on([
        'resize' + eventNS,
        'load' + eventNS
      ].join(' '), placeholderShimRefresh);

    return $elements.each(function () {
        placeholderShim(this);
    });
};

})(jQuery, window, document);
