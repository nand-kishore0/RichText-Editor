export class AdvancedTableEditor {
  private editor: any
  private tableDialog: HTMLElement | null = null
  private tableContextMenu: HTMLElement | null = null
  private activeTable: HTMLTableElement | null = null
  private activeCell: HTMLTableCellElement | null = null
  private cellPropertiesDialog: HTMLElement | null = null
  private tablePropertiesDialog: HTMLElement | null = null

  constructor(editor: any) {
    this.editor = editor
    this.initEvents()
  }

  private initEvents(): void {
    // Listen for clicks on tables in the editor
    const editorContent = this.editor.getEditor()
    editorContent.addEventListener("click", this.handleTableClick)

    // Listen for context menu events on tables
    editorContent.addEventListener("contextmenu", this.handleTableContextMenu)

    // Listen for mousedown on the document to handle clicks outside
    document.addEventListener("mousedown", this.handleDocumentMouseDown)
  }

  private handleTableClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement

    // Check if the clicked element is a table cell
    const cell = target.closest("td, th")

    if (cell) {
      // Set the active cell
      this.activeCell = cell as HTMLTableCellElement

      // Set the active table
      this.activeTable = cell.closest("table") as HTMLTableElement

      // Add selection styling
      this.addCellSelection(cell as HTMLTableCellElement)
    } else {
      // Clear active cell and table if clicking outside
      this.clearCellSelection()
      this.activeCell = null
      this.activeTable = null
    }
  }

  private handleTableContextMenu = (e: MouseEvent): void => {
    const target = e.target as HTMLElement

    // Check if the right-clicked element is a table cell
    const cell = target.closest("td, th")

    if (cell) {
      e.preventDefault()

      // Set the active cell
      this.activeCell = cell as HTMLTableCellElement

      // Set the active table
      this.activeTable = cell.closest("table") as HTMLTableElement

      // Add selection styling
      this.addCellSelection(cell as HTMLTableCellElement)

      // Show context menu
      this.showTableContextMenu(e)
    }
  }

  private handleDocumentMouseDown = (e: MouseEvent): void => {
    const target = e.target as HTMLElement

    // Close context menu if clicking outside
    if (this.tableContextMenu && !this.tableContextMenu.contains(target)) {
      this.closeTableContextMenu()
    }

    // Close cell properties dialog if clicking outside
    if (this.cellPropertiesDialog && !this.cellPropertiesDialog.contains(target)) {
      this.closeCellPropertiesDialog()
    }

    // Close table properties dialog if clicking outside
    if (this.tablePropertiesDialog && !this.tablePropertiesDialog.contains(target)) {
      this.closeTablePropertiesDialog()
    }
  }

  private addCellSelection(cell: HTMLTableCellElement): void {
    // Clear any existing selection
    this.clearCellSelection()

    // Add selection styling
    cell.classList.add("selected-cell")
    cell.style.outline = "2px solid #1a73e8"
    cell.style.outlineOffset = "-2px"
  }

  private clearCellSelection(): void {
    // Remove selection styling from all cells
    const selectedCells = document.querySelectorAll(".selected-cell")
    selectedCells.forEach((cell) => {
      cell.classList.remove("selected-cell")
      ;(cell as HTMLElement).style.outline = ""
      ;(cell as HTMLElement).style.outlineOffset = ""
    })
  }

  private showTableContextMenu(e: MouseEvent): void {
    // Close any existing context menu
    this.closeTableContextMenu()

    // Create context menu
    this.tableContextMenu = document.createElement("div")
    this.tableContextMenu.className = "table-context-menu"
    this.tableContextMenu.style.position = "absolute"
    this.tableContextMenu.style.top = `${e.pageY}px`
    this.tableContextMenu.style.left = `${e.pageX}px`
    this.tableContextMenu.style.backgroundColor = "white"
    this.tableContextMenu.style.border = "1px solid #ddd"
    this.tableContextMenu.style.borderRadius = "4px"
    this.tableContextMenu.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)"
    this.tableContextMenu.style.padding = "5px 0"
    this.tableContextMenu.style.zIndex = "1100"
    this.tableContextMenu.style.minWidth = "180px"

    // Create menu items
    const menuItems = [
      { text: "Insert Row Above", action: () => this.insertRow(true) },
      { text: "Insert Row Below", action: () => this.insertRow(false) },
      { text: "Insert Column Left", action: () => this.insertColumn(true) },
      { text: "Insert Column Right", action: () => this.insertColumn(false) },
      { text: "Delete Row", action: () => this.deleteRow() },
      { text: "Delete Column", action: () => this.deleteColumn() },
      { text: "Delete Table", action: () => this.deleteTable() },
      { text: "Merge Cells", action: () => this.mergeCells() },
      { text: "Split Cell", action: () => this.splitCell() },
      { text: "Cell Properties", action: () => this.showCellPropertiesDialog() },
      { text: "Table Properties", action: () => this.showTablePropertiesDialog() },
    ]

    menuItems.forEach((item, index) => {
      const menuItem = document.createElement("div")
      menuItem.className = "table-context-menu-item"
      menuItem.textContent = item.text
      menuItem.style.padding = "8px 12px"
      menuItem.style.cursor = "pointer"

      menuItem.addEventListener("mouseenter", () => {
        menuItem.style.backgroundColor = "#f0f0f0"
      })

      menuItem.addEventListener("mouseleave", () => {
        menuItem.style.backgroundColor = "transparent"
      })

      menuItem.addEventListener("click", () => {
        item.action()
        this.closeTableContextMenu()
      })

      this.tableContextMenu.appendChild(menuItem)

      // Add separator after certain items
      if (index === 1 || index === 3 || index === 6 || index === 8) {
        const separator = document.createElement("div")
        separator.style.height = "1px"
        separator.style.backgroundColor = "#ddd"
        separator.style.margin = "5px 0"
        this.tableContextMenu.appendChild(separator)
      }
    })

    // Add to document body
    document.body.appendChild(this.tableContextMenu)

    // Adjust position if menu goes off screen
    const menuRect = this.tableContextMenu.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    if (menuRect.right > windowWidth) {
      this.tableContextMenu.style.left = `${windowWidth - menuRect.width - 10}px`
    }

    if (menuRect.bottom > windowHeight) {
      this.tableContextMenu.style.top = `${e.pageY - menuRect.height}px`
    }
  }

  private closeTableContextMenu(): void {
    if (this.tableContextMenu) {
      document.body.removeChild(this.tableContextMenu)
      this.tableContextMenu = null
    }
  }

  private insertRow(before: boolean): void {
    if (!this.activeCell || !this.activeTable) return

    // Find the current row
    const row = this.activeCell.parentElement as HTMLTableRowElement
    if (!row) return

    // Get the number of cells in the row
    const cellCount = row.cells.length

    // Create a new row
    const newRow = document.createElement("tr")

    // Add cells to the new row
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement("td")
      cell.innerHTML = "&nbsp;"
      cell.style.padding = "8px"
      cell.style.border = "1px solid #ddd"
      newRow.appendChild(cell)
    }

    // Insert the new row
    if (before) {
      row.parentNode?.insertBefore(newRow, row)
    } else {
      row.parentNode?.insertBefore(newRow, row.nextSibling)
    }

    // Update the editor content
    this.editor.handleInput()
  }

  private insertColumn(before: boolean): void {
    if (!this.activeCell || !this.activeTable) return

    // Find the index of the current cell in its row
    const cellIndex = Array.from(this.activeCell.parentElement?.cells || []).indexOf(this.activeCell)

    // Get all rows in the table
    const rows = this.activeTable.rows

    // Insert a new cell in each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const newCell = document.createElement(i === 0 && row.cells[0].tagName === "TH" ? "th" : "td")
      newCell.innerHTML = "&nbsp;"
      newCell.style.padding = "8px"
      newCell.style.border = "1px solid #ddd"

      if (before) {
        row.insertBefore(newCell, row.cells[cellIndex])
      } else {
        row.insertBefore(newCell, row.cells[cellIndex + 1])
      }
    }

    // Update the editor content
    this.editor.handleInput()
  }

  private deleteRow(): void {
    if (!this.activeCell || !this.activeTable) return

    // Find the current row
    const row = this.activeCell.parentElement as HTMLTableRowElement
    if (!row) return

    // Delete the row
    row.parentNode?.removeChild(row)

    // Update the editor content
    this.editor.handleInput()

    // Clear active cell
    this.activeCell = null
  }

  private deleteColumn(): void {
    if (!this.activeCell || !this.activeTable) return

    // Find the index of the current cell in its row
    const cellIndex = Array.from(this.activeCell.parentElement?.cells || []).indexOf(this.activeCell)

    // Get all rows in the table
    const rows = this.activeTable.rows

    // Delete the cell at the same index in each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (cellIndex < row.cells.length) {
        row.deleteCell(cellIndex)
      }
    }

    // Update the editor content
    this.editor.handleInput()

    // Clear active cell
    this.activeCell = null
  }

  private deleteTable(): void {
    if (!this.activeTable) return

    // Delete the table
    this.activeTable.parentNode?.removeChild(this.activeTable)

    // Update the editor content
    this.editor.handleInput()

    // Clear active table and cell
    this.activeTable = null
    this.activeCell = null
  }

  private mergeCells(): void {
    if (!this.activeCell || !this.activeTable) return

    // Get selected cells
    const selectedCells = this.activeTable.querySelectorAll(".selected-cell")

    // If only one cell is selected, show a message
    if (selectedCells.length <= 1) {
      alert("Please select multiple cells to merge. Hold Shift and click to select multiple cells.")
      return
    }

    // Get the first selected cell
    const firstCell = selectedCells[0] as HTMLTableCellElement

    // Calculate the colspan and rowspan
    const maxRowspan = 1
    const maxColspan = 1

    // TODO: Implement proper cell merging logic
    // This is a simplified implementation that would need to be expanded

    // For now, just merge the content of all selected cells into the first one
    let mergedContent = ""
    selectedCells.forEach((cell) => {
      mergedContent += (cell.innerHTML || "") + " "
    })

    firstCell.innerHTML = mergedContent.trim() || "&nbsp;"

    // Delete the other selected cells
    for (let i = 1; i < selectedCells.length; i++) {
      const cell = selectedCells[i] as HTMLTableCellElement
      cell.parentNode?.removeChild(cell)
    }

    // Update the editor content
    this.editor.handleInput()
  }

  private splitCell(): void {
    if (!this.activeCell || !this.activeTable) return

    // Check if the cell has colspan or rowspan
    const colspan = Number.parseInt(this.activeCell.getAttribute("colspan") || "1", 10)
    const rowspan = Number.parseInt(this.activeCell.getAttribute("rowspan") || "1", 10)

    if (colspan === 1 && rowspan === 1) {
      alert("This cell cannot be split further.")
      return
    }

    // TODO: Implement proper cell splitting logic
    // This is a simplified implementation that would need to be expanded

    // For now, just reset the colspan and rowspan
    this.activeCell.removeAttribute("colspan")
    this.activeCell.removeAttribute("rowspan")

    // Update the editor content
    this.editor.handleInput()
  }

  private showCellPropertiesDialog(): void {
    if (!this.activeCell) return

    // Close any existing dialog
    this.closeCellPropertiesDialog()

    // Create dialog
    this.cellPropertiesDialog = document.createElement("div")
    this.cellPropertiesDialog.className = "cell-properties-dialog"
    this.cellPropertiesDialog.style.position = "fixed"
    this.cellPropertiesDialog.style.top = "50%"
    this.cellPropertiesDialog.style.left = "50%"
    this.cellPropertiesDialog.style.transform = "translate(-50%, -50%)"
    this.cellPropertiesDialog.style.backgroundColor = "white"
    this.cellPropertiesDialog.style.border = "1px solid #ddd"
    this.cellPropertiesDialog.style.borderRadius = "4px"
    this.cellPropertiesDialog.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
    this.cellPropertiesDialog.style.padding = "20px"
    this.cellPropertiesDialog.style.zIndex = "1050"
    this.cellPropertiesDialog.style.minWidth = "300px"

    // Get current cell properties
    const width = this.activeCell.style.width || ""
    const height = this.activeCell.style.height || ""
    const backgroundColor = this.activeCell.style.backgroundColor || ""
    const textAlign = this.activeCell.style.textAlign || ""
    const verticalAlign = this.activeCell.style.verticalAlign || ""

    // Create dialog content
    this.cellPropertiesDialog.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 15px;">Cell Properties</h3>
      
      <div style="margin-bottom: 15px;">
        <label for="cell-width" style="display: block; margin-bottom: 5px;">Width:</label>
        <input id="cell-width" type="text" value="${width}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="cell-height" style="display: block; margin-bottom: 5px;">Height:</label>
        <input id="cell-height" type="text" value="${height}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="cell-bg-color" style="display: block; margin-bottom: 5px;">Background Color:</label>
        <input id="cell-bg-color" type="color" value="${backgroundColor || "#ffffff"}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="cell-text-align" style="display: block; margin-bottom: 5px;">Text Align:</label>
        <select id="cell-text-align" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="" ${textAlign === "" ? "selected" : ""}>Default</option>
          <option value="left" ${textAlign === "left" ? "selected" : ""}>Left</option>
          <option value="center" ${textAlign === "center" ? "selected" : ""}>Center</option>
          <option value="right" ${textAlign === "right" ? "selected" : ""}>Right</option>
          <option value="justify" ${textAlign === "justify" ? "selected" : ""}>Justify</option>
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="cell-vertical-align" style="display: block; margin-bottom: 5px;">Vertical Align:</label>
        <select id="cell-vertical-align" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="" ${verticalAlign === "" ? "selected" : ""}>Default</option>
          <option value="top" ${verticalAlign === "top" ? "selected" : ""}>Top</option>
          <option value="middle" ${verticalAlign === "middle" ? "selected" : ""}>Middle</option>
          <option value="bottom" ${verticalAlign === "bottom" ? "selected" : ""}>Bottom</option>
        </select>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button id="cell-properties-cancel" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer;">Cancel</button>
        <button id="cell-properties-apply" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #1a73e8; color: white; cursor: pointer;">Apply</button>
      </div>
    `

    // Add event listeners
    const cancelButton = this.cellPropertiesDialog.querySelector("#cell-properties-cancel")
    const applyButton = this.cellPropertiesDialog.querySelector("#cell-properties-apply")

    if (cancelButton) {
      cancelButton.addEventListener("click", () => this.closeCellPropertiesDialog())
    }

    if (applyButton) {
      applyButton.addEventListener("click", () => this.applyCellProperties())
    }

    // Add to document body
    document.body.appendChild(this.cellPropertiesDialog)
  }

  private closeCellPropertiesDialog(): void {
    if (this.cellPropertiesDialog) {
      document.body.removeChild(this.cellPropertiesDialog)
      this.cellPropertiesDialog = null
    }
  }

  private applyCellProperties(): void {
    if (!this.activeCell || !this.cellPropertiesDialog) return

    // Get form values
    const widthInput = this.cellPropertiesDialog.querySelector("#cell-width") as HTMLInputElement
    const heightInput = this.cellPropertiesDialog.querySelector("#cell-height") as HTMLInputElement
    const bgColorInput = this.cellPropertiesDialog.querySelector("#cell-bg-color") as HTMLInputElement
    const textAlignSelect = this.cellPropertiesDialog.querySelector("#cell-text-align") as HTMLSelectElement
    const verticalAlignSelect = this.cellPropertiesDialog.querySelector("#cell-vertical-align") as HTMLSelectElement

    // Apply properties
    if (widthInput.value) {
      this.activeCell.style.width = widthInput.value
    } else {
      this.activeCell.style.width = ""
    }

    if (heightInput.value) {
      this.activeCell.style.height = heightInput.value
    } else {
      this.activeCell.style.height = ""
    }

    this.activeCell.style.backgroundColor = bgColorInput.value
    this.activeCell.style.textAlign = textAlignSelect.value
    this.activeCell.style.verticalAlign = verticalAlignSelect.value

    // Close the dialog
    this.closeCellPropertiesDialog()

    // Update the editor content
    this.editor.handleInput()
  }

  private showTablePropertiesDialog(): void {
    if (!this.activeTable) return

    // Close any existing dialog
    this.closeTablePropertiesDialog()

    // Create dialog
    this.tablePropertiesDialog = document.createElement("div")
    this.tablePropertiesDialog.className = "table-properties-dialog"
    this.tablePropertiesDialog.style.position = "fixed"
    this.tablePropertiesDialog.style.top = "50%"
    this.tablePropertiesDialog.style.left = "50%"
    this.tablePropertiesDialog.style.transform = "translate(-50%, -50%)"
    this.tablePropertiesDialog.style.backgroundColor = "white"
    this.tablePropertiesDialog.style.border = "1px solid #ddd"
    this.tablePropertiesDialog.style.borderRadius = "4px"
    this.tablePropertiesDialog.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
    this.tablePropertiesDialog.style.padding = "20px"
    this.tablePropertiesDialog.style.zIndex = "1050"
    this.tablePropertiesDialog.style.minWidth = "400px"

    // Get current table properties
    const width = this.activeTable.style.width || ""
    const border = this.activeTable.getAttribute("border") || ""
    const cellpadding = this.activeTable.getAttribute("cellpadding") || ""
    const cellspacing = this.activeTable.getAttribute("cellspacing") || ""
    const borderCollapse = this.activeTable.style.borderCollapse || ""

    // Create dialog content
    this.tablePropertiesDialog.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 15px;">Table Properties</h3>
      
      <div style="margin-bottom: 15px;">
        <label for="table-width" style="display: block; margin-bottom: 5px;">Width:</label>
        <input id="table-width" type="text" value="${width}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="table-border" style="display: block; margin-bottom: 5px;">Border Size:</label>
        <input id="table-border" type="number" min="0" value="${border}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="table-cellpadding" style="display: block; margin-bottom: 5px;">Cell Padding:</label>
        <input id="table-cellpadding" type="number" min="0" value="${cellpadding}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="table-cellspacing" style="display: block; margin-bottom: 5px;">Cell Spacing:</label>
        <input id="table-cellspacing" type="number" min="0" value="${cellspacing}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="table-border-collapse" style="display: block; margin-bottom: 5px;">Border Collapse:</label>
        <select id="table-border-collapse" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="" ${borderCollapse === "" ? "selected" : ""}>Default</option>
          <option value="collapse" ${borderCollapse === "collapse" ? "selected" : ""}>Collapse</option>
          <option value="separate" ${borderCollapse === "separate" ? "selected" : ""}>Separate</option>
        </select>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button id="table-properties-cancel" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer;">Cancel</button>
        <button id="table-properties-apply" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #1a73e8; color: white; cursor: pointer;">Apply</button>
      </div>
    `

    // Add event listeners
    const cancelButton = this.tablePropertiesDialog.querySelector("#table-properties-cancel")
    const applyButton = this.tablePropertiesDialog.querySelector("#table-properties-apply")

    if (cancelButton) {
      cancelButton.addEventListener("click", () => this.closeTablePropertiesDialog())
    }

    if (applyButton) {
      applyButton.addEventListener("click", () => this.applyTableProperties())
    }

    // Add to document body
    document.body.appendChild(this.tablePropertiesDialog)
  }

  private closeTablePropertiesDialog(): void {
    if (this.tablePropertiesDialog) {
      document.body.removeChild(this.tablePropertiesDialog)
      this.tablePropertiesDialog = null
    }
  }
}
