// This is just to demonstrate how to use the editor in Vue
// In a real Vue project, this would be a .vue file

export default function VueExample() {
  return (
    <div className="p-4 border rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4">Vue.js Integration Example</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {`<!-- Vue.js Example (MyEditor.vue) -->
<template>
  <div>
    <div ref="editorContainer"></div>
    <div class="mt-4">
      <h3>HTML Output:</h3>
      <pre>{{ editorContent }}</pre>
    </div>
  </div>
</template>

<script>
import { RichEditor } from '@/lib/rich-editor';

export default {
  data() {
    return {
      editor: null,
      editorContent: ''
    }
  },
  mounted() {
    // Initialize the editor
    this.editor = new RichEditor({
      container: this.$refs.editorContainer,
      placeholder: 'Start typing...',
      onChange: (html) => {
        this.editorContent = html;
      }
    });
  },
  beforeUnmount() {
    // Clean up
    if (this.editor) {
      this.editor.destroy();
    }
  },
  methods: {
    getEditorContent() {
      return this.editor ? this.editor.getHTML() : '';
    }
  }
}
</script>

<style>
/* Import the base editor styles */
@import '@/styles/editor.css';

/* Add your custom styles here */
</style>`}
      </pre>
    </div>
  )
}
