"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  valueHtml: string;
  onChangeHtml: (nextHtml: string) => void;
  placeholder?: string;
  className?: string;
};

function ToolButton({
  active,
  disabled,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-transparent text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40",
        active && "bg-gray-900 text-white hover:bg-gray-900 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function buildEditor({
  valueHtml,
  onChangeHtml,
  placeholder,
}: {
  valueHtml: string;
  onChangeHtml: (next: string) => void;
  placeholder?: string;
}) {
  return useEditor({
    // Next.js dev overlays can look like SSR; keep hydration stable.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
    ],
    content: valueHtml || (placeholder ? `<p>${placeholder}</p>` : "<p></p>"),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[260px] prose-headings:font-bold prose-a:text-[#c0392b]",
      },
    },
    onUpdate: ({ editor }) => {
      onChangeHtml(editor.getHTML());
    },
  });
}

function canToggle(editor: Editor | null) {
  return !!editor && editor.isEditable;
}

export function RichTextEditor({ valueHtml, onChangeHtml, placeholder, className }: Props) {
  const editor = buildEditor({ valueHtml, onChangeHtml, placeholder });

  // Khi đổi record (edit post khác), cập nhật content.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== valueHtml) {
      editor.commands.setContent(valueHtml || "<p></p>", { emitUpdate: false });
    }
  }, [editor, valueHtml]);

  const tools = useMemo(
    () => [
      {
        key: "bold",
        icon: <Bold size={16} />,
        label: "Bold",
        active: () => editor?.isActive("bold") ?? false,
        run: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        key: "italic",
        icon: <Italic size={16} />,
        label: "Italic",
        active: () => editor?.isActive("italic") ?? false,
        run: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        key: "bullet",
        icon: <List size={16} />,
        label: "Bullet list",
        active: () => editor?.isActive("bulletList") ?? false,
        run: () => editor?.chain().focus().toggleBulletList().run(),
      },
      {
        key: "ordered",
        icon: <ListOrdered size={16} />,
        label: "Ordered list",
        active: () => editor?.isActive("orderedList") ?? false,
        run: () => editor?.chain().focus().toggleOrderedList().run(),
      },
      {
        key: "quote",
        icon: <Quote size={16} />,
        label: "Blockquote",
        active: () => editor?.isActive("blockquote") ?? false,
        run: () => editor?.chain().focus().toggleBlockquote().run(),
      },
    ],
    [editor]
  );

  return (
    <div className={cn("overflow-hidden rounded-sm border border-gray-200 bg-white", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 py-2">
        {tools.map((t) => (
          <ToolButton
            key={t.key}
            label={t.label}
            active={t.active()}
            disabled={!canToggle(editor)}
            onClick={() => t.run()}
          >
            {t.icon}
          </ToolButton>
        ))}
        <div className="mx-1 h-6 w-px bg-gray-200" aria-hidden />
        <ToolButton
          label="Undo"
          disabled={!editor?.can().chain().focus().undo().run()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 size={16} />
        </ToolButton>
        <ToolButton
          label="Redo"
          disabled={!editor?.can().chain().focus().redo().run()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 size={16} />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

