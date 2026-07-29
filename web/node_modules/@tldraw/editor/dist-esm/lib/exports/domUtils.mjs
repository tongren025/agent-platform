function getRenderedChildNodes(node) {
  if (node.shadowRoot) {
    return node.shadowRoot.childNodes;
  }
  if (isShadowSlotElement(node)) {
    const assignedNodes = node.assignedNodes();
    if (assignedNodes?.length) {
      return assignedNodes;
    }
  }
  return node.childNodes;
}
function* getRenderedChildren(node) {
  for (const child of getRenderedChildNodes(node)) {
    if (isElement(child)) yield child;
  }
}
function getOwnerWindow(nodeOrDocument) {
  if (!nodeOrDocument) return globalThis;
  const doc = isDocument(nodeOrDocument) ? nodeOrDocument : nodeOrDocument.ownerDocument;
  return doc?.defaultView ?? globalThis;
}
function getOwnerDocument(nodeOrDocument) {
  if (!nodeOrDocument) return globalThis.document;
  if (isDocument(nodeOrDocument)) return nodeOrDocument;
  return nodeOrDocument.ownerDocument ?? globalThis.document;
}
function isDocument(node) {
  return node.nodeType === Node.DOCUMENT_NODE;
}
function getWindow(node) {
  return node.ownerDocument?.defaultView ?? globalThis;
}
function isElement(node) {
  return node instanceof getWindow(node).Element;
}
function isShadowRoot(node) {
  return node instanceof getWindow(node).ShadowRoot;
}
function isInShadowRoot(node) {
  return "getRootNode" in node && isShadowRoot(node.getRootNode());
}
function isShadowSlotElement(node) {
  return isInShadowRoot(node) && node instanceof getWindow(node).HTMLSlotElement;
}
function elementStyle(element) {
  return element.style;
}
function getComputedStyle(element, pseudoElement) {
  return getWindow(element).getComputedStyle(element, pseudoElement);
}
export {
  elementStyle,
  getComputedStyle,
  getOwnerDocument,
  getOwnerWindow,
  getRenderedChildNodes,
  getRenderedChildren,
  isElement
};
//# sourceMappingURL=domUtils.mjs.map
