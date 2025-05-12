export class ColorPicker {
  private editor: any
  private colorPickerElement: HTMLElement | null = null
  private currentCommand = ""
  private recentColors: string[] = []
  private maxRecentColors = 8

  constructor(editor: any) {
    this.editor = editor
    this.loadRecentColors()
  }

  public show(command: string): void {
    this.currentCommand = command

    // Create color picker if it doesn't exist
    if (!this.colorPickerElement) {
      this.createColorPicker()
    }

    // Position the color picker
    const toolbar = this.editor.getToolbar()
    const button = toolbar.querySelector(`[data-command="${command}"]`)
    if (button && this.colorPickerElement) {
      const buttonRect = button.getBoundingClientRect()
      const containerRect = this.editor.getContainer().getBoundingClientRect()

      this.colorPickerElement.style.top = `${buttonRect.bottom - containerRect.top}px`
      this.colorPickerElement.style.left = `${buttonRect.left - containerRect.left}px`
      this.colorPickerElement.style.display = "block"
    }

    // Add click outside listener
    document.addEventListener("click", this.handleClickOutside)
  }

  private createColorPicker(): void {
    this.colorPickerElement = document.createElement("div")
    this.colorPickerElement.className = "color-picker"
    this.colorPickerElement.style.display = "none"

    // Add predefined colors
    const colors = [
      "#000000",
      "#434343",
      "#666666",
      "#999999",
      "#b7b7b7",
      "#cccccc",
      "#d9d9d9",
      "#efefef",
      "#f3f3f3",
      "#ffffff",
      "#980000",
      "#ff0000",
      "#ff9900",
      "#ffff00",
      "#00ff00",
      "#00ffff",
      "#4a86e8",
      "#0000ff",
      "#9900ff",
      "#ff00ff",
      "#e6b8af",
      "#f4cccc",
      "#fce5cd",
      "#fff2cc",
      "#d9ead3",
      "#d0e0e3",
      "#c9daf8",
      "#cfe2f3",
      "#d9d2e9",
      "#ead1dc",
      "#dd7e6b",
      "#ea9999",
      "#f9cb9c",
      "#ffe599",
      "#b6d7a8",
      "#a2c4c9",
      "#a4c2f4",
      "#9fc5e8",
      "#b4a7d6",
      "#d5a6bd",
      "#cc4125",
      "#e06666",
      "#f6b26b",
      "#ffd966",
      "#93c47d",
      "#76a5af",
      "#6d9eeb",
      "#6fa8dc",
      "#8e7cc3",
      "#c27ba0",
      "#a61c00",
      "#cc0000",
      "#e69138",
      "#f1c232",
      "#6aa84f",
      "#45818e",
      "#3c78d8",
      "#3d85c6",
      "#674ea7",
      "#a64d79",
      "#85200c",
      "#990000",
      "#b45f06",
      "#bf9000",
      "#38761d",
      "#134f5c",
      "#1155cc",
      "#0b5394",
      "#351c75",
      "#741b47",
      "#5b0f00",
      "#660000",
      "#783f04",
      "#7f6000",
      "#274e13",
      "#0c343d",
      "#1c4587",
      "#073763",
      "#20124d",
      "#4c1130",
    ]

    // Create color grid
    const colorGrid = document.createElement("div")
    colorGrid.className = "color-grid"

    colors.forEach((color) => {
      const colorSwatch = document.createElement("div")
      colorSwatch.className = "color-swatch"
      colorSwatch.style.backgroundColor = color
      colorSwatch.setAttribute("data-color", color)
      colorSwatch.addEventListener("click", () => this.selectColor(color))
      colorGrid.appendChild(colorSwatch)
    })

    // Create recent colors section
    const recentColorsSection = document.createElement("div")
    recentColorsSection.className = "recent-colors"

    const recentColorsTitle = document.createElement("div")
    recentColorsTitle.className = "recent-colors-title"
    recentColorsTitle.textContent = "Recent Colors"
    recentColorsSection.appendChild(recentColorsTitle)

    const recentColorsGrid = document.createElement("div")
    recentColorsGrid.className = "recent-colors-grid"

    this.recentColors.forEach((color) => {
      const colorSwatch = document.createElement("div")
      colorSwatch.className = "color-swatch"
      colorSwatch.style.backgroundColor = color
      colorSwatch.setAttribute("data-color", color)
      colorSwatch.addEventListener("click", () => this.selectColor(color))
      recentColorsGrid.appendChild(colorSwatch)
    })

    recentColorsSection.appendChild(recentColorsGrid)

    // Create custom color input
    const customColorSection = document.createElement("div")
    customColorSection.className = "custom-color"

    const customColorInput = document.createElement("input")
    customColorInput.type = "text"
    customColorInput.placeholder = "#RRGGBB or rgb(r,g,b)"
    customColorInput.className = "custom-color-input"

    const customColorButton = document.createElement("button")
    customColorButton.className = "custom-color-button"
    customColorButton.textContent = "Apply"
    customColorButton.addEventListener("click", () => {
      const color = customColorInput.value
      if (this.isValidColor(color)) {
        this.selectColor(color)
      }
    })

    customColorSection.appendChild(customColorInput)
    customColorSection.appendChild(customColorButton)

    // Add color picker if supported
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      const eyeDropperButton = document.createElement("button")
      eyeDropperButton.className = "eye-dropper-button"
      eyeDropperButton.textContent = "Pick Color"
      eyeDropperButton.addEventListener("click", async () => {
        try {
          // @ts-ignore - EyeDropper is not in TypeScript DOM lib yet
          const eyeDropper = new EyeDropper()
          const result = await eyeDropper.open()
          customColorInput.value = result.sRGBHex
        } catch (e) {
          console.error("Error using EyeDropper:", e)
        }
      })
      customColorSection.appendChild(eyeDropperButton)
    }

    // Assemble color picker
    this.colorPickerElement.appendChild(colorGrid)
    this.colorPickerElement.appendChild(recentColorsSection)
    this.colorPickerElement.appendChild(customColorSection)

    // Add to editor container
    this.editor.getContainer().appendChild(this.colorPickerElement)
  }

  private selectColor(color: string): void {
    // Apply the color
    this.editor.execCommand(this.currentCommand, color)

    // Add to recent colors
    this.addToRecentColors(color)

    // Hide the color picker
    this.hide()
  }

  private addToRecentColors(color: string): void {
    // Remove if already exists
    const index = this.recentColors.indexOf(color)
    if (index !== -1) {
      this.recentColors.splice(index, 1)
    }

    // Add to beginning
    this.recentColors.unshift(color)

    // Limit size
    if (this.recentColors.length > this.maxRecentColors) {
      this.recentColors.pop()
    }

    // Save to localStorage
    this.saveRecentColors()

    // Update UI
    this.updateRecentColorsUI()
  }

  private updateRecentColorsUI(): void {
    if (!this.colorPickerElement) return

    const recentColorsGrid = this.colorPickerElement.querySelector(".recent-colors-grid")
    if (!recentColorsGrid) return

    // Clear existing swatches
    recentColorsGrid.innerHTML = ""

    // Add current recent colors
    this.recentColors.forEach((color) => {
      const colorSwatch = document.createElement("div")
      colorSwatch.className = "color-swatch"
      colorSwatch.style.backgroundColor = color
      colorSwatch.setAttribute("data-color", color)
      colorSwatch.addEventListener("click", () => this.selectColor(color))
      recentColorsGrid.appendChild(colorSwatch)
    })
  }

  private saveRecentColors(): void {
    localStorage.setItem("rich-editor-recent-colors", JSON.stringify(this.recentColors))
  }

  private loadRecentColors(): void {
    const saved = localStorage.getItem("rich-editor-recent-colors")
    if (saved) {
      try {
        this.recentColors = JSON.parse(saved)
      } catch (e) {
        console.error("Error loading recent colors:", e)
        this.recentColors = []
      }
    }
  }

  private isValidColor(color: string): boolean {
    // Check if it's a valid color format
    const s = new Option().style
    s.color = color
    return s.color !== ""
  }

  private handleClickOutside = (e: MouseEvent): void => {
    if (this.colorPickerElement && !this.colorPickerElement.contains(e.target as Node)) {
      this.hide()
    }
  }

  public hide(): void {
    if (this.colorPickerElement) {
      this.colorPickerElement.style.display = "none"
    }
    document.removeEventListener("click", this.handleClickOutside)
  }

  public destroy(): void {
    if (this.colorPickerElement) {
      this.colorPickerElement.remove()
      this.colorPickerElement = null
    }
    document.removeEventListener("click", this.handleClickOutside)
  }
}
