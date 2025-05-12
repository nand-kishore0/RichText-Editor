export class ImageResizer {
  private editor: any
  private activeImage: HTMLImageElement | null = null
  private resizeHandles: HTMLElement[] = []
  private startX = 0
  private startY = 0
  private startWidth = 0
  private startHeight = 0
  private currentHandle: HTMLElement | null = null
  private aspectRatio = 1
  private imageControls: HTMLElement | null = null

  constructor(editor: any) {
    this.editor = editor
    this.initEvents()
  }

  private initEvents(): void {
    // Listen for image clicks in the editor
    const editorContent = this.editor.getEditor()
    editorContent.addEventListener("click", this.handleImageClick)

    // Listen for mousedown on the document to handle clicks outside the image
    document.addEventListener("mousedown", this.handleDocumentMouseDown)
  }

  private handleImageClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement

    // Check if the clicked element is an image
    if (target.tagName === "IMG") {
      e.preventDefault()

      // Remove existing resize handles if any
      this.removeResizeHandles()

      // Set the active image
      this.activeImage = target as HTMLImageElement

      // Create resize handles
      this.createResizeHandles()

      // Create image controls
      this.createImageControls()
    }
  }

  private handleDocumentMouseDown = (e: MouseEvent): void => {
    const target = e.target as HTMLElement

    // Check if the click is outside the active image, resize handles, and image controls
    if (
      this.activeImage &&
      target !== this.activeImage &&
      !this.resizeHandles.includes(target) &&
      (!this.imageControls || !this.imageControls.contains(target))
    ) {
      this.removeResizeHandles()
      this.removeImageControls()
      this.activeImage = null
    }
  }

  private createResizeHandles(): void {
    if (!this.activeImage) return

    const imageRect = this.activeImage.getBoundingClientRect()
    const editorRect = this.editor.getContainer().getBoundingClientRect()

    // Calculate positions relative to the editor
    const top = imageRect.top - editorRect.top
    const left = imageRect.left - editorRect.left
    const width = imageRect.width
    const height = imageRect.height

    // Store aspect ratio
    this.aspectRatio = width / height

    // Create handles for each corner and midpoint
    const positions = [
      { name: "top-left", cursor: "nwse-resize", top: top, left: left },
      { name: "top-right", cursor: "nesw-resize", top: top, left: left + width },
      { name: "bottom-left", cursor: "nesw-resize", top: top + height, left: left },
      { name: "bottom-right", cursor: "nwse-resize", top: top + height, left: left + width },
      { name: "top", cursor: "ns-resize", top: top, left: left + width / 2 },
      { name: "right", cursor: "ew-resize", top: top + height / 2, left: left + width },
      { name: "bottom", cursor: "ns-resize", top: top + height, left: left + width / 2 },
      { name: "left", cursor: "ew-resize", top: top + height / 2, left: left },
    ]

    positions.forEach((pos) => {
      const handle = document.createElement("div")
      handle.className = `resize-handle resize-handle-${pos.name}`
      handle.style.position = "absolute"
      handle.style.width = "8px"
      handle.style.height = "8px"
      handle.style.backgroundColor = "#1a73e8"
      handle.style.border = "1px solid white"
      handle.style.borderRadius = "50%"
      handle.style.top = `${pos.top - 4}px`
      handle.style.left = `${pos.left - 4}px`
      handle.style.cursor = pos.cursor
      handle.style.zIndex = "1000"

      // Add event listeners for resizing
      handle.addEventListener("mousedown", (e) => this.startResize(e, pos.name))

      this.editor.getContainer().appendChild(handle)
      this.resizeHandles.push(handle)
    })

    // Add a selection border around the image
    this.activeImage.style.outline = "2px solid #1a73e8"
    this.activeImage.style.outlineOffset = "2px"
  }

  private createImageControls(): void {
    if (!this.activeImage) return

    const imageRect = this.activeImage.getBoundingClientRect()
    const editorRect = this.editor.getContainer().getBoundingClientRect()

    // Calculate position above the image
    const top = imageRect.top - editorRect.top - 40 // 40px above the image
    const left = imageRect.left - editorRect.left

    // Create controls container
    this.imageControls = document.createElement("div")
    this.imageControls.className = "image-controls"
    this.imageControls.style.position = "absolute"
    this.imageControls.style.top = `${top}px`
    this.imageControls.style.left = `${left}px`
    this.imageControls.style.backgroundColor = "#fff"
    this.imageControls.style.border = "1px solid #ddd"
    this.imageControls.style.borderRadius = "4px"
    this.imageControls.style.padding = "4px"
    this.imageControls.style.zIndex = "1001"
    this.imageControls.style.display = "flex"
    this.imageControls.style.gap = "4px"

    // Add alignment buttons
    const alignments = [
      { name: "left", icon: "⟵", title: "Align Left" },
      { name: "center", icon: "⟷", title: "Align Center" },
      { name: "right", icon: "⟶", title: "Align Right" },
    ]

    alignments.forEach((align) => {
      const button = document.createElement("button")
      button.type = "button"
      button.className = "image-control-button"
      button.innerHTML = align.icon
      button.title = align.title
      button.style.border = "1px solid #ddd"
      button.style.borderRadius = "4px"
      button.style.padding = "4px 8px"
      button.style.background = "none"
      button.style.cursor = "pointer"

      button.addEventListener("click", () => this.alignImage(align.name))

      this.imageControls?.appendChild(button)
    })

    // Add caption button
    const captionButton = document.createElement("button")
    captionButton.type = "button"
    captionButton.className = "image-control-button"
    captionButton.innerHTML = "Caption"
    captionButton.title = "Add Caption"
    captionButton.style.border = "1px solid #ddd"
    captionButton.style.borderRadius = "4px"
    captionButton.style.padding = "4px 8px"
    captionButton.style.background = "none"
    captionButton.style.cursor = "pointer"

    captionButton.addEventListener("click", () => this.addCaption())

    this.imageControls.appendChild(captionButton)

    // Add alt text button
    const altTextButton = document.createElement("button")
    altTextButton.type = "button"
    altTextButton.className = "image-control-button"
    altTextButton.innerHTML = "Alt"
    altTextButton.title = "Edit Alt Text"
    altTextButton.style.border = "1px solid #ddd"
    altTextButton.style.borderRadius = "4px"
    altTextButton.style.padding = "4px 8px"
    altTextButton.style.background = "none"
    altTextButton.style.cursor = "pointer"

    altTextButton.addEventListener("click", () => this.editAltText())

    this.imageControls.appendChild(altTextButton)

    // Add remove button
    const removeButton = document.createElement("button")
    removeButton.type = "button"
    removeButton.className = "image-control-button"
    removeButton.innerHTML = "✕"
    removeButton.title = "Remove Image"
    removeButton.style.border = "1px solid #ddd"
    removeButton.style.borderRadius = "4px"
    removeButton.style.padding = "4px 8px"
    removeButton.style.background = "none"
    removeButton.style.cursor = "pointer"

    removeButton.addEventListener("click", () => this.removeImage())

    this.imageControls.appendChild(removeButton)

    this.editor.getContainer().appendChild(this.imageControls)
  }

  private startResize(e: MouseEvent, handleName: string): void {
    e.preventDefault()

    if (!this.activeImage) return

    this.currentHandle = e.target as HTMLElement
    this.startX = e.clientX
    this.startY = e.clientY
    this.startWidth = this.activeImage.offsetWidth
    this.startHeight = this.activeImage.offsetHeight

    // Add event listeners for mouse move and up
    document.addEventListener("mousemove", this.handleResize)
    document.addEventListener("mouseup", this.stopResize)
  }

  private handleResize = (e: MouseEvent): void => {
    if (!this.activeImage || !this.currentHandle) return

    e.preventDefault()

    const dx = e.clientX - this.startX
    const dy = e.clientY - this.startY

    const handleName = this.currentHandle.className.split(" ")[1].replace("resize-handle-", "")

    let newWidth = this.startWidth
    let newHeight = this.startHeight

    // Calculate new dimensions based on the handle being dragged
    switch (handleName) {
      case "right":
        newWidth = this.startWidth + dx
        break
      case "bottom":
        newHeight = this.startHeight + dy
        break
      case "left":
        newWidth = this.startWidth - dx
        break
      case "top":
        newHeight = this.startHeight - dy
        break
      case "top-left":
        newWidth = this.startWidth - dx
        newHeight = this.startHeight - dy
        break
      case "top-right":
        newWidth = this.startWidth + dx
        newHeight = this.startHeight - dy
        break
      case "bottom-left":
        newWidth = this.startWidth - dx
        newHeight = this.startHeight + dy
        break
      case "bottom-right":
        newWidth = this.startWidth + dx
        newHeight = this.startHeight + dy
        break
    }

    // Ensure minimum dimensions
    newWidth = Math.max(20, newWidth)
    newHeight = Math.max(20, newHeight)

    // Apply new dimensions
    this.activeImage.style.width = `${newWidth}px`
    this.activeImage.style.height = `${newHeight}px`

    // Update resize handles positions
    this.updateResizeHandlesPositions()
  }

  private stopResize = (): void => {
    document.removeEventListener("mousemove", this.handleResize)
    document.removeEventListener("mouseup", this.stopResize)
    this.currentHandle = null

    // Update the editor content
    this.editor.handleInput()
  }

  private updateResizeHandlesPositions(): void {
    if (!this.activeImage) return

    const imageRect = this.activeImage.getBoundingClientRect()
    const editorRect = this.editor.getContainer().getBoundingClientRect()

    // Calculate positions relative to the editor
    const top = imageRect.top - editorRect.top
    const left = imageRect.left - editorRect.left
    const width = imageRect.width
    const height = imageRect.height

    // Update positions for each handle
    const positions = [
      { name: "top-left", top: top, left: left },
      { name: "top-right", top: top, left: left + width },
      { name: "bottom-left", top: top + height, left: left },
      { name: "bottom-right", top: top + height, left: left + width },
      { name: "top", top: top, left: left + width / 2 },
      { name: "right", top: top + height / 2, left: left + width },
      { name: "bottom", top: top + height, left: left + width / 2 },
      { name: "left", top: top + height / 2, left: left },
    ]

    this.resizeHandles.forEach((handle) => {
      const handleName = handle.className.split(" ")[1].replace("resize-handle-", "")
      const position = positions.find((pos) => pos.name === handleName)

      if (position) {
        handle.style.top = `${position.top - 4}px`
        handle.style.left = `${position.left - 4}px`
      }
    })

    // Update image controls position if they exist
    if (this.imageControls) {
      this.imageControls.style.top = `${top - 40}px`
      this.imageControls.style.left = `${left}px`
    }
  }

  private alignImage(alignment: string): void {
    if (!this.activeImage) return

    // Remove existing alignment classes
    this.activeImage.classList.remove("align-left", "align-center", "align-right")

    // Apply new alignment
    switch (alignment) {
      case "left":
        this.activeImage.style.float = "left"
        this.activeImage.style.marginRight = "10px"
        this.activeImage.style.marginLeft = "0"
        this.activeImage.style.display = "inline"
        break
      case "center":
        this.activeImage.style.float = "none"
        this.activeImage.style.marginLeft = "auto"
        this.activeImage.style.marginRight = "auto"
        this.activeImage.style.display = "block"
        break
      case "right":
        this.activeImage.style.float = "right"
        this.activeImage.style.marginLeft = "10px"
        this.activeImage.style.marginRight = "0"
        this.activeImage.style.display = "inline"
        break
    }

    // Add class for reference
    this.activeImage.classList.add(`align-${alignment}`)

    // Update the editor content
    this.editor.handleInput()
  }

  private addCaption(): void {
    if (!this.activeImage) return

    // Check if the image is already wrapped in a figure
    let figure = this.activeImage.closest("figure")

    if (!figure) {
      // Create a figure element
      const imageClone = this.activeImage.cloneNode(true) as HTMLImageElement

      // Create figure and figcaption
      figure = document.createElement("figure")
      figure.style.margin = "0"
      figure.style.display = "inline-block"

      // Preserve alignment
      if (this.activeImage.classList.contains("align-left")) {
        figure.style.float = "left"
        figure.style.marginRight = "10px"
      } else if (this.activeImage.classList.contains("align-right")) {
        figure.style.float = "right"
        figure.style.marginLeft = "10px"
      } else if (this.activeImage.classList.contains("align-center")) {
        figure.style.margin = "0 auto"
        figure.style.display = "block"
        figure.style.textAlign = "center"
      }

      // Replace the image with the figure
      this.activeImage.parentNode?.replaceChild(figure, this.activeImage)

      // Add the image to the figure
      figure.appendChild(imageClone)

      // Update the active image reference
      this.activeImage = imageClone
    }

    // Check if figcaption already exists
    let figcaption = figure.querySelector("figcaption")

    if (!figcaption) {
      // Create figcaption
      figcaption = document.createElement("figcaption")
      figcaption.style.fontSize = "0.9em"
      figcaption.style.textAlign = "center"
      figcaption.style.color = "#666"
      figcaption.style.marginTop = "5px"
      figcaption.contentEditable = "true"
      figcaption.textContent = "Image caption"

      // Add figcaption to figure
      figure.appendChild(figcaption)

      // Focus the figcaption for editing
      setTimeout(() => {
        figcaption?.focus()

        // Select all text in the figcaption
        const range = document.createRange()
        range.selectNodeContents(figcaption as Node)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }, 0)
    }

    // Update the editor content
    this.editor.handleInput()

    // Remove resize handles and controls
    this.removeResizeHandles()
    this.removeImageControls()
  }

  private editAltText(): void {
    if (!this.activeImage) return

    // Get current alt text
    const currentAlt = this.activeImage.alt || ""

    // Prompt for new alt text
    const newAlt = prompt("Enter alternative text for this image:", currentAlt)

    // Update alt text if not cancelled
    if (newAlt !== null) {
      this.activeImage.alt = newAlt

      // Update the editor content
      this.editor.handleInput()
    }
  }

  private removeImage(): void {
    if (!this.activeImage) return

    // Check if the image is wrapped in a figure
    const figure = this.activeImage.closest("figure")

    if (figure) {
      // Remove the entire figure
      figure.parentNode?.removeChild(figure)
    } else {
      // Remove just the image
      this.activeImage.parentNode?.removeChild(this.activeImage)
    }

    // Remove resize handles and controls
    this.removeResizeHandles()
    this.removeImageControls()

    // Clear active image reference
    this.activeImage = null

    // Update the editor content
    this.editor.handleInput()
  }

  private removeResizeHandles(): void {
    // Remove all resize handles
    this.resizeHandles.forEach((handle) => {
      handle.parentNode?.removeChild(handle)
    })

    this.resizeHandles = []

    // Remove selection border from active image
    if (this.activeImage) {
      this.activeImage.style.outline = ""
      this.activeImage.style.outlineOffset = ""
    }
  }

  private removeImageControls(): void {
    if (this.imageControls) {
      this.imageControls.parentNode?.removeChild(this.imageControls)
      this.imageControls = null
    }
  }

  public destroy(): void {
    // Remove event listeners
    const editorContent = this.editor.getEditor()
    editorContent.removeEventListener("click", this.handleImageClick)
    document.removeEventListener("mousedown", this.handleDocumentMouseDown)

    // Remove any active resize handles and controls
    this.removeResizeHandles()
    this.removeImageControls()
  }
}
