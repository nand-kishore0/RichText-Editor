// This is an example of how to extend the base editor with more features
// Not used in the demo but provided as a reference

import { RichEditor } from "./rich-editor"

type ExtendedEditorOptions = {
  container: HTMLElement
  placeholder?: string
  onChange?: (html: string) => void
  initialValue?: string
  customButtons?: Array<{
    name: string
    icon: string
    title: string
    action: (editor: ExtendedRichEditor) => void
  }>
  allowedTags?: string[]
}

export class ExtendedRichEditor extends RichEditor {
  private customButtons: ExtendedEditorOptions["customButtons"]
  private allowedTags: string[]

  constructor(options: ExtendedEditorOptions) {
    super(options)
    this.customButtons = options.customButtons || []
    this.allowedTags = options.allowedTags || [
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
      "a",
      "strong",
      "em",
      "u",
      "strike",
      "blockquote",
      "pre",
      "code",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "br",
    ]

    // Add custom buttons if provided
    if (this.customButtons && this.customButtons.length > 0) {
      this.addCustomButtons()
    }
  }

  private addCustomButtons() {
    const toolbar = this.getToolbar()
    if (!toolbar || !this.customButtons) return

    // Add separator before custom buttons
    const separator = document.createElement("span")
    separator.className = "toolbar-separator"
    toolbar.appendChild(separator)

    // Add each custom button
    this.customButtons.forEach((button) => {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "toolbar-button custom-button"
      btn.innerHTML = button.icon || ""
      btn.title = button.title || ""
      btn.setAttribute("data-custom-command", button.name)

      btn.addEventListener("click", (e) => {
        e.preventDefault()
        button.action(this)
      })

      toolbar.appendChild(btn)
    })
  }

  // Helper method to get the toolbar element
  private getToolbar(): HTMLElement | null {
    return this.getContainer().querySelector(".editor-toolbar")
  }

  // Helper method to get the container element
  public getContainer(): HTMLElement {
    return this.container
  }

  // Override sanitizeHTML to use the allowed tags list
  public sanitizeHTML(html: string): string {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html

    // Remove all elements not in the allowed tags list
    const allElements = tempDiv.querySelectorAll("*")
    allElements.forEach((el) => {
      if (!this.allowedTags.includes(el.tagName.toLowerCase())) {
        // Replace with its contents
        const fragment = document.createDocumentFragment()
        while (el.firstChild) {
          fragment.appendChild(el.firstChild)
        }
        el.parentNode?.replaceChild(fragment, el)
      }

      // Remove on* attributes and other potentially dangerous attributes
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith("on") || (attr.name === "style" && attr.value.includes("expression"))) {
          el.removeAttribute(attr.name)
        }
      })
    })

    return tempDiv.innerHTML
  }

  // Add method to insert a template
  public insertTemplate(templateName: string): void {
    const templates: Record<string, string> = {
      signature: `
        <div class="signature">
          <p>Best regards,</p>
          <p><strong>Your Name</strong></p>
          <p>Your Title | Your Company</p>
          <p><a href="mailto:email@example.com">email@example.com</a></p>
        </div>
      `,
      callout: `
        <div class="callout" style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #5c6bc0; margin: 20px 0;">
          <h4 style="margin-top: 0;">Important Note</h4>
          <p style="margin-bottom: 0;">This is a callout box for important information.</p>
        </div>
      `,
      twoColumn: `
        <div style="display: flex; gap: 20px; margin: 20px 0;">
          <div style="flex: 1;">
            <h3>Column 1</h3>
            <p>Content for the first column goes here.</p>
          </div>
          <div style="flex: 1;">
            <h3>Column 2</h3>
            <p>Content for the second column goes here.</p>
          </div>
        </div>
      `,
    }

    const template = templates[templateName]
    if (template) {
      this.insertHTML(template)
    }
  }

  // Add method to export to Markdown (basic implementation)
  public exportToMarkdown(): string {
    const html = this.getHTML()
    let markdown = html
      .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<h4>(.*?)<\/h4>/gi, "#### $1\n\n")
      .replace(/<h5>(.*?)<\/h5>/gi, "##### $1\n\n")
      .replace(/<h6>(.*?)<\/h6>/gi, "###### $1\n\n")
      .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i>(.*?)<\/i>/gi, "*$1*")
      .replace(/<a href="(.*?)">(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<ul>(.*?)<\/ul>/gis, (match, p1) => {
        return p1.replace(/<li>(.*?)<\/li>/gi, "- $1\n")
      })
      .replace(/<ol>(.*?)<\/ol>/gis, (match, p1) => {
        let index = 1
        return p1.replace(/<li>(.*?)<\/li>/gi, () => {
          return `${index++}. $1\n`
        })
      })
      .replace(/<blockquote>(.*?)<\/blockquote>/gis, "> $1\n\n")
      .replace(/<pre>(.*?)<\/pre>/gis, "```\n$1\n```\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "---\n\n")
      .replace(/<img.*?src="(.*?)".*?>/gi, "![]($1)\n\n")

    // Clean up any remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, "")

    // Fix multiple newlines
    markdown = markdown.replace(/\n\n\n+/g, "\n\n")

    return markdown
  }
}
