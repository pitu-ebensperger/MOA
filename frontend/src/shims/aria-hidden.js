
export function hideOthers(node) {
  if (!node || typeof document === 'undefined') {
    return () => {};
  }

  const originalAttrs = [];
  const bodyChildren = Array.from(document.body.children);

  for (const child of bodyChildren) {
    // skip the node itself (or its ancestors)
    if (child === node || child.contains(node) || node.contains(child)) {
      continue;
    }
    const prev = child.getAttribute('aria-hidden');
    originalAttrs.push([child, prev]);
    try {
      child.setAttribute('aria-hidden', 'true');
    } catch (e) {
      // ignore setting failures
    }
  }

  return function restore() {
    for (const [el, prev] of originalAttrs) {
      try {
        if (prev === null) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', prev);
      } catch (e) {
        // ignore
      }
    }
  };
}

export default hideOthers;
