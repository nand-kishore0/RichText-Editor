import { ColorPicker } from "./components/color-picker"
import { TableEditor } from "./components/table-editor"
import { EmojiPicker } from "./components/emoji-picker"
import { SpecialCharacterPicker } from "./components/special-character-picker"
import { FontSelector } from "./components/font-selector"
import { sanitizeHTML } from "./utils/sanitize"
import { htmlToMarkdown } from "./utils/html-to-markdown"
import { markdownToHtml } from "./utils/markdown-to-html"
import { debounce } from "./utils/debounce"
import { FindReplaceDialog } from "./components/find-replace-dialog"
import { ImageResizer } from "./components/image-resizer"
import { CodeBlockEditor } from "./components/code-block-editor"
import { MediaEmbedder } from "./components/media-embedder"
import { WordCounter } from "./components/word-counter"
import { SpellChecker } from "./components/spell-checker"
import { AdvancedTableEditor } from "./components/advanced-table-editor"
import { AccessibilityHelper } from "./components/accessibility-helper"

export type FullRichEditorOptions = {
  container: HTMLElement
  placeholder?: string
  onChange?: (html: string) => void
  initialValue?: string
  darkMode?: boolean
  readOnly?: boolean
  autosave?: boolean
  autosaveKey?: string
  i18n?: {
    locale: string
    translations: Record<string, string>
  }
  allowedTags?: string[]
  plugins?: {
    imageResizing?: boolean
    codeBlocks?: boolean
    findReplace?: boolean
    wordCount?: boolean
    mediaEmbed?: boolean
    pageBreak?: boolean
    advancedTables?: boolean
    textAlignment?: boolean
    spellCheck?: boolean
    pasteFormatting?: boolean
    accessibility?: boolean
  }
}

export class FullRichEditor {
  private container: HTMLElement
  private toolbar: HTMLElement
  private editor: HTMLElement
  private statusBar: HTMLElement
  private options: FullRichEditorOptions
  private lastSelection: Range | null = null
  private isDestroyed = false
  private colorPicker: ColorPicker
  private tableEditor: TableEditor
  private emojiPicker: EmojiPicker
  private specialCharPicker: SpecialCharacterPicker
  private fontSelector: FontSelector
  private history: string[] = []
  private historyIndex = -1
  private maxHistorySize = 50
  private isRecordingHistory = true
  private debouncedSave: Function
  private keyboardShortcuts: Map<string, () => void> = new Map()
  private findReplaceDialog: FindReplaceDialog | null = null
  private imageResizer: ImageResizer | null = null
  private codeBlockEditor: CodeBlockEditor | null = null
  private mediaEmbedder: MediaEmbedder | null = null
  private wordCounter: WordCounter | null = null
  private spellChecker: SpellChecker | null = null
  private advancedTableEditor: AdvancedTableEditor | null = null
  private accessibilityHelper: AccessibilityHelper | null = null

