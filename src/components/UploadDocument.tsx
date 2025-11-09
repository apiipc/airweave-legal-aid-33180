import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Progress } from "./ui/progress";

interface UploadDocumentProps {
  onUploadSuccess?: () => void;
}

export const UploadDocument = ({ onUploadSuccess }: UploadDocumentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Chỉ hỗ trợ file PDF, DOC, DOCX, TXT, MD");
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File không được vượt quá 10MB");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Content = e.target?.result as string;
          const base64Data = base64Content.split(",")[1]; // Remove data:application/pdf;base64, prefix

          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + 10;
            });
          }, 200);

          // Call edge function to upload
          const { data, error } = await supabase.functions.invoke("upload-document", {
            body: {
              filename: file.name,
              fileType: file.type,
              content: base64Data,
            },
          });

          clearInterval(progressInterval);
          setUploadProgress(100);

          if (error) {
            console.error("Upload error:", error);
            toast.error(error.message || "Không thể upload tài liệu. Vui lòng thử lại.");
            setIsUploading(false);
            return;
          }

          if (data?.success) {
            toast.success(`Đã upload tài liệu "${file.name}" thành công!`);
            setFile(null);
            setIsOpen(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
            onUploadSuccess?.();
          } else {
            toast.error(data?.error || "Upload thất bại");
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("Đã xảy ra lỗi khi upload tài liệu.");
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      };

      reader.onerror = () => {
        toast.error("Không thể đọc file.");
        setIsUploading(false);
        setUploadProgress(0);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Đã xảy ra lỗi khi upload tài liệu.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Tài Liệu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Tài Liệu</DialogTitle>
          <DialogDescription>
            Upload hợp đồng hoặc tài liệu để chatbot có thể phân tích và so sánh. Hỗ trợ PDF, DOC, DOCX, TXT, MD (tối đa 10MB).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Chọn tài liệu</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.md"
                disabled={isUploading}
                className="flex-1"
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Đang upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

