/*
Another lightweight HTML5 placeholder shim for jQuery.
*/
;(function ($, window, document) {

// Custom element used for placeholder shims.
var placeholderTag = 'x-placeholder-shim';

// Store of all elements with a placeholder shim.
var shimmedElements = [];

// Style block prepended to head for placeholder shims.
var placeholderSharedStyles;

var placeholderSupported = 'placeholder' in document.createElement('input');
var UID = 0;
var NS = 'placeholderShim';
var eventNS = '.' + NS;

function placeholderShim(element) {

    var $element = $(element);
    var elementId = $(element).attr('id');
    var $placeholder = $element.data(NS);
    var initialized = !! $placeholder;

    if (! initialized) {

        // If refreshing after ajax action remove existing placeholder shim.
        if (elementId) {
            $('body [placeholder-shim-for="' + elementId + '"]').remove();
        }

        // Create placeholder element with unique ID.
        var placeholderID = NS + ++UID;
        $placeholder = $(document.createElement(placeholderTag))
            .attr({
                'id': placeholderID,
                'aria-hidden': 'true'
            });

        // If an ID is set on $element store it on $placeholder so it can be targeted
        // individually with CSS.
        if (elementId) {
            $placeholder.attr('placeholder-shim-for', elementId);
        }

        // Store $placeholder on $element and link with ARIA.
        $element
            .data(NS, $placeholder)
            .attr('aria-describedby', placeholderID);

        // Bind trigger events.
        $element
            .off(eventNS)
            .on('focus' + eventNS, focus)
            .on('blur' + eventNS, blur);
        $placeholder.on('click' + eventNS, focus);
    }

    function blur(e) {
        var currentValue = $.trim($element.val());
        if (currentValue.length) {
            $placeholder.hide();
        }
        else {
            $placeholder.appendTo(document.body);
            stylePlaceholder($element, $placeholder);
            $placeholder.show();
        }
    }

    function focus(e) {
        $placeholder.hide();
        if (e && (e.type !== 'focus') && (e.type !== 'focusin')) {
            $element.focus();
        }
    }

    blur();
}

function refreshPlaceholders() {

    $.each(shimmedElements, function (index, element) {
        var $element = $(element);
        var visible = $element.is(':visible');
        var $placeholder = $element.data(NS);

        $placeholder && $placeholder.toggle(visible);

        // Only update visible elements that are in the DOM.
        if (visible && $placeholder && $placeholder[0].parentNode) {
            placeholderShim(element);
        }
    });
}

function stylePlaceholder($element, $placeholder) {

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
        'border-right-width',
        'border-left-width',
        'padding-top',
        'padding-right',
        'padding-left',
        'font-size',
        'font-family',
        'line-height',
        'text-align',
        'word-spacing'
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
}

$.fn.placeholderShim = function () {

    if (placeholderSupported) {
        return this;
    }

    if (! placeholderSharedStyles) {
        placeholderSharedStyles = $(
            '<style id="placeholder-shim-styles" type="text/css">' +
            placeholderTag + '{' + [
                'position: absolute !important',
                'white-space: nowrap !important',
                'overflow: hidden !important',
                'background: 0 !important',
                'border-color: transparent',
                'border-style: solid',
                // Default placeholder color.
                'color: #777'
            ].join(';') + '}' +
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
        ].join(' '), refreshPlaceholders);

    return $elements.each(function () {
        placeholderShim(this);
    });
};

})(jQuery, window, document);
