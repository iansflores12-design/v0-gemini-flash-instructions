// components/ai-chat.tsx
import { useState, useRef } from 'react';
import { Paperclip, Image as ImageIcon, Send, X } from 'lucide-react'; // Iconos sugeridos
import { Button } from "./ui/button";

export function AIChat() {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      {/* Visualización de archivos seleccionados */}
      {files.length > 0 && (
        <div className="p-2 flex gap-2 overflow-x-auto border-b">
          {files.map((file, i) => (
            <div key={i} className="relative bg-secondary p-2 rounded-md text-xs flex items-center gap-2">
              <span className="truncate max-w-[100px]">{file.name}</span>
              <button onClick={() => removeFile(i)} className="text-destructive">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 flex items-center gap-2">
        {/* Botón para Adjuntar */}
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Campo de texto (Ya existente en tu código) */}
        <input 
          className="flex-1 bg-transparent border-none focus:ring-0" 
          placeholder="Escribe tu mensaje o adjunta una foto..."
        />

        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}