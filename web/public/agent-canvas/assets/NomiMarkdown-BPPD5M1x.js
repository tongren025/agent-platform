import { bw as Zt, ci as W, cS as mi } from "./agentStudioMount-xGP7t2dE.js";
function gi(e, t) {
  const n = {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const di = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, xi = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, yi = {};
function ct(e, t) {
  return (yi.jsx ? xi : di).test(e);
}
const ki = /[ \t\n\f\r]/g;
function bi(e) {
  return typeof e == "object" ? e.type === "text" ? ft(e.value) : !1 : ft(e);
}
function ft(e) {
  return e.replace(ki, "") === "";
}
class Xe {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(t, n, r) {
    this.normal = n, this.property = t, r && (this.space = r);
  }
}
Xe.prototype.normal = {};
Xe.prototype.property = {};
Xe.prototype.space = void 0;
function er(e, t) {
  const n = {}, r = {};
  for (const i of e)
    Object.assign(n, i.property), Object.assign(r, i.normal);
  return new Xe(n, r, t);
}
function zn(e) {
  return e.toLowerCase();
}
class ne {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(t, n) {
    this.attribute = n, this.property = t;
  }
}
ne.prototype.attribute = "";
ne.prototype.booleanish = !1;
ne.prototype.boolean = !1;
ne.prototype.commaOrSpaceSeparated = !1;
ne.prototype.commaSeparated = !1;
ne.prototype.defined = !1;
ne.prototype.mustUseProperty = !1;
ne.prototype.number = !1;
ne.prototype.overloadedBoolean = !1;
ne.prototype.property = "";
ne.prototype.spaceSeparated = !1;
ne.prototype.space = void 0;
let wi = 0;
const R = Ie(), X = Ie(), Dn = Ie(), E = Ie(), Y = Ie(), Le = Ie(), re = Ie();
function Ie() {
  return 2 ** ++wi;
}
const Ln = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: R,
  booleanish: X,
  commaOrSpaceSeparated: re,
  commaSeparated: Le,
  number: E,
  overloadedBoolean: Dn,
  spaceSeparated: Y
}, Symbol.toStringTag, { value: "Module" })), pn = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(Ln)
);
class Hn extends ne {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(t, n, r, i) {
    let o = -1;
    if (super(t, n), ht(this, "space", i), typeof r == "number")
      for (; ++o < pn.length; ) {
        const l = pn[o];
        ht(this, pn[o], (r & Ln[l]) === Ln[l]);
      }
  }
}
Hn.prototype.defined = !0;
function ht(e, t, n) {
  n && (e[t] = n);
}
function _e(e) {
  const t = {}, n = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const o = new Hn(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (o.mustUseProperty = !0), t[r] = o, n[zn(r)] = r, n[zn(o.attribute)] = r;
  }
  return new Xe(t, n, e.space);
}
const nr = _e({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: X,
    ariaAutoComplete: null,
    ariaBusy: X,
    ariaChecked: X,
    ariaColCount: E,
    ariaColIndex: E,
    ariaColSpan: E,
    ariaControls: Y,
    ariaCurrent: null,
    ariaDescribedBy: Y,
    ariaDetails: null,
    ariaDisabled: X,
    ariaDropEffect: Y,
    ariaErrorMessage: null,
    ariaExpanded: X,
    ariaFlowTo: Y,
    ariaGrabbed: X,
    ariaHasPopup: null,
    ariaHidden: X,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: Y,
    ariaLevel: E,
    ariaLive: null,
    ariaModal: X,
    ariaMultiLine: X,
    ariaMultiSelectable: X,
    ariaOrientation: null,
    ariaOwns: Y,
    ariaPlaceholder: null,
    ariaPosInSet: E,
    ariaPressed: X,
    ariaReadOnly: X,
    ariaRelevant: null,
    ariaRequired: X,
    ariaRoleDescription: Y,
    ariaRowCount: E,
    ariaRowIndex: E,
    ariaRowSpan: E,
    ariaSelected: X,
    ariaSetSize: E,
    ariaSort: null,
    ariaValueMax: E,
    ariaValueMin: E,
    ariaValueNow: E,
    ariaValueText: null,
    role: null
  },
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  }
});
function tr(e, t) {
  return t in e ? e[t] : t;
}
function rr(e, t) {
  return tr(e, t.toLowerCase());
}
const Si = _e({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: Le,
    acceptCharset: Y,
    accessKey: Y,
    action: null,
    allow: null,
    allowFullScreen: R,
    allowPaymentRequest: R,
    allowUserMedia: R,
    alt: null,
    as: null,
    async: R,
    autoCapitalize: null,
    autoComplete: Y,
    autoFocus: R,
    autoPlay: R,
    blocking: Y,
    capture: null,
    charSet: null,
    checked: R,
    cite: null,
    className: Y,
    cols: E,
    colSpan: null,
    content: null,
    contentEditable: X,
    controls: R,
    controlsList: Y,
    coords: E | Le,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: R,
    defer: R,
    dir: null,
    dirName: null,
    disabled: R,
    download: Dn,
    draggable: X,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: R,
    formTarget: null,
    headers: Y,
    height: E,
    hidden: Dn,
    high: E,
    href: null,
    hrefLang: null,
    htmlFor: Y,
    httpEquiv: Y,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: R,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: R,
    itemId: null,
    itemProp: Y,
    itemRef: Y,
    itemScope: R,
    itemType: Y,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: R,
    low: E,
    manifest: null,
    max: null,
    maxLength: E,
    media: null,
    method: null,
    min: null,
    minLength: E,
    multiple: R,
    muted: R,
    name: null,
    nonce: null,
    noModule: R,
    noValidate: R,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: R,
    optimum: E,
    pattern: null,
    ping: Y,
    placeholder: null,
    playsInline: R,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: R,
    referrerPolicy: null,
    rel: Y,
    required: R,
    reversed: R,
    rows: E,
    rowSpan: E,
    sandbox: Y,
    scope: null,
    scoped: R,
    seamless: R,
    selected: R,
    shadowRootClonable: R,
    shadowRootDelegatesFocus: R,
    shadowRootMode: null,
    shape: null,
    size: E,
    sizes: null,
    slot: null,
    span: E,
    spellCheck: X,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: E,
    step: null,
    style: null,
    tabIndex: E,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: R,
    useMap: null,
    value: X,
    width: E,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: Y,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: E,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: E,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: R,
    // Lists. Use CSS to reduce space between items instead
    declare: R,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: E,
    // `<img>` and `<object>`
    leftMargin: E,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: E,
    // `<body>`
    marginWidth: E,
    // `<body>`
    noResize: R,
    // `<frame>`
    noHref: R,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: R,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: R,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: E,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: X,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: E,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: E,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: R,
    disableRemotePlayback: R,
    prefix: null,
    property: null,
    results: E,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: rr
}), Ci = _e({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: re,
    accentHeight: E,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: E,
    amplitude: E,
    arabicForm: null,
    ascent: E,
    attributeName: null,
    attributeType: null,
    azimuth: E,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: E,
    by: null,
    calcMode: null,
    capHeight: E,
    className: Y,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: E,
    diffuseConstant: E,
    direction: null,
    display: null,
    dur: null,
    divisor: E,
    dominantBaseline: null,
    download: R,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: E,
    enableBackground: null,
    end: null,
    event: null,
    exponent: E,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: E,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: Le,
    g2: Le,
    glyphName: Le,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: E,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: E,
    horizOriginX: E,
    horizOriginY: E,
    id: null,
    ideographic: E,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: E,
    k: E,
    k1: E,
    k2: E,
    k3: E,
    k4: E,
    kernelMatrix: re,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: E,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: E,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: E,
    overlineThickness: E,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: E,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: Y,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: E,
    pointsAtY: E,
    pointsAtZ: E,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: re,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: re,
    rev: re,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: re,
    requiredFeatures: re,
    requiredFonts: re,
    requiredFormats: re,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: E,
    specularExponent: E,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: E,
    strikethroughThickness: E,
    string: null,
    stroke: null,
    strokeDashArray: re,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: E,
    strokeOpacity: E,
    strokeWidth: null,
    style: null,
    surfaceScale: E,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: re,
    tabIndex: E,
    tableValues: null,
    target: null,
    targetX: E,
    targetY: E,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: re,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: E,
    underlineThickness: E,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: E,
    values: null,
    vAlphabetic: E,
    vMathematical: E,
    vectorEffect: null,
    vHanging: E,
    vIdeographic: E,
    version: null,
    vertAdvY: E,
    vertOriginX: E,
    vertOriginY: E,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: E,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: tr
}), ir = _e({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(e, t) {
    return "xlink:" + t.slice(5).toLowerCase();
  }
}), lr = _e({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: rr
}), or = _e({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  }
}), Ei = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
}, Ii = /[A-Z]/g, pt = /-[a-z]/g, Ai = /^data[-\w.:]+$/i;
function Ti(e, t) {
  const n = zn(t);
  let r = t, i = ne;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && Ai.test(t)) {
    if (t.charAt(4) === "-") {
      const o = t.slice(5).replace(pt, Pi);
      r = "data" + o.charAt(0).toUpperCase() + o.slice(1);
    } else {
      const o = t.slice(4);
      if (!pt.test(o)) {
        let l = o.replace(Ii, vi);
        l.charAt(0) !== "-" && (l = "-" + l), t = "data" + l;
      }
    }
    i = Hn;
  }
  return new i(r, t);
}
function vi(e) {
  return "-" + e.toLowerCase();
}
function Pi(e) {
  return e.charAt(1).toUpperCase();
}
const zi = er([nr, Si, ir, lr, or], "html"), $n = er([nr, Ci, ir, lr, or], "svg");
function Di(e) {
  return e.join(" ").trim();
}
var Pe = {}, mn, mt;
function Li() {
  if (mt) return mn;
  mt = 1;
  var e = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, t = /\n/g, n = /^\s*/, r = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, i = /^:\s*/, o = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, l = /^[;\s]*/, a = /^\s+|\s+$/g, u = `
`, s = "/", f = "*", c = "", p = "comment", h = "declaration";
  function d(S, x) {
    if (typeof S != "string")
      throw new TypeError("First argument must be a string");
    if (!S) return [];
    x = x || {};
    var I = 1, C = 1;
    function F(D) {
      var T = D.match(t);
      T && (I += T.length);
      var U = D.lastIndexOf(u);
      C = ~U ? D.length - U : C + D.length;
    }
    function _() {
      var D = { line: I, column: C };
      return function(T) {
        return T.position = new b(D), j(), T;
      };
    }
    function b(D) {
      this.start = D, this.end = { line: I, column: C }, this.source = x.source;
    }
    b.prototype.content = S;
    function M(D) {
      var T = new Error(
        x.source + ":" + I + ":" + C + ": " + D
      );
      if (T.reason = D, T.filename = x.source, T.line = I, T.column = C, T.source = S, !x.silent) throw T;
    }
    function H(D) {
      var T = D.exec(S);
      if (T) {
        var U = T[0];
        return F(U), S = S.slice(U.length), T;
      }
    }
    function j() {
      H(n);
    }
    function y(D) {
      var T;
      for (D = D || []; T = v(); )
        T !== !1 && D.push(T);
      return D;
    }
    function v() {
      var D = _();
      if (!(s != S.charAt(0) || f != S.charAt(1))) {
        for (var T = 2; c != S.charAt(T) && (f != S.charAt(T) || s != S.charAt(T + 1)); )
          ++T;
        if (T += 2, c === S.charAt(T - 1))
          return M("End of comment missing");
        var U = S.slice(2, T - 2);
        return C += 2, F(U), S = S.slice(T), C += 2, D({
          type: p,
          comment: U
        });
      }
    }
    function P() {
      var D = _(), T = H(r);
      if (T) {
        if (v(), !H(i)) return M("property missing ':'");
        var U = H(o), Q = D({
          type: h,
          property: w(T[0].replace(e, c)),
          value: U ? w(U[0].replace(e, c)) : c
        });
        return H(l), Q;
      }
    }
    function $() {
      var D = [];
      y(D);
      for (var T; T = P(); )
        T !== !1 && (D.push(T), y(D));
      return D;
    }
    return j(), $();
  }
  function w(S) {
    return S ? S.replace(a, c) : c;
  }
  return mn = d, mn;
}
var gt;
function Fi() {
  if (gt) return Pe;
  gt = 1;
  var e = Pe && Pe.__importDefault || function(r) {
    return r && r.__esModule ? r : { default: r };
  };
  Object.defineProperty(Pe, "__esModule", { value: !0 }), Pe.default = n;
  const t = e(Li());
  function n(r, i) {
    let o = null;
    if (!r || typeof r != "string")
      return o;
    const l = (0, t.default)(r), a = typeof i == "function";
    return l.forEach((u) => {
      if (u.type !== "declaration")
        return;
      const { property: s, value: f } = u;
      a ? i(s, f, u) : f && (o = o || {}, o[s] = f);
    }), o;
  }
  return Pe;
}
var Be = {}, dt;
function _i() {
  if (dt) return Be;
  dt = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.camelCase = void 0;
  var e = /^--[a-zA-Z0-9_-]+$/, t = /-([a-z])/g, n = /^[^-]+$/, r = /^-(webkit|moz|ms|o|khtml)-/, i = /^-(ms)-/, o = function(s) {
    return !s || n.test(s) || e.test(s);
  }, l = function(s, f) {
    return f.toUpperCase();
  }, a = function(s, f) {
    return "".concat(f, "-");
  }, u = function(s, f) {
    return f === void 0 && (f = {}), o(s) ? s : (s = s.toLowerCase(), f.reactCompat ? s = s.replace(i, a) : s = s.replace(r, a), s.replace(t, l));
  };
  return Be.camelCase = u, Be;
}
var je, xt;
function Ri() {
  if (xt) return je;
  xt = 1;
  var e = je && je.__importDefault || function(i) {
    return i && i.__esModule ? i : { default: i };
  }, t = e(Fi()), n = _i();
  function r(i, o) {
    var l = {};
    return !i || typeof i != "string" || (0, t.default)(i, function(a, u) {
      a && u && (l[(0, n.camelCase)(a, o)] = u);
    }), l;
  }
  return r.default = r, je = r, je;
}
var Oi = Ri();
const Mi = /* @__PURE__ */ Zt(Oi), ar = ur("end"), Un = ur("start");
function ur(e) {
  return t;
  function t(n) {
    const r = n && n.position && n.position[e] || {};
    if (typeof r.line == "number" && r.line > 0 && typeof r.column == "number" && r.column > 0)
      return {
        line: r.line,
        column: r.column,
        offset: typeof r.offset == "number" && r.offset > -1 ? r.offset : void 0
      };
  }
}
function Ni(e) {
  const t = Un(e), n = ar(e);
  if (t && n)
    return { start: t, end: n };
}
function Ue(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? yt(e.position) : "start" in e || "end" in e ? yt(e) : "line" in e || "column" in e ? Fn(e) : "";
}
function Fn(e) {
  return kt(e && e.line) + ":" + kt(e && e.column);
}
function yt(e) {
  return Fn(e && e.start) + "-" + Fn(e && e.end);
}
function kt(e) {
  return e && typeof e == "number" ? e : 1;
}
class J extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(t, n, r) {
    super(), typeof n == "string" && (r = n, n = void 0);
    let i = "", o = {}, l = !1;
    if (n && ("line" in n && "column" in n ? o = { place: n } : "start" in n && "end" in n ? o = { place: n } : "type" in n ? o = {
      ancestors: [n],
      place: n.position
    } : o = { ...n }), typeof t == "string" ? i = t : !o.cause && t && (l = !0, i = t.message, o.cause = t), !o.ruleId && !o.source && typeof r == "string") {
      const u = r.indexOf(":");
      u === -1 ? o.ruleId = r : (o.source = r.slice(0, u), o.ruleId = r.slice(u + 1));
    }
    if (!o.place && o.ancestors && o.ancestors) {
      const u = o.ancestors[o.ancestors.length - 1];
      u && (o.place = u.position);
    }
    const a = o.place && "start" in o.place ? o.place.start : o.place;
    this.ancestors = o.ancestors || void 0, this.cause = o.cause || void 0, this.column = a ? a.column : void 0, this.fatal = void 0, this.file = "", this.message = i, this.line = a ? a.line : void 0, this.name = Ue(o.place) || "1:1", this.place = o.place || void 0, this.reason = this.message, this.ruleId = o.ruleId || void 0, this.source = o.source || void 0, this.stack = l && o.cause && typeof o.cause.stack == "string" ? o.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
  }
}
J.prototype.file = "";
J.prototype.name = "";
J.prototype.reason = "";
J.prototype.message = "";
J.prototype.stack = "";
J.prototype.column = void 0;
J.prototype.line = void 0;
J.prototype.ancestors = void 0;
J.prototype.cause = void 0;
J.prototype.fatal = void 0;
J.prototype.place = void 0;
J.prototype.ruleId = void 0;
J.prototype.source = void 0;
const qn = {}.hasOwnProperty, Bi = /* @__PURE__ */ new Map(), ji = /[A-Z]/g, Hi = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), $i = /* @__PURE__ */ new Set(["td", "th"]), sr = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function Ui(e, t) {
  if (!t || t.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = Ki(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = Gi(n, t.jsx, t.jsxs);
  }
  const i = {
    Fragment: t.Fragment,
    ancestors: [],
    components: t.components || {},
    create: r,
    elementAttributeNameCase: t.elementAttributeNameCase || "react",
    evaluater: t.createEvaluater ? t.createEvaluater() : void 0,
    filePath: n,
    ignoreInvalidStyle: t.ignoreInvalidStyle || !1,
    passKeys: t.passKeys !== !1,
    passNode: t.passNode || !1,
    schema: t.space === "svg" ? $n : zi,
    stylePropertyNameCase: t.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: t.tableCellAlignToStyle !== !1
  }, o = cr(i, e, void 0);
  return o && typeof o != "string" ? o : i.create(
    e,
    i.Fragment,
    { children: o || void 0 },
    void 0
  );
}
function cr(e, t, n) {
  if (t.type === "element")
    return qi(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression")
    return Vi(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement")
    return Yi(e, t, n);
  if (t.type === "mdxjsEsm")
    return Wi(e, t);
  if (t.type === "root")
    return Xi(e, t, n);
  if (t.type === "text")
    return Qi(e, t);
}
function qi(e, t, n) {
  const r = e.schema;
  let i = r;
  t.tagName.toLowerCase() === "svg" && r.space === "html" && (i = $n, e.schema = i), e.ancestors.push(t);
  const o = hr(e, t.tagName, !1), l = Ji(e, t);
  let a = Wn(e, t);
  return Hi.has(t.tagName) && (a = a.filter(function(u) {
    return typeof u == "string" ? !bi(u) : !0;
  })), fr(e, l, o, t), Vn(l, a), e.ancestors.pop(), e.schema = r, e.create(t, o, l, n);
}
function Vi(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  We(e, t.position);
}
function Wi(e, t) {
  if (t.data && t.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(t.data.estree)
    );
  We(e, t.position);
}
function Yi(e, t, n) {
  const r = e.schema;
  let i = r;
  t.name === "svg" && r.space === "html" && (i = $n, e.schema = i), e.ancestors.push(t);
  const o = t.name === null ? e.Fragment : hr(e, t.name, !0), l = Zi(e, t), a = Wn(e, t);
  return fr(e, l, o, t), Vn(l, a), e.ancestors.pop(), e.schema = r, e.create(t, o, l, n);
}
function Xi(e, t, n) {
  const r = {};
  return Vn(r, Wn(e, t)), e.create(t, e.Fragment, r, n);
}
function Qi(e, t) {
  return t.value;
}
function fr(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function Vn(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function Gi(e, t, n) {
  return r;
  function r(i, o, l, a) {
    const s = Array.isArray(l.children) ? n : t;
    return a ? s(o, l, a) : s(o, l);
  }
}
function Ki(e, t) {
  return n;
  function n(r, i, o, l) {
    const a = Array.isArray(o.children), u = Un(r);
    return t(
      i,
      o,
      l,
      a,
      {
        columnNumber: u ? u.column - 1 : void 0,
        fileName: e,
        lineNumber: u ? u.line : void 0
      },
      void 0
    );
  }
}
function Ji(e, t) {
  const n = {};
  let r, i;
  for (i in t.properties)
    if (i !== "children" && qn.call(t.properties, i)) {
      const o = el(e, i, t.properties[i]);
      if (o) {
        const [l, a] = o;
        e.tableCellAlignToStyle && l === "align" && typeof a == "string" && $i.has(t.tagName) ? r = a : n[l] = a;
      }
    }
  if (r) {
    const o = (
      /** @type {Style} */
      n.style || (n.style = {})
    );
    o[e.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = r;
  }
  return n;
}
function Zi(e, t) {
  const n = {};
  for (const r of t.attributes)
    if (r.type === "mdxJsxExpressionAttribute")
      if (r.data && r.data.estree && e.evaluater) {
        const o = r.data.estree.body[0];
        o.type;
        const l = o.expression;
        l.type;
        const a = l.properties[0];
        a.type, Object.assign(
          n,
          e.evaluater.evaluateExpression(a.argument)
        );
      } else
        We(e, t.position);
    else {
      const i = r.name;
      let o;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const a = r.value.data.estree.body[0];
          a.type, o = e.evaluater.evaluateExpression(a.expression);
        } else
          We(e, t.position);
      else
        o = r.value === null ? !0 : r.value;
      n[i] = /** @type {Props[keyof Props]} */
      o;
    }
  return n;
}
function Wn(e, t) {
  const n = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : Bi;
  for (; ++r < t.children.length; ) {
    const o = t.children[r];
    let l;
    if (e.passKeys) {
      const u = o.type === "element" ? o.tagName : o.type === "mdxJsxFlowElement" || o.type === "mdxJsxTextElement" ? o.name : void 0;
      if (u) {
        const s = i.get(u) || 0;
        l = u + "-" + s, i.set(u, s + 1);
      }
    }
    const a = cr(e, o, l);
    a !== void 0 && n.push(a);
  }
  return n;
}
function el(e, t, n) {
  const r = Ti(e.schema, t);
  if (!(n == null || typeof n == "number" && Number.isNaN(n))) {
    if (Array.isArray(n) && (n = r.commaSeparated ? gi(n) : Di(n)), r.property === "style") {
      let i = typeof n == "object" ? n : nl(e, String(n));
      return e.stylePropertyNameCase === "css" && (i = tl(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? Ei[r.property] || r.property : r.attribute,
      n
    ];
  }
}
function nl(e, t) {
  try {
    return Mi(t, { reactCompat: !0 });
  } catch (n) {
    if (e.ignoreInvalidStyle)
      return {};
    const r = (
      /** @type {Error} */
      n
    ), i = new J("Cannot parse `style` attribute", {
      ancestors: e.ancestors,
      cause: r,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    throw i.file = e.filePath || void 0, i.url = sr + "#cannot-parse-style-attribute", i;
  }
}
function hr(e, t, n) {
  let r;
  if (!n)
    r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const i = t.split(".");
    let o = -1, l;
    for (; ++o < i.length; ) {
      const a = ct(i[o]) ? { type: "Identifier", name: i[o] } : { type: "Literal", value: i[o] };
      l = l ? {
        type: "MemberExpression",
        object: l,
        property: a,
        computed: !!(o && a.type === "Literal"),
        optional: !1
      } : a;
    }
    r = l;
  } else
    r = ct(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return qn.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  We(e);
}
function We(e, t) {
  const n = new J(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: t,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw n.file = e.filePath || void 0, n.url = sr + "#cannot-handle-mdx-estrees-without-createevaluater", n;
}
function tl(e) {
  const t = {};
  let n;
  for (n in e)
    qn.call(e, n) && (t[rl(n)] = e[n]);
  return t;
}
function rl(e) {
  let t = e.replace(ji, il);
  return t.slice(0, 3) === "ms-" && (t = "-" + t), t;
}
function il(e) {
  return "-" + e.toLowerCase();
}
const gn = {
  action: ["form"],
  cite: ["blockquote", "del", "ins", "q"],
  data: ["object"],
  formAction: ["button", "input"],
  href: ["a", "area", "base", "link"],
  icon: ["menuitem"],
  itemId: null,
  manifest: ["html"],
  ping: ["a", "area"],
  poster: ["video"],
  src: [
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video"
  ]
}, ll = {};
function Yn(e, t) {
  const n = ll, r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0, i = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return pr(e, r, i);
}
function pr(e, t, n) {
  if (ol(e)) {
    if ("value" in e)
      return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return bt(e.children, t, n);
  }
  return Array.isArray(e) ? bt(e, t, n) : "";
}
function bt(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = pr(e[i], t, n);
  return r.join("");
}
function ol(e) {
  return !!(e && typeof e == "object");
}
const wt = document.createElement("i");
function Xn(e) {
  const t = "&" + e + ";";
  wt.innerHTML = t;
  const n = wt.textContent;
  return n.charCodeAt(n.length - 1) === 59 && e !== "semi" || n === t ? !1 : n;
}
function ie(e, t, n, r) {
  const i = e.length;
  let o = 0, l;
  if (t < 0 ? t = -t > i ? 0 : i + t : t = t > i ? i : t, n = n > 0 ? n : 0, r.length < 1e4)
    l = Array.from(r), l.unshift(t, n), e.splice(...l);
  else
    for (n && e.splice(t, n); o < r.length; )
      l = r.slice(o, o + 1e4), l.unshift(t, 0), e.splice(...l), o += 1e4, t += 1e4;
}
function le(e, t) {
  return e.length > 0 ? (ie(e, e.length, 0, t), e) : t;
}
const St = {}.hasOwnProperty;
function mr(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    al(t, e[n]);
  return t;
}
function al(e, t) {
  let n;
  for (n in t) {
    const i = (St.call(e, n) ? e[n] : void 0) || (e[n] = {}), o = t[n];
    let l;
    if (o)
      for (l in o) {
        St.call(i, l) || (i[l] = []);
        const a = o[l];
        ul(
          // @ts-expect-error Looks like a list.
          i[l],
          Array.isArray(a) ? a : a ? [a] : []
        );
      }
  }
}
function ul(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  ie(e, 0, 0, r);
}
function gr(e, t) {
  const n = Number.parseInt(e, t);
  return (
    // C0 except for HT, LF, FF, CR, space.
    n < 9 || n === 11 || n > 13 && n < 32 || // Control character (DEL) of C0, and C1 controls.
    n > 126 && n < 160 || // Lone high surrogates and low surrogates.
    n > 55295 && n < 57344 || // Noncharacters.
    n > 64975 && n < 65008 || /* eslint-disable no-bitwise */
    (n & 65535) === 65535 || (n & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    n > 1114111 ? "�" : String.fromCodePoint(n)
  );
}
function ce(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const Z = be(/[A-Za-z]/), K = be(/[\dA-Za-z]/), sl = be(/[#-'*+\--9=?A-Z^-~]/);
function rn(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const _n = be(/\d/), cl = be(/[\dA-Fa-f]/), fl = be(/[!-/:-@[-`{-~]/);
function z(e) {
  return e !== null && e < -2;
}
function V(e) {
  return e !== null && (e < 0 || e === 32);
}
function O(e) {
  return e === -2 || e === -1 || e === 32;
}
const un = be(new RegExp("\\p{P}|\\p{S}", "u")), Ee = be(/\s/);
function be(e) {
  return t;
  function t(n) {
    return n !== null && n > -1 && e.test(String.fromCharCode(n));
  }
}
function Re(e) {
  const t = [];
  let n = -1, r = 0, i = 0;
  for (; ++n < e.length; ) {
    const o = e.charCodeAt(n);
    let l = "";
    if (o === 37 && K(e.charCodeAt(n + 1)) && K(e.charCodeAt(n + 2)))
      i = 2;
    else if (o < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(o)) || (l = String.fromCharCode(o));
    else if (o > 55295 && o < 57344) {
      const a = e.charCodeAt(n + 1);
      o < 56320 && a > 56319 && a < 57344 ? (l = String.fromCharCode(o, a), i = 1) : l = "�";
    } else
      l = String.fromCharCode(o);
    l && (t.push(e.slice(r, n), encodeURIComponent(l)), r = n + i + 1, l = ""), i && (n += i, i = 0);
  }
  return t.join("") + e.slice(r);
}
function B(e, t, n, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let o = 0;
  return l;
  function l(u) {
    return O(u) ? (e.enter(n), a(u)) : t(u);
  }
  function a(u) {
    return O(u) && o++ < i ? (e.consume(u), a) : (e.exit(n), t(u));
  }
}
const hl = {
  tokenize: pl
};
function pl(e) {
  const t = e.attempt(this.parser.constructs.contentInitial, r, i);
  let n;
  return t;
  function r(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), B(e, t, "linePrefix");
  }
  function i(a) {
    return e.enter("paragraph"), o(a);
  }
  function o(a) {
    const u = e.enter("chunkText", {
      contentType: "text",
      previous: n
    });
    return n && (n.next = u), n = u, l(a);
  }
  function l(a) {
    if (a === null) {
      e.exit("chunkText"), e.exit("paragraph"), e.consume(a);
      return;
    }
    return z(a) ? (e.consume(a), e.exit("chunkText"), o) : (e.consume(a), l);
  }
}
const ml = {
  tokenize: gl
}, Ct = {
  tokenize: dl
};
function gl(e) {
  const t = this, n = [];
  let r = 0, i, o, l;
  return a;
  function a(C) {
    if (r < n.length) {
      const F = n[r];
      return t.containerState = F[1], e.attempt(F[0].continuation, u, s)(C);
    }
    return s(C);
  }
  function u(C) {
    if (r++, t.containerState._closeFlow) {
      t.containerState._closeFlow = void 0, i && I();
      const F = t.events.length;
      let _ = F, b;
      for (; _--; )
        if (t.events[_][0] === "exit" && t.events[_][1].type === "chunkFlow") {
          b = t.events[_][1].end;
          break;
        }
      x(r);
      let M = F;
      for (; M < t.events.length; )
        t.events[M][1].end = {
          ...b
        }, M++;
      return ie(t.events, _ + 1, 0, t.events.slice(F)), t.events.length = M, s(C);
    }
    return a(C);
  }
  function s(C) {
    if (r === n.length) {
      if (!i)
        return p(C);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return d(C);
      t.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return t.containerState = {}, e.check(Ct, f, c)(C);
  }
  function f(C) {
    return i && I(), x(r), p(C);
  }
  function c(C) {
    return t.parser.lazy[t.now().line] = r !== n.length, l = t.now().offset, d(C);
  }
  function p(C) {
    return t.containerState = {}, e.attempt(Ct, h, d)(C);
  }
  function h(C) {
    return r++, n.push([t.currentConstruct, t.containerState]), p(C);
  }
  function d(C) {
    if (C === null) {
      i && I(), x(0), e.consume(C);
      return;
    }
    return i = i || t.parser.flow(t.now()), e.enter("chunkFlow", {
      _tokenizer: i,
      contentType: "flow",
      previous: o
    }), w(C);
  }
  function w(C) {
    if (C === null) {
      S(e.exit("chunkFlow"), !0), x(0), e.consume(C);
      return;
    }
    return z(C) ? (e.consume(C), S(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, a) : (e.consume(C), w);
  }
  function S(C, F) {
    const _ = t.sliceStream(C);
    if (F && _.push(null), C.previous = o, o && (o.next = C), o = C, i.defineSkip(C.start), i.write(_), t.parser.lazy[C.start.line]) {
      let b = i.events.length;
      for (; b--; )
        if (
          // The token starts before the line ending…
          i.events[b][1].start.offset < l && // …and either is not ended yet…
          (!i.events[b][1].end || // …or ends after it.
          i.events[b][1].end.offset > l)
        )
          return;
      const M = t.events.length;
      let H = M, j, y;
      for (; H--; )
        if (t.events[H][0] === "exit" && t.events[H][1].type === "chunkFlow") {
          if (j) {
            y = t.events[H][1].end;
            break;
          }
          j = !0;
        }
      for (x(r), b = M; b < t.events.length; )
        t.events[b][1].end = {
          ...y
        }, b++;
      ie(t.events, H + 1, 0, t.events.slice(M)), t.events.length = b;
    }
  }
  function x(C) {
    let F = n.length;
    for (; F-- > C; ) {
      const _ = n[F];
      t.containerState = _[1], _[0].exit.call(t, e);
    }
    n.length = C;
  }
  function I() {
    i.write([null]), o = void 0, i = void 0, t.containerState._closeFlow = void 0;
  }
}
function dl(e, t, n) {
  return B(e, e.attempt(this.parser.constructs.document, t, n), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function Fe(e) {
  if (e === null || V(e) || Ee(e))
    return 1;
  if (un(e))
    return 2;
}
function sn(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const o = e[i].resolveAll;
    o && !r.includes(o) && (t = o(t, n), r.push(o));
  }
  return t;
}
const Rn = {
  name: "attention",
  resolveAll: xl,
  tokenize: yl
};
function xl(e, t) {
  let n = -1, r, i, o, l, a, u, s, f;
  for (; ++n < e.length; )
    if (e[n][0] === "enter" && e[n][1].type === "attentionSequence" && e[n][1]._close) {
      for (r = n; r--; )
        if (e[r][0] === "exit" && e[r][1].type === "attentionSequence" && e[r][1]._open && // If the markers are the same:
        t.sliceSerialize(e[r][1]).charCodeAt(0) === t.sliceSerialize(e[n][1]).charCodeAt(0)) {
          if ((e[r][1]._close || e[n][1]._open) && (e[n][1].end.offset - e[n][1].start.offset) % 3 && !((e[r][1].end.offset - e[r][1].start.offset + e[n][1].end.offset - e[n][1].start.offset) % 3))
            continue;
          u = e[r][1].end.offset - e[r][1].start.offset > 1 && e[n][1].end.offset - e[n][1].start.offset > 1 ? 2 : 1;
          const c = {
            ...e[r][1].end
          }, p = {
            ...e[n][1].start
          };
          Et(c, -u), Et(p, u), l = {
            type: u > 1 ? "strongSequence" : "emphasisSequence",
            start: c,
            end: {
              ...e[r][1].end
            }
          }, a = {
            type: u > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...e[n][1].start
            },
            end: p
          }, o = {
            type: u > 1 ? "strongText" : "emphasisText",
            start: {
              ...e[r][1].end
            },
            end: {
              ...e[n][1].start
            }
          }, i = {
            type: u > 1 ? "strong" : "emphasis",
            start: {
              ...l.start
            },
            end: {
              ...a.end
            }
          }, e[r][1].end = {
            ...l.start
          }, e[n][1].start = {
            ...a.end
          }, s = [], e[r][1].end.offset - e[r][1].start.offset && (s = le(s, [["enter", e[r][1], t], ["exit", e[r][1], t]])), s = le(s, [["enter", i, t], ["enter", l, t], ["exit", l, t], ["enter", o, t]]), s = le(s, sn(t.parser.constructs.insideSpan.null, e.slice(r + 1, n), t)), s = le(s, [["exit", o, t], ["enter", a, t], ["exit", a, t], ["exit", i, t]]), e[n][1].end.offset - e[n][1].start.offset ? (f = 2, s = le(s, [["enter", e[n][1], t], ["exit", e[n][1], t]])) : f = 0, ie(e, r - 1, n - r + 3, s), n = r + s.length - f - 2;
          break;
        }
    }
  for (n = -1; ++n < e.length; )
    e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function yl(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = Fe(r);
  let o;
  return l;
  function l(u) {
    return o = u, e.enter("attentionSequence"), a(u);
  }
  function a(u) {
    if (u === o)
      return e.consume(u), a;
    const s = e.exit("attentionSequence"), f = Fe(u), c = !f || f === 2 && i || n.includes(u), p = !i || i === 2 && f || n.includes(r);
    return s._open = !!(o === 42 ? c : c && (i || !p)), s._close = !!(o === 42 ? p : p && (f || !c)), t(u);
  }
}
function Et(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const kl = {
  name: "autolink",
  tokenize: bl
};
function bl(e, t, n) {
  let r = 0;
  return i;
  function i(h) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(h), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), o;
  }
  function o(h) {
    return Z(h) ? (e.consume(h), l) : h === 64 ? n(h) : s(h);
  }
  function l(h) {
    return h === 43 || h === 45 || h === 46 || K(h) ? (r = 1, a(h)) : s(h);
  }
  function a(h) {
    return h === 58 ? (e.consume(h), r = 0, u) : (h === 43 || h === 45 || h === 46 || K(h)) && r++ < 32 ? (e.consume(h), a) : (r = 0, s(h));
  }
  function u(h) {
    return h === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(h), e.exit("autolinkMarker"), e.exit("autolink"), t) : h === null || h === 32 || h === 60 || rn(h) ? n(h) : (e.consume(h), u);
  }
  function s(h) {
    return h === 64 ? (e.consume(h), f) : sl(h) ? (e.consume(h), s) : n(h);
  }
  function f(h) {
    return K(h) ? c(h) : n(h);
  }
  function c(h) {
    return h === 46 ? (e.consume(h), r = 0, f) : h === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(h), e.exit("autolinkMarker"), e.exit("autolink"), t) : p(h);
  }
  function p(h) {
    if ((h === 45 || K(h)) && r++ < 63) {
      const d = h === 45 ? p : c;
      return e.consume(h), d;
    }
    return n(h);
  }
}
const Qe = {
  partial: !0,
  tokenize: wl
};
function wl(e, t, n) {
  return r;
  function r(o) {
    return O(o) ? B(e, i, "linePrefix")(o) : i(o);
  }
  function i(o) {
    return o === null || z(o) ? t(o) : n(o);
  }
}
const dr = {
  continuation: {
    tokenize: Cl
  },
  exit: El,
  name: "blockQuote",
  tokenize: Sl
};
function Sl(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    if (l === 62) {
      const a = r.containerState;
      return a.open || (e.enter("blockQuote", {
        _container: !0
      }), a.open = !0), e.enter("blockQuotePrefix"), e.enter("blockQuoteMarker"), e.consume(l), e.exit("blockQuoteMarker"), o;
    }
    return n(l);
  }
  function o(l) {
    return O(l) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(l), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(l));
  }
}
function Cl(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return O(l) ? B(e, o, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(l) : o(l);
  }
  function o(l) {
    return e.attempt(dr, t, n)(l);
  }
}
function El(e) {
  e.exit("blockQuote");
}
const xr = {
  name: "characterEscape",
  tokenize: Il
};
function Il(e, t, n) {
  return r;
  function r(o) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(o), e.exit("escapeMarker"), i;
  }
  function i(o) {
    return fl(o) ? (e.enter("characterEscapeValue"), e.consume(o), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(o);
  }
}
const yr = {
  name: "characterReference",
  tokenize: Al
};
function Al(e, t, n) {
  const r = this;
  let i = 0, o, l;
  return a;
  function a(c) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(c), e.exit("characterReferenceMarker"), u;
  }
  function u(c) {
    return c === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(c), e.exit("characterReferenceMarkerNumeric"), s) : (e.enter("characterReferenceValue"), o = 31, l = K, f(c));
  }
  function s(c) {
    return c === 88 || c === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(c), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), o = 6, l = cl, f) : (e.enter("characterReferenceValue"), o = 7, l = _n, f(c));
  }
  function f(c) {
    if (c === 59 && i) {
      const p = e.exit("characterReferenceValue");
      return l === K && !Xn(r.sliceSerialize(p)) ? n(c) : (e.enter("characterReferenceMarker"), e.consume(c), e.exit("characterReferenceMarker"), e.exit("characterReference"), t);
    }
    return l(c) && i++ < o ? (e.consume(c), f) : n(c);
  }
}
const It = {
  partial: !0,
  tokenize: vl
}, At = {
  concrete: !0,
  name: "codeFenced",
  tokenize: Tl
};
function Tl(e, t, n) {
  const r = this, i = {
    partial: !0,
    tokenize: _
  };
  let o = 0, l = 0, a;
  return u;
  function u(b) {
    return s(b);
  }
  function s(b) {
    const M = r.events[r.events.length - 1];
    return o = M && M[1].type === "linePrefix" ? M[2].sliceSerialize(M[1], !0).length : 0, a = b, e.enter("codeFenced"), e.enter("codeFencedFence"), e.enter("codeFencedFenceSequence"), f(b);
  }
  function f(b) {
    return b === a ? (l++, e.consume(b), f) : l < 3 ? n(b) : (e.exit("codeFencedFenceSequence"), O(b) ? B(e, c, "whitespace")(b) : c(b));
  }
  function c(b) {
    return b === null || z(b) ? (e.exit("codeFencedFence"), r.interrupt ? t(b) : e.check(It, w, F)(b)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), p(b));
  }
  function p(b) {
    return b === null || z(b) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), c(b)) : O(b) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), B(e, h, "whitespace")(b)) : b === 96 && b === a ? n(b) : (e.consume(b), p);
  }
  function h(b) {
    return b === null || z(b) ? c(b) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), d(b));
  }
  function d(b) {
    return b === null || z(b) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), c(b)) : b === 96 && b === a ? n(b) : (e.consume(b), d);
  }
  function w(b) {
    return e.attempt(i, F, S)(b);
  }
  function S(b) {
    return e.enter("lineEnding"), e.consume(b), e.exit("lineEnding"), x;
  }
  function x(b) {
    return o > 0 && O(b) ? B(e, I, "linePrefix", o + 1)(b) : I(b);
  }
  function I(b) {
    return b === null || z(b) ? e.check(It, w, F)(b) : (e.enter("codeFlowValue"), C(b));
  }
  function C(b) {
    return b === null || z(b) ? (e.exit("codeFlowValue"), I(b)) : (e.consume(b), C);
  }
  function F(b) {
    return e.exit("codeFenced"), t(b);
  }
  function _(b, M, H) {
    let j = 0;
    return y;
    function y(T) {
      return b.enter("lineEnding"), b.consume(T), b.exit("lineEnding"), v;
    }
    function v(T) {
      return b.enter("codeFencedFence"), O(T) ? B(b, P, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(T) : P(T);
    }
    function P(T) {
      return T === a ? (b.enter("codeFencedFenceSequence"), $(T)) : H(T);
    }
    function $(T) {
      return T === a ? (j++, b.consume(T), $) : j >= l ? (b.exit("codeFencedFenceSequence"), O(T) ? B(b, D, "whitespace")(T) : D(T)) : H(T);
    }
    function D(T) {
      return T === null || z(T) ? (b.exit("codeFencedFence"), M(T)) : H(T);
    }
  }
}
function vl(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return l === null ? n(l) : (e.enter("lineEnding"), e.consume(l), e.exit("lineEnding"), o);
  }
  function o(l) {
    return r.parser.lazy[r.now().line] ? n(l) : t(l);
  }
}
const dn = {
  name: "codeIndented",
  tokenize: zl
}, Pl = {
  partial: !0,
  tokenize: Dl
};
function zl(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("codeIndented"), B(e, o, "linePrefix", 5)(s);
  }
  function o(s) {
    const f = r.events[r.events.length - 1];
    return f && f[1].type === "linePrefix" && f[2].sliceSerialize(f[1], !0).length >= 4 ? l(s) : n(s);
  }
  function l(s) {
    return s === null ? u(s) : z(s) ? e.attempt(Pl, l, u)(s) : (e.enter("codeFlowValue"), a(s));
  }
  function a(s) {
    return s === null || z(s) ? (e.exit("codeFlowValue"), l(s)) : (e.consume(s), a);
  }
  function u(s) {
    return e.exit("codeIndented"), t(s);
  }
}
function Dl(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return r.parser.lazy[r.now().line] ? n(l) : z(l) ? (e.enter("lineEnding"), e.consume(l), e.exit("lineEnding"), i) : B(e, o, "linePrefix", 5)(l);
  }
  function o(l) {
    const a = r.events[r.events.length - 1];
    return a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(l) : z(l) ? i(l) : n(l);
  }
}
const Ll = {
  name: "codeText",
  previous: _l,
  resolve: Fl,
  tokenize: Rl
};
function Fl(e) {
  let t = e.length - 4, n = 3, r, i;
  if ((e[n][1].type === "lineEnding" || e[n][1].type === "space") && (e[t][1].type === "lineEnding" || e[t][1].type === "space")) {
    for (r = n; ++r < t; )
      if (e[r][1].type === "codeTextData") {
        e[n][1].type = "codeTextPadding", e[t][1].type = "codeTextPadding", n += 2, t -= 2;
        break;
      }
  }
  for (r = n - 1, t++; ++r <= t; )
    i === void 0 ? r !== t && e[r][1].type !== "lineEnding" && (i = r) : (r === t || e[r][1].type === "lineEnding") && (e[i][1].type = "codeTextData", r !== i + 2 && (e[i][1].end = e[r - 1][1].end, e.splice(i + 2, r - i - 2), t -= r - i - 2, r = i + 2), i = void 0);
  return e;
}
function _l(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function Rl(e, t, n) {
  let r = 0, i, o;
  return l;
  function l(c) {
    return e.enter("codeText"), e.enter("codeTextSequence"), a(c);
  }
  function a(c) {
    return c === 96 ? (e.consume(c), r++, a) : (e.exit("codeTextSequence"), u(c));
  }
  function u(c) {
    return c === null ? n(c) : c === 32 ? (e.enter("space"), e.consume(c), e.exit("space"), u) : c === 96 ? (o = e.enter("codeTextSequence"), i = 0, f(c)) : z(c) ? (e.enter("lineEnding"), e.consume(c), e.exit("lineEnding"), u) : (e.enter("codeTextData"), s(c));
  }
  function s(c) {
    return c === null || c === 32 || c === 96 || z(c) ? (e.exit("codeTextData"), u(c)) : (e.consume(c), s);
  }
  function f(c) {
    return c === 96 ? (e.consume(c), i++, f) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(c)) : (o.type = "codeTextData", s(c));
  }
}
class Ol {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(t) {
    this.left = t ? [...t] : [], this.right = [];
  }
  /**
   * Array access;
   * does not move the cursor.
   *
   * @param {number} index
   *   Index.
   * @return {T}
   *   Item.
   */
  get(t) {
    if (t < 0 || t >= this.left.length + this.right.length)
      throw new RangeError("Cannot access index `" + t + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    return t < this.left.length ? this.left[t] : this.right[this.right.length - t + this.left.length - 1];
  }
  /**
   * The length of the splice buffer, one greater than the largest index in the
   * array.
   */
  get length() {
    return this.left.length + this.right.length;
  }
  /**
   * Remove and return `list[0]`;
   * moves the cursor to `0`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  shift() {
    return this.setCursor(0), this.right.pop();
  }
  /**
   * Slice the buffer to get an array;
   * does not move the cursor.
   *
   * @param {number} start
   *   Start.
   * @param {number | null | undefined} [end]
   *   End (optional).
   * @returns {Array<T>}
   *   Array of items.
   */
  slice(t, n) {
    const r = n ?? Number.POSITIVE_INFINITY;
    return r < this.left.length ? this.left.slice(t, r) : t > this.left.length ? this.right.slice(this.right.length - r + this.left.length, this.right.length - t + this.left.length).reverse() : this.left.slice(t).concat(this.right.slice(this.right.length - r + this.left.length).reverse());
  }
  /**
   * Mimics the behavior of Array.prototype.splice() except for the change of
   * interface necessary to avoid segfaults when patching in very large arrays.
   *
   * This operation moves cursor is moved to `start` and results in the cursor
   * placed after any inserted items.
   *
   * @param {number} start
   *   Start;
   *   zero-based index at which to start changing the array;
   *   negative numbers count backwards from the end of the array and values
   *   that are out-of bounds are clamped to the appropriate end of the array.
   * @param {number | null | undefined} [deleteCount=0]
   *   Delete count (default: `0`);
   *   maximum number of elements to delete, starting from start.
   * @param {Array<T> | null | undefined} [items=[]]
   *   Items to include in place of the deleted items (default: `[]`).
   * @return {Array<T>}
   *   Any removed items.
   */
  splice(t, n, r) {
    const i = n || 0;
    this.setCursor(Math.trunc(t));
    const o = this.right.splice(this.right.length - i, Number.POSITIVE_INFINITY);
    return r && He(this.left, r), o.reverse();
  }
  /**
   * Remove and return the highest-numbered item in the array, so
   * `list[list.length - 1]`;
   * Moves the cursor to `length`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  pop() {
    return this.setCursor(Number.POSITIVE_INFINITY), this.left.pop();
  }
  /**
   * Inserts a single item to the high-numbered side of the array;
   * moves the cursor to `length`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  push(t) {
    this.setCursor(Number.POSITIVE_INFINITY), this.left.push(t);
  }
  /**
   * Inserts many items to the high-numbered side of the array.
   * Moves the cursor to `length`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  pushMany(t) {
    this.setCursor(Number.POSITIVE_INFINITY), He(this.left, t);
  }
  /**
   * Inserts a single item to the low-numbered side of the array;
   * Moves the cursor to `0`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  unshift(t) {
    this.setCursor(0), this.right.push(t);
  }
  /**
   * Inserts many items to the low-numbered side of the array;
   * moves the cursor to `0`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  unshiftMany(t) {
    this.setCursor(0), He(this.right, t.reverse());
  }
  /**
   * Move the cursor to a specific position in the array. Requires
   * time proportional to the distance moved.
   *
   * If `n < 0`, the cursor will end up at the beginning.
   * If `n > length`, the cursor will end up at the end.
   *
   * @param {number} n
   *   Position.
   * @return {undefined}
   *   Nothing.
   */
  setCursor(t) {
    if (!(t === this.left.length || t > this.left.length && this.right.length === 0 || t < 0 && this.left.length === 0))
      if (t < this.left.length) {
        const n = this.left.splice(t, Number.POSITIVE_INFINITY);
        He(this.right, n.reverse());
      } else {
        const n = this.right.splice(this.left.length + this.right.length - t, Number.POSITIVE_INFINITY);
        He(this.left, n.reverse());
      }
  }
}
function He(e, t) {
  let n = 0;
  if (t.length < 1e4)
    e.push(...t);
  else
    for (; n < t.length; )
      e.push(...t.slice(n, n + 1e4)), n += 1e4;
}
function kr(e) {
  const t = {};
  let n = -1, r, i, o, l, a, u, s;
  const f = new Ol(e);
  for (; ++n < f.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = f.get(n), n && r[1].type === "chunkFlow" && f.get(n - 1)[1].type === "listItemPrefix" && (u = r[1]._tokenizer.events, o = 0, o < u.length && u[o][1].type === "lineEndingBlank" && (o += 2), o < u.length && u[o][1].type === "content"))
      for (; ++o < u.length && u[o][1].type !== "content"; )
        u[o][1].type === "chunkText" && (u[o][1]._isInFirstContentOfListItem = !0, o++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, Ml(f, n)), n = t[n], s = !0);
    else if (r[1]._container) {
      for (o = n, i = void 0; o--; )
        if (l = f.get(o), l[1].type === "lineEnding" || l[1].type === "lineEndingBlank")
          l[0] === "enter" && (i && (f.get(i)[1].type = "lineEndingBlank"), l[1].type = "lineEnding", i = o);
        else if (!(l[1].type === "linePrefix" || l[1].type === "listItemIndent")) break;
      i && (r[1].end = {
        ...f.get(i)[1].start
      }, a = f.slice(i, n), a.unshift(r), f.splice(i, n - i + 1, a));
    }
  }
  return ie(e, 0, Number.POSITIVE_INFINITY, f.slice(0)), !s;
}
function Ml(e, t) {
  const n = e.get(t)[1], r = e.get(t)[2];
  let i = t - 1;
  const o = [];
  let l = n._tokenizer;
  l || (l = r.parser[n.contentType](n.start), n._contentTypeTextTrailing && (l._contentTypeTextTrailing = !0));
  const a = l.events, u = [], s = {};
  let f, c, p = -1, h = n, d = 0, w = 0;
  const S = [w];
  for (; h; ) {
    for (; e.get(++i)[1] !== h; )
      ;
    o.push(i), h._tokenizer || (f = r.sliceStream(h), h.next || f.push(null), c && l.defineSkip(h.start), h._isInFirstContentOfListItem && (l._gfmTasklistFirstContentOfListItem = !0), l.write(f), h._isInFirstContentOfListItem && (l._gfmTasklistFirstContentOfListItem = void 0)), c = h, h = h.next;
  }
  for (h = n; ++p < a.length; )
    // Find a void token that includes a break.
    a[p][0] === "exit" && a[p - 1][0] === "enter" && a[p][1].type === a[p - 1][1].type && a[p][1].start.line !== a[p][1].end.line && (w = p + 1, S.push(w), h._tokenizer = void 0, h.previous = void 0, h = h.next);
  for (l.events = [], h ? (h._tokenizer = void 0, h.previous = void 0) : S.pop(), p = S.length; p--; ) {
    const x = a.slice(S[p], S[p + 1]), I = o.pop();
    u.push([I, I + x.length - 1]), e.splice(I, 2, x);
  }
  for (u.reverse(), p = -1; ++p < u.length; )
    s[d + u[p][0]] = d + u[p][1], d += u[p][1] - u[p][0] - 1;
  return s;
}
const Nl = {
  resolve: jl,
  tokenize: Hl
}, Bl = {
  partial: !0,
  tokenize: $l
};
function jl(e) {
  return kr(e), e;
}
function Hl(e, t) {
  let n;
  return r;
  function r(a) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(a);
  }
  function i(a) {
    return a === null ? o(a) : z(a) ? e.check(Bl, l, o)(a) : (e.consume(a), i);
  }
  function o(a) {
    return e.exit("chunkContent"), e.exit("content"), t(a);
  }
  function l(a) {
    return e.consume(a), e.exit("chunkContent"), n.next = e.enter("chunkContent", {
      contentType: "content",
      previous: n
    }), n = n.next, i;
  }
}
function $l(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(l), e.exit("lineEnding"), B(e, o, "linePrefix");
  }
  function o(l) {
    if (l === null || z(l))
      return n(l);
    const a = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && a && a[1].type === "linePrefix" && a[2].sliceSerialize(a[1], !0).length >= 4 ? t(l) : e.interrupt(r.parser.constructs.flow, n, t)(l);
  }
}
function br(e, t, n, r, i, o, l, a, u) {
  const s = u || Number.POSITIVE_INFINITY;
  let f = 0;
  return c;
  function c(x) {
    return x === 60 ? (e.enter(r), e.enter(i), e.enter(o), e.consume(x), e.exit(o), p) : x === null || x === 32 || x === 41 || rn(x) ? n(x) : (e.enter(r), e.enter(l), e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), w(x));
  }
  function p(x) {
    return x === 62 ? (e.enter(o), e.consume(x), e.exit(o), e.exit(i), e.exit(r), t) : (e.enter(a), e.enter("chunkString", {
      contentType: "string"
    }), h(x));
  }
  function h(x) {
    return x === 62 ? (e.exit("chunkString"), e.exit(a), p(x)) : x === null || x === 60 || z(x) ? n(x) : (e.consume(x), x === 92 ? d : h);
  }
  function d(x) {
    return x === 60 || x === 62 || x === 92 ? (e.consume(x), h) : h(x);
  }
  function w(x) {
    return !f && (x === null || x === 41 || V(x)) ? (e.exit("chunkString"), e.exit(a), e.exit(l), e.exit(r), t(x)) : f < s && x === 40 ? (e.consume(x), f++, w) : x === 41 ? (e.consume(x), f--, w) : x === null || x === 32 || x === 40 || rn(x) ? n(x) : (e.consume(x), x === 92 ? S : w);
  }
  function S(x) {
    return x === 40 || x === 41 || x === 92 ? (e.consume(x), w) : w(x);
  }
}
function wr(e, t, n, r, i, o) {
  const l = this;
  let a = 0, u;
  return s;
  function s(h) {
    return e.enter(r), e.enter(i), e.consume(h), e.exit(i), e.enter(o), f;
  }
  function f(h) {
    return a > 999 || h === null || h === 91 || h === 93 && !u || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    h === 94 && !a && "_hiddenFootnoteSupport" in l.parser.constructs ? n(h) : h === 93 ? (e.exit(o), e.enter(i), e.consume(h), e.exit(i), e.exit(r), t) : z(h) ? (e.enter("lineEnding"), e.consume(h), e.exit("lineEnding"), f) : (e.enter("chunkString", {
      contentType: "string"
    }), c(h));
  }
  function c(h) {
    return h === null || h === 91 || h === 93 || z(h) || a++ > 999 ? (e.exit("chunkString"), f(h)) : (e.consume(h), u || (u = !O(h)), h === 92 ? p : c);
  }
  function p(h) {
    return h === 91 || h === 92 || h === 93 ? (e.consume(h), a++, c) : c(h);
  }
}
function Sr(e, t, n, r, i, o) {
  let l;
  return a;
  function a(p) {
    return p === 34 || p === 39 || p === 40 ? (e.enter(r), e.enter(i), e.consume(p), e.exit(i), l = p === 40 ? 41 : p, u) : n(p);
  }
  function u(p) {
    return p === l ? (e.enter(i), e.consume(p), e.exit(i), e.exit(r), t) : (e.enter(o), s(p));
  }
  function s(p) {
    return p === l ? (e.exit(o), u(l)) : p === null ? n(p) : z(p) ? (e.enter("lineEnding"), e.consume(p), e.exit("lineEnding"), B(e, s, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), f(p));
  }
  function f(p) {
    return p === l || p === null || z(p) ? (e.exit("chunkString"), s(p)) : (e.consume(p), p === 92 ? c : f);
  }
  function c(p) {
    return p === l || p === 92 ? (e.consume(p), f) : f(p);
  }
}
function qe(e, t) {
  let n;
  return r;
  function r(i) {
    return z(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : O(i) ? B(e, r, n ? "linePrefix" : "lineSuffix")(i) : t(i);
  }
}
const Ul = {
  name: "definition",
  tokenize: Vl
}, ql = {
  partial: !0,
  tokenize: Wl
};
function Vl(e, t, n) {
  const r = this;
  let i;
  return o;
  function o(h) {
    return e.enter("definition"), l(h);
  }
  function l(h) {
    return wr.call(
      r,
      e,
      a,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(h);
  }
  function a(h) {
    return i = ce(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), h === 58 ? (e.enter("definitionMarker"), e.consume(h), e.exit("definitionMarker"), u) : n(h);
  }
  function u(h) {
    return V(h) ? qe(e, s)(h) : s(h);
  }
  function s(h) {
    return br(
      e,
      f,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(h);
  }
  function f(h) {
    return e.attempt(ql, c, c)(h);
  }
  function c(h) {
    return O(h) ? B(e, p, "whitespace")(h) : p(h);
  }
  function p(h) {
    return h === null || z(h) ? (e.exit("definition"), r.parser.defined.push(i), t(h)) : n(h);
  }
}
function Wl(e, t, n) {
  return r;
  function r(a) {
    return V(a) ? qe(e, i)(a) : n(a);
  }
  function i(a) {
    return Sr(e, o, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(a);
  }
  function o(a) {
    return O(a) ? B(e, l, "whitespace")(a) : l(a);
  }
  function l(a) {
    return a === null || z(a) ? t(a) : n(a);
  }
}
const Yl = {
  name: "hardBreakEscape",
  tokenize: Xl
};
function Xl(e, t, n) {
  return r;
  function r(o) {
    return e.enter("hardBreakEscape"), e.consume(o), i;
  }
  function i(o) {
    return z(o) ? (e.exit("hardBreakEscape"), t(o)) : n(o);
  }
}
const Ql = {
  name: "headingAtx",
  resolve: Gl,
  tokenize: Kl
};
function Gl(e, t) {
  let n = e.length - 2, r = 3, i, o;
  return e[r][1].type === "whitespace" && (r += 2), n - 2 > r && e[n][1].type === "whitespace" && (n -= 2), e[n][1].type === "atxHeadingSequence" && (r === n - 1 || n - 4 > r && e[n - 2][1].type === "whitespace") && (n -= r + 1 === n ? 2 : 4), n > r && (i = {
    type: "atxHeadingText",
    start: e[r][1].start,
    end: e[n][1].end
  }, o = {
    type: "chunkText",
    start: e[r][1].start,
    end: e[n][1].end,
    contentType: "text"
  }, ie(e, r, n - r + 1, [["enter", i, t], ["enter", o, t], ["exit", o, t], ["exit", i, t]])), e;
}
function Kl(e, t, n) {
  let r = 0;
  return i;
  function i(f) {
    return e.enter("atxHeading"), o(f);
  }
  function o(f) {
    return e.enter("atxHeadingSequence"), l(f);
  }
  function l(f) {
    return f === 35 && r++ < 6 ? (e.consume(f), l) : f === null || V(f) ? (e.exit("atxHeadingSequence"), a(f)) : n(f);
  }
  function a(f) {
    return f === 35 ? (e.enter("atxHeadingSequence"), u(f)) : f === null || z(f) ? (e.exit("atxHeading"), t(f)) : O(f) ? B(e, a, "whitespace")(f) : (e.enter("atxHeadingText"), s(f));
  }
  function u(f) {
    return f === 35 ? (e.consume(f), u) : (e.exit("atxHeadingSequence"), a(f));
  }
  function s(f) {
    return f === null || f === 35 || V(f) ? (e.exit("atxHeadingText"), a(f)) : (e.consume(f), s);
  }
}
const Jl = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], Tt = ["pre", "script", "style", "textarea"], Zl = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: to,
  tokenize: ro
}, eo = {
  partial: !0,
  tokenize: lo
}, no = {
  partial: !0,
  tokenize: io
};
function to(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function ro(e, t, n) {
  const r = this;
  let i, o, l, a, u;
  return s;
  function s(g) {
    return f(g);
  }
  function f(g) {
    return e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(g), c;
  }
  function c(g) {
    return g === 33 ? (e.consume(g), p) : g === 47 ? (e.consume(g), o = !0, w) : g === 63 ? (e.consume(g), i = 3, r.interrupt ? t : m) : Z(g) ? (e.consume(g), l = String.fromCharCode(g), S) : n(g);
  }
  function p(g) {
    return g === 45 ? (e.consume(g), i = 2, h) : g === 91 ? (e.consume(g), i = 5, a = 0, d) : Z(g) ? (e.consume(g), i = 4, r.interrupt ? t : m) : n(g);
  }
  function h(g) {
    return g === 45 ? (e.consume(g), r.interrupt ? t : m) : n(g);
  }
  function d(g) {
    const ue = "CDATA[";
    return g === ue.charCodeAt(a++) ? (e.consume(g), a === ue.length ? r.interrupt ? t : P : d) : n(g);
  }
  function w(g) {
    return Z(g) ? (e.consume(g), l = String.fromCharCode(g), S) : n(g);
  }
  function S(g) {
    if (g === null || g === 47 || g === 62 || V(g)) {
      const ue = g === 47, we = l.toLowerCase();
      return !ue && !o && Tt.includes(we) ? (i = 1, r.interrupt ? t(g) : P(g)) : Jl.includes(l.toLowerCase()) ? (i = 6, ue ? (e.consume(g), x) : r.interrupt ? t(g) : P(g)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(g) : o ? I(g) : C(g));
    }
    return g === 45 || K(g) ? (e.consume(g), l += String.fromCharCode(g), S) : n(g);
  }
  function x(g) {
    return g === 62 ? (e.consume(g), r.interrupt ? t : P) : n(g);
  }
  function I(g) {
    return O(g) ? (e.consume(g), I) : y(g);
  }
  function C(g) {
    return g === 47 ? (e.consume(g), y) : g === 58 || g === 95 || Z(g) ? (e.consume(g), F) : O(g) ? (e.consume(g), C) : y(g);
  }
  function F(g) {
    return g === 45 || g === 46 || g === 58 || g === 95 || K(g) ? (e.consume(g), F) : _(g);
  }
  function _(g) {
    return g === 61 ? (e.consume(g), b) : O(g) ? (e.consume(g), _) : C(g);
  }
  function b(g) {
    return g === null || g === 60 || g === 61 || g === 62 || g === 96 ? n(g) : g === 34 || g === 39 ? (e.consume(g), u = g, M) : O(g) ? (e.consume(g), b) : H(g);
  }
  function M(g) {
    return g === u ? (e.consume(g), u = null, j) : g === null || z(g) ? n(g) : (e.consume(g), M);
  }
  function H(g) {
    return g === null || g === 34 || g === 39 || g === 47 || g === 60 || g === 61 || g === 62 || g === 96 || V(g) ? _(g) : (e.consume(g), H);
  }
  function j(g) {
    return g === 47 || g === 62 || O(g) ? C(g) : n(g);
  }
  function y(g) {
    return g === 62 ? (e.consume(g), v) : n(g);
  }
  function v(g) {
    return g === null || z(g) ? P(g) : O(g) ? (e.consume(g), v) : n(g);
  }
  function P(g) {
    return g === 45 && i === 2 ? (e.consume(g), U) : g === 60 && i === 1 ? (e.consume(g), Q) : g === 62 && i === 4 ? (e.consume(g), ae) : g === 63 && i === 3 ? (e.consume(g), m) : g === 93 && i === 5 ? (e.consume(g), pe) : z(g) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(eo, me, $)(g)) : g === null || z(g) ? (e.exit("htmlFlowData"), $(g)) : (e.consume(g), P);
  }
  function $(g) {
    return e.check(no, D, me)(g);
  }
  function D(g) {
    return e.enter("lineEnding"), e.consume(g), e.exit("lineEnding"), T;
  }
  function T(g) {
    return g === null || z(g) ? $(g) : (e.enter("htmlFlowData"), P(g));
  }
  function U(g) {
    return g === 45 ? (e.consume(g), m) : P(g);
  }
  function Q(g) {
    return g === 47 ? (e.consume(g), l = "", oe) : P(g);
  }
  function oe(g) {
    if (g === 62) {
      const ue = l.toLowerCase();
      return Tt.includes(ue) ? (e.consume(g), ae) : P(g);
    }
    return Z(g) && l.length < 8 ? (e.consume(g), l += String.fromCharCode(g), oe) : P(g);
  }
  function pe(g) {
    return g === 93 ? (e.consume(g), m) : P(g);
  }
  function m(g) {
    return g === 62 ? (e.consume(g), ae) : g === 45 && i === 2 ? (e.consume(g), m) : P(g);
  }
  function ae(g) {
    return g === null || z(g) ? (e.exit("htmlFlowData"), me(g)) : (e.consume(g), ae);
  }
  function me(g) {
    return e.exit("htmlFlow"), t(g);
  }
}
function io(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return z(l) ? (e.enter("lineEnding"), e.consume(l), e.exit("lineEnding"), o) : n(l);
  }
  function o(l) {
    return r.parser.lazy[r.now().line] ? n(l) : t(l);
  }
}
function lo(e, t, n) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(Qe, t, n);
  }
}
const oo = {
  name: "htmlText",
  tokenize: ao
};
function ao(e, t, n) {
  const r = this;
  let i, o, l;
  return a;
  function a(m) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(m), u;
  }
  function u(m) {
    return m === 33 ? (e.consume(m), s) : m === 47 ? (e.consume(m), _) : m === 63 ? (e.consume(m), C) : Z(m) ? (e.consume(m), H) : n(m);
  }
  function s(m) {
    return m === 45 ? (e.consume(m), f) : m === 91 ? (e.consume(m), o = 0, d) : Z(m) ? (e.consume(m), I) : n(m);
  }
  function f(m) {
    return m === 45 ? (e.consume(m), h) : n(m);
  }
  function c(m) {
    return m === null ? n(m) : m === 45 ? (e.consume(m), p) : z(m) ? (l = c, Q(m)) : (e.consume(m), c);
  }
  function p(m) {
    return m === 45 ? (e.consume(m), h) : c(m);
  }
  function h(m) {
    return m === 62 ? U(m) : m === 45 ? p(m) : c(m);
  }
  function d(m) {
    const ae = "CDATA[";
    return m === ae.charCodeAt(o++) ? (e.consume(m), o === ae.length ? w : d) : n(m);
  }
  function w(m) {
    return m === null ? n(m) : m === 93 ? (e.consume(m), S) : z(m) ? (l = w, Q(m)) : (e.consume(m), w);
  }
  function S(m) {
    return m === 93 ? (e.consume(m), x) : w(m);
  }
  function x(m) {
    return m === 62 ? U(m) : m === 93 ? (e.consume(m), x) : w(m);
  }
  function I(m) {
    return m === null || m === 62 ? U(m) : z(m) ? (l = I, Q(m)) : (e.consume(m), I);
  }
  function C(m) {
    return m === null ? n(m) : m === 63 ? (e.consume(m), F) : z(m) ? (l = C, Q(m)) : (e.consume(m), C);
  }
  function F(m) {
    return m === 62 ? U(m) : C(m);
  }
  function _(m) {
    return Z(m) ? (e.consume(m), b) : n(m);
  }
  function b(m) {
    return m === 45 || K(m) ? (e.consume(m), b) : M(m);
  }
  function M(m) {
    return z(m) ? (l = M, Q(m)) : O(m) ? (e.consume(m), M) : U(m);
  }
  function H(m) {
    return m === 45 || K(m) ? (e.consume(m), H) : m === 47 || m === 62 || V(m) ? j(m) : n(m);
  }
  function j(m) {
    return m === 47 ? (e.consume(m), U) : m === 58 || m === 95 || Z(m) ? (e.consume(m), y) : z(m) ? (l = j, Q(m)) : O(m) ? (e.consume(m), j) : U(m);
  }
  function y(m) {
    return m === 45 || m === 46 || m === 58 || m === 95 || K(m) ? (e.consume(m), y) : v(m);
  }
  function v(m) {
    return m === 61 ? (e.consume(m), P) : z(m) ? (l = v, Q(m)) : O(m) ? (e.consume(m), v) : j(m);
  }
  function P(m) {
    return m === null || m === 60 || m === 61 || m === 62 || m === 96 ? n(m) : m === 34 || m === 39 ? (e.consume(m), i = m, $) : z(m) ? (l = P, Q(m)) : O(m) ? (e.consume(m), P) : (e.consume(m), D);
  }
  function $(m) {
    return m === i ? (e.consume(m), i = void 0, T) : m === null ? n(m) : z(m) ? (l = $, Q(m)) : (e.consume(m), $);
  }
  function D(m) {
    return m === null || m === 34 || m === 39 || m === 60 || m === 61 || m === 96 ? n(m) : m === 47 || m === 62 || V(m) ? j(m) : (e.consume(m), D);
  }
  function T(m) {
    return m === 47 || m === 62 || V(m) ? j(m) : n(m);
  }
  function U(m) {
    return m === 62 ? (e.consume(m), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(m);
  }
  function Q(m) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(m), e.exit("lineEnding"), oe;
  }
  function oe(m) {
    return O(m) ? B(e, pe, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(m) : pe(m);
  }
  function pe(m) {
    return e.enter("htmlTextData"), l(m);
  }
}
const Qn = {
  name: "labelEnd",
  resolveAll: fo,
  resolveTo: ho,
  tokenize: po
}, uo = {
  tokenize: mo
}, so = {
  tokenize: go
}, co = {
  tokenize: xo
};
function fo(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.length; ) {
    const r = e[t][1];
    if (n.push(e[t]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd") {
      const i = r.type === "labelImage" ? 4 : 2;
      r.type = "data", t += i;
    }
  }
  return e.length !== n.length && ie(e, 0, e.length, n), e;
}
function ho(e, t) {
  let n = e.length, r = 0, i, o, l, a;
  for (; n--; )
    if (i = e[n][1], o) {
      if (i.type === "link" || i.type === "labelLink" && i._inactive)
        break;
      e[n][0] === "enter" && i.type === "labelLink" && (i._inactive = !0);
    } else if (l) {
      if (e[n][0] === "enter" && (i.type === "labelImage" || i.type === "labelLink") && !i._balanced && (o = n, i.type !== "labelLink")) {
        r = 2;
        break;
      }
    } else i.type === "labelEnd" && (l = n);
  const u = {
    type: e[o][1].type === "labelLink" ? "link" : "image",
    start: {
      ...e[o][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  }, s = {
    type: "label",
    start: {
      ...e[o][1].start
    },
    end: {
      ...e[l][1].end
    }
  }, f = {
    type: "labelText",
    start: {
      ...e[o + r + 2][1].end
    },
    end: {
      ...e[l - 2][1].start
    }
  };
  return a = [["enter", u, t], ["enter", s, t]], a = le(a, e.slice(o + 1, o + r + 3)), a = le(a, [["enter", f, t]]), a = le(a, sn(t.parser.constructs.insideSpan.null, e.slice(o + r + 4, l - 3), t)), a = le(a, [["exit", f, t], e[l - 2], e[l - 1], ["exit", s, t]]), a = le(a, e.slice(l + 1)), a = le(a, [["exit", u, t]]), ie(e, o, e.length, a), e;
}
function po(e, t, n) {
  const r = this;
  let i = r.events.length, o, l;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      o = r.events[i][1];
      break;
    }
  return a;
  function a(p) {
    return o ? o._inactive ? c(p) : (l = r.parser.defined.includes(ce(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(p), e.exit("labelMarker"), e.exit("labelEnd"), u) : n(p);
  }
  function u(p) {
    return p === 40 ? e.attempt(uo, f, l ? f : c)(p) : p === 91 ? e.attempt(so, f, l ? s : c)(p) : l ? f(p) : c(p);
  }
  function s(p) {
    return e.attempt(co, f, c)(p);
  }
  function f(p) {
    return t(p);
  }
  function c(p) {
    return o._balanced = !0, n(p);
  }
}
function mo(e, t, n) {
  return r;
  function r(c) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(c), e.exit("resourceMarker"), i;
  }
  function i(c) {
    return V(c) ? qe(e, o)(c) : o(c);
  }
  function o(c) {
    return c === 41 ? f(c) : br(e, l, a, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(c);
  }
  function l(c) {
    return V(c) ? qe(e, u)(c) : f(c);
  }
  function a(c) {
    return n(c);
  }
  function u(c) {
    return c === 34 || c === 39 || c === 40 ? Sr(e, s, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(c) : f(c);
  }
  function s(c) {
    return V(c) ? qe(e, f)(c) : f(c);
  }
  function f(c) {
    return c === 41 ? (e.enter("resourceMarker"), e.consume(c), e.exit("resourceMarker"), e.exit("resource"), t) : n(c);
  }
}
function go(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return wr.call(r, e, o, l, "reference", "referenceMarker", "referenceString")(a);
  }
  function o(a) {
    return r.parser.defined.includes(ce(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? t(a) : n(a);
  }
  function l(a) {
    return n(a);
  }
}
function xo(e, t, n) {
  return r;
  function r(o) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), i;
  }
  function i(o) {
    return o === 93 ? (e.enter("referenceMarker"), e.consume(o), e.exit("referenceMarker"), e.exit("reference"), t) : n(o);
  }
}
const yo = {
  name: "labelStartImage",
  resolveAll: Qn.resolveAll,
  tokenize: ko
};
function ko(e, t, n) {
  const r = this;
  return i;
  function i(a) {
    return e.enter("labelImage"), e.enter("labelImageMarker"), e.consume(a), e.exit("labelImageMarker"), o;
  }
  function o(a) {
    return a === 91 ? (e.enter("labelMarker"), e.consume(a), e.exit("labelMarker"), e.exit("labelImage"), l) : n(a);
  }
  function l(a) {
    return a === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(a) : t(a);
  }
}
const bo = {
  name: "labelStartLink",
  resolveAll: Qn.resolveAll,
  tokenize: wo
};
function wo(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(l), e.exit("labelMarker"), e.exit("labelLink"), o;
  }
  function o(l) {
    return l === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(l) : t(l);
  }
}
const xn = {
  name: "lineEnding",
  tokenize: So
};
function So(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), B(e, t, "linePrefix");
  }
}
const tn = {
  name: "thematicBreak",
  tokenize: Co
};
function Co(e, t, n) {
  let r = 0, i;
  return o;
  function o(s) {
    return e.enter("thematicBreak"), l(s);
  }
  function l(s) {
    return i = s, a(s);
  }
  function a(s) {
    return s === i ? (e.enter("thematicBreakSequence"), u(s)) : r >= 3 && (s === null || z(s)) ? (e.exit("thematicBreak"), t(s)) : n(s);
  }
  function u(s) {
    return s === i ? (e.consume(s), r++, u) : (e.exit("thematicBreakSequence"), O(s) ? B(e, a, "whitespace")(s) : a(s));
  }
}
const ee = {
  continuation: {
    tokenize: To
  },
  exit: Po,
  name: "list",
  tokenize: Ao
}, Eo = {
  partial: !0,
  tokenize: zo
}, Io = {
  partial: !0,
  tokenize: vo
};
function Ao(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let o = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, l = 0;
  return a;
  function a(h) {
    const d = r.containerState.type || (h === 42 || h === 43 || h === 45 ? "listUnordered" : "listOrdered");
    if (d === "listUnordered" ? !r.containerState.marker || h === r.containerState.marker : _n(h)) {
      if (r.containerState.type || (r.containerState.type = d, e.enter(d, {
        _container: !0
      })), d === "listUnordered")
        return e.enter("listItemPrefix"), h === 42 || h === 45 ? e.check(tn, n, s)(h) : s(h);
      if (!r.interrupt || h === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), u(h);
    }
    return n(h);
  }
  function u(h) {
    return _n(h) && ++l < 10 ? (e.consume(h), u) : (!r.interrupt || l < 2) && (r.containerState.marker ? h === r.containerState.marker : h === 41 || h === 46) ? (e.exit("listItemValue"), s(h)) : n(h);
  }
  function s(h) {
    return e.enter("listItemMarker"), e.consume(h), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || h, e.check(
      Qe,
      // Can’t be empty when interrupting.
      r.interrupt ? n : f,
      e.attempt(Eo, p, c)
    );
  }
  function f(h) {
    return r.containerState.initialBlankLine = !0, o++, p(h);
  }
  function c(h) {
    return O(h) ? (e.enter("listItemPrefixWhitespace"), e.consume(h), e.exit("listItemPrefixWhitespace"), p) : n(h);
  }
  function p(h) {
    return r.containerState.size = o + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(h);
  }
}
function To(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(Qe, i, o);
  function i(a) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, B(e, t, "listItemIndent", r.containerState.size + 1)(a);
  }
  function o(a) {
    return r.containerState.furtherBlankLines || !O(a) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, l(a)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(Io, t, l)(a));
  }
  function l(a) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, B(e, e.attempt(ee, t, n), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(a);
  }
}
function vo(e, t, n) {
  const r = this;
  return B(e, i, "listItemIndent", r.containerState.size + 1);
  function i(o) {
    const l = r.events[r.events.length - 1];
    return l && l[1].type === "listItemIndent" && l[2].sliceSerialize(l[1], !0).length === r.containerState.size ? t(o) : n(o);
  }
}
function Po(e) {
  e.exit(this.containerState.type);
}
function zo(e, t, n) {
  const r = this;
  return B(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(o) {
    const l = r.events[r.events.length - 1];
    return !O(o) && l && l[1].type === "listItemPrefixWhitespace" ? t(o) : n(o);
  }
}
const vt = {
  name: "setextUnderline",
  resolveTo: Do,
  tokenize: Lo
};
function Do(e, t) {
  let n = e.length, r, i, o;
  for (; n--; )
    if (e[n][0] === "enter") {
      if (e[n][1].type === "content") {
        r = n;
        break;
      }
      e[n][1].type === "paragraph" && (i = n);
    } else
      e[n][1].type === "content" && e.splice(n, 1), !o && e[n][1].type === "definition" && (o = n);
  const l = {
    type: "setextHeading",
    start: {
      ...e[r][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  };
  return e[i][1].type = "setextHeadingText", o ? (e.splice(i, 0, ["enter", l, t]), e.splice(o + 1, 0, ["exit", e[r][1], t]), e[r][1].end = {
    ...e[o][1].end
  }) : e[r][1] = l, e.push(["exit", l, t]), e;
}
function Lo(e, t, n) {
  const r = this;
  let i;
  return o;
  function o(s) {
    let f = r.events.length, c;
    for (; f--; )
      if (r.events[f][1].type !== "lineEnding" && r.events[f][1].type !== "linePrefix" && r.events[f][1].type !== "content") {
        c = r.events[f][1].type === "paragraph";
        break;
      }
    return !r.parser.lazy[r.now().line] && (r.interrupt || c) ? (e.enter("setextHeadingLine"), i = s, l(s)) : n(s);
  }
  function l(s) {
    return e.enter("setextHeadingLineSequence"), a(s);
  }
  function a(s) {
    return s === i ? (e.consume(s), a) : (e.exit("setextHeadingLineSequence"), O(s) ? B(e, u, "lineSuffix")(s) : u(s));
  }
  function u(s) {
    return s === null || z(s) ? (e.exit("setextHeadingLine"), t(s)) : n(s);
  }
}
const Fo = {
  tokenize: _o
};
function _o(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    Qe,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, B(e, e.attempt(this.parser.constructs.flow, i, e.attempt(Nl, i)), "linePrefix"))
  );
  return n;
  function r(o) {
    if (o === null) {
      e.consume(o);
      return;
    }
    return e.enter("lineEndingBlank"), e.consume(o), e.exit("lineEndingBlank"), t.currentConstruct = void 0, n;
  }
  function i(o) {
    if (o === null) {
      e.consume(o);
      return;
    }
    return e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), t.currentConstruct = void 0, n;
  }
}
const Ro = {
  resolveAll: Er()
}, Oo = Cr("string"), Mo = Cr("text");
function Cr(e) {
  return {
    resolveAll: Er(e === "text" ? No : void 0),
    tokenize: t
  };
  function t(n) {
    const r = this, i = this.parser.constructs[e], o = n.attempt(i, l, a);
    return l;
    function l(f) {
      return s(f) ? o(f) : a(f);
    }
    function a(f) {
      if (f === null) {
        n.consume(f);
        return;
      }
      return n.enter("data"), n.consume(f), u;
    }
    function u(f) {
      return s(f) ? (n.exit("data"), o(f)) : (n.consume(f), u);
    }
    function s(f) {
      if (f === null)
        return !0;
      const c = i[f];
      let p = -1;
      if (c)
        for (; ++p < c.length; ) {
          const h = c[p];
          if (!h.previous || h.previous.call(r, r.previous))
            return !0;
        }
      return !1;
    }
  }
}
function Er(e) {
  return t;
  function t(n, r) {
    let i = -1, o;
    for (; ++i <= n.length; )
      o === void 0 ? n[i] && n[i][1].type === "data" && (o = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== o + 2 && (n[o][1].end = n[i - 1][1].end, n.splice(o + 2, i - o - 2), i = o + 2), o = void 0);
    return e ? e(n, r) : n;
  }
}
function No(e, t) {
  let n = 0;
  for (; ++n <= e.length; )
    if ((n === e.length || e[n][1].type === "lineEnding") && e[n - 1][1].type === "data") {
      const r = e[n - 1][1], i = t.sliceStream(r);
      let o = i.length, l = -1, a = 0, u;
      for (; o--; ) {
        const s = i[o];
        if (typeof s == "string") {
          for (l = s.length; s.charCodeAt(l - 1) === 32; )
            a++, l--;
          if (l) break;
          l = -1;
        } else if (s === -2)
          u = !0, a++;
        else if (s !== -1) {
          o++;
          break;
        }
      }
      if (t._contentTypeTextTrailing && n === e.length && (a = 0), a) {
        const s = {
          type: n === e.length || u || a < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: o ? l : r.start._bufferIndex + l,
            _index: r.start._index + o,
            line: r.end.line,
            column: r.end.column - a,
            offset: r.end.offset - a
          },
          end: {
            ...r.end
          }
        };
        r.end = {
          ...s.start
        }, r.start.offset === r.end.offset ? Object.assign(r, s) : (e.splice(n, 0, ["enter", s, t], ["exit", s, t]), n += 2);
      }
      n++;
    }
  return e;
}
const Bo = {
  42: ee,
  43: ee,
  45: ee,
  48: ee,
  49: ee,
  50: ee,
  51: ee,
  52: ee,
  53: ee,
  54: ee,
  55: ee,
  56: ee,
  57: ee,
  62: dr
}, jo = {
  91: Ul
}, Ho = {
  [-2]: dn,
  [-1]: dn,
  32: dn
}, $o = {
  35: Ql,
  42: tn,
  45: [vt, tn],
  60: Zl,
  61: vt,
  95: tn,
  96: At,
  126: At
}, Uo = {
  38: yr,
  92: xr
}, qo = {
  [-5]: xn,
  [-4]: xn,
  [-3]: xn,
  33: yo,
  38: yr,
  42: Rn,
  60: [kl, oo],
  91: bo,
  92: [Yl, xr],
  93: Qn,
  95: Rn,
  96: Ll
}, Vo = {
  null: [Rn, Ro]
}, Wo = {
  null: [42, 95]
}, Yo = {
  null: []
}, Xo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: Wo,
  contentInitial: jo,
  disable: Yo,
  document: Bo,
  flow: $o,
  flowInitial: Ho,
  insideSpan: Vo,
  string: Uo,
  text: qo
}, Symbol.toStringTag, { value: "Module" }));
function Qo(e, t, n) {
  let r = {
    _bufferIndex: -1,
    _index: 0,
    line: n && n.line || 1,
    column: n && n.column || 1,
    offset: n && n.offset || 0
  };
  const i = {}, o = [];
  let l = [], a = [];
  const u = {
    attempt: M(_),
    check: M(b),
    consume: I,
    enter: C,
    exit: F,
    interrupt: M(b, {
      interrupt: !0
    })
  }, s = {
    code: null,
    containerState: {},
    defineSkip: w,
    events: [],
    now: d,
    parser: e,
    previous: null,
    sliceSerialize: p,
    sliceStream: h,
    write: c
  };
  let f = t.tokenize.call(s, u);
  return t.resolveAll && o.push(t), s;
  function c(v) {
    return l = le(l, v), S(), l[l.length - 1] !== null ? [] : (H(t, 0), s.events = sn(o, s.events, s), s.events);
  }
  function p(v, P) {
    return Ko(h(v), P);
  }
  function h(v) {
    return Go(l, v);
  }
  function d() {
    const {
      _bufferIndex: v,
      _index: P,
      line: $,
      column: D,
      offset: T
    } = r;
    return {
      _bufferIndex: v,
      _index: P,
      line: $,
      column: D,
      offset: T
    };
  }
  function w(v) {
    i[v.line] = v.column, y();
  }
  function S() {
    let v;
    for (; r._index < l.length; ) {
      const P = l[r._index];
      if (typeof P == "string")
        for (v = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === v && r._bufferIndex < P.length; )
          x(P.charCodeAt(r._bufferIndex));
      else
        x(P);
    }
  }
  function x(v) {
    f = f(v);
  }
  function I(v) {
    z(v) ? (r.line++, r.column = 1, r.offset += v === -3 ? 2 : 1, y()) : v !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    l[r._index].length && (r._bufferIndex = -1, r._index++)), s.previous = v;
  }
  function C(v, P) {
    const $ = P || {};
    return $.type = v, $.start = d(), s.events.push(["enter", $, s]), a.push($), $;
  }
  function F(v) {
    const P = a.pop();
    return P.end = d(), s.events.push(["exit", P, s]), P;
  }
  function _(v, P) {
    H(v, P.from);
  }
  function b(v, P) {
    P.restore();
  }
  function M(v, P) {
    return $;
    function $(D, T, U) {
      let Q, oe, pe, m;
      return Array.isArray(D) ? (
        /* c8 ignore next 1 */
        me(D)
      ) : "tokenize" in D ? (
        // Looks like a construct.
        me([
          /** @type {Construct} */
          D
        ])
      ) : ae(D);
      function ae(G) {
        return Oe;
        function Oe(ye) {
          const Ae = ye !== null && G[ye], Te = ye !== null && G.null, Ke = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(Ae) ? Ae : Ae ? [Ae] : [],
            ...Array.isArray(Te) ? Te : Te ? [Te] : []
          ];
          return me(Ke)(ye);
        }
      }
      function me(G) {
        return Q = G, oe = 0, G.length === 0 ? U : g(G[oe]);
      }
      function g(G) {
        return Oe;
        function Oe(ye) {
          return m = j(), pe = G, G.partial || (s.currentConstruct = G), G.name && s.parser.constructs.disable.null.includes(G.name) ? we() : G.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            P ? Object.assign(Object.create(s), P) : s,
            u,
            ue,
            we
          )(ye);
        }
      }
      function ue(G) {
        return v(pe, m), T;
      }
      function we(G) {
        return m.restore(), ++oe < Q.length ? g(Q[oe]) : U;
      }
    }
  }
  function H(v, P) {
    v.resolveAll && !o.includes(v) && o.push(v), v.resolve && ie(s.events, P, s.events.length - P, v.resolve(s.events.slice(P), s)), v.resolveTo && (s.events = v.resolveTo(s.events, s));
  }
  function j() {
    const v = d(), P = s.previous, $ = s.currentConstruct, D = s.events.length, T = Array.from(a);
    return {
      from: D,
      restore: U
    };
    function U() {
      r = v, s.previous = P, s.currentConstruct = $, s.events.length = D, a = T, y();
    }
  }
  function y() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function Go(e, t) {
  const n = t.start._index, r = t.start._bufferIndex, i = t.end._index, o = t.end._bufferIndex;
  let l;
  if (n === i)
    l = [e[n].slice(r, o)];
  else {
    if (l = e.slice(n, i), r > -1) {
      const a = l[0];
      typeof a == "string" ? l[0] = a.slice(r) : l.shift();
    }
    o > 0 && l.push(e[i].slice(0, o));
  }
  return l;
}
function Ko(e, t) {
  let n = -1;
  const r = [];
  let i;
  for (; ++n < e.length; ) {
    const o = e[n];
    let l;
    if (typeof o == "string")
      l = o;
    else switch (o) {
      case -5: {
        l = "\r";
        break;
      }
      case -4: {
        l = `
`;
        break;
      }
      case -3: {
        l = `\r
`;
        break;
      }
      case -2: {
        l = t ? " " : "	";
        break;
      }
      case -1: {
        if (!t && i) continue;
        l = " ";
        break;
      }
      default:
        l = String.fromCharCode(o);
    }
    i = o === -2, r.push(l);
  }
  return r.join("");
}
function Jo(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      mr([Xo, ...(e || {}).extensions || []])
    ),
    content: i(hl),
    defined: [],
    document: i(ml),
    flow: i(Fo),
    lazy: {},
    string: i(Oo),
    text: i(Mo)
  };
  return r;
  function i(o) {
    return l;
    function l(a) {
      return Qo(r, o, a);
    }
  }
}
function Zo(e) {
  for (; !kr(e); )
    ;
  return e;
}
const Pt = /[\0\t\n\r]/g;
function ea() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(o, l, a) {
    const u = [];
    let s, f, c, p, h;
    for (o = t + (typeof o == "string" ? o.toString() : new TextDecoder(l || void 0).decode(o)), c = 0, t = "", n && (o.charCodeAt(0) === 65279 && c++, n = void 0); c < o.length; ) {
      if (Pt.lastIndex = c, s = Pt.exec(o), p = s && s.index !== void 0 ? s.index : o.length, h = o.charCodeAt(p), !s) {
        t = o.slice(c);
        break;
      }
      if (h === 10 && c === p && r)
        u.push(-3), r = void 0;
      else
        switch (r && (u.push(-5), r = void 0), c < p && (u.push(o.slice(c, p)), e += p - c), h) {
          case 0: {
            u.push(65533), e++;
            break;
          }
          case 9: {
            for (f = Math.ceil(e / 4) * 4, u.push(-2); e++ < f; ) u.push(-1);
            break;
          }
          case 10: {
            u.push(-4), e = 1;
            break;
          }
          default:
            r = !0, e = 1;
        }
      c = p + 1;
    }
    return a && (r && u.push(-5), t && u.push(t), u.push(null)), u;
  }
}
const na = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function ta(e) {
  return e.replace(na, ra);
}
function ra(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), o = i === 120 || i === 88;
    return gr(n.slice(o ? 2 : 1), o ? 16 : 10);
  }
  return Xn(n) || e;
}
const Ir = {}.hasOwnProperty;
function ia(e, t, n) {
  return t && typeof t == "object" && (n = t, t = void 0), la(n)(Zo(Jo(n).document().write(ea()(e, t, !0))));
}
function la(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: o(ut),
      autolinkProtocol: j,
      autolinkEmail: j,
      atxHeading: o(lt),
      blockQuote: o(Te),
      characterEscape: j,
      characterReference: j,
      codeFenced: o(Ke),
      codeFencedFenceInfo: l,
      codeFencedFenceMeta: l,
      codeIndented: o(Ke, l),
      codeText: o(li, l),
      codeTextData: j,
      data: j,
      codeFlowValue: j,
      definition: o(oi),
      definitionDestinationString: l,
      definitionLabelString: l,
      definitionTitleString: l,
      emphasis: o(ai),
      hardBreakEscape: o(ot),
      hardBreakTrailing: o(ot),
      htmlFlow: o(at, l),
      htmlFlowData: j,
      htmlText: o(at, l),
      htmlTextData: j,
      image: o(ui),
      label: l,
      link: o(ut),
      listItem: o(si),
      listItemValue: p,
      listOrdered: o(st, c),
      listUnordered: o(st),
      paragraph: o(ci),
      reference: g,
      referenceString: l,
      resourceDestinationString: l,
      resourceTitleString: l,
      setextHeading: o(lt),
      strong: o(fi),
      thematicBreak: o(pi)
    },
    exit: {
      atxHeading: u(),
      atxHeadingSequence: _,
      autolink: u(),
      autolinkEmail: Ae,
      autolinkProtocol: ye,
      blockQuote: u(),
      characterEscapeValue: y,
      characterReferenceMarkerHexadecimal: we,
      characterReferenceMarkerNumeric: we,
      characterReferenceValue: G,
      characterReference: Oe,
      codeFenced: u(S),
      codeFencedFence: w,
      codeFencedFenceInfo: h,
      codeFencedFenceMeta: d,
      codeFlowValue: y,
      codeIndented: u(x),
      codeText: u(T),
      codeTextData: y,
      data: y,
      definition: u(),
      definitionDestinationString: F,
      definitionLabelString: I,
      definitionTitleString: C,
      emphasis: u(),
      hardBreakEscape: u(P),
      hardBreakTrailing: u(P),
      htmlFlow: u($),
      htmlFlowData: y,
      htmlText: u(D),
      htmlTextData: y,
      image: u(Q),
      label: pe,
      labelText: oe,
      lineEnding: v,
      link: u(U),
      listItem: u(),
      listOrdered: u(),
      listUnordered: u(),
      paragraph: u(),
      referenceString: ue,
      resourceDestinationString: m,
      resourceTitleString: ae,
      resource: me,
      setextHeading: u(H),
      setextHeadingLineSequence: M,
      setextHeadingText: b,
      strong: u(),
      thematicBreak: u()
    }
  };
  Ar(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(k) {
    let A = {
      type: "root",
      children: []
    };
    const L = {
      stack: [A],
      tokenStack: [],
      config: t,
      enter: a,
      exit: s,
      buffer: l,
      resume: f,
      data: n
    }, N = [];
    let q = -1;
    for (; ++q < k.length; )
      if (k[q][1].type === "listOrdered" || k[q][1].type === "listUnordered")
        if (k[q][0] === "enter")
          N.push(q);
        else {
          const se = N.pop();
          q = i(k, se, q);
        }
    for (q = -1; ++q < k.length; ) {
      const se = t[k[q][0]];
      Ir.call(se, k[q][1].type) && se[k[q][1].type].call(Object.assign({
        sliceSerialize: k[q][2].sliceSerialize
      }, L), k[q][1]);
    }
    if (L.tokenStack.length > 0) {
      const se = L.tokenStack[L.tokenStack.length - 1];
      (se[1] || zt).call(L, void 0, se[0]);
    }
    for (A.position = {
      start: ke(k.length > 0 ? k[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: ke(k.length > 0 ? k[k.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, q = -1; ++q < t.transforms.length; )
      A = t.transforms[q](A) || A;
    return A;
  }
  function i(k, A, L) {
    let N = A - 1, q = -1, se = !1, Se, ge, Me, Ne;
    for (; ++N <= L; ) {
      const te = k[N];
      switch (te[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          te[0] === "enter" ? q++ : q--, Ne = void 0;
          break;
        }
        case "lineEndingBlank": {
          te[0] === "enter" && (Se && !Ne && !q && !Me && (Me = N), Ne = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          Ne = void 0;
      }
      if (!q && te[0] === "enter" && te[1].type === "listItemPrefix" || q === -1 && te[0] === "exit" && (te[1].type === "listUnordered" || te[1].type === "listOrdered")) {
        if (Se) {
          let ve = N;
          for (ge = void 0; ve--; ) {
            const de = k[ve];
            if (de[1].type === "lineEnding" || de[1].type === "lineEndingBlank") {
              if (de[0] === "exit") continue;
              ge && (k[ge][1].type = "lineEndingBlank", se = !0), de[1].type = "lineEnding", ge = ve;
            } else if (!(de[1].type === "linePrefix" || de[1].type === "blockQuotePrefix" || de[1].type === "blockQuotePrefixWhitespace" || de[1].type === "blockQuoteMarker" || de[1].type === "listItemIndent")) break;
          }
          Me && (!ge || Me < ge) && (Se._spread = !0), Se.end = Object.assign({}, ge ? k[ge][1].start : te[1].end), k.splice(ge || N, 0, ["exit", Se, te[2]]), N++, L++;
        }
        if (te[1].type === "listItemPrefix") {
          const ve = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, te[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          Se = ve, k.splice(N, 0, ["enter", ve, te[2]]), N++, L++, Me = void 0, Ne = !0;
        }
      }
    }
    return k[A][1]._spread = se, L;
  }
  function o(k, A) {
    return L;
    function L(N) {
      a.call(this, k(N), N), A && A.call(this, N);
    }
  }
  function l() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function a(k, A, L) {
    this.stack[this.stack.length - 1].children.push(k), this.stack.push(k), this.tokenStack.push([A, L || void 0]), k.position = {
      start: ke(A.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function u(k) {
    return A;
    function A(L) {
      k && k.call(this, L), s.call(this, L);
    }
  }
  function s(k, A) {
    const L = this.stack.pop(), N = this.tokenStack.pop();
    if (N)
      N[0].type !== k.type && (A ? A.call(this, k, N[0]) : (N[1] || zt).call(this, k, N[0]));
    else throw new Error("Cannot close `" + k.type + "` (" + Ue({
      start: k.start,
      end: k.end
    }) + "): it’s not open");
    L.position.end = ke(k.end);
  }
  function f() {
    return Yn(this.stack.pop());
  }
  function c() {
    this.data.expectingFirstListItemValue = !0;
  }
  function p(k) {
    if (this.data.expectingFirstListItemValue) {
      const A = this.stack[this.stack.length - 2];
      A.start = Number.parseInt(this.sliceSerialize(k), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function h() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.lang = k;
  }
  function d() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.meta = k;
  }
  function w() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function S() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.value = k.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function x() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.value = k.replace(/(\r?\n|\r)$/g, "");
  }
  function I(k) {
    const A = this.resume(), L = this.stack[this.stack.length - 1];
    L.label = A, L.identifier = ce(this.sliceSerialize(k)).toLowerCase();
  }
  function C() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.title = k;
  }
  function F() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.url = k;
  }
  function _(k) {
    const A = this.stack[this.stack.length - 1];
    if (!A.depth) {
      const L = this.sliceSerialize(k).length;
      A.depth = L;
    }
  }
  function b() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function M(k) {
    const A = this.stack[this.stack.length - 1];
    A.depth = this.sliceSerialize(k).codePointAt(0) === 61 ? 1 : 2;
  }
  function H() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function j(k) {
    const L = this.stack[this.stack.length - 1].children;
    let N = L[L.length - 1];
    (!N || N.type !== "text") && (N = hi(), N.position = {
      start: ke(k.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, L.push(N)), this.stack.push(N);
  }
  function y(k) {
    const A = this.stack.pop();
    A.value += this.sliceSerialize(k), A.position.end = ke(k.end);
  }
  function v(k) {
    const A = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const L = A.children[A.children.length - 1];
      L.position.end = ke(k.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && t.canContainEols.includes(A.type) && (j.call(this, k), y.call(this, k));
  }
  function P() {
    this.data.atHardBreak = !0;
  }
  function $() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.value = k;
  }
  function D() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.value = k;
  }
  function T() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.value = k;
  }
  function U() {
    const k = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const A = this.data.referenceType || "shortcut";
      k.type += "Reference", k.referenceType = A, delete k.url, delete k.title;
    } else
      delete k.identifier, delete k.label;
    this.data.referenceType = void 0;
  }
  function Q() {
    const k = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const A = this.data.referenceType || "shortcut";
      k.type += "Reference", k.referenceType = A, delete k.url, delete k.title;
    } else
      delete k.identifier, delete k.label;
    this.data.referenceType = void 0;
  }
  function oe(k) {
    const A = this.sliceSerialize(k), L = this.stack[this.stack.length - 2];
    L.label = ta(A), L.identifier = ce(A).toLowerCase();
  }
  function pe() {
    const k = this.stack[this.stack.length - 1], A = this.resume(), L = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, L.type === "link") {
      const N = k.children;
      L.children = N;
    } else
      L.alt = A;
  }
  function m() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.url = k;
  }
  function ae() {
    const k = this.resume(), A = this.stack[this.stack.length - 1];
    A.title = k;
  }
  function me() {
    this.data.inReference = void 0;
  }
  function g() {
    this.data.referenceType = "collapsed";
  }
  function ue(k) {
    const A = this.resume(), L = this.stack[this.stack.length - 1];
    L.label = A, L.identifier = ce(this.sliceSerialize(k)).toLowerCase(), this.data.referenceType = "full";
  }
  function we(k) {
    this.data.characterReferenceType = k.type;
  }
  function G(k) {
    const A = this.sliceSerialize(k), L = this.data.characterReferenceType;
    let N;
    L ? (N = gr(A, L === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : N = Xn(A);
    const q = this.stack[this.stack.length - 1];
    q.value += N;
  }
  function Oe(k) {
    const A = this.stack.pop();
    A.position.end = ke(k.end);
  }
  function ye(k) {
    y.call(this, k);
    const A = this.stack[this.stack.length - 1];
    A.url = this.sliceSerialize(k);
  }
  function Ae(k) {
    y.call(this, k);
    const A = this.stack[this.stack.length - 1];
    A.url = "mailto:" + this.sliceSerialize(k);
  }
  function Te() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function Ke() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function li() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function oi() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function ai() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function lt() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function ot() {
    return {
      type: "break"
    };
  }
  function at() {
    return {
      type: "html",
      value: ""
    };
  }
  function ui() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function ut() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function st(k) {
    return {
      type: "list",
      ordered: k.type === "listOrdered",
      start: null,
      spread: k._spread,
      children: []
    };
  }
  function si(k) {
    return {
      type: "listItem",
      spread: k._spread,
      checked: null,
      children: []
    };
  }
  function ci() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function fi() {
    return {
      type: "strong",
      children: []
    };
  }
  function hi() {
    return {
      type: "text",
      value: ""
    };
  }
  function pi() {
    return {
      type: "thematicBreak"
    };
  }
}
function ke(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function Ar(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? Ar(e, r) : oa(e, r);
  }
}
function oa(e, t) {
  let n;
  for (n in t)
    if (Ir.call(t, n))
      switch (n) {
        case "canContainEols": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "transforms": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "enter":
        case "exit": {
          const r = t[n];
          r && Object.assign(e[n], r);
          break;
        }
      }
}
function zt(e, t) {
  throw e ? new Error("Cannot close `" + e.type + "` (" + Ue({
    start: e.start,
    end: e.end
  }) + "): a different token (`" + t.type + "`, " + Ue({
    start: t.start,
    end: t.end
  }) + ") is open") : new Error("Cannot close document, a token (`" + t.type + "`, " + Ue({
    start: t.start,
    end: t.end
  }) + ") is still open");
}
function aa(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return ia(r, {
      ...t.data("settings"),
      ...e,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      extensions: t.data("micromarkExtensions") || [],
      mdastExtensions: t.data("fromMarkdownExtensions") || []
    });
  }
}
function ua(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function sa(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function ca(e, t) {
  const n = t.value ? t.value + `
` : "", r = {}, i = t.lang ? t.lang.split(/\s+/) : [];
  i.length > 0 && (r.className = ["language-" + i[0]]);
  let o = {
    type: "element",
    tagName: "code",
    properties: r,
    children: [{ type: "text", value: n }]
  };
  return t.meta && (o.data = { meta: t.meta }), e.patch(t, o), o = e.applyData(t, o), o = { type: "element", tagName: "pre", properties: {}, children: [o] }, e.patch(t, o), o;
}
function fa(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function ha(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function pa(e, t) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", r = String(t.identifier).toUpperCase(), i = Re(r.toLowerCase()), o = e.footnoteOrder.indexOf(r);
  let l, a = e.footnoteCounts.get(r);
  a === void 0 ? (a = 0, e.footnoteOrder.push(r), l = e.footnoteOrder.length) : l = o + 1, a += 1, e.footnoteCounts.set(r, a);
  const u = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + n + "fn-" + i,
      id: n + "fnref-" + i + (a > 1 ? "-" + a : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(l) }]
  };
  e.patch(t, u);
  const s = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [u]
  };
  return e.patch(t, s), e.applyData(t, s);
}
function ma(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function ga(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
}
function Tr(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return [{ type: "text", value: "![" + t.alt + r }];
  const i = e.all(t), o = i[0];
  o && o.type === "text" ? o.value = "[" + o.value : i.unshift({ type: "text", value: "[" });
  const l = i[i.length - 1];
  return l && l.type === "text" ? l.value += r : i.push({ type: "text", value: r }), i;
}
function da(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Tr(e, t);
  const i = { src: Re(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(t, o), e.applyData(t, o);
}
function xa(e, t) {
  const n = { src: Re(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function ya(e, t) {
  const n = { type: "text", value: t.value.replace(/\r?\n|\r/g, " ") };
  e.patch(t, n);
  const r = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [n]
  };
  return e.patch(t, r), e.applyData(t, r);
}
function ka(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return Tr(e, t);
  const i = { href: Re(r.url || "") };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const o = {
    type: "element",
    tagName: "a",
    properties: i,
    children: e.all(t)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function ba(e, t) {
  const n = { href: Re(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: n,
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function wa(e, t, n) {
  const r = e.all(t), i = n ? Sa(n) : vr(t), o = {}, l = [];
  if (typeof t.checked == "boolean") {
    const f = r[0];
    let c;
    f && f.type === "element" && f.tagName === "p" ? c = f : (c = { type: "element", tagName: "p", properties: {}, children: [] }, r.unshift(c)), c.children.length > 0 && c.children.unshift({ type: "text", value: " " }), c.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: t.checked, disabled: !0 },
      children: []
    }), o.className = ["task-list-item"];
  }
  let a = -1;
  for (; ++a < r.length; ) {
    const f = r[a];
    (i || a !== 0 || f.type !== "element" || f.tagName !== "p") && l.push({ type: "text", value: `
` }), f.type === "element" && f.tagName === "p" && !i ? l.push(...f.children) : l.push(f);
  }
  const u = r[r.length - 1];
  u && (i || u.type !== "element" || u.tagName !== "p") && l.push({ type: "text", value: `
` });
  const s = { type: "element", tagName: "li", properties: o, children: l };
  return e.patch(t, s), e.applyData(t, s);
}
function Sa(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = vr(n[r]);
  }
  return t;
}
function vr(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function Ca(e, t) {
  const n = {}, r = e.all(t);
  let i = -1;
  for (typeof t.start == "number" && t.start !== 1 && (n.start = t.start); ++i < r.length; ) {
    const l = r[i];
    if (l.type === "element" && l.tagName === "li" && l.properties && Array.isArray(l.properties.className) && l.properties.className.includes("task-list-item")) {
      n.className = ["contains-task-list"];
      break;
    }
  }
  const o = {
    type: "element",
    tagName: t.ordered ? "ol" : "ul",
    properties: n,
    children: e.wrap(r, !0)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function Ea(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Ia(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function Aa(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Ta(e, t) {
  const n = e.all(t), r = n.shift(), i = [];
  if (r) {
    const l = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: e.wrap([r], !0)
    };
    e.patch(t.children[0], l), i.push(l);
  }
  if (n.length > 0) {
    const l = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: e.wrap(n, !0)
    }, a = Un(t.children[1]), u = ar(t.children[t.children.length - 1]);
    a && u && (l.position = { start: a, end: u }), i.push(l);
  }
  const o = {
    type: "element",
    tagName: "table",
    properties: {},
    children: e.wrap(i, !0)
  };
  return e.patch(t, o), e.applyData(t, o);
}
function va(e, t, n) {
  const r = n ? n.children : void 0, o = (r ? r.indexOf(t) : 1) === 0 ? "th" : "td", l = n && n.type === "table" ? n.align : void 0, a = l ? l.length : t.children.length;
  let u = -1;
  const s = [];
  for (; ++u < a; ) {
    const c = t.children[u], p = {}, h = l ? l[u] : void 0;
    h && (p.align = h);
    let d = { type: "element", tagName: o, properties: p, children: [] };
    c && (d.children = e.all(c), e.patch(c, d), d = e.applyData(c, d)), s.push(d);
  }
  const f = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(s, !0)
  };
  return e.patch(t, f), e.applyData(t, f);
}
function Pa(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const Dt = 9, Lt = 32;
function za(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const o = [];
  for (; r; )
    o.push(
      Ft(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return o.push(Ft(t.slice(i), i > 0, !1)), o.join("");
}
function Ft(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let o = e.codePointAt(r);
    for (; o === Dt || o === Lt; )
      r++, o = e.codePointAt(r);
  }
  if (n) {
    let o = e.codePointAt(i - 1);
    for (; o === Dt || o === Lt; )
      i--, o = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function Da(e, t) {
  const n = { type: "text", value: za(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function La(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const Fa = {
  blockquote: ua,
  break: sa,
  code: ca,
  delete: fa,
  emphasis: ha,
  footnoteReference: pa,
  heading: ma,
  html: ga,
  imageReference: da,
  image: xa,
  inlineCode: ya,
  linkReference: ka,
  link: ba,
  listItem: wa,
  list: Ca,
  paragraph: Ea,
  // @ts-expect-error: root is different, but hard to type.
  root: Ia,
  strong: Aa,
  table: Ta,
  tableCell: Pa,
  tableRow: va,
  text: Da,
  thematicBreak: La,
  toml: Je,
  yaml: Je,
  definition: Je,
  footnoteDefinition: Je
};
function Je() {
}
const Pr = -1, cn = 0, Ve = 1, ln = 2, Gn = 3, Kn = 4, Jn = 5, Zn = 6, zr = 7, Dr = 8, _a = typeof self == "object" ? self : globalThis, _t = (e, t) => {
  switch (e) {
    case "Function":
    case "SharedWorker":
    case "Worker":
    case "eval":
    case "setInterval":
    case "setTimeout":
      throw new TypeError("unable to deserialize " + e);
  }
  return new _a[e](t);
}, Ra = (e, t) => {
  const n = (i, o) => (e.set(o, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [o, l] = t[i];
    switch (o) {
      case cn:
      case Pr:
        return n(l, i);
      case Ve: {
        const a = n([], i);
        for (const u of l)
          a.push(r(u));
        return a;
      }
      case ln: {
        const a = n({}, i);
        for (const [u, s] of l)
          a[r(u)] = r(s);
        return a;
      }
      case Gn:
        return n(new Date(l), i);
      case Kn: {
        const { source: a, flags: u } = l;
        return n(new RegExp(a, u), i);
      }
      case Jn: {
        const a = n(/* @__PURE__ */ new Map(), i);
        for (const [u, s] of l)
          a.set(r(u), r(s));
        return a;
      }
      case Zn: {
        const a = n(/* @__PURE__ */ new Set(), i);
        for (const u of l)
          a.add(r(u));
        return a;
      }
      case zr: {
        const { name: a, message: u } = l;
        return n(_t(a, u), i);
      }
      case Dr:
        return n(BigInt(l), i);
      case "BigInt":
        return n(Object(BigInt(l)), i);
      case "ArrayBuffer":
        return n(new Uint8Array(l).buffer, l);
      case "DataView": {
        const { buffer: a } = new Uint8Array(l);
        return n(new DataView(a), l);
      }
    }
    return n(_t(o, l), i);
  };
  return r;
}, Rt = (e) => Ra(/* @__PURE__ */ new Map(), e)(0), ze = "", { toString: Oa } = {}, { keys: Ma } = Object, $e = (e) => {
  const t = typeof e;
  if (t !== "object" || !e)
    return [cn, t];
  const n = Oa.call(e).slice(8, -1);
  switch (n) {
    case "Array":
      return [Ve, ze];
    case "Object":
      return [ln, ze];
    case "Date":
      return [Gn, ze];
    case "RegExp":
      return [Kn, ze];
    case "Map":
      return [Jn, ze];
    case "Set":
      return [Zn, ze];
    case "DataView":
      return [Ve, n];
  }
  return n.includes("Array") ? [Ve, n] : n.includes("Error") ? [zr, n] : [ln, n];
}, Ze = ([e, t]) => e === cn && (t === "function" || t === "symbol"), Na = (e, t, n, r) => {
  const i = (l, a) => {
    const u = r.push(l) - 1;
    return n.set(a, u), u;
  }, o = (l) => {
    if (n.has(l))
      return n.get(l);
    let [a, u] = $e(l);
    switch (a) {
      case cn: {
        let f = l;
        switch (u) {
          case "bigint":
            a = Dr, f = l.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + u);
            f = null;
            break;
          case "undefined":
            return i([Pr], l);
        }
        return i([a, f], l);
      }
      case Ve: {
        if (u) {
          let p = l;
          return u === "DataView" ? p = new Uint8Array(l.buffer) : u === "ArrayBuffer" && (p = new Uint8Array(l)), i([u, [...p]], l);
        }
        const f = [], c = i([a, f], l);
        for (const p of l)
          f.push(o(p));
        return c;
      }
      case ln: {
        if (u)
          switch (u) {
            case "BigInt":
              return i([u, l.toString()], l);
            case "Boolean":
            case "Number":
            case "String":
              return i([u, l.valueOf()], l);
          }
        if (t && "toJSON" in l)
          return o(l.toJSON());
        const f = [], c = i([a, f], l);
        for (const p of Ma(l))
          (e || !Ze($e(l[p]))) && f.push([o(p), o(l[p])]);
        return c;
      }
      case Gn:
        return i([a, l.toISOString()], l);
      case Kn: {
        const { source: f, flags: c } = l;
        return i([a, { source: f, flags: c }], l);
      }
      case Jn: {
        const f = [], c = i([a, f], l);
        for (const [p, h] of l)
          (e || !(Ze($e(p)) || Ze($e(h)))) && f.push([o(p), o(h)]);
        return c;
      }
      case Zn: {
        const f = [], c = i([a, f], l);
        for (const p of l)
          (e || !Ze($e(p))) && f.push(o(p));
        return c;
      }
    }
    const { message: s } = l;
    return i([a, { name: u, message: s }], l);
  };
  return o;
}, Ot = (e, { json: t, lossy: n } = {}) => {
  const r = [];
  return Na(!(t || n), !!t, /* @__PURE__ */ new Map(), r)(e), r;
}, on = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, t) => t && ("json" in t || "lossy" in t) ? Rt(Ot(e, t)) : structuredClone(e)
) : (e, t) => Rt(Ot(e, t));
function Ba(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return t > 1 && n.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(t) }]
  }), n;
}
function ja(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function Ha(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", n = e.options.footnoteBackContent || Ba, r = e.options.footnoteBackLabel || ja, i = e.options.footnoteLabel || "Footnotes", o = e.options.footnoteLabelTagName || "h2", l = e.options.footnoteLabelProperties || {
    className: ["sr-only"]
  }, a = [];
  let u = -1;
  for (; ++u < e.footnoteOrder.length; ) {
    const s = e.footnoteById.get(
      e.footnoteOrder[u]
    );
    if (!s)
      continue;
    const f = e.all(s), c = String(s.identifier).toUpperCase(), p = Re(c.toLowerCase());
    let h = 0;
    const d = [], w = e.footnoteCounts.get(c);
    for (; w !== void 0 && ++h <= w; ) {
      d.length > 0 && d.push({ type: "text", value: " " });
      let I = typeof n == "string" ? n : n(u, h);
      typeof I == "string" && (I = { type: "text", value: I }), d.push({
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + t + "fnref-" + p + (h > 1 ? "-" + h : ""),
          dataFootnoteBackref: "",
          ariaLabel: typeof r == "string" ? r : r(u, h),
          className: ["data-footnote-backref"]
        },
        children: Array.isArray(I) ? I : [I]
      });
    }
    const S = f[f.length - 1];
    if (S && S.type === "element" && S.tagName === "p") {
      const I = S.children[S.children.length - 1];
      I && I.type === "text" ? I.value += " " : S.children.push({ type: "text", value: " " }), S.children.push(...d);
    } else
      f.push(...d);
    const x = {
      type: "element",
      tagName: "li",
      properties: { id: t + "fn-" + p },
      children: e.wrap(f, !0)
    };
    e.patch(s, x), a.push(x);
  }
  if (a.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: o,
          properties: {
            ...on(l),
            id: "footnote-label"
          },
          children: [{ type: "text", value: i }]
        },
        { type: "text", value: `
` },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: e.wrap(a, !0)
        },
        { type: "text", value: `
` }
      ]
    };
}
const fn = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  (function(e) {
    if (e == null)
      return Va;
    if (typeof e == "function")
      return hn(e);
    if (typeof e == "object")
      return Array.isArray(e) ? $a(e) : (
        // Cast because `ReadonlyArray` goes into the above but `isArray`
        // narrows to `Array`.
        Ua(
          /** @type {Props} */
          e
        )
      );
    if (typeof e == "string")
      return qa(e);
    throw new Error("Expected function, string, or object as test");
  })
);
function $a(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = fn(e[n]);
  return hn(r);
  function r(...i) {
    let o = -1;
    for (; ++o < t.length; )
      if (t[o].apply(this, i)) return !0;
    return !1;
  }
}
function Ua(e) {
  const t = (
    /** @type {Record<string, unknown>} */
    e
  );
  return hn(n);
  function n(r) {
    const i = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      r
    );
    let o;
    for (o in e)
      if (i[o] !== t[o]) return !1;
    return !0;
  }
}
function qa(e) {
  return hn(t);
  function t(n) {
    return n && n.type === e;
  }
}
function hn(e) {
  return t;
  function t(n, r, i) {
    return !!(Wa(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function Va() {
  return !0;
}
function Wa(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const Lr = [], Ya = !0, On = !1, Xa = "skip";
function Fr(e, t, n, r) {
  let i;
  typeof t == "function" && typeof n != "function" ? (r = n, n = t) : i = t;
  const o = fn(i), l = r ? -1 : 1;
  a(e, void 0, [])();
  function a(u, s, f) {
    const c = (
      /** @type {Record<string, unknown>} */
      u && typeof u == "object" ? u : {}
    );
    if (typeof c.type == "string") {
      const h = (
        // `hast`
        typeof c.tagName == "string" ? c.tagName : (
          // `xast`
          typeof c.name == "string" ? c.name : void 0
        )
      );
      Object.defineProperty(p, "name", {
        value: "node (" + (u.type + (h ? "<" + h + ">" : "")) + ")"
      });
    }
    return p;
    function p() {
      let h = Lr, d, w, S;
      if ((!t || o(u, s, f[f.length - 1] || void 0)) && (h = Qa(n(u, f)), h[0] === On))
        return h;
      if ("children" in u && u.children) {
        const x = (
          /** @type {UnistParent} */
          u
        );
        if (x.children && h[0] !== Xa)
          for (w = (r ? x.children.length : -1) + l, S = f.concat(x); w > -1 && w < x.children.length; ) {
            const I = x.children[w];
            if (d = a(I, w, S)(), d[0] === On)
              return d;
            w = typeof d[1] == "number" ? d[1] : w + l;
          }
      }
      return h;
    }
  }
}
function Qa(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [Ya, e] : e == null ? Lr : [e];
}
function et(e, t, n, r) {
  let i, o, l;
  typeof t == "function" && typeof n != "function" ? (o = void 0, l = t, i = n) : (o = t, l = n, i = r), Fr(e, o, a, i);
  function a(u, s) {
    const f = s[s.length - 1], c = f ? f.children.indexOf(u) : void 0;
    return l(u, c, f);
  }
}
const Mn = {}.hasOwnProperty, Ga = {};
function Ka(e, t) {
  const n = t || Ga, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), l = { ...Fa, ...n.handlers }, a = {
    all: s,
    applyData: Za,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: o,
    footnoteOrder: [],
    handlers: l,
    one: u,
    options: n,
    patch: Ja,
    wrap: nu
  };
  return et(e, function(f) {
    if (f.type === "definition" || f.type === "footnoteDefinition") {
      const c = f.type === "definition" ? r : i, p = String(f.identifier).toUpperCase();
      c.has(p) || c.set(p, f);
    }
  }), a;
  function u(f, c) {
    const p = f.type, h = a.handlers[p];
    if (Mn.call(a.handlers, p) && h)
      return h(a, f, c);
    if (a.options.passThrough && a.options.passThrough.includes(p)) {
      if ("children" in f) {
        const { children: w, ...S } = f, x = on(S);
        return x.children = a.all(f), x;
      }
      return on(f);
    }
    return (a.options.unknownHandler || eu)(a, f, c);
  }
  function s(f) {
    const c = [];
    if ("children" in f) {
      const p = f.children;
      let h = -1;
      for (; ++h < p.length; ) {
        const d = a.one(p[h], f);
        if (d) {
          if (h && p[h - 1].type === "break" && (!Array.isArray(d) && d.type === "text" && (d.value = Mt(d.value)), !Array.isArray(d) && d.type === "element")) {
            const w = d.children[0];
            w && w.type === "text" && (w.value = Mt(w.value));
          }
          Array.isArray(d) ? c.push(...d) : c.push(d);
        }
      }
    }
    return c;
  }
}
function Ja(e, t) {
  e.position && (t.position = Ni(e));
}
function Za(e, t) {
  let n = t;
  if (e && e.data) {
    const r = e.data.hName, i = e.data.hChildren, o = e.data.hProperties;
    if (typeof r == "string")
      if (n.type === "element")
        n.tagName = r;
      else {
        const l = "children" in n ? n.children : [n];
        n = { type: "element", tagName: r, properties: {}, children: l };
      }
    n.type === "element" && o && Object.assign(n.properties, on(o)), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function eu(e, t) {
  const n = t.data || {}, r = "value" in t && !(Mn.call(n, "hProperties") || Mn.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function nu(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function Mt(e) {
  let t = 0, n = e.charCodeAt(t);
  for (; n === 9 || n === 32; )
    t++, n = e.charCodeAt(t);
  return e.slice(t);
}
function Nt(e, t) {
  const n = Ka(e, t), r = n.one(e, void 0), i = Ha(n), o = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && o.children.push({ type: "text", value: `
` }, i), o;
}
function tu(e, t) {
  return e && "run" in e ? async function(n, r) {
    const i = (
      /** @type {HastRoot} */
      Nt(n, { file: r, ...t })
    );
    await e.run(i, r);
  } : function(n, r) {
    return (
      /** @type {HastRoot} */
      Nt(n, { file: r, ...e || t })
    );
  };
}
function Bt(e) {
  if (e)
    throw e;
}
var yn, jt;
function ru() {
  if (jt) return yn;
  jt = 1;
  var e = Object.prototype.hasOwnProperty, t = Object.prototype.toString, n = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = function(s) {
    return typeof Array.isArray == "function" ? Array.isArray(s) : t.call(s) === "[object Array]";
  }, o = function(s) {
    if (!s || t.call(s) !== "[object Object]")
      return !1;
    var f = e.call(s, "constructor"), c = s.constructor && s.constructor.prototype && e.call(s.constructor.prototype, "isPrototypeOf");
    if (s.constructor && !f && !c)
      return !1;
    var p;
    for (p in s)
      ;
    return typeof p > "u" || e.call(s, p);
  }, l = function(s, f) {
    n && f.name === "__proto__" ? n(s, f.name, {
      enumerable: !0,
      configurable: !0,
      value: f.newValue,
      writable: !0
    }) : s[f.name] = f.newValue;
  }, a = function(s, f) {
    if (f === "__proto__")
      if (e.call(s, f)) {
        if (r)
          return r(s, f).value;
      } else return;
    return s[f];
  };
  return yn = function u() {
    var s, f, c, p, h, d, w = arguments[0], S = 1, x = arguments.length, I = !1;
    for (typeof w == "boolean" && (I = w, w = arguments[1] || {}, S = 2), (w == null || typeof w != "object" && typeof w != "function") && (w = {}); S < x; ++S)
      if (s = arguments[S], s != null)
        for (f in s)
          c = a(w, f), p = a(s, f), w !== p && (I && p && (o(p) || (h = i(p))) ? (h ? (h = !1, d = c && i(c) ? c : []) : d = c && o(c) ? c : {}, l(w, { name: f, newValue: u(I, d, p) })) : typeof p < "u" && l(w, { name: f, newValue: p }));
    return w;
  }, yn;
}
var iu = ru();
const kn = /* @__PURE__ */ Zt(iu);
function Nn(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function lu() {
  const e = [], t = { run: n, use: r };
  return t;
  function n(...i) {
    let o = -1;
    const l = i.pop();
    if (typeof l != "function")
      throw new TypeError("Expected function as last argument, not " + l);
    a(null, ...i);
    function a(u, ...s) {
      const f = e[++o];
      let c = -1;
      if (u) {
        l(u);
        return;
      }
      for (; ++c < i.length; )
        (s[c] === null || s[c] === void 0) && (s[c] = i[c]);
      i = s, f ? ou(f, a)(...s) : l(null, ...s);
    }
  }
  function r(i) {
    if (typeof i != "function")
      throw new TypeError(
        "Expected `middelware` to be a function, not " + i
      );
    return e.push(i), t;
  }
}
function ou(e, t) {
  let n;
  return r;
  function r(...l) {
    const a = e.length > l.length;
    let u;
    a && l.push(i);
    try {
      u = e.apply(this, l);
    } catch (s) {
      const f = (
        /** @type {Error} */
        s
      );
      if (a && n)
        throw f;
      return i(f);
    }
    a || (u && u.then && typeof u.then == "function" ? u.then(o, i) : u instanceof Error ? i(u) : o(u));
  }
  function i(l, ...a) {
    n || (n = !0, t(l, ...a));
  }
  function o(l) {
    i(null, l);
  }
}
const fe = { basename: au, dirname: uu, extname: su, join: cu, sep: "/" };
function au(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  Ge(e);
  let n = 0, r = -1, i = e.length, o;
  if (t === void 0 || t.length === 0 || t.length > e.length) {
    for (; i--; )
      if (e.codePointAt(i) === 47) {
        if (o) {
          n = i + 1;
          break;
        }
      } else r < 0 && (o = !0, r = i + 1);
    return r < 0 ? "" : e.slice(n, r);
  }
  if (t === e)
    return "";
  let l = -1, a = t.length - 1;
  for (; i--; )
    if (e.codePointAt(i) === 47) {
      if (o) {
        n = i + 1;
        break;
      }
    } else
      l < 0 && (o = !0, l = i + 1), a > -1 && (e.codePointAt(i) === t.codePointAt(a--) ? a < 0 && (r = i) : (a = -1, r = l));
  return n === r ? r = l : r < 0 && (r = e.length), e.slice(n, r);
}
function uu(e) {
  if (Ge(e), e.length === 0)
    return ".";
  let t = -1, n = e.length, r;
  for (; --n; )
    if (e.codePointAt(n) === 47) {
      if (r) {
        t = n;
        break;
      }
    } else r || (r = !0);
  return t < 0 ? e.codePointAt(0) === 47 ? "/" : "." : t === 1 && e.codePointAt(0) === 47 ? "//" : e.slice(0, t);
}
function su(e) {
  Ge(e);
  let t = e.length, n = -1, r = 0, i = -1, o = 0, l;
  for (; t--; ) {
    const a = e.codePointAt(t);
    if (a === 47) {
      if (l) {
        r = t + 1;
        break;
      }
      continue;
    }
    n < 0 && (l = !0, n = t + 1), a === 46 ? i < 0 ? i = t : o !== 1 && (o = 1) : i > -1 && (o = -1);
  }
  return i < 0 || n < 0 || // We saw a non-dot character immediately before the dot.
  o === 0 || // The (right-most) trimmed path component is exactly `..`.
  o === 1 && i === n - 1 && i === r + 1 ? "" : e.slice(i, n);
}
function cu(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    Ge(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : fu(n);
}
function fu(e) {
  Ge(e);
  const t = e.codePointAt(0) === 47;
  let n = hu(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function hu(e, t) {
  let n = "", r = 0, i = -1, o = 0, l = -1, a, u;
  for (; ++l <= e.length; ) {
    if (l < e.length)
      a = e.codePointAt(l);
    else {
      if (a === 47)
        break;
      a = 47;
    }
    if (a === 47) {
      if (!(i === l - 1 || o === 1)) if (i !== l - 1 && o === 2) {
        if (n.length < 2 || r !== 2 || n.codePointAt(n.length - 1) !== 46 || n.codePointAt(n.length - 2) !== 46) {
          if (n.length > 2) {
            if (u = n.lastIndexOf("/"), u !== n.length - 1) {
              u < 0 ? (n = "", r = 0) : (n = n.slice(0, u), r = n.length - 1 - n.lastIndexOf("/")), i = l, o = 0;
              continue;
            }
          } else if (n.length > 0) {
            n = "", r = 0, i = l, o = 0;
            continue;
          }
        }
        t && (n = n.length > 0 ? n + "/.." : "..", r = 2);
      } else
        n.length > 0 ? n += "/" + e.slice(i + 1, l) : n = e.slice(i + 1, l), r = l - i - 1;
      i = l, o = 0;
    } else a === 46 && o > -1 ? o++ : o = -1;
  }
  return n;
}
function Ge(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const pu = { cwd: mu };
function mu() {
  return "/";
}
function Bn(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function gu(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!Bn(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return du(e);
}
function du(e) {
  if (e.hostname !== "") {
    const r = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    throw r.code = "ERR_INVALID_FILE_URL_HOST", r;
  }
  const t = e.pathname;
  let n = -1;
  for (; ++n < t.length; )
    if (t.codePointAt(n) === 37 && t.codePointAt(n + 1) === 50) {
      const r = t.codePointAt(n + 2);
      if (r === 70 || r === 102) {
        const i = new TypeError(
          "File URL path must not include encoded / characters"
        );
        throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
      }
    }
  return decodeURIComponent(t);
}
const bn = (
  /** @type {const} */
  [
    "history",
    "path",
    "basename",
    "stem",
    "extname",
    "dirname"
  ]
);
class _r {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Uint8Array` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(t) {
    let n;
    t ? Bn(t) ? n = { path: t } : typeof t == "string" || xu(t) ? n = { value: t } : n = t : n = {}, this.cwd = "cwd" in n ? "" : pu.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < bn.length; ) {
      const o = bn[r];
      o in n && n[o] !== void 0 && n[o] !== null && (this[o] = o === "history" ? [...n[o]] : n[o]);
    }
    let i;
    for (i in n)
      bn.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? fe.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} basename
   *   Basename.
   * @returns {undefined}
   *   Nothing.
   */
  set basename(t) {
    Sn(t, "basename"), wn(t, "basename"), this.path = fe.join(this.dirname || "", t);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? fe.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} dirname
   *   Dirname.
   * @returns {undefined}
   *   Nothing.
   */
  set dirname(t) {
    Ht(this.basename, "dirname"), this.path = fe.join(t || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? fe.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} extname
   *   Extname.
   * @returns {undefined}
   *   Nothing.
   */
  set extname(t) {
    if (wn(t, "extname"), Ht(this.dirname, "extname"), t) {
      if (t.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = fe.join(this.dirname, this.stem + (t || ""));
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   *   Path.
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {URL | string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  set path(t) {
    Bn(t) && (t = gu(t)), Sn(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? fe.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} stem
   *   Stem.
   * @returns {undefined}
   *   Nothing.
   */
  set stem(t) {
    Sn(t, "stem"), wn(t, "stem"), this.path = fe.join(this.dirname || "", t + (this.extname || ""));
  }
  // Normal prototypal methods.
  /**
   * Create a fatal message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `true` (error; file not usable)
   * and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Never.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(t, n, r) {
    const i = this.message(t, n, r);
    throw i.fatal = !0, i;
  }
  /**
   * Create an info message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `undefined` (info; change
   * likely not needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(t, n, r) {
    const i = this.message(t, n, r);
    return i.fatal = void 0, i;
  }
  /**
   * Create a message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `false` (warning; change may be
   * needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(t, n, r) {
    const i = new J(
      // @ts-expect-error: the overloads are fine.
      t,
      n,
      r
    );
    return this.path && (i.name = this.path + ":" + i.name, i.file = this.path), i.fatal = !1, this.messages.push(i), i;
  }
  /**
   * Serialize the file.
   *
   * > **Note**: which encodings are supported depends on the engine.
   * > For info on Node.js, see:
   * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
   *
   * @param {string | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Uint8Array`
   *   (default: `'utf-8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(t) {
    return this.value === void 0 ? "" : typeof this.value == "string" ? this.value : new TextDecoder(t || void 0).decode(this.value);
  }
}
function wn(e, t) {
  if (e && e.includes(fe.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + fe.sep + "`"
    );
}
function Sn(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function Ht(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function xu(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const yu = (
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  /** @type {unknown} */
  /**
   * @this {Function}
   * @param {string | symbol} property
   * @returns {(...parameters: Array<unknown>) => unknown}
   */
  (function(e) {
    const r = (
      /** @type {Record<string | symbol, Function>} */
      // Prototypes do exist.
      // type-coverage:ignore-next-line
      this.constructor.prototype
    ), i = r[e], o = function() {
      return i.apply(o, arguments);
    };
    return Object.setPrototypeOf(o, r), o;
  })
), ku = {}.hasOwnProperty;
class nt extends yu {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = lu();
  }
  /**
   * Copy a processor.
   *
   * @deprecated
   *   This is a private internal method and should not be used.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   New *unfrozen* processor ({@linkcode Processor}) that is
   *   configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  copy() {
    const t = (
      /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
      new nt()
    );
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return t.data(kn(!0, {}, this.namespace)), t;
  }
  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * > **Note**: to register custom data in TypeScript, augment the
   * > {@linkcode Data} interface.
   *
   * @example
   *   This example show how to get and set info:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   const processor = unified().data('alpha', 'bravo')
   *
   *   processor.data('alpha') // => 'bravo'
   *
   *   processor.data() // => {alpha: 'bravo'}
   *
   *   processor.data({charlie: 'delta'})
   *
   *   processor.data() // => {charlie: 'delta'}
   *   ```
   *
   * @template {keyof Data} Key
   *
   * @overload
   * @returns {Data}
   *
   * @overload
   * @param {Data} dataset
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Key} key
   * @returns {Data[Key]}
   *
   * @overload
   * @param {Key} key
   * @param {Data[Key]} value
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @param {Data | Key} [key]
   *   Key to get or set, or entire dataset to set, or nothing to get the
   *   entire dataset (optional).
   * @param {Data[Key]} [value]
   *   Value to set (optional).
   * @returns {unknown}
   *   The current processor when setting, the value at `key` when getting, or
   *   the entire dataset when getting without key.
   */
  data(t, n) {
    return typeof t == "string" ? arguments.length === 2 ? (In("data", this.frozen), this.namespace[t] = n, this) : ku.call(this.namespace, t) && this.namespace[t] || void 0 : t ? (In("data", this.frozen), this.namespace = t, this) : this.namespace;
  }
  /**
   * Freeze a processor.
   *
   * Frozen processors are meant to be extended and not to be configured
   * directly.
   *
   * When a processor is frozen it cannot be unfrozen.
   * New processors working the same way can be created by calling the
   * processor.
   *
   * It’s possible to freeze processors explicitly by calling `.freeze()`.
   * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
   * `.stringify()`, `.process()`, or `.processSync()` are called.
   *
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   The current processor.
   */
  freeze() {
    if (this.frozen)
      return this;
    const t = (
      /** @type {Processor} */
      /** @type {unknown} */
      this
    );
    for (; ++this.freezeIndex < this.attachers.length; ) {
      const [n, ...r] = this.attachers[this.freezeIndex];
      if (r[0] === !1)
        continue;
      r[0] === !0 && (r[0] = void 0);
      const i = n.call(t, ...r);
      typeof i == "function" && this.transformers.use(i);
    }
    return this.frozen = !0, this.freezeIndex = Number.POSITIVE_INFINITY, this;
  }
  /**
   * Parse text to a syntax tree.
   *
   * > **Note**: `parse` freezes the processor if not already *frozen*.
   *
   * > **Note**: `parse` performs the parse phase, not the run phase or other
   * > phases.
   *
   * @param {Compatible | undefined} [file]
   *   file to parse (optional); typically `string` or `VFile`; any value
   *   accepted as `x` in `new VFile(x)`.
   * @returns {ParseTree extends undefined ? Node : ParseTree}
   *   Syntax tree representing `file`.
   */
  parse(t) {
    this.freeze();
    const n = en(t), r = this.parser || this.Parser;
    return Cn("parse", r), r(String(n), n);
  }
  /**
   * Process the given file as configured on the processor.
   *
   * > **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @overload
   * @param {Compatible | undefined} file
   * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
   * @returns {undefined}
   *
   * @overload
   * @param {Compatible | undefined} [file]
   * @returns {Promise<VFileWithOutput<CompileResult>>}
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`]; any value accepted as
   *   `x` in `new VFile(x)`.
   * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
   *   Callback (optional).
   * @returns {Promise<VFile> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise a promise, rejected with a fatal error or resolved with the
   *   processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  process(t, n) {
    const r = this;
    return this.freeze(), Cn("process", this.parser || this.Parser), En("process", this.compiler || this.Compiler), n ? i(void 0, n) : new Promise(i);
    function i(o, l) {
      const a = en(t), u = (
        /** @type {HeadTree extends undefined ? Node : HeadTree} */
        /** @type {unknown} */
        r.parse(a)
      );
      r.run(u, a, function(f, c, p) {
        if (f || !c || !p)
          return s(f);
        const h = (
          /** @type {CompileTree extends undefined ? Node : CompileTree} */
          /** @type {unknown} */
          c
        ), d = r.stringify(h, p);
        Su(d) ? p.value = d : p.result = d, s(
          f,
          /** @type {VFileWithOutput<CompileResult>} */
          p
        );
      });
      function s(f, c) {
        f || !c ? l(f) : o ? o(c) : n(void 0, c);
      }
    }
  }
  /**
   * Process the given file as configured on the processor.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `processSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `processSync` performs the parse, run, and stringify phases.
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`; any value accepted as
   *   `x` in `new VFile(x)`.
   * @returns {VFileWithOutput<CompileResult>}
   *   The processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  processSync(t) {
    let n = !1, r;
    return this.freeze(), Cn("processSync", this.parser || this.Parser), En("processSync", this.compiler || this.Compiler), this.process(t, i), Ut("processSync", "process", n), r;
    function i(o, l) {
      n = !0, Bt(o), r = l;
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * > **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > **Note**: `run` performs the run phase, not other phases.
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} file
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} [file]
   * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {(
   *   RunCallback<TailTree extends undefined ? Node : TailTree> |
   *   Compatible
   * )} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
   *   Callback (optional).
   * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise, a promise rejected with a fatal error or resolved with the
   *   transformed tree.
   */
  run(t, n, r) {
    $t(t), this.freeze();
    const i = this.transformers;
    return !r && typeof n == "function" && (r = n, n = void 0), r ? o(void 0, r) : new Promise(o);
    function o(l, a) {
      const u = en(n);
      i.run(t, u, s);
      function s(f, c, p) {
        const h = (
          /** @type {TailTree extends undefined ? Node : TailTree} */
          c || t
        );
        f ? a(f) : l ? l(h) : r(void 0, h, p);
      }
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `runSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `runSync` performs the run phase, not other phases.
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {TailTree extends undefined ? Node : TailTree}
   *   Transformed tree.
   */
  runSync(t, n) {
    let r = !1, i;
    return this.run(t, n, o), Ut("runSync", "run", r), i;
    function o(l, a) {
      Bt(l), i = a, r = !0;
    }
  }
  /**
   * Compile a syntax tree.
   *
   * > **Note**: `stringify` freezes the processor if not already *frozen*.
   *
   * > **Note**: `stringify` performs the stringify phase, not the run phase
   * > or other phases.
   *
   * @param {CompileTree extends undefined ? Node : CompileTree} tree
   *   Tree to compile.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {CompileResult extends undefined ? Value : CompileResult}
   *   Textual representation of the tree (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most compilers
   *   > return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  stringify(t, n) {
    this.freeze();
    const r = en(n), i = this.compiler || this.Compiler;
    return En("stringify", i), $t(t), i(t, r);
  }
  /**
   * Configure the processor to use a plugin, a list of usable values, or a
   * preset.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * > **Note**: `use` cannot be called on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @example
   *   There are many ways to pass plugins to `.use()`.
   *   This example gives an overview:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use(pluginA, {x: true, y: true})
   *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
   *     .use(pluginA, {y: false, z: true})
   *     // Plugins:
   *     .use([pluginB, pluginC])
   *     // Two plugins, the second with options:
   *     .use([pluginD, [pluginE, {}]])
   *     // Preset with plugins and settings:
   *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
   *     // Settings only:
   *     .use({settings: {position: false}})
   *   ```
   *
   * @template {Array<unknown>} [Parameters=[]]
   * @template {Node | string | undefined} [Input=undefined]
   * @template [Output=Input]
   *
   * @overload
   * @param {Preset | null | undefined} [preset]
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {PluggableList} list
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Plugin<Parameters, Input, Output>} plugin
   * @param {...(Parameters | [boolean])} parameters
   * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
   *
   * @param {PluggableList | Plugin | Preset | null | undefined} value
   *   Usable value.
   * @param {...unknown} parameters
   *   Parameters, when a plugin is given as a usable value.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   Current processor.
   */
  use(t, ...n) {
    const r = this.attachers, i = this.namespace;
    if (In("use", this.frozen), t != null) if (typeof t == "function")
      u(t, n);
    else if (typeof t == "object")
      Array.isArray(t) ? a(t) : l(t);
    else
      throw new TypeError("Expected usable value, not `" + t + "`");
    return this;
    function o(s) {
      if (typeof s == "function")
        u(s, []);
      else if (typeof s == "object")
        if (Array.isArray(s)) {
          const [f, ...c] = (
            /** @type {PluginTuple<Array<unknown>>} */
            s
          );
          u(f, c);
        } else
          l(s);
      else
        throw new TypeError("Expected usable value, not `" + s + "`");
    }
    function l(s) {
      if (!("plugins" in s) && !("settings" in s))
        throw new Error(
          "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
        );
      a(s.plugins), s.settings && (i.settings = kn(!0, i.settings, s.settings));
    }
    function a(s) {
      let f = -1;
      if (s != null) if (Array.isArray(s))
        for (; ++f < s.length; ) {
          const c = s[f];
          o(c);
        }
      else
        throw new TypeError("Expected a list of plugins, not `" + s + "`");
    }
    function u(s, f) {
      let c = -1, p = -1;
      for (; ++c < r.length; )
        if (r[c][0] === s) {
          p = c;
          break;
        }
      if (p === -1)
        r.push([s, ...f]);
      else if (f.length > 0) {
        let [h, ...d] = f;
        const w = r[p][1];
        Nn(w) && Nn(h) && (h = kn(!0, w, h)), r[p] = [s, h, ...d];
      }
    }
  }
}
const bu = new nt().freeze();
function Cn(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function En(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function In(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function $t(e) {
  if (!Nn(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function Ut(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function en(e) {
  return wu(e) ? e : new _r(e);
}
function wu(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function Su(e) {
  return typeof e == "string" || Cu(e);
}
function Cu(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const Eu = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", qt = [], Vt = { allowDangerousHtml: !0 }, Iu = /^(https?|ircs?|mailto|xmpp)$/i, Au = [
  { from: "astPlugins", id: "remove-buggy-html-in-markdown-parser" },
  { from: "allowDangerousHtml", id: "remove-buggy-html-in-markdown-parser" },
  {
    from: "allowNode",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowElement"
  },
  {
    from: "allowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowedElements"
  },
  { from: "className", id: "remove-classname" },
  {
    from: "disallowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "disallowedElements"
  },
  { from: "escapeHtml", id: "remove-buggy-html-in-markdown-parser" },
  { from: "includeElementIndex", id: "#remove-includeelementindex" },
  {
    from: "includeNodeIndex",
    id: "change-includenodeindex-to-includeelementindex"
  },
  { from: "linkTarget", id: "remove-linktarget" },
  { from: "plugins", id: "change-plugins-to-remarkplugins", to: "remarkPlugins" },
  { from: "rawSourcePos", id: "#remove-rawsourcepos" },
  { from: "renderers", id: "change-renderers-to-components", to: "components" },
  { from: "source", id: "change-source-to-children", to: "children" },
  { from: "sourcePos", id: "#remove-sourcepos" },
  { from: "transformImageUri", id: "#add-urltransform", to: "urlTransform" },
  { from: "transformLinkUri", id: "#add-urltransform", to: "urlTransform" }
];
function Tu(e) {
  const t = vu(e), n = Pu(e);
  return zu(t.runSync(t.parse(n), n), e);
}
function vu(e) {
  const t = e.rehypePlugins || qt, n = e.remarkPlugins || qt, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...Vt } : Vt;
  return bu().use(aa).use(n).use(tu, r).use(t);
}
function Pu(e) {
  const t = e.children || "", n = new _r();
  return typeof t == "string" && (n.value = t), n;
}
function zu(e, t) {
  const n = t.allowedElements, r = t.allowElement, i = t.components, o = t.disallowedElements, l = t.skipHtml, a = t.unwrapDisallowed, u = t.urlTransform || Du;
  for (const f of Au)
    Object.hasOwn(t, f.from) && ("" + f.from + (f.to ? "use `" + f.to + "` instead" : "remove it") + Eu + f.id, void 0);
  return et(e, s), Ui(e, {
    Fragment: W.Fragment,
    components: i,
    ignoreInvalidStyle: !0,
    jsx: W.jsx,
    jsxs: W.jsxs,
    passKeys: !0,
    passNode: !0
  });
  function s(f, c, p) {
    if (f.type === "raw" && p && typeof c == "number")
      return l ? p.children.splice(c, 1) : p.children[c] = { type: "text", value: f.value }, c;
    if (f.type === "element") {
      let h;
      for (h in gn)
        if (Object.hasOwn(gn, h) && Object.hasOwn(f.properties, h)) {
          const d = f.properties[h], w = gn[h];
          (w === null || w.includes(f.tagName)) && (f.properties[h] = u(String(d || ""), h, f));
        }
    }
    if (f.type === "element") {
      let h = n ? !n.includes(f.tagName) : o ? o.includes(f.tagName) : !1;
      if (!h && r && typeof c == "number" && (h = !r(f, c, p)), h && p && typeof c == "number")
        return a && f.children ? p.children.splice(c, 1, ...f.children) : p.children.splice(c, 1), c;
    }
  }
}
function Du(e) {
  const t = e.indexOf(":"), n = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    t === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && t > i || n !== -1 && t > n || r !== -1 && t > r || // It is a protocol, it should be allowed.
    Iu.test(e.slice(0, t)) ? e : ""
  );
}
function Wt(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
function Lu(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function Fu(e, t, n) {
  const i = fn((n || {}).ignore || []), o = _u(t);
  let l = -1;
  for (; ++l < o.length; )
    Fr(e, "text", a);
  function a(s, f) {
    let c = -1, p;
    for (; ++c < f.length; ) {
      const h = f[c], d = p ? p.children : void 0;
      if (i(
        h,
        d ? d.indexOf(h) : void 0,
        p
      ))
        return;
      p = h;
    }
    if (p)
      return u(s, f);
  }
  function u(s, f) {
    const c = f[f.length - 1], p = o[l][0], h = o[l][1];
    let d = 0;
    const S = c.children.indexOf(s);
    let x = !1, I = [];
    p.lastIndex = 0;
    let C = p.exec(s.value);
    for (; C; ) {
      const F = C.index, _ = {
        index: C.index,
        input: C.input,
        stack: [...f, s]
      };
      let b = h(...C, _);
      if (typeof b == "string" && (b = b.length > 0 ? { type: "text", value: b } : void 0), b === !1 ? p.lastIndex = F + 1 : (d !== F && I.push({
        type: "text",
        value: s.value.slice(d, F)
      }), Array.isArray(b) ? I.push(...b) : b && I.push(b), d = F + C[0].length, x = !0), !p.global)
        break;
      C = p.exec(s.value);
    }
    return x ? (d < s.value.length && I.push({ type: "text", value: s.value.slice(d) }), c.children.splice(S, 1, ...I)) : I = [s], S + I.length;
  }
}
function _u(e) {
  const t = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const n = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    t.push([Ru(i[0]), Ou(i[1])]);
  }
  return t;
}
function Ru(e) {
  return typeof e == "string" ? new RegExp(Lu(e), "g") : e;
}
function Ou(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const An = "phrasing", Tn = ["autolink", "link", "image", "label"];
function Mu() {
  return {
    transforms: [qu],
    enter: {
      literalAutolink: Bu,
      literalAutolinkEmail: vn,
      literalAutolinkHttp: vn,
      literalAutolinkWww: vn
    },
    exit: {
      literalAutolink: Uu,
      literalAutolinkEmail: $u,
      literalAutolinkHttp: ju,
      literalAutolinkWww: Hu
    }
  };
}
function Nu() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: An,
        notInConstruct: Tn
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: An,
        notInConstruct: Tn
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: An,
        notInConstruct: Tn
      }
    ]
  };
}
function Bu(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function vn(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function ju(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function Hu(e) {
  this.config.exit.data.call(this, e);
  const t = this.stack[this.stack.length - 1];
  t.type, t.url = "http://" + this.sliceSerialize(e);
}
function $u(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function Uu(e) {
  this.exit(e);
}
function qu(e) {
  Fu(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, Vu],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), Wu]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function Vu(e, t, n, r, i) {
  let o = "";
  if (!Rr(i) || (/^w/i.test(t) && (n = t + n, t = "", o = "http://"), !Yu(n)))
    return !1;
  const l = Xu(n + r);
  if (!l[0]) return !1;
  const a = {
    type: "link",
    title: null,
    url: o + t + l[0],
    children: [{ type: "text", value: t + l[0] }]
  };
  return l[1] ? [a, { type: "text", value: l[1] }] : a;
}
function Wu(e, t, n, r) {
  return (
    // Not an expected previous character.
    !Rr(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(n) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + t + "@" + n,
      children: [{ type: "text", value: t + "@" + n }]
    }
  );
}
function Yu(e) {
  const t = e.split(".");
  return !(t.length < 2 || t[t.length - 1] && (/_/.test(t[t.length - 1]) || !/[a-zA-Z\d]/.test(t[t.length - 1])) || t[t.length - 2] && (/_/.test(t[t.length - 2]) || !/[a-zA-Z\d]/.test(t[t.length - 2])));
}
function Xu(e) {
  const t = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!t)
    return [e, void 0];
  e = e.slice(0, t.index);
  let n = t[0], r = n.indexOf(")");
  const i = Wt(e, "(");
  let o = Wt(e, ")");
  for (; r !== -1 && i > o; )
    e += n.slice(0, r + 1), n = n.slice(r + 1), r = n.indexOf(")"), o++;
  return [e, n];
}
function Rr(e, t) {
  const n = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || Ee(n) || un(n)) && // If it’s an email, the previous character should not be a slash.
  (!t || n !== 47);
}
Or.peek = rs;
function Qu() {
  this.buffer();
}
function Gu(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function Ku() {
  this.buffer();
}
function Ju(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function Zu(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = ce(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function es(e) {
  this.exit(e);
}
function ns(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = ce(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function ts(e) {
  this.exit(e);
}
function rs() {
  return "[";
}
function Or(e, t, n, r) {
  const i = n.createTracker(r);
  let o = i.move("[^");
  const l = n.enter("footnoteReference"), a = n.enter("reference");
  return o += i.move(
    n.safe(n.associationId(e), { after: "]", before: o })
  ), a(), l(), o += i.move("]"), o;
}
function is() {
  return {
    enter: {
      gfmFootnoteCallString: Qu,
      gfmFootnoteCall: Gu,
      gfmFootnoteDefinitionLabelString: Ku,
      gfmFootnoteDefinition: Ju
    },
    exit: {
      gfmFootnoteCallString: Zu,
      gfmFootnoteCall: es,
      gfmFootnoteDefinitionLabelString: ns,
      gfmFootnoteDefinition: ts
    }
  };
}
function ls(e) {
  let t = !1;
  return e && e.firstLineBlank && (t = !0), {
    handlers: { footnoteDefinition: n, footnoteReference: Or },
    // This is on by default already.
    unsafe: [{ character: "[", inConstruct: ["label", "phrasing", "reference"] }]
  };
  function n(r, i, o, l) {
    const a = o.createTracker(l);
    let u = a.move("[^");
    const s = o.enter("footnoteDefinition"), f = o.enter("label");
    return u += a.move(
      o.safe(o.associationId(r), { before: u, after: "]" })
    ), f(), u += a.move("]:"), r.children && r.children.length > 0 && (a.shift(4), u += a.move(
      (t ? `
` : " ") + o.indentLines(
        o.containerFlow(r, a.current()),
        t ? Mr : os
      )
    )), s(), u;
  }
}
function os(e, t, n) {
  return t === 0 ? e : Mr(e, t, n);
}
function Mr(e, t, n) {
  return (n ? "" : "    ") + e;
}
const as = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
Nr.peek = hs;
function us() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: cs },
    exit: { strikethrough: fs }
  };
}
function ss() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: as
      }
    ],
    handlers: { delete: Nr }
  };
}
function cs(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function fs(e) {
  this.exit(e);
}
function Nr(e, t, n, r) {
  const i = n.createTracker(r), o = n.enter("strikethrough");
  let l = i.move("~~");
  return l += n.containerPhrasing(e, {
    ...i.current(),
    before: l,
    after: "~"
  }), l += i.move("~~"), o(), l;
}
function hs() {
  return "~";
}
function ps(e) {
  return e.length;
}
function ms(e, t) {
  const n = t || {}, r = (n.align || []).concat(), i = n.stringLength || ps, o = [], l = [], a = [], u = [];
  let s = 0, f = -1;
  for (; ++f < e.length; ) {
    const w = [], S = [];
    let x = -1;
    for (e[f].length > s && (s = e[f].length); ++x < e[f].length; ) {
      const I = gs(e[f][x]);
      if (n.alignDelimiters !== !1) {
        const C = i(I);
        S[x] = C, (u[x] === void 0 || C > u[x]) && (u[x] = C);
      }
      w.push(I);
    }
    l[f] = w, a[f] = S;
  }
  let c = -1;
  if (typeof r == "object" && "length" in r)
    for (; ++c < s; )
      o[c] = Yt(r[c]);
  else {
    const w = Yt(r);
    for (; ++c < s; )
      o[c] = w;
  }
  c = -1;
  const p = [], h = [];
  for (; ++c < s; ) {
    const w = o[c];
    let S = "", x = "";
    w === 99 ? (S = ":", x = ":") : w === 108 ? S = ":" : w === 114 && (x = ":");
    let I = n.alignDelimiters === !1 ? 1 : Math.max(
      1,
      u[c] - S.length - x.length
    );
    const C = S + "-".repeat(I) + x;
    n.alignDelimiters !== !1 && (I = S.length + I + x.length, I > u[c] && (u[c] = I), h[c] = I), p[c] = C;
  }
  l.splice(1, 0, p), a.splice(1, 0, h), f = -1;
  const d = [];
  for (; ++f < l.length; ) {
    const w = l[f], S = a[f];
    c = -1;
    const x = [];
    for (; ++c < s; ) {
      const I = w[c] || "";
      let C = "", F = "";
      if (n.alignDelimiters !== !1) {
        const _ = u[c] - (S[c] || 0), b = o[c];
        b === 114 ? C = " ".repeat(_) : b === 99 ? _ % 2 ? (C = " ".repeat(_ / 2 + 0.5), F = " ".repeat(_ / 2 - 0.5)) : (C = " ".repeat(_ / 2), F = C) : F = " ".repeat(_);
      }
      n.delimiterStart !== !1 && !c && x.push("|"), n.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(n.alignDelimiters === !1 && I === "") && (n.delimiterStart !== !1 || c) && x.push(" "), n.alignDelimiters !== !1 && x.push(C), x.push(I), n.alignDelimiters !== !1 && x.push(F), n.padding !== !1 && x.push(" "), (n.delimiterEnd !== !1 || c !== s - 1) && x.push("|");
    }
    d.push(
      n.delimiterEnd === !1 ? x.join("").replace(/ +$/, "") : x.join("")
    );
  }
  return d.join(`
`);
}
function gs(e) {
  return e == null ? "" : String(e);
}
function Yt(e) {
  const t = typeof e == "string" ? e.codePointAt(0) : 0;
  return t === 67 || t === 99 ? 99 : t === 76 || t === 108 ? 108 : t === 82 || t === 114 ? 114 : 0;
}
function ds(e, t, n, r) {
  const i = n.enter("blockquote"), o = n.createTracker(r);
  o.move("> "), o.shift(2);
  const l = n.indentLines(
    n.containerFlow(e, o.current()),
    xs
  );
  return i(), l;
}
function xs(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function ys(e, t) {
  return Xt(e, t.inConstruct, !0) && !Xt(e, t.notInConstruct, !1);
}
function Xt(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function Qt(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && ys(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function ks(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, o = 0, l = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++o > l && (l = o) : o = 1, i = r + t.length, r = n.indexOf(t, i);
  return l;
}
function bs(e, t) {
  return !!(t.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function ws(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function Ss(e, t, n, r) {
  const i = ws(n), o = e.value || "", l = i === "`" ? "GraveAccent" : "Tilde";
  if (bs(e, n)) {
    const c = n.enter("codeIndented"), p = n.indentLines(o, Cs);
    return c(), p;
  }
  const a = n.createTracker(r), u = i.repeat(Math.max(ks(o, i) + 1, 3)), s = n.enter("codeFenced");
  let f = a.move(u);
  if (e.lang) {
    const c = n.enter(`codeFencedLang${l}`);
    f += a.move(
      n.safe(e.lang, {
        before: f,
        after: " ",
        encode: ["`"],
        ...a.current()
      })
    ), c();
  }
  if (e.lang && e.meta) {
    const c = n.enter(`codeFencedMeta${l}`);
    f += a.move(" "), f += a.move(
      n.safe(e.meta, {
        before: f,
        after: `
`,
        encode: ["`"],
        ...a.current()
      })
    ), c();
  }
  return f += a.move(`
`), o && (f += a.move(o + `
`)), f += a.move(u), s(), f;
}
function Cs(e, t, n) {
  return (n ? "" : "    ") + e;
}
function tt(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function Es(e, t, n, r) {
  const i = tt(n), o = i === '"' ? "Quote" : "Apostrophe", l = n.enter("definition");
  let a = n.enter("label");
  const u = n.createTracker(r);
  let s = u.move("[");
  return s += u.move(
    n.safe(n.associationId(e), {
      before: s,
      after: "]",
      ...u.current()
    })
  ), s += u.move("]: "), a(), // If there’s no url, or…
  !e.url || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (a = n.enter("destinationLiteral"), s += u.move("<"), s += u.move(
    n.safe(e.url, { before: s, after: ">", ...u.current() })
  ), s += u.move(">")) : (a = n.enter("destinationRaw"), s += u.move(
    n.safe(e.url, {
      before: s,
      after: e.title ? " " : `
`,
      ...u.current()
    })
  )), a(), e.title && (a = n.enter(`title${o}`), s += u.move(" " + i), s += u.move(
    n.safe(e.title, {
      before: s,
      after: i,
      ...u.current()
    })
  ), s += u.move(i), a()), l(), s;
}
function Is(e) {
  const t = e.options.emphasis || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + t + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return t;
}
function Ye(e) {
  return "&#x" + e.toString(16).toUpperCase() + ";";
}
function an(e, t, n) {
  const r = Fe(e), i = Fe(t);
  return r === void 0 ? i === void 0 ? (
    // Letter inside:
    // we have to encode *both* letters for `_` as it is looser.
    // it already forms for `*` (and GFMs `~`).
    n === "_" ? { inside: !0, outside: !0 } : { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (letter, whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: encode outer (letter)
    { inside: !1, outside: !0 }
  ) : r === 1 ? i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode inner (whitespace).
    { inside: !0, outside: !1 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  );
}
Br.peek = As;
function Br(e, t, n, r) {
  const i = Is(n), o = n.enter("emphasis"), l = n.createTracker(r), a = l.move(i);
  let u = l.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...l.current()
    })
  );
  const s = u.charCodeAt(0), f = an(
    r.before.charCodeAt(r.before.length - 1),
    s,
    i
  );
  f.inside && (u = Ye(s) + u.slice(1));
  const c = u.charCodeAt(u.length - 1), p = an(r.after.charCodeAt(0), c, i);
  p.inside && (u = u.slice(0, -1) + Ye(c));
  const h = l.move(i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: p.outside,
    before: f.outside
  }, a + u + h;
}
function As(e, t, n) {
  return n.options.emphasis || "*";
}
function Ts(e, t) {
  let n = !1;
  return et(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, On;
  }), !!((!e.depth || e.depth < 3) && Yn(e) && (t.options.setext || n));
}
function vs(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), o = n.createTracker(r);
  if (Ts(e, n)) {
    const f = n.enter("headingSetext"), c = n.enter("phrasing"), p = n.containerPhrasing(e, {
      ...o.current(),
      before: `
`,
      after: `
`
    });
    return c(), f(), p + `
` + (i === 1 ? "=" : "-").repeat(
      // The whole size…
      p.length - // Minus the position of the character after the last EOL (or
      // 0 if there is none)…
      (Math.max(p.lastIndexOf("\r"), p.lastIndexOf(`
`)) + 1)
    );
  }
  const l = "#".repeat(i), a = n.enter("headingAtx"), u = n.enter("phrasing");
  o.move(l + " ");
  let s = n.containerPhrasing(e, {
    before: "# ",
    after: `
`,
    ...o.current()
  });
  return /^[\t ]/.test(s) && (s = Ye(s.charCodeAt(0)) + s.slice(1)), s = s ? l + " " + s : l, n.options.closeAtx && (s += " " + l), u(), a(), s;
}
jr.peek = Ps;
function jr(e) {
  return e.value || "";
}
function Ps() {
  return "<";
}
Hr.peek = zs;
function Hr(e, t, n, r) {
  const i = tt(n), o = i === '"' ? "Quote" : "Apostrophe", l = n.enter("image");
  let a = n.enter("label");
  const u = n.createTracker(r);
  let s = u.move("![");
  return s += u.move(
    n.safe(e.alt, { before: s, after: "]", ...u.current() })
  ), s += u.move("]("), a(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (a = n.enter("destinationLiteral"), s += u.move("<"), s += u.move(
    n.safe(e.url, { before: s, after: ">", ...u.current() })
  ), s += u.move(">")) : (a = n.enter("destinationRaw"), s += u.move(
    n.safe(e.url, {
      before: s,
      after: e.title ? " " : ")",
      ...u.current()
    })
  )), a(), e.title && (a = n.enter(`title${o}`), s += u.move(" " + i), s += u.move(
    n.safe(e.title, {
      before: s,
      after: i,
      ...u.current()
    })
  ), s += u.move(i), a()), s += u.move(")"), l(), s;
}
function zs() {
  return "!";
}
$r.peek = Ds;
function $r(e, t, n, r) {
  const i = e.referenceType, o = n.enter("imageReference");
  let l = n.enter("label");
  const a = n.createTracker(r);
  let u = a.move("![");
  const s = n.safe(e.alt, {
    before: u,
    after: "]",
    ...a.current()
  });
  u += a.move(s + "]["), l();
  const f = n.stack;
  n.stack = [], l = n.enter("reference");
  const c = n.safe(n.associationId(e), {
    before: u,
    after: "]",
    ...a.current()
  });
  return l(), n.stack = f, o(), i === "full" || !s || s !== c ? u += a.move(c + "]") : i === "shortcut" ? u = u.slice(0, -1) : u += a.move("]"), u;
}
function Ds() {
  return "!";
}
Ur.peek = Ls;
function Ur(e, t, n) {
  let r = e.value || "", i = "`", o = -1;
  for (; new RegExp("(^|[^`])" + i + "([^`]|$)").test(r); )
    i += "`";
  for (/[^ \r\n]/.test(r) && (/^[ \r\n]/.test(r) && /[ \r\n]$/.test(r) || /^`|`$/.test(r)) && (r = " " + r + " "); ++o < n.unsafe.length; ) {
    const l = n.unsafe[o], a = n.compilePattern(l);
    let u;
    if (l.atBreak)
      for (; u = a.exec(r); ) {
        let s = u.index;
        r.charCodeAt(s) === 10 && r.charCodeAt(s - 1) === 13 && s--, r = r.slice(0, s) + " " + r.slice(u.index + 1);
      }
  }
  return i + r + i;
}
function Ls() {
  return "`";
}
function qr(e, t) {
  const n = Yn(e);
  return !!(!t.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
Vr.peek = Fs;
function Vr(e, t, n, r) {
  const i = tt(n), o = i === '"' ? "Quote" : "Apostrophe", l = n.createTracker(r);
  let a, u;
  if (qr(e, n)) {
    const f = n.stack;
    n.stack = [], a = n.enter("autolink");
    let c = l.move("<");
    return c += l.move(
      n.containerPhrasing(e, {
        before: c,
        after: ">",
        ...l.current()
      })
    ), c += l.move(">"), a(), n.stack = f, c;
  }
  a = n.enter("link"), u = n.enter("label");
  let s = l.move("[");
  return s += l.move(
    n.containerPhrasing(e, {
      before: s,
      after: "](",
      ...l.current()
    })
  ), s += l.move("]("), u(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (u = n.enter("destinationLiteral"), s += l.move("<"), s += l.move(
    n.safe(e.url, { before: s, after: ">", ...l.current() })
  ), s += l.move(">")) : (u = n.enter("destinationRaw"), s += l.move(
    n.safe(e.url, {
      before: s,
      after: e.title ? " " : ")",
      ...l.current()
    })
  )), u(), e.title && (u = n.enter(`title${o}`), s += l.move(" " + i), s += l.move(
    n.safe(e.title, {
      before: s,
      after: i,
      ...l.current()
    })
  ), s += l.move(i), u()), s += l.move(")"), a(), s;
}
function Fs(e, t, n) {
  return qr(e, n) ? "<" : "[";
}
Wr.peek = _s;
function Wr(e, t, n, r) {
  const i = e.referenceType, o = n.enter("linkReference");
  let l = n.enter("label");
  const a = n.createTracker(r);
  let u = a.move("[");
  const s = n.containerPhrasing(e, {
    before: u,
    after: "]",
    ...a.current()
  });
  u += a.move(s + "]["), l();
  const f = n.stack;
  n.stack = [], l = n.enter("reference");
  const c = n.safe(n.associationId(e), {
    before: u,
    after: "]",
    ...a.current()
  });
  return l(), n.stack = f, o(), i === "full" || !s || s !== c ? u += a.move(c + "]") : i === "shortcut" ? u = u.slice(0, -1) : u += a.move("]"), u;
}
function _s() {
  return "[";
}
function rt(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function Rs(e) {
  const t = rt(e), n = e.options.bulletOther;
  if (!n)
    return t === "*" ? "-" : "*";
  if (n !== "*" && n !== "+" && n !== "-")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bulletOther`, expected `*`, `+`, or `-`"
    );
  if (n === t)
    throw new Error(
      "Expected `bullet` (`" + t + "`) and `bulletOther` (`" + n + "`) to be different"
    );
  return n;
}
function Os(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function Yr(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function Ms(e, t, n, r) {
  const i = n.enter("list"), o = n.bulletCurrent;
  let l = e.ordered ? Os(n) : rt(n);
  const a = e.ordered ? l === "." ? ")" : "." : Rs(n);
  let u = t && n.bulletLastUsed ? l === n.bulletLastUsed : !1;
  if (!e.ordered) {
    const f = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (l === "*" || l === "-") && // Empty first list item:
      f && (!f.children || !f.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (u = !0), Yr(n) === l && f
    ) {
      let c = -1;
      for (; ++c < e.children.length; ) {
        const p = e.children[c];
        if (p && p.type === "listItem" && p.children && p.children[0] && p.children[0].type === "thematicBreak") {
          u = !0;
          break;
        }
      }
    }
  }
  u && (l = a), n.bulletCurrent = l;
  const s = n.containerFlow(e, r);
  return n.bulletLastUsed = l, n.bulletCurrent = o, i(), s;
}
function Ns(e) {
  const t = e.options.listItemIndent || "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function Bs(e, t, n, r) {
  const i = Ns(n);
  let o = n.bulletCurrent || rt(n);
  t && t.type === "list" && t.ordered && (o = (typeof t.start == "number" && t.start > -1 ? t.start : 1) + (n.options.incrementListMarker === !1 ? 0 : t.children.indexOf(e)) + o);
  let l = o.length + 1;
  (i === "tab" || i === "mixed" && (t && t.type === "list" && t.spread || e.spread)) && (l = Math.ceil(l / 4) * 4);
  const a = n.createTracker(r);
  a.move(o + " ".repeat(l - o.length)), a.shift(l);
  const u = n.enter("listItem"), s = n.indentLines(
    n.containerFlow(e, a.current()),
    f
  );
  return u(), s;
  function f(c, p, h) {
    return p ? (h ? "" : " ".repeat(l)) + c : (h ? o : o + " ".repeat(l - o.length)) + c;
  }
}
function js(e, t, n, r) {
  const i = n.enter("paragraph"), o = n.enter("phrasing"), l = n.containerPhrasing(e, r);
  return o(), i(), l;
}
const Hs = (
  /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
  fn([
    "break",
    "delete",
    "emphasis",
    // To do: next major: removed since footnotes were added to GFM.
    "footnote",
    "footnoteReference",
    "image",
    "imageReference",
    "inlineCode",
    // Enabled by `mdast-util-math`:
    "inlineMath",
    "link",
    "linkReference",
    // Enabled by `mdast-util-mdx`:
    "mdxJsxTextElement",
    // Enabled by `mdast-util-mdx`:
    "mdxTextExpression",
    "strong",
    "text",
    // Enabled by `mdast-util-directive`:
    "textDirective"
  ])
);
function $s(e, t, n, r) {
  return (e.children.some(function(l) {
    return Hs(l);
  }) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function Us(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
Xr.peek = qs;
function Xr(e, t, n, r) {
  const i = Us(n), o = n.enter("strong"), l = n.createTracker(r), a = l.move(i + i);
  let u = l.move(
    n.containerPhrasing(e, {
      after: i,
      before: a,
      ...l.current()
    })
  );
  const s = u.charCodeAt(0), f = an(
    r.before.charCodeAt(r.before.length - 1),
    s,
    i
  );
  f.inside && (u = Ye(s) + u.slice(1));
  const c = u.charCodeAt(u.length - 1), p = an(r.after.charCodeAt(0), c, i);
  p.inside && (u = u.slice(0, -1) + Ye(c));
  const h = l.move(i + i);
  return o(), n.attentionEncodeSurroundingInfo = {
    after: p.outside,
    before: f.outside
  }, a + u + h;
}
function qs(e, t, n) {
  return n.options.strong || "*";
}
function Vs(e, t, n, r) {
  return n.safe(e.value, r);
}
function Ws(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function Ys(e, t, n) {
  const r = (Yr(n) + (n.options.ruleSpaces ? " " : "")).repeat(Ws(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const Qr = {
  blockquote: ds,
  break: Qt,
  code: Ss,
  definition: Es,
  emphasis: Br,
  hardBreak: Qt,
  heading: vs,
  html: jr,
  image: Hr,
  imageReference: $r,
  inlineCode: Ur,
  link: Vr,
  linkReference: Wr,
  list: Ms,
  listItem: Bs,
  paragraph: js,
  root: $s,
  strong: Xr,
  text: Vs,
  thematicBreak: Ys
};
function Xs() {
  return {
    enter: {
      table: Qs,
      tableData: Gt,
      tableHeader: Gt,
      tableRow: Ks
    },
    exit: {
      codeText: Js,
      table: Gs,
      tableData: Pn,
      tableHeader: Pn,
      tableRow: Pn
    }
  };
}
function Qs(e) {
  const t = e._align;
  this.enter(
    {
      type: "table",
      align: t.map(function(n) {
        return n === "none" ? null : n;
      }),
      children: []
    },
    e
  ), this.data.inTable = !0;
}
function Gs(e) {
  this.exit(e), this.data.inTable = void 0;
}
function Ks(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function Pn(e) {
  this.exit(e);
}
function Gt(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function Js(e) {
  let t = this.resume();
  this.data.inTable && (t = t.replace(/\\([\\|])/g, Zs));
  const n = this.stack[this.stack.length - 1];
  n.type, n.value = t, this.exit(e);
}
function Zs(e, t) {
  return t === "|" ? t : e;
}
function ec(e) {
  const t = e || {}, n = t.tableCellPadding, r = t.tablePipeAlign, i = t.stringLength, o = n ? " " : "|";
  return {
    unsafe: [
      { character: "\r", inConstruct: "tableCell" },
      { character: `
`, inConstruct: "tableCell" },
      // A pipe, when followed by a tab or space (padding), or a dash or colon
      // (unpadded delimiter row), could result in a table.
      { atBreak: !0, character: "|", after: "[	 :-]" },
      // A pipe in a cell must be encoded.
      { character: "|", inConstruct: "tableCell" },
      // A colon must be followed by a dash, in which case it could start a
      // delimiter row.
      { atBreak: !0, character: ":", after: "-" },
      // A delimiter row can also start with a dash, when followed by more
      // dashes, a colon, or a pipe.
      // This is a stricter version than the built in check for lists, thematic
      // breaks, and setex heading underlines though:
      // <https://github.com/syntax-tree/mdast-util-to-markdown/blob/51a2038/lib/unsafe.js#L57>
      { atBreak: !0, character: "-", after: "[:|-]" }
    ],
    handlers: {
      inlineCode: p,
      table: l,
      tableCell: u,
      tableRow: a
    }
  };
  function l(h, d, w, S) {
    return s(f(h, w, S), h.align);
  }
  function a(h, d, w, S) {
    const x = c(h, w, S), I = s([x]);
    return I.slice(0, I.indexOf(`
`));
  }
  function u(h, d, w, S) {
    const x = w.enter("tableCell"), I = w.enter("phrasing"), C = w.containerPhrasing(h, {
      ...S,
      before: o,
      after: o
    });
    return I(), x(), C;
  }
  function s(h, d) {
    return ms(h, {
      align: d,
      // @ts-expect-error: `markdown-table` types should support `null`.
      alignDelimiters: r,
      // @ts-expect-error: `markdown-table` types should support `null`.
      padding: n,
      // @ts-expect-error: `markdown-table` types should support `null`.
      stringLength: i
    });
  }
  function f(h, d, w) {
    const S = h.children;
    let x = -1;
    const I = [], C = d.enter("table");
    for (; ++x < S.length; )
      I[x] = c(S[x], d, w);
    return C(), I;
  }
  function c(h, d, w) {
    const S = h.children;
    let x = -1;
    const I = [], C = d.enter("tableRow");
    for (; ++x < S.length; )
      I[x] = u(S[x], h, d, w);
    return C(), I;
  }
  function p(h, d, w) {
    let S = Qr.inlineCode(h, d, w);
    return w.stack.includes("tableCell") && (S = S.replace(/\|/g, "\\$&")), S;
  }
}
function nc() {
  return {
    exit: {
      taskListCheckValueChecked: Kt,
      taskListCheckValueUnchecked: Kt,
      paragraph: rc
    }
  };
}
function tc() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: ic }
  };
}
function Kt(e) {
  const t = this.stack[this.stack.length - 2];
  t.type, t.checked = e.type === "taskListCheckValueChecked";
}
function rc(e) {
  const t = this.stack[this.stack.length - 2];
  if (t && t.type === "listItem" && typeof t.checked == "boolean") {
    const n = this.stack[this.stack.length - 1];
    n.type;
    const r = n.children[0];
    if (r && r.type === "text") {
      const i = t.children;
      let o = -1, l;
      for (; ++o < i.length; ) {
        const a = i[o];
        if (a.type === "paragraph") {
          l = a;
          break;
        }
      }
      l === n && (r.value = r.value.slice(1), r.value.length === 0 ? n.children.shift() : n.position && r.position && typeof r.position.start.offset == "number" && (r.position.start.column++, r.position.start.offset++, n.position.start = Object.assign({}, r.position.start)));
    }
  }
  this.exit(e);
}
function ic(e, t, n, r) {
  const i = e.children[0], o = typeof e.checked == "boolean" && i && i.type === "paragraph", l = "[" + (e.checked ? "x" : " ") + "] ", a = n.createTracker(r);
  o && a.move(l);
  let u = Qr.listItem(e, t, n, {
    ...r,
    ...a.current()
  });
  return o && (u = u.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, s)), u;
  function s(f) {
    return f + l;
  }
}
function lc() {
  return [
    Mu(),
    is(),
    us(),
    Xs(),
    nc()
  ];
}
function oc(e) {
  return {
    extensions: [
      Nu(),
      ls(e),
      ss(),
      ec(e),
      tc()
    ]
  };
}
const ac = {
  tokenize: pc,
  partial: !0
}, Gr = {
  tokenize: mc,
  partial: !0
}, Kr = {
  tokenize: gc,
  partial: !0
}, Jr = {
  tokenize: dc,
  partial: !0
}, uc = {
  tokenize: xc,
  partial: !0
}, Zr = {
  name: "wwwAutolink",
  tokenize: fc,
  previous: ni
}, ei = {
  name: "protocolAutolink",
  tokenize: hc,
  previous: ti
}, xe = {
  name: "emailAutolink",
  tokenize: cc,
  previous: ri
}, he = {};
function sc() {
  return {
    text: he
  };
}
let Ce = 48;
for (; Ce < 123; )
  he[Ce] = xe, Ce++, Ce === 58 ? Ce = 65 : Ce === 91 && (Ce = 97);
he[43] = xe;
he[45] = xe;
he[46] = xe;
he[95] = xe;
he[72] = [xe, ei];
he[104] = [xe, ei];
he[87] = [xe, Zr];
he[119] = [xe, Zr];
function cc(e, t, n) {
  const r = this;
  let i, o;
  return l;
  function l(c) {
    return !jn(c) || !ri.call(r, r.previous) || it(r.events) ? n(c) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), a(c));
  }
  function a(c) {
    return jn(c) ? (e.consume(c), a) : c === 64 ? (e.consume(c), u) : n(c);
  }
  function u(c) {
    return c === 46 ? e.check(uc, f, s)(c) : c === 45 || c === 95 || K(c) ? (o = !0, e.consume(c), u) : f(c);
  }
  function s(c) {
    return e.consume(c), i = !0, u;
  }
  function f(c) {
    return o && i && Z(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), t(c)) : n(c);
  }
}
function fc(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return l !== 87 && l !== 119 || !ni.call(r, r.previous) || it(r.events) ? n(l) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(ac, e.attempt(Gr, e.attempt(Kr, o), n), n)(l));
  }
  function o(l) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), t(l);
  }
}
function hc(e, t, n) {
  const r = this;
  let i = "", o = !1;
  return l;
  function l(c) {
    return (c === 72 || c === 104) && ti.call(r, r.previous) && !it(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(c), e.consume(c), a) : n(c);
  }
  function a(c) {
    if (Z(c) && i.length < 5)
      return i += String.fromCodePoint(c), e.consume(c), a;
    if (c === 58) {
      const p = i.toLowerCase();
      if (p === "http" || p === "https")
        return e.consume(c), u;
    }
    return n(c);
  }
  function u(c) {
    return c === 47 ? (e.consume(c), o ? s : (o = !0, u)) : n(c);
  }
  function s(c) {
    return c === null || rn(c) || V(c) || Ee(c) || un(c) ? n(c) : e.attempt(Gr, e.attempt(Kr, f), n)(c);
  }
  function f(c) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), t(c);
  }
}
function pc(e, t, n) {
  let r = 0;
  return i;
  function i(l) {
    return (l === 87 || l === 119) && r < 3 ? (r++, e.consume(l), i) : l === 46 && r === 3 ? (e.consume(l), o) : n(l);
  }
  function o(l) {
    return l === null ? n(l) : t(l);
  }
}
function mc(e, t, n) {
  let r, i, o;
  return l;
  function l(s) {
    return s === 46 || s === 95 ? e.check(Jr, u, a)(s) : s === null || V(s) || Ee(s) || s !== 45 && un(s) ? u(s) : (o = !0, e.consume(s), l);
  }
  function a(s) {
    return s === 95 ? r = !0 : (i = r, r = void 0), e.consume(s), l;
  }
  function u(s) {
    return i || r || !o ? n(s) : t(s);
  }
}
function gc(e, t) {
  let n = 0, r = 0;
  return i;
  function i(l) {
    return l === 40 ? (n++, e.consume(l), i) : l === 41 && r < n ? o(l) : l === 33 || l === 34 || l === 38 || l === 39 || l === 41 || l === 42 || l === 44 || l === 46 || l === 58 || l === 59 || l === 60 || l === 63 || l === 93 || l === 95 || l === 126 ? e.check(Jr, t, o)(l) : l === null || V(l) || Ee(l) ? t(l) : (e.consume(l), i);
  }
  function o(l) {
    return l === 41 && r++, e.consume(l), i;
  }
}
function dc(e, t, n) {
  return r;
  function r(a) {
    return a === 33 || a === 34 || a === 39 || a === 41 || a === 42 || a === 44 || a === 46 || a === 58 || a === 59 || a === 63 || a === 95 || a === 126 ? (e.consume(a), r) : a === 38 ? (e.consume(a), o) : a === 93 ? (e.consume(a), i) : (
      // `<` is an end.
      a === 60 || // So is whitespace.
      a === null || V(a) || Ee(a) ? t(a) : n(a)
    );
  }
  function i(a) {
    return a === null || a === 40 || a === 91 || V(a) || Ee(a) ? t(a) : r(a);
  }
  function o(a) {
    return Z(a) ? l(a) : n(a);
  }
  function l(a) {
    return a === 59 ? (e.consume(a), r) : Z(a) ? (e.consume(a), l) : n(a);
  }
}
function xc(e, t, n) {
  return r;
  function r(o) {
    return e.consume(o), i;
  }
  function i(o) {
    return K(o) ? n(o) : t(o);
  }
}
function ni(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || V(e);
}
function ti(e) {
  return !Z(e);
}
function ri(e) {
  return !(e === 47 || jn(e));
}
function jn(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || K(e);
}
function it(e) {
  let t = e.length, n = !1;
  for (; t--; ) {
    const r = e[t][1];
    if ((r.type === "labelLink" || r.type === "labelImage") && !r._balanced) {
      n = !0;
      break;
    }
    if (r._gfmAutolinkLiteralWalkedInto) {
      n = !1;
      break;
    }
  }
  return e.length > 0 && !n && (e[e.length - 1][1]._gfmAutolinkLiteralWalkedInto = !0), n;
}
const yc = {
  tokenize: Ac,
  partial: !0
};
function kc() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: Cc,
        continuation: {
          tokenize: Ec
        },
        exit: Ic
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: Sc
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: bc,
        resolveTo: wc
      }
    }
  };
}
function bc(e, t, n) {
  const r = this;
  let i = r.events.length;
  const o = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let l;
  for (; i--; ) {
    const u = r.events[i][1];
    if (u.type === "labelImage") {
      l = u;
      break;
    }
    if (u.type === "gfmFootnoteCall" || u.type === "labelLink" || u.type === "label" || u.type === "image" || u.type === "link")
      break;
  }
  return a;
  function a(u) {
    if (!l || !l._balanced)
      return n(u);
    const s = ce(r.sliceSerialize({
      start: l.end,
      end: r.now()
    }));
    return s.codePointAt(0) !== 94 || !o.includes(s.slice(1)) ? n(u) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(u), e.exit("gfmFootnoteCallLabelMarker"), t(u));
  }
}
function wc(e, t) {
  let n = e.length;
  for (; n--; )
    if (e[n][1].type === "labelImage" && e[n][0] === "enter") {
      e[n][1];
      break;
    }
  e[n + 1][1].type = "data", e[n + 3][1].type = "gfmFootnoteCallLabelMarker";
  const r = {
    type: "gfmFootnoteCall",
    start: Object.assign({}, e[n + 3][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  }, i = {
    type: "gfmFootnoteCallMarker",
    start: Object.assign({}, e[n + 3][1].end),
    end: Object.assign({}, e[n + 3][1].end)
  };
  i.end.column++, i.end.offset++, i.end._bufferIndex++;
  const o = {
    type: "gfmFootnoteCallString",
    start: Object.assign({}, i.end),
    end: Object.assign({}, e[e.length - 1][1].start)
  }, l = {
    type: "chunkString",
    contentType: "string",
    start: Object.assign({}, o.start),
    end: Object.assign({}, o.end)
  }, a = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    e[n + 1],
    e[n + 2],
    ["enter", r, t],
    // The `[`
    e[n + 3],
    e[n + 4],
    // The `^`.
    ["enter", i, t],
    ["exit", i, t],
    // Everything in between.
    ["enter", o, t],
    ["enter", l, t],
    ["exit", l, t],
    ["exit", o, t],
    // The ending (`]`, properly parsed and labelled).
    e[e.length - 2],
    e[e.length - 1],
    ["exit", r, t]
  ];
  return e.splice(n, e.length - n + 1, ...a), e;
}
function Sc(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o = 0, l;
  return a;
  function a(c) {
    return e.enter("gfmFootnoteCall"), e.enter("gfmFootnoteCallLabelMarker"), e.consume(c), e.exit("gfmFootnoteCallLabelMarker"), u;
  }
  function u(c) {
    return c !== 94 ? n(c) : (e.enter("gfmFootnoteCallMarker"), e.consume(c), e.exit("gfmFootnoteCallMarker"), e.enter("gfmFootnoteCallString"), e.enter("chunkString").contentType = "string", s);
  }
  function s(c) {
    if (
      // Too long.
      o > 999 || // Closing brace with nothing.
      c === 93 && !l || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      c === null || c === 91 || V(c)
    )
      return n(c);
    if (c === 93) {
      e.exit("chunkString");
      const p = e.exit("gfmFootnoteCallString");
      return i.includes(ce(r.sliceSerialize(p))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(c), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), t) : n(c);
    }
    return V(c) || (l = !0), o++, e.consume(c), c === 92 ? f : s;
  }
  function f(c) {
    return c === 91 || c === 92 || c === 93 ? (e.consume(c), o++, s) : s(c);
  }
}
function Cc(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o, l = 0, a;
  return u;
  function u(d) {
    return e.enter("gfmFootnoteDefinition")._container = !0, e.enter("gfmFootnoteDefinitionLabel"), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(d), e.exit("gfmFootnoteDefinitionLabelMarker"), s;
  }
  function s(d) {
    return d === 94 ? (e.enter("gfmFootnoteDefinitionMarker"), e.consume(d), e.exit("gfmFootnoteDefinitionMarker"), e.enter("gfmFootnoteDefinitionLabelString"), e.enter("chunkString").contentType = "string", f) : n(d);
  }
  function f(d) {
    if (
      // Too long.
      l > 999 || // Closing brace with nothing.
      d === 93 && !a || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      d === null || d === 91 || V(d)
    )
      return n(d);
    if (d === 93) {
      e.exit("chunkString");
      const w = e.exit("gfmFootnoteDefinitionLabelString");
      return o = ce(r.sliceSerialize(w)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(d), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), p;
    }
    return V(d) || (a = !0), l++, e.consume(d), d === 92 ? c : f;
  }
  function c(d) {
    return d === 91 || d === 92 || d === 93 ? (e.consume(d), l++, f) : f(d);
  }
  function p(d) {
    return d === 58 ? (e.enter("definitionMarker"), e.consume(d), e.exit("definitionMarker"), i.includes(o) || i.push(o), B(e, h, "gfmFootnoteDefinitionWhitespace")) : n(d);
  }
  function h(d) {
    return t(d);
  }
}
function Ec(e, t, n) {
  return e.check(Qe, t, e.attempt(yc, t, n));
}
function Ic(e) {
  e.exit("gfmFootnoteDefinition");
}
function Ac(e, t, n) {
  const r = this;
  return B(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(o) {
    const l = r.events[r.events.length - 1];
    return l && l[1].type === "gfmFootnoteDefinitionIndent" && l[2].sliceSerialize(l[1], !0).length === 4 ? t(o) : n(o);
  }
}
function Tc(e) {
  let n = (e || {}).singleTilde;
  const r = {
    name: "strikethrough",
    tokenize: o,
    resolveAll: i
  };
  return n == null && (n = !0), {
    text: {
      126: r
    },
    insideSpan: {
      null: [r]
    },
    attentionMarkers: {
      null: [126]
    }
  };
  function i(l, a) {
    let u = -1;
    for (; ++u < l.length; )
      if (l[u][0] === "enter" && l[u][1].type === "strikethroughSequenceTemporary" && l[u][1]._close) {
        let s = u;
        for (; s--; )
          if (l[s][0] === "exit" && l[s][1].type === "strikethroughSequenceTemporary" && l[s][1]._open && // If the sizes are the same:
          l[u][1].end.offset - l[u][1].start.offset === l[s][1].end.offset - l[s][1].start.offset) {
            l[u][1].type = "strikethroughSequence", l[s][1].type = "strikethroughSequence";
            const f = {
              type: "strikethrough",
              start: Object.assign({}, l[s][1].start),
              end: Object.assign({}, l[u][1].end)
            }, c = {
              type: "strikethroughText",
              start: Object.assign({}, l[s][1].end),
              end: Object.assign({}, l[u][1].start)
            }, p = [["enter", f, a], ["enter", l[s][1], a], ["exit", l[s][1], a], ["enter", c, a]], h = a.parser.constructs.insideSpan.null;
            h && ie(p, p.length, 0, sn(h, l.slice(s + 1, u), a)), ie(p, p.length, 0, [["exit", c, a], ["enter", l[u][1], a], ["exit", l[u][1], a], ["exit", f, a]]), ie(l, s - 1, u - s + 3, p), u = s + p.length - 2;
            break;
          }
      }
    for (u = -1; ++u < l.length; )
      l[u][1].type === "strikethroughSequenceTemporary" && (l[u][1].type = "data");
    return l;
  }
  function o(l, a, u) {
    const s = this.previous, f = this.events;
    let c = 0;
    return p;
    function p(d) {
      return s === 126 && f[f.length - 1][1].type !== "characterEscape" ? u(d) : (l.enter("strikethroughSequenceTemporary"), h(d));
    }
    function h(d) {
      const w = Fe(s);
      if (d === 126)
        return c > 1 ? u(d) : (l.consume(d), c++, h);
      if (c < 2 && !n) return u(d);
      const S = l.exit("strikethroughSequenceTemporary"), x = Fe(d);
      return S._open = !x || x === 2 && !!w, S._close = !w || w === 2 && !!x, a(d);
    }
  }
}
class vc {
  /**
   * Create a new edit map.
   */
  constructor() {
    this.map = [];
  }
  /**
   * Create an edit: a remove and/or add at a certain place.
   *
   * @param {number} index
   * @param {number} remove
   * @param {Array<Event>} add
   * @returns {undefined}
   */
  add(t, n, r) {
    Pc(this, t, n, r);
  }
  // To do: add this when moving to `micromark`.
  // /**
  //  * Create an edit: but insert `add` before existing additions.
  //  *
  //  * @param {number} index
  //  * @param {number} remove
  //  * @param {Array<Event>} add
  //  * @returns {undefined}
  //  */
  // addBefore(index, remove, add) {
  //   addImplementation(this, index, remove, add, true)
  // }
  /**
   * Done, change the events.
   *
   * @param {Array<Event>} events
   * @returns {undefined}
   */
  consume(t) {
    if (this.map.sort(function(o, l) {
      return o[0] - l[0];
    }), this.map.length === 0)
      return;
    let n = this.map.length;
    const r = [];
    for (; n > 0; )
      n -= 1, r.push(t.slice(this.map[n][0] + this.map[n][1]), this.map[n][2]), t.length = this.map[n][0];
    r.push(t.slice()), t.length = 0;
    let i = r.pop();
    for (; i; ) {
      for (const o of i)
        t.push(o);
      i = r.pop();
    }
    this.map.length = 0;
  }
}
function Pc(e, t, n, r) {
  let i = 0;
  if (!(n === 0 && r.length === 0)) {
    for (; i < e.map.length; ) {
      if (e.map[i][0] === t) {
        e.map[i][1] += n, e.map[i][2].push(...r);
        return;
      }
      i += 1;
    }
    e.map.push([t, n, r]);
  }
}
function zc(e, t) {
  let n = !1;
  const r = [];
  for (; t < e.length; ) {
    const i = e[t];
    if (n) {
      if (i[0] === "enter")
        i[1].type === "tableContent" && r.push(e[t + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
      else if (i[1].type === "tableContent") {
        if (e[t - 1][1].type === "tableDelimiterMarker") {
          const o = r.length - 1;
          r[o] = r[o] === "left" ? "center" : "right";
        }
      } else if (i[1].type === "tableDelimiterRow")
        break;
    } else i[0] === "enter" && i[1].type === "tableDelimiterRow" && (n = !0);
    t += 1;
  }
  return r;
}
function Dc() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: Lc,
        resolveAll: Fc
      }
    }
  };
}
function Lc(e, t, n) {
  const r = this;
  let i = 0, o = 0, l;
  return a;
  function a(y) {
    let v = r.events.length - 1;
    for (; v > -1; ) {
      const D = r.events[v][1].type;
      if (D === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      D === "linePrefix") v--;
      else break;
    }
    const P = v > -1 ? r.events[v][1].type : null, $ = P === "tableHead" || P === "tableRow" ? b : u;
    return $ === b && r.parser.lazy[r.now().line] ? n(y) : $(y);
  }
  function u(y) {
    return e.enter("tableHead"), e.enter("tableRow"), s(y);
  }
  function s(y) {
    return y === 124 || (l = !0, o += 1), f(y);
  }
  function f(y) {
    return y === null ? n(y) : z(y) ? o > 1 ? (o = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(y), e.exit("lineEnding"), h) : n(y) : O(y) ? B(e, f, "whitespace")(y) : (o += 1, l && (l = !1, i += 1), y === 124 ? (e.enter("tableCellDivider"), e.consume(y), e.exit("tableCellDivider"), l = !0, f) : (e.enter("data"), c(y)));
  }
  function c(y) {
    return y === null || y === 124 || V(y) ? (e.exit("data"), f(y)) : (e.consume(y), y === 92 ? p : c);
  }
  function p(y) {
    return y === 92 || y === 124 ? (e.consume(y), c) : c(y);
  }
  function h(y) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? n(y) : (e.enter("tableDelimiterRow"), l = !1, O(y) ? B(e, d, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(y) : d(y));
  }
  function d(y) {
    return y === 45 || y === 58 ? S(y) : y === 124 ? (l = !0, e.enter("tableCellDivider"), e.consume(y), e.exit("tableCellDivider"), w) : _(y);
  }
  function w(y) {
    return O(y) ? B(e, S, "whitespace")(y) : S(y);
  }
  function S(y) {
    return y === 58 ? (o += 1, l = !0, e.enter("tableDelimiterMarker"), e.consume(y), e.exit("tableDelimiterMarker"), x) : y === 45 ? (o += 1, x(y)) : y === null || z(y) ? F(y) : _(y);
  }
  function x(y) {
    return y === 45 ? (e.enter("tableDelimiterFiller"), I(y)) : _(y);
  }
  function I(y) {
    return y === 45 ? (e.consume(y), I) : y === 58 ? (l = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(y), e.exit("tableDelimiterMarker"), C) : (e.exit("tableDelimiterFiller"), C(y));
  }
  function C(y) {
    return O(y) ? B(e, F, "whitespace")(y) : F(y);
  }
  function F(y) {
    return y === 124 ? d(y) : y === null || z(y) ? !l || i !== o ? _(y) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), t(y)) : _(y);
  }
  function _(y) {
    return n(y);
  }
  function b(y) {
    return e.enter("tableRow"), M(y);
  }
  function M(y) {
    return y === 124 ? (e.enter("tableCellDivider"), e.consume(y), e.exit("tableCellDivider"), M) : y === null || z(y) ? (e.exit("tableRow"), t(y)) : O(y) ? B(e, M, "whitespace")(y) : (e.enter("data"), H(y));
  }
  function H(y) {
    return y === null || y === 124 || V(y) ? (e.exit("data"), M(y)) : (e.consume(y), y === 92 ? j : H);
  }
  function j(y) {
    return y === 92 || y === 124 ? (e.consume(y), H) : H(y);
  }
}
function Fc(e, t) {
  let n = -1, r = !0, i = 0, o = [0, 0, 0, 0], l = [0, 0, 0, 0], a = !1, u = 0, s, f, c;
  const p = new vc();
  for (; ++n < e.length; ) {
    const h = e[n], d = h[1];
    h[0] === "enter" ? d.type === "tableHead" ? (a = !1, u !== 0 && (Jt(p, t, u, s, f), f = void 0, u = 0), s = {
      type: "table",
      start: Object.assign({}, d.start),
      // Note: correct end is set later.
      end: Object.assign({}, d.end)
    }, p.add(n, 0, [["enter", s, t]])) : d.type === "tableRow" || d.type === "tableDelimiterRow" ? (r = !0, c = void 0, o = [0, 0, 0, 0], l = [0, n + 1, 0, 0], a && (a = !1, f = {
      type: "tableBody",
      start: Object.assign({}, d.start),
      // Note: correct end is set later.
      end: Object.assign({}, d.end)
    }, p.add(n, 0, [["enter", f, t]])), i = d.type === "tableDelimiterRow" ? 2 : f ? 3 : 1) : i && (d.type === "data" || d.type === "tableDelimiterMarker" || d.type === "tableDelimiterFiller") ? (r = !1, l[2] === 0 && (o[1] !== 0 && (l[0] = l[1], c = nn(p, t, o, i, void 0, c), o = [0, 0, 0, 0]), l[2] = n)) : d.type === "tableCellDivider" && (r ? r = !1 : (o[1] !== 0 && (l[0] = l[1], c = nn(p, t, o, i, void 0, c)), o = l, l = [o[1], n, 0, 0])) : d.type === "tableHead" ? (a = !0, u = n) : d.type === "tableRow" || d.type === "tableDelimiterRow" ? (u = n, o[1] !== 0 ? (l[0] = l[1], c = nn(p, t, o, i, n, c)) : l[1] !== 0 && (c = nn(p, t, l, i, n, c)), i = 0) : i && (d.type === "data" || d.type === "tableDelimiterMarker" || d.type === "tableDelimiterFiller") && (l[3] = n);
  }
  for (u !== 0 && Jt(p, t, u, s, f), p.consume(t.events), n = -1; ++n < t.events.length; ) {
    const h = t.events[n];
    h[0] === "enter" && h[1].type === "table" && (h[1]._align = zc(t.events, n));
  }
  return e;
}
function nn(e, t, n, r, i, o) {
  const l = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", a = "tableContent";
  n[0] !== 0 && (o.end = Object.assign({}, De(t.events, n[0])), e.add(n[0], 0, [["exit", o, t]]));
  const u = De(t.events, n[1]);
  if (o = {
    type: l,
    start: Object.assign({}, u),
    // Note: correct end is set later.
    end: Object.assign({}, u)
  }, e.add(n[1], 0, [["enter", o, t]]), n[2] !== 0) {
    const s = De(t.events, n[2]), f = De(t.events, n[3]), c = {
      type: a,
      start: Object.assign({}, s),
      end: Object.assign({}, f)
    };
    if (e.add(n[2], 0, [["enter", c, t]]), r !== 2) {
      const p = t.events[n[2]], h = t.events[n[3]];
      if (p[1].end = Object.assign({}, h[1].end), p[1].type = "chunkText", p[1].contentType = "text", n[3] > n[2] + 1) {
        const d = n[2] + 1, w = n[3] - n[2] - 1;
        e.add(d, w, []);
      }
    }
    e.add(n[3] + 1, 0, [["exit", c, t]]);
  }
  return i !== void 0 && (o.end = Object.assign({}, De(t.events, i)), e.add(i, 0, [["exit", o, t]]), o = void 0), o;
}
function Jt(e, t, n, r, i) {
  const o = [], l = De(t.events, n);
  i && (i.end = Object.assign({}, l), o.push(["exit", i, t])), r.end = Object.assign({}, l), o.push(["exit", r, t]), e.add(n + 1, 0, o);
}
function De(e, t) {
  const n = e[t], r = n[0] === "enter" ? "start" : "end";
  return n[1][r];
}
const _c = {
  name: "tasklistCheck",
  tokenize: Oc
};
function Rc() {
  return {
    text: {
      91: _c
    }
  };
}
function Oc(e, t, n) {
  const r = this;
  return i;
  function i(u) {
    return (
      // Exit if there’s stuff before.
      r.previous !== null || // Exit if not in the first content that is the first child of a list
      // item.
      !r._gfmTasklistFirstContentOfListItem ? n(u) : (e.enter("taskListCheck"), e.enter("taskListCheckMarker"), e.consume(u), e.exit("taskListCheckMarker"), o)
    );
  }
  function o(u) {
    return V(u) ? (e.enter("taskListCheckValueUnchecked"), e.consume(u), e.exit("taskListCheckValueUnchecked"), l) : u === 88 || u === 120 ? (e.enter("taskListCheckValueChecked"), e.consume(u), e.exit("taskListCheckValueChecked"), l) : n(u);
  }
  function l(u) {
    return u === 93 ? (e.enter("taskListCheckMarker"), e.consume(u), e.exit("taskListCheckMarker"), e.exit("taskListCheck"), a) : n(u);
  }
  function a(u) {
    return z(u) ? t(u) : O(u) ? e.check({
      tokenize: Mc
    }, t, n)(u) : n(u);
  }
}
function Mc(e, t, n) {
  return B(e, r, "whitespace");
  function r(i) {
    return i === null ? n(i) : t(i);
  }
}
function Nc(e) {
  return mr([
    sc(),
    kc(),
    Tc(e),
    Dc(),
    Rc()
  ]);
}
const Bc = {};
function jc(e) {
  const t = (
    /** @type {Processor<Root>} */
    this
  ), n = e || Bc, r = t.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), o = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), l = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(Nc(n)), o.push(lc()), l.push(oc(n));
}
function ii(e) {
  const t = e ? "my-1" : "my-2", n = e ? "mt-2.5" : "mt-4", r = e ? "mb-1" : "mb-2", i = e ? "text-title" : "text-h2", o = e ? "text-body" : "text-title", l = e ? "text-body-sm" : "text-body";
  return {
    h1: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("h1", { className: `${i} font-semibold leading-snug text-nomi-ink ${n} ${r} first:mt-0`, ...u }),
    h2: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("h2", { className: `${o} font-semibold leading-snug text-nomi-ink ${n} ${r} first:mt-0`, ...u }),
    h3: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("h3", { className: `${l} font-semibold leading-snug text-nomi-ink ${n} ${r} first:mt-0`, ...u }),
    p: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("p", { className: `text-body leading-relaxed text-nomi-ink-80 ${t}`, ...u }),
    ul: ({ node: a, className: u, ...s }) => {
      const f = /contains-task-list/.test(u || "");
      return /* @__PURE__ */ W.jsx("ul", { className: `${f ? "list-none pl-1" : "list-disc pl-5"} ${t} text-body leading-relaxed text-nomi-ink-80`, ...s });
    },
    ol: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("ol", { className: `list-decimal pl-5 ${t} text-body leading-relaxed text-nomi-ink-80`, ...u }),
    li: ({ node: a, className: u, ...s }) => /* @__PURE__ */ W.jsx("li", { className: `my-0.5 ${/task-list-item/.test(u || "") ? "list-none" : ""}`.trim(), ...s }),
    a: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("a", { className: "text-nomi-accent underline underline-offset-2 [overflow-wrap:anywhere]", target: "_blank", rel: "noreferrer", ...u }),
    blockquote: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("blockquote", { className: `border-l-2 border-nomi-line pl-3 ${t} text-nomi-ink-60`, ...u }),
    hr: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("hr", { className: "border-nomi-line my-3", ...u }),
    strong: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("strong", { className: "font-semibold text-nomi-ink", ...u }),
    del: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("del", { className: "line-through text-nomi-ink-60", ...u }),
    code: ({ node: a, className: u, children: s, ...f }) => String(u || "").includes("language-") ? /* @__PURE__ */ W.jsx("code", { className: `font-nomi-mono text-caption ${u || ""}`.trim(), ...f, children: s }) : /* @__PURE__ */ W.jsx("code", { className: "font-nomi-mono text-caption bg-nomi-ink-05 rounded-nomi-sm px-1 py-0.5 [overflow-wrap:anywhere]", ...f, children: s }),
    pre: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("pre", { className: `bg-nomi-ink-05 rounded-nomi-sm p-3 ${t} overflow-auto text-nomi-ink-80`, ...u }),
    // GFM 表格：token 化 + 整体可横向滚动（窄聊天列不溢出/不撑破气泡）。
    table: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("div", { className: `${t} max-w-full overflow-x-auto`, children: /* @__PURE__ */ W.jsx("table", { className: "w-full text-caption border-collapse", ...u }) }),
    thead: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("thead", { className: "border-b border-nomi-line", ...u }),
    th: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("th", { className: "px-2 py-1 text-left font-semibold text-nomi-ink border border-nomi-line", ...u }),
    td: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("td", { className: "px-2 py-1 text-nomi-ink-80 border border-nomi-line align-top", ...u }),
    // 任务清单复选框（GFM 输出 disabled input）：token 强调色 + 与文字对齐。
    input: ({ node: a, ...u }) => /* @__PURE__ */ W.jsx("input", { className: "mr-1.5 align-middle accent-nomi-accent", ...u, disabled: !0 })
  };
}
const Hc = ii(!1), $c = ii(!0), Uc = [jc], Vc = mi.memo(function({
  children: t,
  compact: n = !1
}) {
  return /* @__PURE__ */ W.jsx("div", { className: "min-w-0 [overflow-wrap:anywhere]", children: /* @__PURE__ */ W.jsx(Tu, { remarkPlugins: Uc, components: n ? $c : Hc, children: t }) });
});
export {
  Vc as N
};
