/**
 * Converts HTML to Markdown
 * @param html HTML string to convert
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return ""

  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  // Process the DOM tree and convert to Markdown
  let markdown = processNode(tempDiv)

  // Clean up extra newlines
  markdown = markdown.replace(/\n\n\n+/g, "\n\n")

  return markdown.trim()
}

function processNode(node: Node, level = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ""
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ""
  }

  const element = node as HTMLElement
  const tagName = element.tagName.toLowerCase()
  let result = ""

  // Process by tag type
  switch (tagName) {
    case "h1":
      result = `# ${getTextContent(element)}\n\n`
      break

    case "h2":
      result = `## ${getTextContent(element)}\n\n`
      break

    case "h3":
      result = `### ${getTextContent(element)}\n\n`
      break

    case "h4":
      result = `#### ${getTextContent(element)}\n\n`
      break

    case "h5":
      result = `##### ${getTextContent(element)}\n\n`
      break

    case "h6":
      result = `###### ${getTextContent(element)}\n\n`
      break

    case "p":
      result = `${processChildren(element)}\n\n`
      break

    case "strong":
    case "b":
      result = `**${processChildren(element)}**`
      break

    case "em":
    case "i":
      result = `*${processChildren(element)}*`
      break

    case "u":
      result = `<u>${processChildren(element)}</u>`
      break

    case "s":
    case "strike":
    case "del":
      result = `~~${processChildren(element)}~~`
      break

    case "a":
      const href = element.getAttribute("href") || ""
      const text = processChildren(element)
      result = `[${text}](${href})`
      break

    case "img":
      const src = element.getAttribute("src") || ""
      const alt = element.getAttribute("alt") || ""
      result = `![${alt}](${src})`
      break

    case "blockquote":
      // Add > to each line
      const blockquoteContent = processChildren(element)
      result =
        blockquoteContent
          .split("\n")
          .map((line) => (line ? `> ${line}` : ">"))
          .join("\n") + "\n\n"
      break

    case "pre":
      // Check if it contains a code block
      if (element.querySelector("code")) {
        // The code element will be processed separately
        result = processChildren(element)
      } else {
        // Treat as a code block
        result = "```\n" + getTextContent(element) + "\n```\n\n"
      }
      break

    case "code":
      // Check if it's inside a pre
      if (element.parentElement?.tagName.toLowerCase() === "pre") {
        // Code block
        const language = element.className.replace("language-", "").trim()
        result = "```" + language + "\n" + getTextContent(element) + "\n```\n\n"
      } else {
        // Inline code
        result = "`" + getTextContent(element) + "`"
      }
      break

    case "ul":
      result = processChildren(element, level) + "\n"
      break

    case "ol":
      result = processChildren(element, level) + "\n"
      break

    case "li":
      const parent = element.parentElement
      const isOrdered = parent?.tagName.toLowerCase() === "ol"
      const index = Array.from(parent?.children || []).indexOf(element) + 1

      const prefix = isOrdered ? `${index}. ` : "- "

      // Add indentation based on nesting level
      const indent = "  ".repeat(level)

      // Process the content of the list item
      let content = processChildren(element, level + 1)

      // Handle multi-line content
      if (content.includes("\n")) {
        const lines = content.split("\n")
        content =
          lines[0] +
          "\n" +
          lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line) => indent + "  " + line)
            .join("\n")
      }

      result = indent + prefix + content + "\n"
      break

    case "hr":
      result = "---\n\n"
      break

    case "br":
      result = "\n"
      break

    case "table":
      result = processTable(element) + "\n\n"
      break

    case "div":
      // Process div as a container
      result = processChildren(element) + "\n"
      break

    case "span":
      // Process span inline
      result = processChildren(element)
      break

    case "sup":
      result = `<sup>${processChildren(element)}</sup>`
      break

    case "sub":
      result = `<sub>${processChildren(element)}</sub>`
      break

    default:
      // For unknown elements, just process their children
      result = processChildren(element)
  }

  return result
}

function processChildren(element: HTMLElement, level = 0): string {
  let result = ""

  for (const child of Array.from(element.childNodes)) {
    result += processNode(child, level)
  }

  return result
}

function getTextContent(element: HTMLElement): string {
  return element.textContent || ""
}

function processTable(table: HTMLElement): string {
  let result = ""

  // Process header row
  const headerRow = table.querySelector("thead tr")
  if (headerRow) {
    const headers = Array.from(headerRow.querySelectorAll("th"))

    // Create header row
    result += "| " + headers.map((th) => getTextContent(th).trim()).join(" | ") + " |\n"

    // Create separator row
    result += "| " + headers.map(() => "---").join(" | ") + " |\n"
  }

  // Process body rows
  const bodyRows = table.querySelectorAll("tbody tr")
  for (const row of Array.from(bodyRows)) {
    const cells = Array.from(row.querySelectorAll("td"))
    result += "| " + cells.map((td) => getTextContent(td).trim()).join(" | ") + " |\n"
  }

  return result
}