  constructor(options: FullRichEditorOptions) {
    this.options = {
      ...options,
      darkMode: options.darkMode || false,
      readOnly: options.readOnly || false,
      autosave: options.autosave || false,
      autosaveKey: options.autosaveKey || "rich-editor-content",
      i18n: options.i18n || { locale: "en", translations: {} },
      allowedTags: options.allowedTags || [
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
        "tr",
        "td",
        "th",
        "hr",
        "br",
        "sup",
        "sub",
      ],
    }
    this.container = options.container

    // Create editor structure
    this.createEditorDOM()

    // Initialize the toolbar
    this.toolbar = this.container.querySelector(".editor-toolbar") as HTMLElement
    this.editor = this.container.querySelector(".editor-content") as HTMLElement
    this.statusBar = this.container.querySelector(".editor-statusbar") as HTMLElement

    // Set initial content if provided or load from autosave
    if (this.options.autosave && this.options.autosaveKey) {
      const savedContent = localStorage.getItem(this.options.autosaveKey)
      if (savedContent) {
        this.editor.innerHTML = savedContent
      } else if (options.initialValue) {
        this.editor.innerHTML = options.initialValue
      }
    } else if (options.initialValue) {
      this.editor.innerHTML = options.initialValue
    }

    // Set placeholder if provided
    if (options.placeholder) {
      this.editor.setAttribute("data-placeholder", options.placeholder)
    }

    // Set read-only mode if specified
    if (this.options.readOnly) {
      this.editor.setAttribute("contenteditable", "false")
      this.container.classList.add("read-only")
    }

    // Set dark mode if specified
    if (this.options.darkMode) {
      this.container.classList.add("dark-mode")
    }

    // Initialize UI components
    this.colorPicker = new ColorPicker(this)
    this.tableEditor = new TableEditor(this)
    this.emojiPicker = new EmojiPicker(this)
    this.specialCharPicker = new SpecialCharacterPicker(this)
    this.fontSelector = new FontSelector(this)

    // Initialize plugins based on options
    if (this.options.plugins?.imageResizing) {
      this.imageResizer = new ImageResizer(this)
    }

    if (this.options.plugins?.codeBlocks) {
      this.codeBlockEditor = new CodeBlockEditor(this)
    }

    if (this.options.plugins?.findReplace) {
      this.findReplaceDialog = new FindReplaceDialog(this)
    }

    if (this.options.plugins?.mediaEmbed) {
      this.mediaEmbedder = new MediaEmbedder(this)
    }

    if (this.options.plugins?.wordCount) {
      this.wordCounter = new WordCounter(this)
    }

    if (this.options.plugins?.spellCheck) {
      this.spellChecker = new SpellChecker(this)
    }

    if (this.options.plugins?.advancedTables) {
      this.advancedTableEditor = new AdvancedTableEditor(this)
    }

    if (this.options.plugins?.accessibility) {
      this.accessibilityHelper = new AccessibilityHelper(this)
    }

    // Initialize event listeners
    this.initEvents()

    // Initialize toolbar buttons
    this.initToolbar()

    // Initialize keyboard shortcuts
    this.initKeyboardShortcuts()

    // Initialize status bar
    this.updateStatusBar()

    // Setup autosave
    this.debouncedSave = debounce(() => {
      if (this.options.autosave && this.options.autosaveKey) {
        localStorage.setItem(this.options.autosaveKey, this.getHTML())
      }
    }, 1000)

    // Add initial state to history
    this.addToHistory()
  }

  private createEditorDOM() {
    this.container.innerHTML = `
      <div class="editor-toolbar"></div>
      <div class="editor-content" contenteditable="true" spellcheck="true"></div>
      <div class="editor-statusbar"></div>
    `
  }

  private initEvents() {
    // Save selection when user selects text
    this.editor.addEventListener("mouseup", this.saveSelection.bind(this))
    this.editor.addEventListener("keyup", this.handleKeyUp.bind(this))
    this.editor.addEventListener("keydown", this.handleKeyDown.bind(this))

    // Handle input events to trigger onChange
    this.editor.addEventListener("input", this.handleInput.bind(this))

    // Focus/blur events for placeholder
    this.editor.addEventListener("focus", () => {
      this.container.classList.add("focused")
    })

    this.editor.addEventListener("blur", () => {
      this.container.classList.remove("focused")
    })

    // Handle paste events
    this.editor.addEventListener("paste", this.handlePaste.bind(this))

    // Handle drop events for images
    this.editor.addEventListener("dragover", (e) => {
      e.preventDefault()
      this.container.classList.add("dragover")
    })

    this.editor.addEventListener("dragleave", () => {
      this.container.classList.remove("dragover")
    })

    this.editor.addEventListener("drop", this.handleDrop.bind(this))
  }

