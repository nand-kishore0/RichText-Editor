"use client"

import { useEffect, useRef } from "react"
import { RichEditor } from "@/lib/rich-editor"
import "@/styles/editor.css"

export default function IntegrationExamplesPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Framework Integration Examples</h1>
      <p className="mb-6">
        The custom rich text editor can be easily integrated into any JavaScript framework. Below are examples for
        React, Vue, and Angular.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReactExample />
        <VueExample />
        <AngularExample />
        <VanillaJSExample />
      </div>
    </main>
  )
}

function ReactExample() {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      // Initialize the editor
      editorInstanceRef.current = new RichEditor({
        container: editorRef.current,
        onChange: (html: string) => {
          console.log("Content changed:", html)
        },
        initialValue: "<p>This is a <strong>React</strong> integration example.</p>",
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

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">React Integration</h2>
      <div className="mb-4">
        <div ref={editorRef}></div>
      </div>
      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-40">
        {`import { useEffect, useRef } from "react";
import { RichEditor } from "@/lib/rich-editor";

function MyEditor() {
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      editorInstanceRef.current = new RichEditor({
        container: editorRef.current,
        onChange: (html) => {
          console.log("Content changed:", html);
        }
      });
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
      }
    };
  }, []);

  return <div ref={editorRef}></div>;
}`}
      </pre>
    </div>
  )
}

function VueExample() {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">Vue Integration</h2>
      <div className="mb-4 bg-gray-100 p-4 rounded-lg text-center text-gray-500">
        Vue component preview not available
      </div>
      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-40">
        {`<!-- Vue.js Example (MyEditor.vue) -->
<template>
  <div>
    <div ref="editorContainer"></div>
  </div>
</template>

<script>
import { RichEditor } from '@/lib/rich-editor';

export default {
  data() {
    return {
      editor: null
    }
  },
  mounted() {
    // Initialize the editor
    this.editor = new RichEditor({
      container: this.$refs.editorContainer,
      onChange: (html) => {
        this.$emit('update:content', html);
      }
    });
  },
  beforeUnmount() {
    // Clean up
    if (this.editor) {
      this.editor.destroy();
    }
  }
}
</script>`}
      </pre>
    </div>
  )
}

function AngularExample() {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">Angular Integration</h2>
      <div className="mb-4 bg-gray-100 p-4 rounded-lg text-center text-gray-500">
        Angular component preview not available
      </div>
      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-40">
        {`// Angular Example (editor.component.ts)
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RichEditor } from '../lib/rich-editor';

@Component({
  selector: 'app-editor',
  template: \`
    <div #editorContainer></div>
  \`
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer: ElementRef;
  
  private editor: any;
  editorContent: string = '';

  ngOnInit() {
    // Initialize the editor
    this.editor = new RichEditor({
      container: this.editorContainer.nativeElement,
      onChange: (html: string) => {
        this.editorContent = html;
      }
    });
  }

  ngOnDestroy() {
    // Clean up
    if (this.editor) {
      this.editor.destroy();
    }
  }
}`}
      </pre>
    </div>
  )
}

function VanillaJSExample() {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">Vanilla JavaScript</h2>
      <div className="mb-4 bg-gray-100 p-4 rounded-lg text-center text-gray-500">
        Vanilla JS example preview not available
      </div>
      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-40">
        {`// Vanilla JavaScript Example
document.addEventListener('DOMContentLoaded', function() {
  // Get the container element
  const container = document.getElementById('editor-container');

  // Initialize the editor
  const editor = new RichEditor({
    container: container,
    placeholder: 'Start typing...',
    onChange: function(html) {
      console.log('Content changed:', html);

      // Update output display
      document.getElementById('output').innerHTML = html;
    }
  });

  // Example of accessing editor methods
  document.getElementById('get-html-btn').addEventListener('click', function() {
    const html = editor.getHTML();
    alert(html);
  });

  document.getElementById('set-html-btn').addEventListener('click', function() {
    editor.setHTML('<p>This content was set programmatically</p>');
  });
});`}
      </pre>
    </div>
  )
}
