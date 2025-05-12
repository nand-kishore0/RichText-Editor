"use client"

import { useEffect, useRef, useState } from "react"
import { FullRichEditor } from "@/lib/full-rich-editor"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import "@/styles/editor.css"

export default function FullFeaturedEditorPage() {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<FullRichEditor | null>(null)
  const [editorContent, setEditorContent] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("editor")
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [readOnly, setReadOnly] = useState<boolean>(false)

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      // Initialize the editor with more options
      editorInstanceRef.current = new FullRichEditor({
        container: editorRef.current,
        placeholder: "Start typing your content here...",
        onChange: (html) => {
          setEditorContent(html)
        },
        initialValue:
          "<h1>Full-Featured Rich Text Editor</h1><p>This editor includes all the requested features:</p><ul><li>Text formatting (bold, italic, underline, etc.)</li><li>Font options (family, size, color)</li><li>Paragraph controls (alignment, indentation)</li><li>Lists and block formatting</li><li>Content insertion (links, images, tables)</li><li>And much more!</li></ul>",
        darkMode: darkMode,
        readOnly: readOnly,
        autosave: true,
        autosaveKey: "full-editor-content",
      })
    }

    // Cleanup on unmount
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setDarkMode(darkMode)
    }
  }, [darkMode])

  useEffect(() => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setReadOnly(readOnly)
    }
  }, [readOnly])

  const handleExportMarkdown = () => {
    if (editorInstanceRef.current) {
      const markdown = editorInstanceRef.current.exportToMarkdown()

      // Create a download link
      const blob = new Blob([markdown], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "editor-content.md"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImportMarkdown = () => {
    const markdown = prompt("Paste Markdown content:")
    if (markdown && editorInstanceRef.current) {
      editorInstanceRef.current.importFromMarkdown(markdown)
    }
  }

  const handleInsertTemplate = (templateName: string) => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.insertTemplate(templateName)
    }
  }

  return (
    <main className={`container mx-auto p-4 ${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4">Full-Featured Rich Text Editor</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          <Label htmlFor="dark-mode">Dark Mode</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="read-only" checked={readOnly} onCheckedChange={setReadOnly} />
          <Label htmlFor="read-only">Read Only</Label>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="border rounded-lg overflow-hidden">
          <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b dark:bg-gray-800">
            <Button size="sm" onClick={() => handleInsertTemplate("signature")}>
              Insert Signature
            </Button>
            <Button size="sm" onClick={() => handleInsertTemplate("callout")}>
              Insert Callout
            </Button>
            <Button size="sm" onClick={() => handleInsertTemplate("twoColumn")}>
              Insert Two Columns
            </Button>
            <Button size="sm" onClick={handleExportMarkdown}>
              Export to Markdown
            </Button>
            <Button size="sm" onClick={handleImportMarkdown}>
              Import from Markdown
            </Button>
          </div>
          <div id="full-editor-container" ref={editorRef}></div>
        </TabsContent>

        <TabsContent value="html">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">HTML Source:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap dark:bg-gray-800 dark:text-gray-200">
              {editorContent}
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Preview:</h2>
            <div
              className={`bg-white p-4 rounded-lg border ${darkMode ? "dark-preview" : ""}`}
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