  private initToolbar() {
    const buttons = [
      // Text formatting
      { command: "bold", icon: "B", title: this.translate("bold", "Bold") },
      { command: "italic", icon: "I", title: this.translate("italic", "Italic") },
      { command: "underline", icon: "U", title: this.translate("underline", "Underline") },
      { command: "strikeThrough", icon: "S", title: this.translate("strikethrough", "Strikethrough") },
      { command: "superscript", icon: "x²", title: this.translate("superscript", "Superscript") },
      { command: "subscript", icon: "x₂", title: this.translate("subscript", "Subscript") },
      { type: "separator" },

      // Font options
      { command: "fontName", icon: "Font", title: this.translate("fontFamily", "Font Family"), dropdown: "fontFamily" },
      { command: "fontSize", icon: "Size", title: this.translate("fontSize", "Font Size"), dropdown: "fontSize" },
      { command: "foreColor", icon: "A", title: this.translate("textColor", "Text Color"), dropdown: "textColor" },
      {
        command: "hiliteColor",
        icon: "BG",
        title: this.translate("backgroundColor", "Background Color"),
        dropdown: "backgroundColor",
      },
      { type: "separator" },

      // Paragraph formatting
      { command: "formatBlock", value: "H1", icon: "H1", title: this.translate("heading1", "Heading 1") },
      { command: "formatBlock", value: "H2", icon: "H2", title: this.translate("heading2", "Heading 2") },
      { command: "formatBlock", value: "H3", icon: "H3", title: this.translate("heading3", "Heading 3") },
      { command: "formatBlock", value: "H4", icon: "H4", title: this.translate("heading4", "Heading 4") },
      { command: "formatBlock", value: "H5", icon: "H5", title: this.translate("heading5", "Heading 5") },
      { command: "formatBlock", value: "H6", icon: "H6", title: this.translate("heading6", "Heading 6") },

      { command: "formatBlock", value: "P", icon: "¶", title: this.translate("paragraph", "Paragraph") },
      { type: "separator" },

      // Alignment
      { command: "justifyLeft", icon: "←", title: this.translate("alignLeft", "Align Left") },
      { command: "justifyCenter", icon: "↔", title: this.translate("alignCenter", "Align Center") },
      { command: "justifyRight", icon: "→", title: this.translate("alignRight", "Align Right") },
      { command: "justifyFull", icon: "↔↔", title: this.translate("justify", "Justify") },
      { type: "separator" },

      // Lists and indentation
      { command: "insertOrderedList", icon: "1.", title: this.translate("numberedList", "Numbered List") },
      { command: "insertUnorderedList", icon: "•", title: this.translate("bulletList", "Bullet List") },
      { command: "indent", icon: "→|", title: this.translate("indent", "Indent") },
      { command: "outdent", icon: "|←", title: this.translate("outdent", "Outdent") },
      { type: "separator" },

      // Block formatting
      { command: "formatBlock", value: "BLOCKQUOTE", icon: "❝", title: this.translate("blockquote", "Blockquote") },
      { command: "formatBlock", value: "PRE", icon: "</>", title: this.translate("codeBlock", "Code Block") },
      { command: "insertHorizontalRule", icon: "—", title: this.translate("horizontalRule", "Horizontal Rule") },
      { type: "separator" },

      // Insert content
      { command: "createLink", icon: "🔗", title: this.translate("insertLink", "Insert Link") },
      { command: "insertImage", icon: "🖼️", title: this.translate("insertImage", "Insert Image") },
      {
        command: "insertTable",
        icon: "Table",
        title: this.translate("insertTable", "Insert Table"),
        dropdown: "table",
      },
      {
        command: "insertSpecialChar",
        icon: "Ω",
        title: this.translate("specialCharacters", "Special Characters"),
        dropdown: "specialChar",
      },
      { command: "insertEmoji", icon: "😀", title: this.translate("emoji", "Emoji"), dropdown: "emoji" },
      { type: "separator" },

      // Clipboard and history
      { command: "undo", icon: "↩", title: this.translate("undo", "Undo") },
      { command: "redo", icon: "↪", title: this.translate("redo", "Redo") },
      { command: "removeFormat", icon: "Clear", title: this.translate("clearFormatting", "Clear Formatting") },
      { type: "separator" },

      // View modes
      { command: "toggleFullscreen", icon: "⛶", title: this.translate("fullscreen", "Fullscreen") },
      { command: "toggleHtml", icon: "HTML", title: this.translate("viewHtml", "View HTML") },
      { command: "toggleSpellCheck", icon: "ABC", title: this.translate("spellcheck", "Spellcheck") },
    ]

    buttons.push(
      // Advanced features
      { type: "separator" },

      // Find and replace
      ...(this.options.plugins?.findReplace
        ? [{ command: "findReplace", icon: "🔍", title: this.translate("findReplace", "Find and Replace") }]
        : []),

      // Code blocks
      ...(this.options.plugins?.codeBlocks
        ? [{ command: "insertCodeBlock", icon: "</>", title: this.translate("codeBlock", "Insert Code Block") }]
        : []),

      // Media embedding
      ...(this.options.plugins?.mediaEmbed
        ? [{ command: "embedMedia", icon: "📺", title: this.translate("embedMedia", "Embed Media") }]
        : []),

      // Page break
      ...(this.options.plugins?.pageBreak
        ? [{ command: "insertPageBreak", icon: "⊞", title: this.translate("pageBreak", "Insert Page Break") }]
        : []),
    )

    buttons.forEach((button) => {
      if (button.type === "separator") {
        const separator = document.createElement("span")
        separator.className = "toolbar-separator"
        this.toolbar.appendChild(separator)
        return
      }

      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "toolbar-button"
      btn.innerHTML = button.icon || ""
      btn.title = button.title || ""
      if (button.command) {
        btn.setAttribute("data-command", button.command)
      }

      if (button.value) {
        btn.setAttribute("data-value", button.value)
      }

      if (button.dropdown) {
        btn.setAttribute("data-dropdown", button.dropdown)
        btn.classList.add("has-dropdown")
      }

      btn.addEventListener("click", (e) => {
        e.preventDefault()
        if (button.command) {
          this.handleToolbarAction(button.command, button.value, button.dropdown)
        }
      })

      this.toolbar.appendChild(btn)
    })

    // Add file upload button
    const fileUploadInput = document.createElement("input")
    fileUploadInput.type = "file"
    fileUploadInput.accept = "image/*"
    fileUploadInput.style.display = "none"
    fileUploadInput.id = "image-upload"
    fileUploadInput.addEventListener("change", this.handleFileUpload.bind(this))
    this.container.appendChild(fileUploadInput)

    // Add file upload button to toolbar
    const fileUploadButton = document.createElement("button")
    fileUploadButton.type = "button"
    fileUploadButton.className = "toolbar-button"
    fileUploadButton.innerHTML = "📤"
    fileUploadButton.title = this.translate("uploadImage", "Upload Image")
    fileUploadButton.addEventListener("click", (e) => {
      e.preventDefault()
      fileUploadInput.click()
    })
    this.toolbar.appendChild(fileUploadButton)
  }

