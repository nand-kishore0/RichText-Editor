export class SpellChecker {
  private editor: any
  private isEnabled = false
  private misspelledWords: Map<string, string[]> = new Map()
  private suggestionMenu: HTMLElement | null = null
  private currentWord: { text: string; element: HTMLElement } | null = null
  private customDictionary: Set<string> = new Set()
  private ignoreList: Set<string> = new Set()
  private debounceTimeout: number | null = null

  constructor(editor: any) {
    this.editor = editor
    this.loadCustomDictionary()
    this.initEvents()
  }

  private initEvents(): void {
    // Listen for input events on the editor
    const editorContent = this.editor.getEditor()
    editorContent.addEventListener("input", this.handleInput)

    // Listen for context menu events to show spelling suggestions
    editorContent.addEventListener("contextmenu", this.handleContextMenu)

    // Listen for clicks to handle word selection
    editorContent.addEventListener("click", this.handleClick)

    // Listen for mousedown on the document to handle clicks outside the suggestion menu
    document.addEventListener("mousedown", this.handleDocumentMouseDown)
  }

  private handleInput = (): void => {
    // Debounce the spell check to avoid performance issues
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    this.debounceTimeout = window.setTimeout(() => {
      if (this.isEnabled) {
        this.checkSpelling()
      }
    }, 500)
  }

  private handleContextMenu = (e: MouseEvent): void => {
    if (!this.isEnabled) return

    // Get the word under the cursor
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const node = range.startContainer

    if (node.nodeType !== Node.TEXT_NODE) return

    const text = node.textContent || ""
    const offset = range.startOffset

    // Find the word boundaries
    const wordBoundaries = this.findWordBoundaries(text, offset)
    if (!wordBoundaries) return

    const word = text.substring(wordBoundaries.start, wordBoundaries.end)

    // Check if the word is misspelled
    if (this.isWordMisspelled(word)) {
      e.preventDefault()

      // Create a range for the word
      const wordRange = document.createRange()
      wordRange.setStart(node, wordBoundaries.start)
      wordRange.setEnd(node, wordBoundaries.end)

      // Select the word
      selection.removeAllRanges()
      selection.addRange(wordRange)

      // Show suggestions menu
      this.showSuggestionMenu(e, word, node.parentElement as HTMLElement)
    }
  }

  private handleClick = (e: MouseEvent): void => {
    if (!this.isEnabled) return

    const target = e.target as HTMLElement

    // Check if the clicked element is a misspelled word
    if (target.classList.contains("misspelled")) {
      e.preventDefault()

      // Get the word
      const word = target.textContent || ""

      // Show suggestions menu
      this.showSuggestionMenu(e, word, target)
    }
  }

  private handleDocumentMouseDown = (e: MouseEvent): void => {
    // Close suggestion menu if clicking outside
    if (this.suggestionMenu && e.target !== this.suggestionMenu && !this.suggestionMenu.contains(e.target as Node)) {
      this.closeSuggestionMenu()
    }
  }

  private findWordBoundaries(text: string, offset: number): { start: number; end: number } | null {
    // Find the start of the word
    let start = offset
    while (start > 0 && /\w/.test(text[start - 1])) {
      start--
    }

    // Find the end of the word
    let end = offset
    while (end < text.length && /\w/.test(text[end])) {
      end++
    }

    // Return null if no word found
    if (start === end) return null

    return { start, end }
  }

  private isWordMisspelled(word: string): boolean {
    // Skip empty words, numbers, and words in the custom dictionary or ignore list
    if (
      !word ||
      word.length < 2 ||
      /^\d+$/.test(word) ||
      this.customDictionary.has(word.toLowerCase()) ||
      this.ignoreList.has(word.toLowerCase())
    ) {
      return false
    }

    // In a real implementation, you would use a spell checking library or API
    // For this example, we'll use a simple mock implementation

    // Mock dictionary of common English words
    const commonWords = new Set([
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "I",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
      "or",
      "an",
      "will",
      "my",
      "one",
      "all",
      "would",
      "there",
      "their",
      "what",
      "so",
      "up",
      "out",
      "if",
      "about",
      "who",
      "get",
      "which",
      "go",
      "me",
      "when",
      "make",
      "can",
      "like",
      "time",
      "no",
      "just",
      "him",
      "know",
      "take",
      "people",
      "into",
      "year",
      "your",
      "good",
      "some",
      "could",
      "them",
      "see",
      "other",
      "than",
      "then",
      "now",
      "look",
      "only",
      "come",
      "its",
      "over",
      "think",
      "also",
      "back",
      "after",
      "use",
      "two",
      "how",
      "our",
      "work",
      "first",
      "well",
      "way",
      "even",
      "new",
      "want",
      "because",
      "any",
      "these",
      "give",
      "day",
      "most",
      "us",
    ])

    return !commonWords.has(word.toLowerCase())
  }

  private getSuggestions(word: string): string[] {
    // In a real implementation, you would use a spell checking library or API
    // For this example, we'll return some mock suggestions

    // Check if we already have suggestions for this word
    if (this.misspelledWords.has(word)) {
      return this.misspelledWords.get(word) || []
    }

    // Generate some mock suggestions
    const suggestions: string[] = []

    // Add a capitalized version if the word is all lowercase
    if (word === word.toLowerCase() && word.length > 0) {
      suggestions.push(word.charAt(0).toUpperCase() + word.slice(1))
    }

    // Add a lowercase version if the word is capitalized
    if (word.charAt(0) === word.charAt(0).toUpperCase() && word.slice(1) === word.slice(1).toLowerCase()) {
      suggestions.push(word.toLowerCase())
    }

    // Add some common typo corrections
    if (word.includes("teh")) {
      suggestions.push(word.replace("teh", "the"))
    }

    if (word.includes("recieve")) {
      suggestions.push(word.replace("recieve", "receive"))
    }

    if (word.includes("thier")) {
      suggestions.push(word.replace("thier", "their"))
    }

    // Store suggestions for future use
    this.misspelledWords.set(word, suggestions)

    return suggestions
  }

  private showSuggestionMenu(e: MouseEvent, word: string, element: HTMLElement): void {
    // Close any existing menu
    this.closeSuggestionMenu()

    // Create suggestion menu
    this.suggestionMenu = document.createElement("div")
    this.suggestionMenu.className = "spell-suggestion-menu"
    this.suggestionMenu.style.position = "absolute"
    this.suggestionMenu.style.top = `${e.pageY}px`
    this.suggestionMenu.style.left = `${e.pageX}px`
    this.suggestionMenu.style.backgroundColor = "white"
    this.suggestionMenu.style.border = "1px solid #ddd"
    this.suggestionMenu.style.borderRadius = "4px"
    this.suggestionMenu.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)"
    this.suggestionMenu.style.padding = "5px 0"
    this.suggestionMenu.style.zIndex = "1100"
    this.suggestionMenu.style.minWidth = "150px"

    // Store the current word and element
    this.currentWord = { text: word, element }

    // Get suggestions
    const suggestions = this.getSuggestions(word)

    // Add suggestions to menu
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion) => {
        const item = document.createElement("div")
        item.className = "spell-suggestion-item"
        item.textContent = suggestion
        item.style.padding = "5px 10px"
        item.style.cursor = "pointer"

        item.addEventListener("mouseenter", () => {
          item.style.backgroundColor = "#f0f0f0"
        })

        item.addEventListener("mouseleave", () => {
          item.style.backgroundColor = "transparent"
        })

        item.addEventListener("click", () => {
          this.replaceWord(suggestion)
        })

        this.suggestionMenu.appendChild(item)
      })

      // Add separator
      const separator = document.createElement("div")
      separator.style.height = "1px"
      separator.style.backgroundColor = "#ddd"
      separator.style.margin = "5px 0"
      this.suggestionMenu.appendChild(separator)
    } else {
      const noSuggestions = document.createElement("div")
      noSuggestions.className = "spell-suggestion-item"
      noSuggestions.textContent = "No suggestions"
      noSuggestions.style.padding = "5px 10px"
      noSuggestions.style.color = "#999"
      this.suggestionMenu.appendChild(noSuggestions)

      // Add separator
      const separator = document.createElement("div")
      separator.style.height = "1px"
      separator.style.backgroundColor = "#ddd"
      separator.style.margin = "5px 0"
      this.suggestionMenu.appendChild(separator)
    }

    // Add "Add to Dictionary" option
    const addToDictionary = document.createElement("div")
    addToDictionary.className = "spell-suggestion-item"
    addToDictionary.textContent = "Add to Dictionary"
    addToDictionary.style.padding = "5px 10px"
    addToDictionary.style.cursor = "pointer"

    addToDictionary.addEventListener("mouseenter", () => {
      addToDictionary.style.backgroundColor = "#f0f0f0"
    })

    addToDictionary.addEventListener("mouseleave", () => {
      addToDictionary.style.backgroundColor = "transparent"
    })

    addToDictionary.addEventListener("click", () => {
      this.addToDictionary(word)
    })

    this.suggestionMenu.appendChild(addToDictionary)

    // Add "Ignore" option
    const ignore = document.createElement("div")
    ignore.className = "spell-suggestion-item"
    ignore.textContent = "Ignore"
    ignore.style.padding = "5px 10px"
    ignore.style.cursor = "pointer"

    ignore.addEventListener("mouseenter", () => {
      ignore.style.backgroundColor = "#f0f0f0"
    })

    ignore.addEventListener("mouseleave", () => {
      ignore.style.backgroundColor = "transparent"
    })

    ignore.addEventListener("click", () => {
      this.ignoreWord(word)
    })

    this.suggestionMenu.appendChild(ignore)

    // Add to document body
    document.body.appendChild(this.suggestionMenu)

    // Adjust position if menu goes off screen
    const menuRect = this.suggestionMenu.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    if (menuRect.right > windowWidth) {
      this.suggestionMenu.style.left = `${windowWidth - menuRect.width - 10}px`
    }

    if (menuRect.bottom > windowHeight) {
      this.suggestionMenu.style.top = `${e.pageY - menuRect.height}px`
    }
  }

  private closeSuggestionMenu(): void {
    if (this.suggestionMenu) {
      document.body.removeChild(this.suggestionMenu)
      this.suggestionMenu = null
      this.currentWord = null
    }
  }

  private replaceWord(replacement: string): void {
    if (!this.currentWord) return

    const { text, element } = this.currentWord

    // If the element is a misspelled span, replace its content
    if (element.classList.contains("misspelled")) {
      element.textContent = replacement
      element.classList.remove("misspelled")
      element.style.textDecoration = ""
      element.style.borderBottom = ""
    } else {
      // Otherwise, replace the text in the editor content
      const editorContent = this.editor.getHTML()
      const newContent = editorContent.replace(text, replacement)
      this.editor.setHTML(newContent)
    }

    // Close the suggestion menu
    this.closeSuggestionMenu()

    // Update the editor
    this.editor.handleInput()
  }

  private addToDictionary(word: string): void {
    // Add the word to the custom dictionary
    this.customDictionary.add(word.toLowerCase())

    // Save the custom dictionary
    this.saveCustomDictionary()

    // Remove the misspelled styling
    if (this.currentWord && this.currentWord.element.classList.contains("misspelled")) {
      this.currentWord.element.classList.remove("misspelled")
      this.currentWord.element.style.textDecoration = ""
      this.currentWord.element.style.borderBottom = ""
    }

    // Close the suggestion menu
    this.closeSuggestionMenu()

    // Re-check spelling
    this.checkSpelling()
  }

  private ignoreWord(word: string): void {
    // Add the word to the ignore list
    this.ignoreList.add(word.toLowerCase())

    // Remove the misspelled styling
    if (this.currentWord && this.currentWord.element.classList.contains("misspelled")) {
      this.currentWord.element.classList.remove("misspelled")
      this.currentWord.element.style.textDecoration = ""
      this.currentWord.element.style.borderBottom = ""
    }

    // Close the suggestion menu
    this.closeSuggestionMenu()

    // Re-check spelling
    this.checkSpelling()
  }

  private loadCustomDictionary(): void {
    // Load custom dictionary from localStorage
    const savedDictionary = localStorage.getItem("spell-checker-dictionary")

    if (savedDictionary) {
      try {
        const words = JSON.parse(savedDictionary)
        this.customDictionary = new Set(words)
      } catch (error) {
        console.error("Error loading custom dictionary:", error)
        this.customDictionary = new Set()
      }
    }
  }

  private saveCustomDictionary(): void {
    // Save custom dictionary to localStorage
    const words = Array.from(this.customDictionary)
    localStorage.setItem("spell-checker-dictionary", JSON.stringify(words))
  }

  public checkSpelling(): void {
    if (!this.isEnabled) return

    // Get the editor content
    const editorContent = this.editor.getEditor()

    // Create a style element for misspelled words if it doesn't exist
    let styleElement = document.getElementById("spell-checker-styles")

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = "spell-checker-styles"
      styleElement.textContent = `
        .misspelled {
          text-decoration: none;
          border-bottom: 1px dashed red;
        }
      `
      document.head.appendChild(styleElement)
    }

    // Remove existing misspelled markers
    const misspelledElements = editorContent.querySelectorAll(".misspelled")
    misspelledElements.forEach((element) => {
      const parent = element.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(element.textContent || ""), element)
      }
    })

    // Get all text nodes
    const textNodes = this.getTextNodes(editorContent)

    // Check each text node for misspelled words
    textNodes.forEach((node) => {
      const text = node.nodeValue || ""

      // Find words in the text
      const words = text.match(/\b\w+\b/g)

      if (!words) return

      // Check each word
      words.forEach((word) => {
        if (this.isWordMisspelled(word)) {
          // Mark the word as misspelled
          const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, "g")
          const parent = node.parentNode

          if (parent && parent.nodeType === Node.ELEMENT_NODE) {
            const html = (parent as HTMLElement).innerHTML
            ;(parent as HTMLElement).innerHTML = html.replace(regex, `<span class="misspelled">${word}</span>`)
          }
        }
      })
    })
  }

  private getTextNodes(node: Node): Node[] {
    const textNodes: Node[] = []

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node)
      } else {
        const children = node.childNodes
        for (let i = 0; i < children.length; i++) {
          walk(children[i])
        }
      }
    }

    walk(node)

    return textNodes
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  public enable(): void {
    this.isEnabled = true
    this.checkSpelling()
  }

  public disable(): void {
    this.isEnabled = false

    // Remove misspelled markers
    const editorContent = this.editor.getEditor()
    const misspelledElements = editorContent.querySelectorAll(".misspelled")

    misspelledElements.forEach((element) => {
      const parent = element.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(element.textContent || ""), element)
      }
    })
  }

  public toggle(): void {
    if (this.isEnabled) {
      this.disable()
    } else {
      this.enable()
    }
  }

  public destroy(): void {
    // Remove event listeners
    const editorContent = this.editor.getEditor()
    editorContent.removeEventListener("input", this.handleInput)
    editorContent.removeEventListener("contextmenu", this.handleContextMenu)
    editorContent.removeEventListener("click", this.handleClick)
    document.removeEventListener("mousedown", this.handleDocumentMouseDown)

    // Clear any pending timeouts
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    // Remove suggestion menu
    this.closeSuggestionMenu()

    // Remove style element
    const styleElement = document.getElementById("spell-checker-styles")
    if (styleElement) {
      document.head.removeChild(styleElement)
    }

    // Remove misspelled markers
    this.disable()
  }
}
