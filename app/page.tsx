// src/pages/index.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { FullRichEditor } from "@/lib/full-rich-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"
import "@/styles/editor.css"

export default function Home() {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<FullRichEditor | null>(null)
  const [editorContent, setEditorContent] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("editor")
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false)

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      // Initialize the editor
      editorInstanceRef.current = new FullRichEditor({
        container: editorRef.current,
        onChange: (html) => {
          setEditorContent(html)
        },
        placeholder: "Start typing here...",
        darkMode: darkMode,
        autosave: true,
        autosaveKey: "editor-content",
        i18n: {
          locale: "en",
          translations: {
            bold: "Bold",
            italic: "Italic",
            // Additional translations would go here
          },
        },
        allowedTags: [
          "p", "h1", "h2", "h3", "h4", "h5", "h6",
          "ul", "ol", "li", "blockquote", "pre", "code",
          "a", "strong", "em", "u", "s", "img",
          "table", "tr", "td", "th", "hr", "br",
          "sup", "sub", "figure", "figcaption", "iframe",
          "div", "span",
        ],
        plugins: {
          imageResizing: true,
          codeBlocks: true,
          findReplace: true,
          wordCount: true,
          mediaEmbed: true,
          pageBreak: true,
          advancedTables: true,
          textAlignment: true,
          spellCheck: true,
          pasteFormatting: true,
          accessibility: true,
        }
      })

      // Add custom keyboard shortcuts
      setupCustomKeyboardShortcuts(editorInstanceRef.current)
    }

    // Cleanup on unmount
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [darkMode])

  const setupCustomKeyboardShortcuts = (editor: FullRichEditor) => {
    // Get the editor element
    const editorElement = editor.getEditor()
    
    // Add copy shortcut (Ctrl+Shift+C)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        copyEditorContent()
      }
    })

    // Add paste shortcut (Ctrl+Shift+V)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        pasteFromClipboard()
      }
    })

    // Add select all shortcut (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        selectAllContent()
      }
    })
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const exportAsHTML = () => {
    if (editorInstanceRef.current) {
      const html = editorInstanceRef.current.getHTML()
      downloadFile(html, "editor-content.html", "text/html")
    }
  }

  const exportAsMarkdown = () => {
    if (editorInstanceRef.current) {
      const markdown = editorInstanceRef.current.exportToMarkdown()
      downloadFile(markdown, "editor-content.md", "text/markdown")
    }
  }

  const exportAsPlainText = () => {
    if (editorInstanceRef.current) {
      const text = editorInstanceRef.current.getText()
      downloadFile(text, "editor-content.txt", "text/plain")
    }
  }

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyEditorContent = async () => {
    if (editorInstanceRef.current) {
      const content = activeTab === 'html' 
        ? editorContent 
        : editorInstanceRef.current.getHTML()
      
      try {
        await navigator.clipboard.writeText(content)
        showNotification("Content copied to clipboard!")
      } catch (err) {
        showNotification("Failed to copy content. Please try again.")
      }
    }
  }

  const pasteFromClipboard = async () => {
    if (editorInstanceRef.current) {
      try {
        const clipboardText = await navigator.clipboard.readText()
        if (activeTab === 'editor') {
          editorInstanceRef.current.insertHTML(clipboardText)
          showNotification("Content pasted!")
        }
      } catch (err) {
        showNotification("Failed to paste content. Please try again.")
      }
    }
  }

  const selectAllContent = () => {
    if (editorInstanceRef.current && activeTab === 'editor') {
      const editorElement = editorInstanceRef.current.getEditor()
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(editorElement)
      selection?.removeAllRanges()
      selection?.addRange(range)
      showNotification("All content selected!")
    }
  }

  const showNotification = (message: string) => {
    // Create a simple notification element
    const notification = document.createElement('div')
    notification.className = 'notification'
    notification.textContent = message
    notification.style.position = 'fixed'
    notification.style.bottom = '20px'
    notification.style.right = '20px'
    notification.style.padding = '10px 20px'
    notification.style.backgroundColor = darkMode ? '#2d3748' : '#e2e8f0'
    notification.style.color = darkMode ? '#fff' : '#333'
    notification.style.borderRadius = '4px'
    notification.style.zIndex = '9999'
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)'
    notification.style.transition = 'opacity 0.3s ease'
    
    document.body.appendChild(notification)
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  const toggleKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(!showKeyboardShortcuts)
  }

  return (
    <main className={`container mx-auto p-4 ${darkMode ? "dark" : ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Full-Featured Rich Text Editor</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleKeyboardShortcuts} title="Keyboard Shortcuts">
            <Keyboard className="h-4 w-4 mr-1" />
            Shortcuts
          </Button>
          <Button onClick={toggleDarkMode}>{darkMode ? "Light Mode" : "Dark Mode"}</Button>
        </div>
      </div>

      {showKeyboardShortcuts && (
        <div className={`mb-4 p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          <h2 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <strong>Ctrl+B</strong>: Bold
            </div>
            <div>
              <strong>Ctrl+I</strong>: Italic
            </div>
            <div>
              <strong>Ctrl+U</strong>: Underline
            </div>
            <div>
              <strong>Ctrl+K</strong>: Insert Link
            </div>
            <div>
              <strong>Ctrl+Z</strong>: Undo
            </div>
            <div>
              <strong>Ctrl+Y</strong>: Redo
            </div>
            <div>
              <strong>Ctrl+1-6</strong>: Heading 1-6
            </div>
            <div>
              <strong>Ctrl+0</strong>: Paragraph
            </div>
            <div>
              <strong>Ctrl+Shift+C</strong>: Copy Content
            </div>
            <div>
              <strong>Ctrl+Shift+V</strong>: Paste Content
            </div>
            <div>
              <strong>Ctrl+Shift+A</strong>: Select All
            </div>
            <div>
              <strong>Tab/Shift+Tab</strong>: Indent/Outdent
            </div>
          </div>
          <p className="text-sm mt-2">Note: On Mac, use Cmd instead of Ctrl</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="border rounded-lg overflow-hidden">
          <div className="editor-toolbar-buttons flex gap-2 p-2 border-b">
            <Button size="sm" variant="outline" onClick={copyEditorContent} title="Copy (Ctrl+Shift+C)">
              Copy
            </Button>
            <Button size="sm" variant="outline" onClick={pasteFromClipboard} title="Paste (Ctrl+Shift+V)">
              Paste
            </Button>
            <Button size="sm" variant="outline" onClick={selectAllContent} title="Select All (Ctrl+Shift+A)">
              Select All
            </Button>
          </div>
          <div id="editor-container" ref={editorRef} className="min-h-[400px]"></div>
        </TabsContent>

        <TabsContent value="html">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">HTML Source:</h2>
              <Button size="sm" variant="outline" onClick={copyEditorContent} title="Copy HTML (Ctrl+Shift+C)">
                Copy HTML
              </Button>
            </div>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap">
              {editorContent}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Preview:</h2>
            <div
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg border min-h-[400px] ${darkMode ? "dark-preview" : ""}`}
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Export Options:</h2>
        <div className="flex gap-2">
          <Button onClick={exportAsHTML}>Export as HTML</Button>
          <Button onClick={exportAsMarkdown}>Export as Markdown</Button>
          <Button onClick={exportAsPlainText}>Export as Plain Text</Button>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Tip: Use keyboard shortcuts for faster editing. Toggle the shortcut guide with the button above.</p>
      </div>
    </main>
  )
}