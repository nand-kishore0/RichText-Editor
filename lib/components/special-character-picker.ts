export class SpecialCharacterPicker {
  private editor: any
  private specialCharElement: HTMLElement | null = null
  private recentChars: string[] = []
  private maxRecentChars = 16

  constructor(editor: any) {
    this.editor = editor
    this.loadRecentChars()
  }

  public show(): void {
    // Create special character picker if it doesn't exist
    if (!this.specialCharElement) {
      this.createSpecialCharPicker()
    }

    // Position the special character picker
    const toolbar = this.editor.getToolbar()
    const button = toolbar.querySelector('[data-command="insertSpecialChar"]')
    if (button && this.specialCharElement) {
      const buttonRect = button.getBoundingClientRect()
      const containerRect = this.editor.getContainer().getBoundingClientRect()

      this.specialCharElement.style.top = `${buttonRect.bottom - containerRect.top}px`
      this.specialCharElement.style.left = `${buttonRect.left - containerRect.left}px`
      this.specialCharElement.style.display = "block"
    }

    // Add click outside listener
    document.addEventListener("click", this.handleClickOutside)
  }

  private createSpecialCharPicker(): void {
    this.specialCharElement = document.createElement("div")
    this.specialCharElement.className = "special-char-picker"
    this.specialCharElement.style.display = "none"

    // Create tabs
    const tabs = document.createElement("div")
    tabs.className = "special-char-tabs"

    const categories = [
      { id: "recent", name: "Recent" },
      { id: "punctuation", name: "Punctuation" },
      { id: "math", name: "Math" },
      { id: "currency", name: "Currency" },
      { id: "arrows", name: "Arrows" },
      { id: "symbols", name: "Symbols" },
    ]

    categories.forEach((category) => {
      const tab = document.createElement("div")
      tab.className = "special-char-tab"
      tab.setAttribute("data-category", category.id)
      tab.textContent = category.name
      tab.addEventListener("click", () => this.switchCategory(category.id))
      tabs.appendChild(tab)
    })

    // Create character container
    const charContainer = document.createElement("div")
    charContainer.className = "special-char-container"

    // Create search input
    const searchContainer = document.createElement("div")
    searchContainer.className = "special-char-search-container"

    const searchInput = document.createElement("input")
    searchInput.type = "text"
    searchInput.className = "special-char-search"
    searchInput.placeholder = "Search characters..."
    searchInput.addEventListener("input", () => this.searchChars(searchInput.value))

    searchContainer.appendChild(searchInput)

    // Assemble special character picker
    this.specialCharElement.appendChild(searchContainer)
    this.specialCharElement.appendChild(tabs)
    this.specialCharElement.appendChild(charContainer)

    // Add to editor container
    this.editor.getContainer().appendChild(this.specialCharElement)

    // Load initial category (recent)
    this.switchCategory("recent")
  }

  private switchCategory(categoryId: string): void {
    if (!this.specialCharElement) return

    // Update active tab
    const tabs = this.specialCharElement.querySelectorAll(".special-char-tab")
    tabs.forEach((tab) => {
      if (tab.getAttribute("data-category") === categoryId) {
        tab.classList.add("active")
      } else {
        tab.classList.remove("active")
      }
    })

    // Get character container
    const charContainer = this.specialCharElement.querySelector(".special-char-container")
    if (!charContainer) return

    // Clear container
    charContainer.innerHTML = ""

    // Load characters for the category
    let chars: Array<{ char: string; name: string }> = []

    if (categoryId === "recent") {
      chars = this.recentChars.map((char) => ({ char, name: char }))
    } else {
      chars = this.getCharsForCategory(categoryId)
    }

    // Add characters to container
    chars.forEach(({ char, name }) => {
      const charElement = document.createElement("div")
      charElement.className = "special-char"
      charElement.textContent = char
      charElement.title = name
      charElement.addEventListener("click", () => this.insertChar(char))
      charContainer.appendChild(charElement)
    })
  }

  private getCharsForCategory(categoryId: string): Array<{ char: string; name: string }> {
    const charMap: Record<string, Array<{ char: string; name: string }>> = {
      punctuation: [
        { char: "¶", name: "Paragraph" },
        { char: "§", name: "Section" },
        { char: "†", name: "Dagger" },
        { char: "‡", name: "Double Dagger" },
        { char: "•", name: "Bullet" },
        { char: "‣", name: "Triangle Bullet" },
        { char: "⁃", name: "Hyphen Bullet" },
        { char: "‹", name: "Single Left Angle Quotation" },
        { char: "›", name: "Single Right Angle Quotation" },
        { char: "«", name: "Double Left Angle Quotation" },
        { char: "»", name: "Double Right Angle Quotation" },
        { char: "“", name: "Left Double Quotation" },
        { char: "”", name: "Right Double Quotation" },
        { char: "‘", name: "Left Single Quotation" },
        { char: "'", name: "Right Single Quotation" },
        { char: "′", name: "Prime" },
        { char: "″", name: "Double Prime" },
        { char: "‾", name: "Overline" },
        { char: "‐", name: "Hyphen" },
        { char: "‑", name: "Non-Breaking Hyphen" },
        { char: "‒", name: "Figure Dash" },
        { char: "–", name: "En Dash" },
        { char: "—", name: "Em Dash" },
        { char: "…", name: "Ellipsis" },
      ],
      math: [
        { char: "±", name: "Plus-Minus" },
        { char: "∓", name: "Minus-Plus" },
        { char: "×", name: "Multiplication" },
        { char: "÷", name: "Division" },
        { char: "⁄", name: "Fraction Slash" },
        { char: "∕", name: "Division Slash" },
        { char: "√", name: "Square Root" },
        { char: "∛", name: "Cube Root" },
        { char: "∜", name: "Fourth Root" },
        { char: "∑", name: "Summation" },
        { char: "∏", name: "Product" },
        { char: "∐", name: "Coproduct" },
        { char: "∫", name: "Integral" },
        { char: "∬", name: "Double Integral" },
        { char: "∭", name: "Triple Integral" },
        { char: "∮", name: "Contour Integral" },
        { char: "∯", name: "Surface Integral" },
        { char: "∰", name: "Volume Integral" },
        { char: "∇", name: "Nabla" },
        { char: "∆", name: "Increment" },
        { char: "∂", name: "Partial Differential" },
        { char: "≠", name: "Not Equal To" },
        { char: "≈", name: "Almost Equal To" },
        { char: "≡", name: "Identical To" },
        { char: "≤", name: "Less Than or Equal To" },
        { char: "≥", name: "Greater Than or Equal To" },
        { char: "∝", name: "Proportional To" },
        { char: "∞", name: "Infinity" },
        { char: "∠", name: "Angle" },
        { char: "∟", name: "Right Angle" },
        { char: "∥", name: "Parallel To" },
        { char: "∦", name: "Not Parallel To" },
        { char: "∧", name: "Logical And" },
        { char: "∨", name: "Logical Or" },
        { char: "¬", name: "Not" },
        { char: "∩", name: "Intersection" },
        { char: "∪", name: "Union" },
        { char: "∈", name: "Element Of" },
        { char: "∉", name: "Not Element Of" },
        { char: "∋", name: "Contains As Member" },
        { char: "⊂", name: "Subset Of" },
        { char: "⊃", name: "Superset Of" },
        { char: "⊆", name: "Subset Of or Equal To" },
        { char: "⊇", name: "Superset Of or Equal To" },
      ],
      currency: [
        { char: "¢", name: "Cent" },
        { char: "£", name: "Pound" },
        { char: "¤", name: "Currency" },
        { char: "¥", name: "Yen" },
        { char: "₽", name: "Ruble" },
        { char: "€", name: "Euro" },
        { char: "₩", name: "Won" },
        { char: "₹", name: "Rupee" },
        { char: "₱", name: "Peso" },
        { char: "₿", name: "Bitcoin" },
        { char: "$", name: "Dollar" },
        { char: "¤", name: "Generic Currency" },
        { char: "₴", name: "Hryvnia" },
        { char: "₫", name: "Dong" },
        { char: "฿", name: "Baht" },
        { char: "₭", name: "Kip" },
      ],
      arrows: [
        { char: "←", name: "Left Arrow" },
        { char: "→", name: "Right Arrow" },
        { char: "↑", name: "Up Arrow" },
        { char: "↓", name: "Down Arrow" },
        { char: "↔", name: "Left-Right Arrow" },
        { char: "↕", name: "Up-Down Arrow" },
        { char: "↖", name: "North West Arrow" },
        { char: "↗", name: "North East Arrow" },
        { char: "↘", name: "South East Arrow" },
        { char: "↙", name: "South West Arrow" },
        { char: "↚", name: "Left Arrow with Stroke" },
        { char: "↛", name: "Right Arrow with Stroke" },
        { char: "↜", name: "Left Wave Arrow" },
        { char: "↝", name: "Right Wave Arrow" },
        { char: "↞", name: "Left Double Arrow" },
        { char: "↠", name: "Right Double Arrow" },
        { char: "↢", name: "Left Arrow with Tail" },
        { char: "↣", name: "Right Arrow with Tail" },
        { char: "↩", name: "Left Arrow with Hook" },
        { char: "↪", name: "Right Arrow with Hook" },
        { char: "↫", name: "Left Arrow with Loop" },
        { char: "↬", name: "Right Arrow with Loop" },
        { char: "↰", name: "Up Arrow with Left Barb" },
        { char: "↱", name: "Up Arrow with Right Barb" },
        { char: "↲", name: "Down Arrow with Left Barb" },
        { char: "↳", name: "Down Arrow with Right Barb" },
        { char: "↵", name: "Carriage Return Arrow" },
        { char: "⇄", name: "Right Arrow Over Left Arrow" },
        { char: "⇅", name: "Up Arrow Left of Down Arrow" },
        { char: "⇆", name: "Left Arrow Over Right Arrow" },
        { char: "⇇", name: "Left Paired Arrows" },
        { char: "⇈", name: "Up Paired Arrows" },
        { char: "⇉", name: "Right Paired Arrows" },
        { char: "⇊", name: "Down Paired Arrows" },
      ],
      symbols: [
        { char: "©", name: "Copyright" },
        { char: "®", name: "Registered Trademark" },
        { char: "™", name: "Trademark" },
        { char: "℠", name: "Service Mark" },
        { char: "℗", name: "Sound Recording Copyright" },
        { char: "№", name: "Numero" },
        { char: "℃", name: "Celsius" },
        { char: "℉", name: "Fahrenheit" },
        { char: "°", name: "Degree" },
        { char: "µ", name: "Micro" },
        { char: "Ω", name: "Ohm" },
        { char: "℧", name: "Inverted Ohm" },
        { char: "℮", name: "Estimated" },
        { char: "⌀", name: "Diameter" },
        { char: "♀", name: "Female" },
        { char: "♂", name: "Male" },
        { char: "☀", name: "Sun" },
        { char: "☁", name: "Cloud" },
        { char: "☂", name: "Umbrella" },
        { char: "☃", name: "Snowman" },
        { char: "☄", name: "Comet" },
        { char: "★", name: "Star" },
        { char: "☆", name: "White Star" },
        { char: "☎", name: "Telephone" },
        { char: "☑", name: "Ballot Box with Check" },
        { char: "☒", name: "Ballot Box with X" },
        { char: "☓", name: "Saltire" },
        { char: "☕", name: "Hot Beverage" },
        { char: "☘", name: "Shamrock" },
        { char: "☠", name: "Skull and Crossbones" },
        { char: "☢", name: "Radioactive" },
        { char: "☣", name: "Biohazard" },
        { char: "☮", name: "Peace" },
        { char: "☯", name: "Yin Yang" },
        { char: "☸", name: "Wheel of Dharma" },
        { char: "☹", name: "Frowning Face" },
        { char: "☺", name: "Smiling Face" },
        { char: "☻", name: "Black Smiling Face" },
        { char: "☼", name: "White Sun with Rays" },
        { char: "☽", name: "First Quarter Moon" },
        { char: "☾", name: "Last Quarter Moon" },
        { char: "♠", name: "Spade" },
        { char: "♡", name: "Heart" },
        { char: "♢", name: "Diamond" },
        { char: "♣", name: "Club" },
        { char: "♤", name: "White Spade" },
        { char: "♥", name: "Black Heart" },
        { char: "♦", name: "Black Diamond" },
        { char: "♧", name: "White Club" },
        { char: "♨", name: "Hot Springs" },
        { char: "♩", name: "Quarter Note" },
        { char: "♪", name: "Eighth Note" },
        { char: "♫", name: "Beamed Eighth Notes" },
        { char: "♬", name: "Beamed Sixteenth Notes" },
        { char: "♭", name: "Flat" },
        { char: "♮", name: "Natural" },
        { char: "♯", name: "Sharp" },
      ],
    }

    return charMap[categoryId] || []
  }

  private searchChars(query: string): void {
    if (!this.specialCharElement || !query) {
      // If no query, show recent characters
      this.switchCategory("recent")
      return
    }

    // Get character container
    const charContainer = this.specialCharElement.querySelector(".special-char-container")
    if (!charContainer) return

    // Clear container
    charContainer.innerHTML = ""

    // Search across all categories
    const allChars: Array<{ char: string; name: string }> = []
    const categories = ["punctuation", "math", "currency", "arrows", "symbols"]

    categories.forEach((category) => {
      allChars.push(...this.getCharsForCategory(category))
    })

    // Filter characters by name
    const filteredChars = allChars.filter(({ name }) => {
      return name.toLowerCase().includes(query.toLowerCase())
    })

    // Add filtered characters to container
    filteredChars.forEach(({ char, name }) => {
      const charElement = document.createElement("div")
      charElement.className = "special-char"
      charElement.textContent = char
      charElement.title = name
      charElement.addEventListener("click", () => this.insertChar(char))
      charContainer.appendChild(charElement)
    })

    // Show message if no results
    if (filteredChars.length === 0) {
      const noResults = document.createElement("div")
      noResults.className = "no-results"
      noResults.textContent = "No characters found"
      charContainer.appendChild(noResults)
    }
  }

  private insertChar(char: string): void {
    // Insert the character
    this.editor.restoreSelection()
    this.editor.execCommand("insertText", char)

    // Add to recent characters
    this.addToRecentChars(char)

    // Hide the special character picker
    this.hide()
  }

  private addToRecentChars(char: string): void {
    // Remove if already exists
    const index = this.recentChars.indexOf(char)
    if (index !== -1) {
      this.recentChars.splice(index, 1)
    }

    // Add to beginning
    this.recentChars.unshift(char)

    // Limit size
    if (this.recentChars.length > this.maxRecentChars) {
      this.recentChars.pop()
    }

    // Save to localStorage
    this.saveRecentChars()
  }

  private saveRecentChars(): void {
    localStorage.setItem("rich-editor-recent-chars", JSON.stringify(this.recentChars))
  }

  private loadRecentChars(): void {
    const saved = localStorage.getItem("rich-editor-recent-chars")
    if (saved) {
      try {
        this.recentChars = JSON.parse(saved)
      } catch (e) {
        console.error("Error loading recent characters:", e)
        this.recentChars = []
      }
    }
  }

  private handleClickOutside = (e: MouseEvent): void => {
    if (this.specialCharElement && !this.specialCharElement.contains(e.target as Node)) {
      this.hide()
    }
  }

  public hide(): void {
    if (this.specialCharElement) {
      this.specialCharElement.style.display = "none"
    }
    document.removeEventListener("click", this.handleClickOutside)
  }

  public destroy(): void {
    if (this.specialCharElement) {
      this.specialCharElement.remove()
      this.specialCharElement = null
    }
    document.removeEventListener("click", this.handleClickOutside)
  }
}
