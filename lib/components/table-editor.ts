export class TableEditor {
  private editor: any
  private tableCreatorElement: HTMLElement | null = null
  private tablePropertiesElement: HTMLElement | null = null
  private selectedTable: HTMLTableElement | null = null
  private hoveredCells: number[] = [0, 0]
  private maxRows = 10
  private maxCols = 10

  constructor(editor: any) {
    this.editor = editor
  }

  public showTableCreator(): void {
    // Create table creator if it doesn't exist
    if (!this.tableCreatorElement) {
      this.createTableCreator()
    }

    // Position the table creator
    const toolbar = this.editor.getToolbar()
    const button = toolbar.querySelector('[data-command="insertTable"]')
    if (button && this.tableCreatorElement) {
      const buttonRect = button.getBoundingClientRect()
      const containerRect = this.editor.getContainer().getBoundingClientRect()

      this.tableCreatorElement.style.top = `${buttonRect.bottom - containerRect.top}px`
      this.tableCreatorElement.style.left = `${buttonRect.left - containerRect.left}px`
      this.tableCreatorElement.style.display = "block"
    }

    // Add click outside listener
    document.addEventListener("click", this.handleClickOutside)
  }

  private createTableCreator(): void {
    this.tableCreatorElement = document.createElement("div")
    this.tableCreatorElement.className = "table-creator"
    this.tableCreatorElement.style.display = "none"

    // Create table grid
    const tableGrid = document.createElement("div")
    tableGrid.className = "table-grid"

    // Create cells for the grid
    for (let row = 0; row < this.maxRows; row++) {
      for (let col = 0; col < this.maxCols; col++) {
        const cell = document.createElement("div")
        cell.className = "table-cell"
        cell.setAttribute("data-row", row.toString())
        cell.setAttribute("data-col", col.toString())

        // Add hover effect
        cell.addEventListener("mouseover", () => {
          this.hoveredCells = [row, col]
          this.updateTableGridHighlight()
        })

        // Add click handler
        cell.addEventListener("click", () => {
          this.insertTable(row + 1, col + 1)
        })

        tableGrid.appendChild(cell)
      }
    }

    // Create dimensions display
    const dimensionsDisplay = document.createElement("div")
    dimensionsDisplay.className = "table-dimensions"
    dimensionsDisplay.textContent = "0 × 0"

    // Update dimensions on hover
    tableGrid.addEventListener("mousemove", () => {
      const [row, col] = this.hoveredCells
      dimensionsDisplay.textContent = `${row + 1} × ${col + 1}`
    })

    // Reset dimensions when mouse leaves
    tableGrid.addEventListener("mouseleave", () => {
      dimensionsDisplay.textContent = "0 × 0"
      this.hoveredCells = [0, 0]
      this.updateTableGridHighlight()
    })

    // Assemble table creator
    this.tableCreatorElement.appendChild(tableGrid)
    this.tableCreatorElement.appendChild(dimensionsDisplay)

    // Add to editor container
    this.editor.getContainer().appendChild(this.tableCreatorElement)
  }

  private updateTableGridHighlight(): void {
    if (!this.tableCreatorElement) return

    const [hoveredRow, hoveredCol] = this.hoveredCells
    const cells = this.tableCreatorElement.querySelectorAll(".table-cell")

    cells.forEach((cell) => {
      const row = Number.parseInt(cell.getAttribute("data-row") || "0")
      const col = Number.parseInt(cell.getAttribute("data-col") || "0")

      if (row <= hoveredRow && col <= hoveredCol) {
        cell.classList.add("highlighted")
      } else {
        cell.classList.remove("highlighted")
      }
    })
  }

  private insertTable(rows: number, cols: number): void {
    // Create table HTML
    let tableHTML = `<table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
    `

    // Add header cells
    for (let i = 0; i < cols; i++) {
      tableHTML += `<th style="padding: 8px; border: 1px solid #ddd;">Header ${i + 1}</th>`
    }

    tableHTML += `
        </tr>
      </thead>
      <tbody>
    `

    // Add rows and cells
    for (let row = 0; row < rows; row++) {
      tableHTML += "<tr>"

      for (let col = 0; col < cols; col++) {
        tableHTML += `<td style="padding: 8px; border: 1px solid #ddd;">Cell ${row + 1},${col + 1}</td>`
      }

      tableHTML += "</tr>"
    }

    tableHTML += `
      </tbody>
    </table>
    `

    // Insert the table
    this.editor.insertHTML(tableHTML)

    // Hide the table creator
    this.hide()
  }

  public showTableProperties(table: HTMLTableElement): void {
    this.selectedTable = table

    // Create table properties if it doesn't exist
    if (!this.tablePropertiesElement) {
      this.createTableProperties()
    }

    // Position near the table
    if (this.tablePropertiesElement) {
      const tableRect = table.getBoundingClientRect()
      const containerRect = this.editor.getContainer().getBoundingClientRect()

      this.tablePropertiesElement.style.top = `${tableRect.top - containerRect.top}px`
      this.tablePropertiesElement.style.left = `${tableRect.right - containerRect.left + 10}px`
      this.tablePropertiesElement.style.display = "block"
    }

    // Add click outside listener
    document.addEventListener("click", this.handlePropertiesClickOutside)
  }

  private createTableProperties(): void {
    this.tablePropertiesElement = document.createElement("div")
    this.tablePropertiesElement.className = "table-properties"
    this.tablePropertiesElement.style.display = "none"

    // Create buttons for table operations
    const operations = [
      { name: "Add Row Above", action: () => this.addRow(true) },
      { name: "Add Row Below", action: () => this.addRow(false) },
      { name: "Add Column Left", action: () => this.addColumn(true) },
      { name: "Add Column Right", action: () => this.addColumn(false) },
      { name: "Delete Row", action: () => this.deleteRow() },
      { name: "Delete Column", action: () => this.deleteColumn() },
      { name: "Delete Table", action: () => this.deleteTable() },
      { name: "Merge Cells", action: () => this.mergeCells() },
      { name: "Split Cell", action: () => this.splitCell() },
    ]

    operations.forEach((op) => {
      const button = document.createElement("button")
      button.className = "table-operation-button"
      button.textContent = op.name
      button.addEventListener("click", op.action)
      this.tablePropertiesElement?.appendChild(button)
    })

    // Add to editor container
    this.editor.getContainer().appendChild(this.tablePropertiesElement)
  }

  private addRow(before: boolean): void {
    if (!this.selectedTable) return

    // Get the current selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Find the closest row
    let cell = selection.anchorNode
    while (cell && cell.nodeName !== "TD" && cell.nodeName !== "TH") {
      cell = cell.parentNode
    }

    if (!cell) return

    const row = cell.parentNode
    if (!row) return

    // Get the number of columns
    const numCols = row.childNodes.length

    // Create a new row
    const newRow = document.createElement("tr")
    for (let i = 0; i < numCols; i++) {
      const newCell = document.createElement("td")
      newCell.style.padding = "8px"
      newCell.style.border = "1px solid #ddd"
      newCell.innerHTML = "&nbsp;"
      newRow.appendChild(newCell)
    }

    // Insert the new row
    if (before) {
      row.parentNode?.insertBefore(newRow, row)
    } else {
      row.parentNode?.insertBefore(newRow, row.nextSibling)
    }

    // Hide properties
    this.hideProperties()
  }

  private addColumn(before: boolean): void {
    if (!this.selectedTable) return

    // Get the current selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Find the closest cell
    let cell = selection.anchorNode
    while (cell && cell.nodeName !== "TD" && cell.nodeName !== "TH") {
      cell = cell.parentNode
    }

    if (!cell) return

    // Find the index of the cell
    const cellIndex = Array.from(cell.parentNode?.childNodes || []).indexOf(cell as Node)

    // Add a cell to each row
    const rows = this.selectedTable.querySelectorAll("tr")
    rows.forEach((row) => {
      const newCell = row.childNodes[0].nodeName === "TH" ? document.createElement("th") : document.createElement("td")

      newCell.style.padding = "8px"
      newCell.style.border = "1px solid #ddd"
      newCell.innerHTML = "&nbsp;"

      if (before) {
        row.insertBefore(newCell, row.childNodes[cellIndex])
      } else {
        row.insertBefore(newCell, row.childNodes[cellIndex + 1])
      }
    })

    // Hide properties
    this.hideProperties()
  }

  private deleteRow(): void {
    if (!this.selectedTable) return

    // Get the current selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Find the closest row
    let cell = selection.anchorNode
    while (cell && cell.nodeName !== "TD" && cell.nodeName !== "TH") {
      cell = cell.parentNode
    }

    if (!cell) return

    const row = cell.parentNode
    if (!row) return

    // Delete the row
    row.parentNode?.removeChild(row)

    // Hide properties
    this.hideProperties()
  }

  private deleteColumn(): void {
    if (!this.selectedTable) return

    // Get the current selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Find the closest cell
    let cell = selection.anchorNode
    while (cell && cell.nodeName !== "TD" && cell.nodeName !== "TH") {
      cell = cell.parentNode
    }

    if (!cell) return

    // Find the index of the cell
    const cellIndex = Array.from(cell.parentNode?.childNodes || []).indexOf(cell as Node)

    // Delete the cell from each row
    const rows = this.selectedTable.querySelectorAll("tr")
    rows.forEach((row) => {
      if (row.childNodes.length > cellIndex) {
        row.removeChild(row.childNodes[cellIndex])
      }
    })

    // Hide properties
    this.hideProperties()
  }

  private deleteTable(): void {
    if (!this.selectedTable) return

    // Delete the table
    this.selectedTable.parentNode?.removeChild(this.selectedTable)

    // Hide properties
    this.hideProperties()
  }

  private mergeCells(): void {
    // This is a simplified implementation
    // In a real implementation, you would need to:
    // 1. Get the selected cells
    // 2. Calculate the merged cell dimensions
    // 3. Create a new cell with the combined content
    // 4. Replace the selected cells with the merged cell

    alert("Merge cells functionality would be implemented here")
    this.hideProperties()
  }

  private splitCell(): void {
    // This is a simplified implementation
    // In a real implementation, you would need to:
    // 1. Get the selected cell
    // 2. Check if it has colspan or rowspan
    // 3. Split it into multiple cells

    alert("Split cell functionality would be implemented here")
    this.hideProperties()
  }

  private handleClickOutside = (e: MouseEvent): void => {
    if (this.tableCreatorElement && !this.tableCreatorElement.contains(e.target as Node)) {
      this.hide()
    }
  }

  private handlePropertiesClickOutside = (e: MouseEvent): void => {
    if (this.tablePropertiesElement && !this.tablePropertiesElement.contains(e.target as Node)) {
      this.hideProperties()
    }
  }

  public hide(): void {
    if (this.tableCreatorElement) {
      this.tableCreatorElement.style.display = "none"
    }
    document.removeEventListener("click", this.handleClickOutside)
  }

  public hideProperties(): void {
    if (this.tablePropertiesElement) {
      this.tablePropertiesElement.style.display = "none"
    }
    document.removeEventListener("click", this.handlePropertiesClickOutside)
    this.selectedTable = null
  }

  public destroy(): void {
    if (this.tableCreatorElement) {
      this.tableCreatorElement.remove()
      this.tableCreatorElement = null
    }
    if (this.tablePropertiesElement) {
      this.tablePropertiesElement.remove()
      this.tablePropertiesElement = null
    }
    document.removeEventListener("click", this.handleClickOutside)
    document.removeEventListener("click", this.handlePropertiesClickOutside)
  }
}
