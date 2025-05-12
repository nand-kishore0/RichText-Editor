/**
 * Converts Markdown to HTML
 * @param markdown Markdown string to convert
 * @returns HTML string
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ""

  // Replace line breaks with <br>
  let html = markdown.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")

  // Headers
  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>")
  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>")
  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>")
  html = html.replace(/^#### (.*?)$/gm, "<h4>$1</h4>")
  html = html.replace(/^##### (.*?)$/gm, "<h5>$1</h5>")
  html = html.replace(/^###### (.*?)$/gm, "<h6>$1</h6>")

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>")

  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")
  html = html.replace(/_(.*?)_/g, "<em>$1</em>")

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, "<s>$1</s>")

  // Code blocks
  html = html.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, code) => {
    return `<pre><code class="language-${language.trim()}">${code}</code></pre>`
  })

  // Inline code
  html = html.replace(/`(.*?)`/g, "<code>$1</code>")

  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, "<blockquote>$1</blockquote>")

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>")

  // Unordered lists
  html = html.replace(/^- (.*?)$/gm, "<li>$1</li>")
  html = html.replace(/^\* (.*?)$/gm, "<li>$1</li>")
  html = html.replace(/^\+ (.*?)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>")

  // Ordered lists
  html = html.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*?<\/li>)+/g, (match) => {
    return match.includes("<ul>") ? match : "<ol>" + match + "</ol>"
  })

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')

  // Tables
  html = html.replace(/\|(.+)\|\n\|([-:]+[-| :]*)\|\n((?:\|.+\|\n?)+)/g, (match, header, separator, rows) => {
    const headers = header
      .split("|")
      .map((h) => h.trim())
      .filter(Boolean)
    const alignments = separator
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
    const rowsArray = rows.trim().split("\n")

    let tableHtml = "<table><thead><tr>"

    // Add headers
    headers.forEach((h, i) => {
      let align = ""
      if (alignments[i]) {
        if (alignments[i].startsWith(":") && alignments[i].endsWith(":")) {
          align = ' style="text-align: center"'
        } else if (alignments[i].endsWith(":")) {
          align = ' style="text-align: right"'
        } else if (alignments[i].startsWith(":")) {
          align = ' style="text-align: left"'
        }
      }
      tableHtml += `<th${align}>${h}</th>`
    })

    tableHtml += "</tr></thead><tbody>"

    // Add rows
    rowsArray.forEach((row) => {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
      tableHtml += "<tr>"
      cells.forEach((c, i) => {
        let align = ""
        if (alignments[i]) {
          if (alignments[i].startsWith(":") && alignments[i].endsWith(":")) {
            align = ' style="text-align: center"'
          } else if (alignments[i].endsWith(":")) {
            align = ' style="text-align: right"'
          } else if (alignments[i].startsWith(":")) {
            align = ' style="text-align: left"'
          }
        }
        tableHtml += `<td${align}>${c}</td>`
      })
      tableHtml += "</tr>"
    })

    tableHtml += "</tbody></table>"
    return tableHtml
  })

  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith("<")) {
    html = "<p>" + html + "</p>"
  }

  return html
}