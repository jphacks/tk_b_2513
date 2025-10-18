"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { ImageMeta } from "@/app/api"
import { useToast } from "@/hooks/use-toast"

interface GenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: ImageMeta | null
}

export function GenerationDialog({ open, onOpenChange, image }: GenerationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  if (!image) return null

  const handleDownload = () => {
    setIsSubmitting(true)
    try {
      // プロキシAPIを使用してダウンロード
      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}`
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `generated-${image.id}.png`
      link.style.display = 'none'
      
      // DOMに追加してクリック
      document.body.appendChild(link)
      link.click()
      
      // クリーンアップ
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)

      toast({
        title: "ダウンロード開始",
        description: "画像のダウンロードが開始されました",
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "エラー",
        description: "ダウンロードに失敗しました。画像を右クリックして「名前を付けて保存」してください。",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>生成完了</DialogTitle>
          <DialogDescription>画像が生成されました。ダウンロードを行いますか？</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
            <img 
              src={image.url || "/placeholder.svg"} 
              alt="Generated" 
              className="w-full h-full object-contain" 
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleDownload} disabled={isSubmitting}>
            <Download className="h-4 w-4 mr-2" />
            ダウンロード
          </Button>
        </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
