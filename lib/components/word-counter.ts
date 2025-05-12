export class WordCounter {
  private editor: any
  private counterElement: HTMLElement | null = null
  private debounceTimeout: number | null = null
  private isVisible = true

  constructor(editor: any) {
    this.editor = editor
    this.createCounter()
    this.initEvents()
    this.updateCount()
  }

  private createCounter(): void {
    // Create counter element
    this.counterElement = document.createElement("div")
    this.counterElement.className = "word-counter"
    this.counterElement.style.position = "absolute"
    this.counterElement.style.bottom = "5px"
    this.counterElement.style.right = "10px"
    this.counterElement.style.fontSize = "12px"
    this.counterElement.style.color = "#666"
    this.counterElement.style.padding = "2px 5px"
    this.counterElement.style.backgroundColor = "rgba(255, 255, 255, 0.8)"
    this.counterElement.style.borderRadius = "3px"
    this.counterElement.style.zIndex = "100"
    this.counterElement.style.cursor = "pointer"
    this.counterElement.title = "Click to toggle detailed statistics"

    // Add to editor container
    const editorContainer = this.editor.getContainer()
    editorContainer.style.position = "relative"
    editorContainer.appendChild(this.counterElement)

    // Add click event to toggle between simple and detailed view
    this.counterElement.addEventListener("click", this.toggleDetailedView)
  }

  private initEvents(): void {
    // Listen for input events on the editor
    const editorContent = this.editor.getEditor()
    editorContent.addEventListener("input", this.handleInput)
  }

  private handleInput = (): void => {
    // Debounce the update to avoid performance issues
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    this.debounceTimeout = window.setTimeout(() => {
      this.updateCount()
    }, 300)
  }

  private updateCount(): void {
    if (!this.counterElement) return

    const text = this.editor.getText()

    // Calculate statistics
    const charCount = text.length
    const charCountNoSpaces = text.replace(/\s/g, "").length
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

    // Calculate paragraph and sentence count
    const paragraphCount = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1

    // Rough sentence count (not perfect but a good approximation)
    const sentenceCount = text.split(/[.!?]+\s/).filter((s) => s.trim().length > 0).length || 1

    // Calculate reading time (average reading speed is about 200-250 words per minute)
    const readingTimeMinutes = Math.ceil(wordCount / 225)
    const readingTimeText = readingTimeMinutes <= 1 ? "about 1 minute" : `about ${readingTimeMinutes} minutes`

    if (this.isVisible) {
      // Simple view
      this.counterElement.textContent = `${wordCount} words, ${charCount} characters`
    } else {
      // Detailed view
      this.counterElement.innerHTML = `
        <div style="margin-bottom: 3px;"><strong>Words:</strong> ${wordCount}</div>
        <div style="margin-bottom: 3px;"><strong>Characters:</strong> ${charCount} (${charCountNoSpaces} without spaces)</div>
        <div style="margin-bottom: 3px;"><strong>Paragraphs:</strong> ${paragraphCount}</div>
        <div style="margin-bottom: 3px;"><strong>Sentences:</strong> ${sentenceCount}</div>
        <div><strong>Reading time:</strong> ${readingTimeText}</div>
      `

      // Adjust styles for detailed view
      this.counterElement.style.padding = "8px"
      this.counterElement.style.backgroundColor = "white"
      this.counterElement.style.border = "1px solid #ddd"
      this.counterElement.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)"
    }
  }

  private toggleDetailedView = (): void => {
    this.isVisible = !this.isVisible

    if (this.counterElement) {
      if (this.isVisible) {
        // Switch to simple view
        this.counterElement.style.padding = "2px 5px"
        this.counterElement.style.backgroundColor = "rgba(255, 255, 255, 0.8)"
        this.counterElement.style.border = "none"
        this.counterElement.style.boxShadow = "none"
      }
    }

    this.updateCount()
  }

  public destroy(): void {
    // Remove event listeners
    const editorContent = this.editor.getEditor()
    editorContent.removeEventListener("input", this.handleInput)

    // Clear any pending timeouts
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    // Remove counter element
    if (this.counterElement) {
      this.counterElement.removeEventListener("click", this.toggleDetailedView)
      this.counterElement.parentNode?.removeChild(this.counterElement)
      this.counterElement = null
    }
  }
}
