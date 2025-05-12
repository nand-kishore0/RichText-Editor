export class FontSelector {
  private editor: any
  private fontFamilyElement: HTMLElement | null = null
  private fontSizeElement: HTMLElement | null = null

  constructor(editor: any) {
    this.editor = editor
  }

  public showFontFamilySelector(): void {
    // Create font family selector if it doesn't exist
    if (!this.fontFamilyElement) {
      this.createFontFamilySelector()
    }

    // Position the font family selector
    const toolbar = this.editor.getToolbar()
    const button = toolbar.querySelector('[data-command="fontName"]')
    if (button && this.fontFamilyElement) {
      const buttonRect = button.getBoundingClientRect()
      const containerRect = this.editor.getContainer().getBoundingClientRect()

      this.fontFamilyElement.style.top = `${buttonRect.bottom - containerRect.top}px`
      this.fontFamilyElement.style.left = `${buttonRect.left - containerRect.left}px`
      this.fontFamilyElement.style.display = "block"
    }

    // Add click outside listener
    document.addEventListener("click", this.handleFontFamilyClickOutside)
  }

  public showFontSizeSelector(): void {
    // Create font size selector if it doesn't exist
    if (!this.fontSizeElement) {
      this.createFontSizeSelector()
    }

    // Position the font size selector
    const toolbar = this.editor.getToolbar()
    const button = toolbar.querySelector('[data-command="fontSize"]')
    if (button && this.fontSizeElement) {
      const buttonRect = button.getBoundingClientRect()
      const containerRect = this.editor.getContainer().getBoundingClientRect()

      this.fontSizeElement.style.top = `${buttonRect.bottom - containerRect.top}px`
      this.fontSizeElement.style.left = `${buttonRect.left - containerRect.left}px`
      this.fontSizeElement.style.display = "block"
    }

    // Add click outside listener
    document.addEventListener("click", this.handleFontSizeClickOutside)
  }

  private createFontFamilySelector(): void {
    this.fontFamilyElement = document.createElement("div")
    this.fontFamilyElement.className = "font-family-selector"
    this.fontFamilyElement.style.display = "none"

    // Define font families
    const fontFamilies = [
      { name: "Arial", value: "Arial, Helvetica, sans-serif" },
      { name: "Arial Black", value: "'Arial Black', Gadget, sans-serif" },
      { name: "Comic Sans MS", value: "'Comic Sans MS', cursive, sans-serif" },
      { name: "Courier New", value: "'Courier New', Courier, monospace" },
      { name: "Georgia", value: "Georgia, serif" },
      { name: "Impact", value: "Impact, Charcoal, sans-serif" },
      { name: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
      { name: "Lucida Sans Unicode", value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif" },
      { name: "Palatino Linotype", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
      { name: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
      { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
      { name: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
      { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
    ]

    // Create font family list
    fontFamilies.forEach((font) => {
      const fontElement = document.createElement("div")
      fontElement.className = "font-family-item"
      fontElement.textContent = font.name
      fontElement.style.fontFamily = font.value
      fontElement.addEventListener("click", () => this.setFontFamily(font.value))
      this.fontFamilyElement?.appendChild(fontElement)
    })

    // Add to editor container
    this.editor.getContainer().appendChild(this.fontFamilyElement)
  }

  private createFontSizeSelector(): void {
    this.fontSizeElement = document.createElement("div")
    this.fontSizeElement.className = "font-size-selector"
    this.fontSizeElement.style.display = "none"

    // Define font sizes
    const fontSizes = [
      { name: "8px", value: "1" },
      { name: "10px", value: "2" },
      { name: "12px", value: "3" },
      { name: "14px", value: "4" },
      { name: "18px", value: "5" },
      { name: "24px", value: "6" },
      { name: "36px", value: "7" },
    ]

    // Create font size list
    fontSizes.forEach((size) => {
      const sizeElement = document.createElement("div")
      sizeElement.className = "font-size-item"
      sizeElement.textContent = size.name
      sizeElement.style.fontSize = size.name
      sizeElement.addEventListener("click", () => this.setFontSize(size.value))
      this.fontSizeElement?.appendChild(sizeElement)
    })

    // Add custom size input
    const customSizeContainer = document.createElement("div")
    customSizeContainer.className = "custom-size-container"

    const customSizeInput = document.createElement("input")
    customSizeInput.type = "number"
    customSizeInput.min = "1"
    customSizeInput.max = "100"
    customSizeInput.placeholder = "Custom size (px)"
    customSizeInput.className = "custom-size-input"

    const customSizeButton = document.createElement("button")
    customSizeButton.className = "custom-size-button"
    customSizeButton.textContent = "Apply"
    customSizeButton.addEventListener("click", () => {
      const size = customSizeInput.value
      if (size) {
        this.setCustomFontSize(`${size}px`)
      }
    })

    customSizeContainer.appendChild(customSizeInput)
    customSizeContainer.appendChild(customSizeButton)

    this.fontSizeElement.appendChild(customSizeContainer)

    // Add to editor container
    this.editor.getContainer().appendChild(this.fontSizeElement)
  }

  private setFontFamily(fontFamily: string): void {
    this.editor.restoreSelection()
    this.editor.execCommand("fontName", fontFamily)
    this.hideFontFamilySelector()
  }

  private setFontSize(fontSize: string): void {
    this.editor.restoreSelection()
    this.editor.execCommand("fontSize", fontSize)
    this.hideFontSizeSelector()
  }

  private setCustomFontSize(fontSize: string): void {
    this.editor.restoreSelection()

    // We need to use a different approach for custom font sizes
    // since execCommand("fontSize") only supports values 1-7

    // Get the current selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // If the selection is collapsed (just a cursor), we need to handle differently
    if (range.collapsed) {
      // Create a span with the font size
      const span = document.createElement("span")
      span.style.fontSize = fontSize
      span.innerHTML = "&#8203;" // Zero-width space

      // Insert the span
      range.insertNode(span)

      // Move the cursor inside the span
      range.setStart(span.firstChild as Node, 1)
      range.setEnd(span.firstChild as Node, 1)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      // Create a span with the font size
      const span = document.createElement("span")
      span.style.fontSize = fontSize

      // Extract the contents of the range and put them in the span
      span.appendChild(range.extractContents())

      // Insert the span
      range.insertNode(span)

      // Select the span contents
      range.selectNodeContents(span)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    this.hideFontSizeSelector()
  }

  private handleFontFamilyClickOutside = (e: MouseEvent): void => {
    if (this.fontFamilyElement && !this.fontFamilyElement.contains(e.target as Node)) {
      this.hideFontFamilySelector()
    }
  }

  private handleFontSizeClickOutside = (e: MouseEvent): void => {
    if (this.fontSizeElement && !this.fontSizeElement.contains(e.target as Node)) {
      this.hideFontSizeSelector()
    }
  }

  public hideFontFamilySelector(): void {
    if (this.fontFamilyElement) {
      this.fontFamilyElement.style.display = "none"
    }
    document.removeEventListener("click", this.handleFontFamilyClickOutside)
  }

  public hideFontSizeSelector(): void {
    if (this.fontSizeElement) {
      this.fontSizeElement.style.display = "none"
    }
    document.removeEventListener("click", this.handleFontSizeClickOutside)
  }

  public destroy(): void {
    if (this.fontFamilyElement) {
      this.fontFamilyElement.remove()
      this.fontFamilyElement = null
    }
    if (this.fontSizeElement) {
      this.fontSizeElement.remove()
      this.fontSizeElement = null
    }
    document.removeEventListener("click", this.handleFontFamilyClickOutside)
    document.removeEventListener("click", this.handleFontSizeClickOutside)
  }
}
