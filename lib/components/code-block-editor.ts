export class CodeBlockEditor {
  private editor: any
  private codeBlockDialog: HTMLElement | null = null
  private activeCodeBlock: HTMLElement | null = null
  private languages = [
    { name: "Plain Text", value: "plaintext" },
    { name: "HTML", value: "html" },
    { name: "CSS", value: "css" },
    { name: "JavaScript", value: "javascript" },
    { name: "TypeScript", value: "typescript" },
    { name: "Python", value: "python" },
    { name: "Java", value: "java" },
    { name: "C#", value: "csharp" },
    { name: "PHP", value: "php" },
    { name: "Ruby", value: "ruby" },
    { name: "Go", value: "go" },
    { name: "Rust", value: "rust" },
    { name: "Swift", value: "swift" },
    { name: "Kotlin", value: "kotlin" },
    { name: "SQL", value: "sql" },
    { name: "XML", value: "xml" },
    { name: "JSON", value: "json" },
    { name: "Markdown", value: "markdown" },
    { name: "YAML", value: "yaml" },
    { name: "Bash", value: "bash" },
  ]

  constructor(editor: any) {
    this.editor = editor
    this.initEvents()
  }

  private initEvents(): void {
    // Listen for clicks on code blocks in the editor
    const editorContent = this.editor.getEditor()
    editorContent.addEventListener("click", this.handleCodeBlockClick)

    // Listen for mousedown on the document to handle clicks outside the code block
    document.addEventListener("mousedown", this.handleDocumentMouseDown)
  }

  private handleCodeBlockClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement

    // Check if the clicked element is a code block or inside a code block
    const codeBlock = target.closest("pre")

    if (codeBlock) {
      e.preventDefault()

      // Set the active code block
      this.activeCodeBlock = codeBlock

      // Add edit button if not already present
      this.addEditButton(codeBlock)
    }
  }

  private handleDocumentMouseDown = (e: MouseEvent): void => {
    const target = e.target as HTMLElement

    // Check if the click is outside the active code block and edit button
    if (
      this.activeCodeBlock &&
      !this.activeCodeBlock.contains(target) &&
      !target.classList.contains("code-block-edit-button")
    ) {
      this.removeEditButton()
      this.activeCodeBlock = null
    }

    // Check if the click is outside the code block dialog
    if (this.codeBlockDialog && !this.codeBlockDialog.contains(target)) {
      this.closeDialog()
    }
  }

  private addEditButton(codeBlock: HTMLElement): void {
    // Remove any existing edit buttons
    this.removeEditButton()

    // Create edit button
    const editButton = document.createElement("button")
    editButton.className = "code-block-edit-button"
    editButton.innerHTML = "✎"
    editButton.title = "Edit Code Block"
    editButton.style.position = "absolute"
    editButton.style.top = "5px"
    editButton.style.right = "5px"
    editButton.style.backgroundColor = "#1a73e8"
    editButton.style.color = "white"
    editButton.style.border = "none"
    editButton.style.borderRadius = "4px"
    editButton.style.padding = "4px 8px"
    editButton.style.cursor = "pointer"
    editButton.style.zIndex = "1000"

    // Add event listener for editing
    editButton.addEventListener("click", () => this.editCodeBlock(codeBlock))

    // Position the button relative to the code block
    const codeBlockRect = codeBlock.getBoundingClientRect()
    const editorRect = this.editor.getContainer().getBoundingClientRect()

    // Make the code block position relative for absolute positioning of the button
    codeBlock.style.position = "relative"

    // Append the button to the code block
    codeBlock.appendChild(editButton)
  }

  private removeEditButton(): void {
    // Remove any existing edit buttons
    const editButtons = document.querySelectorAll(".code-block-edit-button")
    editButtons.forEach((button) => {
      button.parentNode?.removeChild(button)
    })
  }

  private editCodeBlock(codeBlock: HTMLElement): void {
    // Get the code and language from the code block
    const codeElement = codeBlock.querySelector("code")
    const code = codeElement ? codeElement.textContent || "" : codeBlock.textContent || ""
    const language = codeElement ? codeElement.className.replace("language-", "") || "plaintext" : "plaintext"

    // Show the code block dialog
    this.showCodeBlockDialog(code, language)
  }

  public insertCodeBlock(): void {
    // Show the code block dialog with empty content
    this.showCodeBlockDialog("", "plaintext")
  }

  private showCodeBlockDialog(code: string, language: string): void {
    // Create dialog if it doesn't exist
    if (!this.codeBlockDialog) {
      this.createCodeBlockDialog()
    }

    if (!this.codeBlockDialog) return

    // Set the code and language in the dialog
    const codeTextarea = this.codeBlockDialog.querySelector("#code-block-code") as HTMLTextAreaElement
    const languageSelect = this.codeBlockDialog.querySelector("#code-block-language") as HTMLSelectElement

    if (codeTextarea && languageSelect) {
      codeTextarea.value = code
      languageSelect.value = language
    }

    // Show the dialog
    this.codeBlockDialog.style.display = "block"

    // Focus the textarea
    setTimeout(() => {
      codeTextarea?.focus()
    }, 0)
  }

  private createCodeBlockDialog(): void {
    // Create dialog element
    this.codeBlockDialog = document.createElement("div")
    this.codeBlockDialog.className = "code-block-dialog"
    this.codeBlockDialog.style.position = "fixed"
    this.codeBlockDialog.style.top = "50%"
    this.codeBlockDialog.style.left = "50%"
    this.codeBlockDialog.style.transform = "translate(-50%, -50%)"
    this.codeBlockDialog.style.backgroundColor = "white"
    this.codeBlockDialog.style.border = "1px solid #ddd"
    this.codeBlockDialog.style.borderRadius = "4px"
    this.codeBlockDialog.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
    this.codeBlockDialog.style.padding = "20px"
    this.codeBlockDialog.style.zIndex = "1050"
    this.codeBlockDialog.style.minWidth = "500px"
    this.codeBlockDialog.style.maxWidth = "80%"
    this.codeBlockDialog.style.display = "none"

    // Create dialog content
    this.codeBlockDialog.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 15px;">Edit Code Block</h3>
      
      <div style="margin-bottom: 15px;">
        <label for="code-block-language" style="display: block; margin-bottom: 5px;">Language:</label>
        <select id="code-block-language" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          ${this.languages.map((lang) => `<option value="${lang.value}">${lang.name}</option>`).join("")}
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="code-block-code" style="display: block; margin-bottom: 5px;">Code:</label>
        <textarea id="code-block-code" style="width: 100%; height: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; white-space: pre; overflow: auto;"></textarea>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button id="code-block-cancel" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer;">Cancel</button>
        <button id="code-block-insert" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #1a73e8; color: white; cursor: pointer;">Insert</button>
      </div>
    `

    // Add event listeners
    const cancelButton = this.codeBlockDialog.querySelector("#code-block-cancel")
    const insertButton = this.codeBlockDialog.querySelector("#code-block-insert")

    if (cancelButton && insertButton) {
      cancelButton.addEventListener("click", () => this.closeDialog())
      insertButton.addEventListener("click", () => this.insertOrUpdateCodeBlock())
    }

    // Add to document body
    document.body.appendChild(this.codeBlockDialog)
  }

  private closeDialog(): void {
    if (this.codeBlockDialog) {
      this.codeBlockDialog.style.display = "none"
    }
  }

  private insertOrUpdateCodeBlock(): void {
    if (!this.codeBlockDialog) return

    // Get the code and language from the dialog
    const codeTextarea = this.codeBlockDialog.querySelector("#code-block-code") as HTMLTextAreaElement
    const languageSelect = this.codeBlockDialog.querySelector("#code-block-language") as HTMLSelectElement

    if (!codeTextarea || !languageSelect) return

    const code = codeTextarea.value
    const language = languageSelect.value

    // Create HTML for the code block
    const codeBlockHTML = `<pre style="background-color: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 1em 0;"><code class="language-${language}">${this.escapeHTML(code)}</code></pre>`

    if (this.activeCodeBlock) {
      // Update existing code block
      this.activeCodeBlock.outerHTML = codeBlockHTML
    } else {
      // Insert new code block
      this.editor.insertHTML(codeBlockHTML)
    }

    // Close the dialog
    this.closeDialog()

    // Update the editor content
    this.editor.handleInput()

    // Clear active code block reference
    this.activeCodeBlock = null
  }

  private escapeHTML(html: string): string {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  public destroy(): void {
    // Remove event listeners
    const editorContent = this.editor.getEditor()
    editorContent.removeEventListener("click", this.handleCodeBlockClick)
    document.removeEventListener("mousedown", this.handleDocumentMouseDown)

    // Remove dialog if it exists
    if (this.codeBlockDialog) {
      document.body.removeChild(this.codeBlockDialog)
      this.codeBlockDialog = null
    }

    // Remove any active edit buttons
    this.removeEditButton()
  }
}
