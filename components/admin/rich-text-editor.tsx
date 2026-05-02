"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, FileText, ImageIcon, Italic, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 15 * 1024 * 1024;
const UPLOAD_IMAGE_ENDPOINT = "/api/admin/uploads/image";
const UPLOAD_PDF_ENDPOINT = "/api/admin/uploads/document";

const StyledImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    const existingStyle = typeof HTMLAttributes.style === "string" ? HTMLAttributes.style : "";
    const baseStyle = "display:block;margin:16px auto;max-width:100%;height:auto;";
    return ["img", { ...HTMLAttributes, style: `${baseStyle}${existingStyle}` }];
  },
});

type Props = {
  valueHtml: string;
  onChangeHtml: (nextHtml: string) => void;
  placeholder?: string;
  className?: string;
};

async function postAdminImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(UPLOAD_IMAGE_ENDPOINT, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const json = (await res.json()) as { data?: { url: string }; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Upload thất bại");
  }
  if (!json.data?.url) {
    throw new Error("Phản hồi máy chủ không hợp lệ");
  }
  return json.data.url;
}

async function postAdminPdf(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(UPLOAD_PDF_ENDPOINT, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const json = (await res.json()) as { data?: { url: string }; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message ?? "Upload thất bại");
  }
  if (!json.data?.url) {
    throw new Error("Phản hồi máy chủ không hợp lệ");
  }
  return json.data.url;
}

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

function canToggle(editor: Editor | null) {
  return !!editor && editor.isEditable;
}

export function RichTextEditor({ valueHtml, onChangeHtml, placeholder, className }: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<false | "image" | "pdf">(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            class: "font-medium text-[#c0392b] underline underline-offset-2",
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      StyledImage.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "mx-auto my-4 block max-w-full h-auto rounded-md border border-gray-200",
        },
      }),
    ],
    []
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: valueHtml || (placeholder ? `<p>${placeholder}</p>` : "<p></p>"),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[260px] prose-headings:font-bold prose-a:text-[#c0392b] prose-img:max-w-full prose-img:rounded-md [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#c0392b]/50 [&_blockquote]:bg-[#c0392b]/5 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-gray-700",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChangeHtml(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== valueHtml) {
      editor.commands.setContent(valueHtml || "<p></p>", { emitUpdate: false });
    }
  }, [editor, valueHtml]);

  const uploadImageAndInsert = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (!file.type.startsWith("image/")) {
        setUploadMessage("Chỉ chấp nhận file ảnh.");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setUploadMessage("Ảnh tối đa 5MB.");
        return;
      }
      setUploading("image");
      setUploadMessage(null);
      try {
        const url = await postAdminImage(file);
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (e) {
        setUploadMessage(e instanceof Error ? e.message : "Không upload được.");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const uploadPdfAndInsert = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (file.type !== "application/pdf") {
        setUploadMessage("Chỉ chấp nhận file PDF.");
        return;
      }
      if (file.size > MAX_PDF_BYTES) {
        setUploadMessage("PDF tối đa 15MB.");
        return;
      }
      setUploading("pdf");
      setUploadMessage(null);
      try {
        const url = await postAdminPdf(file);
        const label = file.name?.trim() || "Tài liệu.pdf";
        editor
          .chain()
          .focus()
          .insertContent({
            type: "paragraph",
            content: [
              {
                type: "text",
                text: label,
                marks: [
                  {
                    type: "link",
                    attrs: { href: url, target: "_blank", rel: "noopener noreferrer" },
                  },
                ],
              },
            ],
          })
          .run();
      } catch (e) {
        setUploadMessage(e instanceof Error ? e.message : "Không upload được.");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return undefined;
    const dom = editor.view.dom as HTMLElement;

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f?.type.startsWith("image/")) {
            e.preventDefault();
            void uploadImageAndInsert(f);
            break;
          }
          if (f?.type === "application/pdf") {
            e.preventDefault();
            void uploadPdfAndInsert(f);
            break;
          }
        }
      }
    };

    const onDrop = (e: DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files?.length) return;
      const list = Array.from(files);
      const images = list.filter((f) => f.type.startsWith("image/"));
      const pdfs = list.filter((f) => f.type === "application/pdf");
      if (images.length === 0 && pdfs.length === 0) return;
      e.preventDefault();
      void (async () => {
        for (const f of images) {
          await uploadImageAndInsert(f);
        }
        for (const f of pdfs) {
          await uploadPdfAndInsert(f);
        }
      })();
    };

    dom.addEventListener("paste", onPaste);
    dom.addEventListener("drop", onDrop);
    return () => {
      dom.removeEventListener("paste", onPaste);
      dom.removeEventListener("drop", onDrop);
    };
  }, [editor, uploadImageAndInsert, uploadPdfAndInsert]);

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
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        multiple
        onChange={async (e) => {
          const files = e.target.files;
          if (files?.length) {
            for (let i = 0; i < files.length; i++) {
              await uploadImageAndInsert(files[i]);
            }
          }
          e.target.value = "";
        }}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const files = e.target.files;
          if (files?.[0]) {
            await uploadPdfAndInsert(files[0]);
          }
          e.target.value = "";
        }}
      />
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
          label="Chèn ảnh"
          disabled={!canToggle(editor) || Boolean(uploading)}
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon size={16} />
        </ToolButton>
        <ToolButton
          label="Chèn PDF (tải lên và chèn liên kết tải xuống)"
          disabled={!canToggle(editor) || Boolean(uploading)}
          onClick={() => pdfInputRef.current?.click()}
        >
          <FileText size={16} />
        </ToolButton>
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
        {uploading === "image" ? (
          <span className="ml-2 font-sans text-xs text-gray-500">Đang tải ảnh…</span>
        ) : uploading === "pdf" ? (
          <span className="ml-2 font-sans text-xs text-gray-500">Đang tải PDF…</span>
        ) : null}
      </div>
      {uploadMessage ? (
        <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 font-sans text-xs text-amber-900">{uploadMessage}</p>
      ) : null}
      {/* Chiều cao không clamp — dialog/page bọc ngoài cuộn để nút Lưu luôn tới được */}
      <div className="min-h-[260px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
