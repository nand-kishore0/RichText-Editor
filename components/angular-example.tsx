// This is just to demonstrate how to use the editor in Angular
// In a real Angular project, this would be a .ts/.html file pair

export default function AngularExample() {
  return (
    <div className="p-4 border rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4">Angular Integration Example</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {`// Angular Example (editor.component.ts)
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RichEditor } from '../lib/rich-editor';

@Component({
  selector: 'app-editor',
  template: \`
    <div>
      <div #editorContainer></div>
      <div class="mt-4">
        <h3>HTML Output:</h3>
        <pre>{{ editorContent }}</pre>
      </div>
    </div>
  \`,
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer: ElementRef;
  
  private editor: any;
  editorContent: string = '';

  ngOnInit() {
    // Initialize the editor
    this.editor = new RichEditor({
      container: this.editorContainer.nativeElement,
      placeholder: 'Start typing...',
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

  getEditorContent() {
    return this.editor ? this.editor.getHTML() : '';
  }
}

// editor.component.css
// Import the base editor styles or copy them here
`}
      </pre>
    </div>
  )
}
