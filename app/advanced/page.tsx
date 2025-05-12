"use client"

import { useEffect, useRef, useState } from "react"
import { RichEditor } from "@/lib/rich-editor"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "@/styles/editor.css"

export default function AdvancedEditorPage() {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<RichEditor | null>(null)
  const [editorContent, setEditorContent] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("editor")
  const [darkMode, setDarkMode] = useState<boolean>(false)

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      // Initialize the editor with more options
      editorInstanceRef.current = new RichEditor({
        container: editorRef.current,
        placeholder: "Start typing your content here...",
        onChange: (html) => {
          setEditorContent(html)
        },
        initialValue: "<p>This is an advanced example of the custom rich text editor with all features enabled.</p>",
        darkMode: darkMode,
        autosave: true,
        autosaveKey: "advanced-editor-content",
        i18n: {
          locale: "en",
          translations: {
            words: "Words",
            characters: "Characters",
            bold: "Bold",
            italic: "Italic",
            underline: "Underline",
            // Add more translations as needed
          },
        },
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setDarkMode(!darkMode)
    }
  }

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

  const handleExportHTML = () => {
    if (editorInstanceRef.current) {
      const html = editorInstanceRef.current.getHTML()
      // Create a download link
      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "editor-content.html"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImportMarkdown = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".md,.markdown,text/markdown"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && editorInstanceRef.current) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          editorInstanceRef.current?.importFromMarkdown(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <main className={`container mx-auto p-4 ${darkMode ? "dark" : ""}`}>
      <h1 className="text-2xl font-bold mb-4">Advanced Rich Text Editor</h1>

      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button size="sm" onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button size="sm" onClick={handleExportMarkdown}>
            Export Markdown
          </Button>
          <Button size="sm" onClick={handleExportHTML}>
            Export HTML
          </Button>
          <Button size="sm" onClick={handleImportMarkdown}>
            Import Markdown
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="html">HTML</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="border rounded-lg overflow-hidden">
          <div id="advanced-editor-container" ref={editorRef}></div>
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
