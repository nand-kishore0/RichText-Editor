export class FindReplaceDialog {
  private editor: any
  private dialog: HTMLElement | null = null
  private findInput: HTMLInputElement | null = null
  private replaceInput: HTMLInputElement | null = null
  private matchCase: HTMLInputElement | null = null
  private wholeWord: HTMLInputElement | null = null
  private regExp: HTMLInputElement | null = null
  private statusElement: HTMLElement | null = null
  private currentMatches: number[] = []
  private currentMatchIndex = -1
  private editorContent = ""
  private originalContent = ""

  constructor(editor: any) {
    this.editor = editor
  }

  public show(): void {
    // Create dialog if it doesn't exist
    if (!this.dialog) {
      this.createDialog()
    }

    if (!this.dialog) return

    // Store original content for reference
    this.originalContent = this.editor.getHTML()
    this.editorContent = this.originalContent

    // Show the dialog
    this.dialog.style.display = "block"

    // Focus the find input
    setTimeout(() => {
      this.findInput?.focus()
    }, 0)
  }

  private createDialog(): void {
    // Create dialog element
    this.dialog = document.createElement("div")
    this.dialog.className = "find-replace-dialog"
    this.dialog.style.position = "fixed"
    this.dialog.style.top = "100px"
    this.dialog.style.right = "20px"
    this.dialog.style.backgroundColor = "white"
    this.dialog.style.border = "1px solid #ddd"
    this.dialog.style.borderRadius = "4px"
    this.dialog.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
    this.dialog.style.padding = "15px"
    this.dialog.style.zIndex = "1050"
    this.dialog.style.width = "300px"
    this.dialog.style.display = "none"

    // Create dialog content
    this.dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0;">Find and Replace</h3>
        <button id="find-replace-close" style="background: none; border: none; font-size: 16px; cursor: pointer;">✕</button>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label for="find-input" style="display: block; margin-bottom: 5px;">Find:</label>
        <div style="display: flex; gap: 5px;">
          <input id="find-input" type="text" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="find-prev" title="Previous match" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer;">↑</button>
          <button id="find-next" title="Next match" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer;">↓</button>
        </div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label for="replace-input" style="display: block; margin-bottom: 5px;">Replace with:</label>
        <div style="display: flex; gap: 5px;">
          <input id="replace-input" type="text" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <button id="replace" title="Replace" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer;">↷</button>
        </div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="display: flex; gap: 15px;">
          <label style="display: flex; align-items: center; gap: 5px;">
            <input id="match-case" type="checkbox">
            Match case
          </label>
          <label style="display: flex; align-items: center; gap: 5px;">
            <input id="whole-word" type="checkbox">
            Whole word
          </label>
        </div>
        <div style="margin-top: 5px;">
          <label style="display: flex; align-items: center; gap: 5px;">
            <input id="regexp" type="checkbox">
            Regular expression
          </label>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <span id="find-status" style="color: #666;"></span>
        <button id="replace-all" style="padding: 6px 12px; border: none; border-radius: 4px; background-color: #1a73e8; color: white; cursor: pointer;">Replace All</button>
      </div>
    `

    // Add to document body
    document.body.appendChild(this.dialog)

    // Get references to elements
    this.findInput = this.dialog.querySelector("#find-input")
    this.replaceInput = this.dialog.querySelector("#replace-input")
    this.matchCase = this.dialog.querySelector("#match-case")
    this.wholeWord = this.dialog.querySelector("#whole-word")
    this.regExp = this.dialog.querySelector("#regexp")
    this.statusElement = this.dialog.querySelector("#find-status")

    // Add event listeners
    const closeButton = this.dialog.querySelector("#find-replace-close")
    const findPrevButton = this.dialog.querySelector("#find-prev")
    const findNextButton = this.dialog.querySelector("#find-next")
    const replaceButton = this.dialog.querySelector("#replace")
    const replaceAllButton = this.dialog.querySelector("#replace-all")

    if (closeButton) {
      closeButton.addEventListener("click", () => this.close())
    }

    if (findPrevButton) {
      findPrevButton.addEventListener("click", () => this.findPrevious())
    }

    if (findNextButton) {
      findNextButton.addEventListener("click", () => this.findNext())
    }

    if (replaceButton) {
      replaceButton.addEventListener("click", () => this.replace())
    }

    if (replaceAllButton) {
      replaceAllButton.addEventListener("click", () => this.replaceAll())
    }

    // Add input event listeners
    if (this.findInput) {
      this.findInput.addEventListener("input", () => this.find())
      this.findInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          this.findNext()
        }
      })
    }

    if (this.matchCase) {
      this.matchCase.addEventListener("change", () => this.find())
    }

    if (this.wholeWord) {
      this.wholeWord.addEventListener("change", () => this.find())
    }

    if (this.regExp) {
      this.regExp.addEventListener("change", () => this.find())
    }

    // Add document event listener for Escape key
    document.addEventListener("keydown", this.handleKeyDown)
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.dialog && this.dialog.style.display === "block") {
      e.preventDefault()
      this.close()
    }
  }

  private find(): void {
    if (!this.findInput || !this.statusElement) return

    const searchText = this.findInput.value

    if (!searchText) {
      this.clearHighlights()
      this.statusElement.textContent = ""
      this.currentMatches = []
      this.currentMatchIndex = -1
      return
    }

    // Get search options
    const matchCase = this.matchCase?.checked || false
    const wholeWord = this.wholeWord?.checked || false
    const useRegExp = this.regExp?.checked || false

    // Create a temporary div to search in
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = this.originalContent

    // Get all text nodes
    const textNodes = this.getTextNodes(tempDiv)

    // Reset matches
    this.currentMatches = []
    this.currentMatchIndex = -1

    // Create RegExp for searching
    let searchRegExp: RegExp

    try {
      if (useRegExp) {
        searchRegExp = new RegExp(searchText, matchCase ? "g" : "gi")
      } else {
        let pattern = this.escapeRegExp(searchText)
        if (wholeWord) {
          pattern = `\\b${pattern}\\b`
        }
        searchRegExp = new RegExp(pattern, matchCase ? "g" : "gi")
      }
    } catch (error) {
      this.statusElement.textContent = "Invalid regular expression"
      return
    }

    // Search in text nodes
    let totalMatches = 0

    textNodes.forEach((node, nodeIndex) => {
      const text = node.nodeValue || ""
      let match

      // Reset lastIndex to start search from beginning
      searchRegExp.lastIndex = 0

      while ((match = searchRegExp.exec(text)) !== null) {
        totalMatches++
        this.currentMatches.push(nodeIndex)
      }
    })

    // Update status
    this.statusElement.textContent = `${totalMatches} matches`

    // Highlight matches
    this.highlightMatches(textNodes, searchRegExp)

    // Move to first match if there are matches
    if (totalMatches > 0) {
      this.currentMatchIndex = 0
      this.scrollToMatch(0)
    }
  }

  private findNext(): void {
    if (this.currentMatches.length === 0) {
      this.find()
      return
    }

    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.currentMatches.length
    this.scrollToMatch(this.currentMatchIndex)
  }

  private findPrevious(): void {
    if (this.currentMatches.length === 0) {
      this.find()
      return
    }

    this.currentMatchIndex = (this.currentMatchIndex - 1 + this.currentMatches.length) % this.currentMatches.length
    this.scrollToMatch(this.currentMatchIndex)
  }

  private replace(): void {
    if (!this.findInput || !this.replaceInput || this.currentMatches.length === 0) return

    const searchText = this.findInput.value
    const replaceText = this.replaceInput.value

    if (!searchText) return

    // Get search options
    const matchCase = this.matchCase?.checked || false
    const wholeWord = this.wholeWord?.checked || false
    const useRegExp = this.regExp?.checked || false

    // Create RegExp for searching
    let searchRegExp: RegExp

    try {
      if (useRegExp) {
        searchRegExp = new RegExp(searchText, matchCase ? "g" : "gi")
      } else {
        let pattern = this.escapeRegExp(searchText)
        if (wholeWord) {
          pattern = `\\b${pattern}\\b`
        }
        searchRegExp = new RegExp(pattern, matchCase ? "g" : "gi")
      }
    } catch (error) {
      return
    }

    // Get the current match
    const matchIndex = this.currentMatches[this.currentMatchIndex]

    // Create a temporary div to modify
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = this.editorContent

    // Get all text nodes
    const textNodes = this.getTextNodes(tempDiv)

    // Replace the current match
    const textNode = textNodes[matchIndex]
    if (textNode) {
      const text = textNode.nodeValue || ""

      // Reset lastIndex to start search from beginning
      searchRegExp.lastIndex = 0

      // Find the match at the current index
      let match
      let currentMatchCount = 0

      while ((match = searchRegExp.exec(text)) !== null) {
        if (currentMatchCount === this.currentMatchIndex) {
          // Replace this match
          const beforeMatch = text.substring(0, match.index)
          const afterMatch = text.substring(match.index + match[0].length)
          textNode.nodeValue = beforeMatch + replaceText + afterMatch
          break
        }
        currentMatchCount++
      }
    }

    // Update editor content
    this.editorContent = tempDiv.innerHTML
    this.editor.setHTML(this.editorContent)

    // Find matches again
    this.find()

    // Move to next match
    if (this.currentMatches.length > 0) {
      this.findNext()
    }
  }

  private replaceAll(): void {
    if (!this.findInput || !this.replaceInput) return

    const searchText = this.findInput.value
    const replaceText = this.replaceInput.value

    if (!searchText) return

    // Get search options
    const matchCase = this.matchCase?.checked || false
    const wholeWord = this.wholeWord?.checked || false
    const useRegExp = this.regExp?.checked || false

    // Create RegExp for searching
    let searchRegExp: RegExp

    try {
      if (useRegExp) {
        searchRegExp = new RegExp(searchText, matchCase ? "g" : "gi")
      } else {
        let pattern = this.escapeRegExp(searchText)
        if (wholeWord) {
          pattern = `\\b${pattern}\\b`
        }
        searchRegExp = new RegExp(pattern, matchCase ? "g" : "gi")
      }
    } catch (error) {
      return
    }

    // Replace all occurrences in the editor content
    let content = this.originalContent
    content = content.replace(searchRegExp, replaceText)

    // Update editor content
    this.editorContent = content
    this.editor.setHTML(content)

    // Update original content
    this.originalContent = content

    // Clear matches
    this.currentMatches = []
    this.currentMatchIndex = -1

    // Update status
    if (this.statusElement) {
      this.statusElement.textContent = "All replaced"
    }
  }

  private scrollToMatch(matchIndex: number): void {
    // Highlight the current match
    const highlights = document.querySelectorAll(".find-highlight")

    highlights.forEach((highlight, index) => {
      if (index === matchIndex) {
        highlight.classList.add("find-highlight-current")

        // Scroll to the highlight
        highlight.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      } else {
        highlight.classList.remove("find-highlight-current")
      }
    })

    // Update status
    if (this.statusElement && this.currentMatches.length > 0) {
      this.statusElement.textContent = `${matchIndex + 1} of ${this.currentMatches.length} matches`
    }
  }

  private highlightMatches(textNodes: Node[], searchRegExp: RegExp): void {
    // Clear existing highlights
    this.clearHighlights()

    // Create a style element for highlights if it doesn't exist
    let styleElement = document.getElementById("find-highlight-styles")

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = "find-highlight-styles"
      styleElement.textContent = `
        .find-highlight {
          background-color: #ffeb3b;
          border-radius: 2px;
        }
        .find-highlight-current {
          background-color: #ff9800;
        }
      `
      document.head.appendChild(styleElement)
    }

    // Highlight matches in the editor content
    let content = this.originalContent

    // Replace matches with highlighted spans
    content = content.replace(searchRegExp, (match) => {
      return `<span class="find-highlight">${match}</span>`
    })

    // Update editor content with highlights
    this.editorContent = content
    this.editor.setHTML(content)
  }

  private clearHighlights(): void {
    // Remove highlight spans from the editor content
    if (this.editorContent !== this.originalContent) {
      this.editor.setHTML(this.originalContent)
      this.editorContent = this.originalContent
    }
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

  private close(): void {
    if (!this.dialog) return

    // Clear highlights
    this.clearHighlights()

    // Hide the dialog
    this.dialog.style.display = "none"
  }

  public destroy(): void {
    // Remove event listeners
    document.removeEventListener("keydown", this.handleKeyDown)

    // Remove dialog if it exists
    if (this.dialog) {
      document.body.removeChild(this.dialog)
      this.dialog = null
    }

    // Remove style element
    const styleElement = document.getElementById("find-highlight-styles")
    if (styleElement) {
      document.head.removeChild(styleElement)
    }
  }
}
