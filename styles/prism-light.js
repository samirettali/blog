export default `
/**
 * base16-prism (https://github.com/h404bi/base16-prism)
 * @license MIT
 *
 * prism.js Default Light theme for JavaScript, CSS and HTML
 * @author Chris Kempson (http:&#x2F;&#x2F;chriskempson.com)
 */

code[class*="language-"],
pre[class*="language-"] {
    color: #383838; /* base05 */
    background: none;
    text-shadow: 0 1px white;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 1em;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
}

pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
    color: inherit;
    text-shadow: none;
    background: #d8d8d8; /* base02 */
}

pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
code[class*="language-"]::selection, code[class*="language-"] ::selection {
    color: inherit;
    text-shadow: none;
    background: #d8d8d8; /* base02 */
}

@media print {
    code[class*="language-"],
    pre[class*="language-"] {
        text-shadow: none;
    }
}

/* Code blocks */
pre[class*="language-"] {
    padding: 1em;
    margin: .5em 0;
    overflow: auto;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
    background: #f8f8f8; /* base00 */
}

/* Inline code */
:not(pre) > code[class*="language-"] {
    padding: .1em;
    border-radius: .3em;
    white-space: normal;
}

.token.comment,
.token.prolog,
.token.cdata {
    color: #b8b8b8; /* base03 */
}

.token.entity,
.language-css .token.string,
.style .token.string {
    color: #585858; /* base04 */
    background: #e8e8e8; /* base01 */
}

.token.punctuation {
    color: #383838; /* base05 */
}

.token.variable,
.token.tag,
.token.operator,
.token.deleted {
    color: #ab4642; /* base08 */
}

.token.property,
.token.number,
.token.boolean,
.token.constant,
.token.url {
    color: #dc9656; /* base09 */
}

.token.class-name,
.token.bold {
    color: #f7ca88; /* base0A */
}

.token.string,
.token.symbol,
.token.attr-value,
.token.inserted,
.token.atrule {
    color:#a1b56c; /* base0B */
}

.token.regex,
.token.important {
    color: #86c1b9; /* base0C */
}

.token.function,
.token.attr-name {
    color: #7cafc2; /* base0D */
}

.token.keyword,
.token.selector,
.token.italic,
.token.char,
.token.builtin {
    color: #ba8baf; /* base0E */
}

.token.doctype {
    color: #a16946; /* base0F */
}

.token.important,
.token.bold {
    font-weight: bold;
}
.token.italic {
    font-style: italic;
}

.token.entity {
    cursor: help;
}

.namespace {
    opacity: .7;
}
`;