  private initKeyboardShortcuts() {
    // Define keyboard shortcuts
    this.keyboardShortcuts.set("b", () => this.execCommand("bold"))
    this.keyboardShortcuts.set("i", () => this.execCommand("italic"))
    this.keyboardShortcuts.set("u", () => this.execCommand("underline"))
    this.keyboardShortcuts.set("k", () => this.handleToolbarAction("createLink"))
    this.keyboardShortcuts.set("z", () => this.undo())
    this.keyboardShortcuts.set("y", () => this.redo())
    this.keyboardShortcuts.set("1", () => this.execCommand("formatBlock", "<H1>"))
    this.keyboardShortcuts.set("2", () => this.execCommand("formatBlock", "<H2>"))
    this.keyboardShortcuts.set("3", () => this.execCommand("formatBlock", "<H3>"))
    this.keyboardShortcuts.set("4", () => this.execCommand("formatBlock", "<H4>"))
    this.keyboardShortcuts.set("5", () => this.execCommand("formatBlock", "<H5>"))
    this.keyboardShortcuts.set("6", () => this.execCommand("formatBlock", "<H6>"))
    this.keyboardShortcuts.set("0", () => this.execCommand("formatBlock", "<P>"))
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Handle keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      const key = e.key.toLowerCase()
      if (this.keyboardShortcuts.has(key)) {
        e.preventDefault()
        this.keyboardShortcuts.get(key)?.()
        return
      }
    }

