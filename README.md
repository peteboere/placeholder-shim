### Another lightweight HTML5 placeholder shim for jQuery

* Does nothing if browser supports the placeholder attribute.
* Does not set the value of inputs; so no issues with browser autocomplete or accidentally posted forms.
* Uses ARIA for enhanced accessibilty.
* Very small.


### Usage

HTML:

```html
<input type="search" placeholder="Search site"/>
```

JS:

```js
jQuery(function ($) {
    $('input, textarea').placeholderShim();
});
```

CSS:

```css
.placeholder-shim {
    color: dodgerblue;
}
```

### Compatibility

Tested in Internet Explorer 7, 8 and 9.
