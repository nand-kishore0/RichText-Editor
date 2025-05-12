/**
 * Sanitizes HTML to prevent XSS attacks
 * @param html HTML string to sanitize
 * @param allowedTags Array of allowed HTML tags
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  if (!html) return ""

  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  // Define default allowed tags if none provided
  const defaultAllowedTags = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "strong",
    "em",
    "u",
    "s",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "hr",
    "br",
    "sup",
    "sub",
    "span",
    "div",
  ]

  const tagsToAllow = allowedTags.length > 0 ? allowedTags : defaultAllowedTags

  // Define allowed attributes for specific tags
  const allowedAttributes: Record<string, string[]> = {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height"],
    table: ["border", "cellpadding", "cellspacing", "width"],
    th: ["colspan", "rowspan", "scope", "width"],
    td: ["colspan", "rowspan", "width"],
    span: ["style"],
    div: ["style"],
    p: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    h5: ["style"],
    h6: ["style"],
  }

  // Define allowed CSS properties
  const allowedCSSProperties = [
    "color",
    "background-color",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-decoration",
    "text-align",
    "margin",
    "margin-left",
    "margin-right",
    "margin-top",
    "margin-bottom",
    "padding",
    "padding-left",
    "padding-right",
    "padding-top",
    "padding-bottom",
    "border",
    "border-left",
    "border-right",
    "border-top",
    "border-bottom",
    "width",
    "height",
    "max-width",
    "max-height",
    "min-width",
    "min-height",
    "display",
    "line-height",
    "vertical-align",
    "text-indent",
  ]

  // Process all nodes recursively
  const processNode = (node: Node): boolean => {
    // Skip text nodes and comments
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE) {
      return true
    }

    // Process element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const tagName = element.tagName.toLowerCase()

      // Remove disallowed tags
      if (!tagsToAllow.includes(tagName)) {
        // Replace with its contents
        const fragment = document.createDocumentFragment()
        while (element.firstChild) {
          const child = element.firstChild
          element.removeChild(child)
          fragment.appendChild(child)
        }
        element.parentNode?.replaceChild(fragment, element)
        return false
      }

      // Clean attributes
      const attributes = Array.from(element.attributes)
      attributes.forEach((attr) => {
        const attrName = attr.name.toLowerCase()

        // Check if attribute is allowed for this tag
        const allowedAttrsForTag = allowedAttributes[tagName] || []

        if (!allowedAttrsForTag.includes(attrName)) {
          element.removeAttribute(attrName)
        } else if (attrName === "style") {
          // Clean style attribute
          const styles = element.style
          const cleanedStyles: string[] = []

          for (let i = 0; i < styles.length; i++) {
            const propertyName = styles[i]
            if (allowedCSSProperties.includes(propertyName)) {
              const propertyValue = styles.getPropertyValue(propertyName)
              // Check for potentially dangerous values
              if (
                !propertyValue.includes("expression") &&
                !propertyValue.includes("javascript:") &&
                !propertyValue.includes("eval(") &&
                !propertyValue.includes("url(")
              ) {
                cleanedStyles.push(`${propertyName}: ${propertyValue}`)
              }
            }
          }

          // Set cleaned style
          element.setAttribute("style", cleanedStyles.join("; "))
        } else if (attrName === "href" || attrName === "src") {
          // Clean URLs
          const value = attr.value
          if (value.startsWith("javascript:") || (value.startsWith("data:") && !value.startsWith("data:image/"))) {
            element.removeAttribute(attrName)
          }
        }
      })

      // Add security attributes to links
      if (tagName === "a" && element.hasAttribute("href")) {
        element.setAttribute("rel", "noopener noreferrer")

        // If it's an external link, add target="_blank"
        const href = element.getAttribute("href") || ""
        if (href.startsWith("http") && !href.startsWith(window.location.origin)) {
          element.setAttribute("target", "_blank")
        }
      }
    }

    // Process children
    const childNodes = Array.from(node.childNodes)
    for (let i = 0; i < childNodes.length; i++) {
      if (!processNode(childNodes[i])) {
        // If a child was removed, we need to reprocess from the beginning
        // because the childNodes array has changed
        i = -1
      }
    }

    return true
  }

  // Process the entire document
  processNode(tempDiv)

  return tempDiv.innerHTML
}