    // Handle tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault()
      if (e.shiftKey) {
        this.execCommand("outdent")
      } else {
        this.execCommand("indent")
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.saveSelection()
    this.updateStatusBar()

    // Add to history for significant changes
    if (e.key === "Enter" || e.key === "Backspace" || e.key === "Delete" || e.key === " " || e.key === ".") {
      this.addToHistory()
    }
  }

  private handlePaste(e: ClipboardEvent) {
    e.preventDefault()

    // Get clipboard data
    const clipboardData = e.clipboardData
    if (!clipboardData) return

    // Check if we have HTML content
    let html = clipboardData.getData("text/html")
    const text = clipboardData.getData("text/plain")

    // If we have HTML, sanitize it
    if (html) {
      html = this.sanitizeHTML(html)
      this.execCommand("insertHTML", html)
    } else {
      // Otherwise insert as plain text
      this.execCommand("insertText", text)
    }

    this.addToHistory()
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault()
    this.container.classList.remove("dragover")

    // Handle dropped files (images)
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          this.insertImage(file)
        }
      }
    } else if (e.dataTransfer?.getData("text/html")) {
      // Handle dropped HTML content
      const html = e.dataTransfer.getData("text/html")
      this.execCommand("insertHTML", this.sanitizeHTML(html))
    } else if (e.dataTransfer?.getData("text/plain")) {
      // Handle dropped text content
      const text = e.dataTransfer.getData("text/plain")
      this.execCommand("insertText", text)
    }

    this.addToHistory()
  }

  private handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      if (file.type.startsWith("image/")) {
        this.insertImage(file)
      }
      // Reset the input so the same file can be selected again
      input.value = ""
    }
  }

  private insertImage(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        this.restoreSelection()
        const imageUrl = e.target.result as string
        this.execCommand("insertImage", imageUrl)
        this.addToHistory()
      }
    }
    reader.readAsDataURL(file)
  }

  private handleToolbarAction(command: string, value?: string, dropdown?: string) {
    this.restoreSelection()

    switch (command) {
      case "findReplace":
        if (this.findReplaceDialog) {
          this.findReplaceDialog.show()
        }
        break

      case "insertCodeBlock":
        if (this.codeBlockEditor) {
          this.codeBlockEditor.insertCodeBlock()
        }
        break

      case "embedMedia":
        if (this.mediaEmbedder) {
          this.mediaEmbedder.showEmbedDialog()
        }
        break

      case "insertPageBreak":
        this.insertHTML(
          '<div class="page-break" style="page-break-after: always; break-after: page; margin: 1em 0; border-top: 1px dashed #ccc; height: 12px; position: relative;"><span style="position: absolute; top: -0.5em; left: 50%; background: white; padding: 0 1em; transform: translateX(-50%); color: #999;">Page Break</span></div>',
        )
        break

      case "createLink":
        const url = prompt(this.translate("enterUrl", "Enter the URL:"), "https://")
        if (url) {
          this.execCommand(command, url)
          // Select the link to allow for immediate editing
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const links = this.editor.querySelectorAll("a")
            links.forEach((link) => {
              if (range.intersectsNode(link)) {
                link.setAttribute("target", "_blank")
                link.setAttribute("rel", "noopener noreferrer")
              }
            })
          }
        }
        break

      case "insertImage":
        const imageUrl = prompt(this.translate("enterImageUrl", "Enter the image URL:"), "https://")
        if (imageUrl) {
          this.execCommand(command, imageUrl)
        }
        break

      case "insertTable":
        if (dropdown === "table") {
          this.tableEditor.showTableCreator()
        }
        break

      case "insertSpecialChar":
        if (dropdown === "specialChar") {
          this.specialCharPicker.show()
        }
        break

      case "insertEmoji":
        if (dropdown === "emoji") {
          this.emojiPicker.show()
        }
        break

      case "foreColor":
      case "hiliteColor":
        if (dropdown === "textColor" || dropdown === "backgroundColor") {
          this.colorPicker.show(command)
        }
        break

      case "fontName":
        if (dropdown === "fontFamily") {
          this.fontSelector.showFontFamilySelector()
        }
        break

      case "fontSize":
        if (dropdown === "fontSize") {
          this.fontSelector.showFontSizeSelector()
        }
        break

      case "toggleFullscreen":
        this.container.classList.toggle("fullscreen")
        break

      case "toggleHtml":
        this.toggleHtmlView()
        break

      case "toggleSpellCheck":
        const currentState = this.editor.getAttribute("spellcheck") === "true"
        this.editor.setAttribute("spellcheck", currentState ? "false" : "true")
        break

      case "formatBlock":
        this.execCommand(command, `<${value}>`)
        break

      default:
        this.execCommand(command, value)
        break
    }

    this.saveSelection()
    this.handleInput()
  }

  private toggleHtmlView() {
    const isHtmlView = this.container.classList.contains("html-view")

    if (isHtmlView) {
      // Switch back to WYSIWYG view
      this.container.classList.remove("html-view")
      this.editor.innerHTML = this.sanitizeHTML((this.editor as HTMLTextAreaElement).value)
      this.editor.setAttribute("contenteditable", "true")
    } else {
      // Switch to HTML view
      this.container.classList.add("html-view")
      const htmlContent = this.getHTML()

      // Create a textarea for HTML editing
      const textarea = document.createElement("textarea")
      textarea.className = "editor-content"
      textarea.value = htmlContent

      // Replace the contenteditable div with the textarea
      this.editor.parentNode?.replaceChild(textarea, this.editor)
      this.editor = textarea
      this.editor.setAttribute("contenteditable", "false")
    }
  }

  private execCommand(command: string, value: string | null = null) {
    document.execCommand(command, false, value)
  }

  private saveSelection() {
    if (window.getSelection) {
      const sel = window.getSelection()
      if (sel && sel.getRangeAt && sel.rangeCount) {
        this.lastSelection = sel.getRangeAt(0).cloneRange()
      }
    }
  }

  private restoreSelection() {
    if (this.lastSelection && window.getSelection) {
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(this.lastSelection)
      }
    }
  }

  private handleInput() {
    if (this.options.onChange) {
      this.options.onChange(this.getHTML())
    }

    // Update status bar
    this.updateStatusBar()

    // Autosave if enabled
    if (this.options.autosave) {
      this.debouncedSave()
    }
  }

  private updateStatusBar() {
    // Get word and character count
    const text = this.getText()
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
    const charCount = text.length

    // Update status bar
    this.statusBar.innerHTML = `${this.translate("words", "Words")}: ${wordCount} | ${this.translate("characters", "Characters")}: ${charCount}`
  }

  private addToHistory() {
    if (!this.isRecordingHistory) return

    const html = this.getHTML()

    // Don't add if content hasn't changed
    if (this.history.length > 0 && this.history[this.historyIndex] === html) {
      return
    }

    // If we're not at the end of the history, remove everything after current index
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    // Add current state to history
    this.history.push(html)
    this.historyIndex = this.history.length - 1

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.historyIndex--
    }
  }

  private undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      this.isRecordingHistory = false
      this.setHTML(this.history[this.historyIndex])
      this.isRecordingHistory = true
    }
  }

  private redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.isRecordingHistory = false
      this.setHTML(this.history[this.historyIndex])
      this.isRecordingHistory = true
    }
  }

  private translate(key: string, defaultValue = ""): string {
    if (this.options.i18n?.translations && this.options.i18n.translations[key]) {
      return this.options.i18n.translations[key]
    }
    return defaultValue
  }

  // Public API methods
  public getHTML(): string {
    if (this.container.classList.contains("html-view")) {
      return (this.editor as HTMLTextAreaElement).value
    }
    return this.editor.innerHTML
  }

  public setHTML(html: string): void {
    if (this.container.classList.contains("html-view")) {
      ;(this.editor as HTMLTextAreaElement).value = html
    } else {
      this.editor.innerHTML = html
    }
    this.handleInput()
  }

  public getText(): string {
    if (this.container.classList.contains("html-view")) {
      // Create a temporary div to extract text from HTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = (this.editor as HTMLTextAreaElement).value
      return tempDiv.textContent || ""
    }
    return this.editor.textContent || ""
  }

  public focus(): void {
    this.editor.focus()
  }

  public blur(): void {
    this.editor.blur()
  }

  public destroy(): void {
    if (this.isDestroyed) return

    // Remove all event listeners
    this.editor.removeEventListener("mouseup", this.saveSelection.bind(this))
    this.editor.removeEventListener("keyup", this.handleKeyUp.bind(this))
    this.editor.removeEventListener("keydown", this.handleKeyDown.bind(this))
    this.editor.removeEventListener("input", this.handleInput.bind(this))
    this.editor.removeEventListener("paste", this.handlePaste.bind(this))
    this.editor.removeEventListener("dragover", (e) => e.preventDefault())
    this.editor.removeEventListener("drop", this.handleDrop.bind(this))

    // Destroy plugins
    if (this.imageResizer) {
      this.imageResizer.destroy()
    }

    if (this.codeBlockEditor) {
      this.codeBlockEditor.destroy()
    }

    if (this.findReplaceDialog) {
      this.findReplaceDialog.destroy()
    }

    if (this.mediaEmbedder) {
      this.mediaEmbedder.destroy()
    }

    if (this.wordCounter) {
      this.wordCounter.destroy()
    }

    if (this.spellChecker) {
      this.spellChecker.destroy()
    }

    if (this.advancedTableEditor) {
      this.advancedTableEditor.destroy()
    }

    if (this.accessibilityHelper) {
      this.accessibilityHelper.destroy()
    }

    // Destroy UI components
    this.colorPicker.destroy()
    this.tableEditor.destroy()
    this.emojiPicker.destroy()
    this.specialCharPicker.destroy()
    this.fontSelector.destroy()

    // Clear DOM
    this.container.innerHTML = ""
    this.isDestroyed = true
  }

  // Advanced methods
  public insertHTML(html: string): void {
    this.restoreSelection()
    this.execCommand("insertHTML", this.sanitizeHTML(html))
    this.handleInput()
    this.addToHistory()
  }

  public sanitizeHTML(html: string): string {
    return sanitizeHTML(html, this.options.allowedTags || [])
  }

  public exportToMarkdown(): string {
    return htmlToMarkdown(this.getHTML())
  }

  public importFromMarkdown(markdown: string): void {
    const html = markdownToHtml(markdown)
    this.setHTML(html)
    this.addToHistory()
  }

  public setReadOnly(readOnly: boolean): void {
    this.options.readOnly = readOnly
    this.editor.setAttribute("contenteditable", readOnly ? "false" : "true")
    this.container.classList.toggle("read-only", readOnly)
  }

  public setDarkMode(darkMode: boolean): void {
    this.options.darkMode = darkMode
    this.container.classList.toggle("dark-mode", darkMode)
  }

  public getContainer(): HTMLElement {
    return this.container
  }

  public getEditor(): HTMLElement {
    return this.editor
  }

  public getToolbar(): HTMLElement {
    return this.toolbar
  }

  public getStatusBar(): HTMLElement {
    return this.statusBar
  }

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
}
