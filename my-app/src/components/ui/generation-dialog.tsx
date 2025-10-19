"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
      // 適切なファイル名を生成
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const fileName = `generated-image-${timestamp}.png`
      
      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}&filename=${encodeURIComponent(fileName)}`
      
      // fetchを使用してダウンロードを実行
      fetch(downloadUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.blob()
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = fileName
          link.style.display = 'none'
          
          document.body.appendChild(link)
          link.click()
          
          // クリーンアップ
          setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          }, 100)

          toast({
            title: "ダウンロード完了",
            description: "画像のダウンロードが完了しました",
          })

          onOpenChange(false)
        })
        .catch(error => {
          console.error('Download error:', error)
          toast({
            title: "エラー",
            description: "ダウンロードに失敗しました。画像を右クリックして「名前を付けて保存」してください。",
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "エラー",
        description: "ダウンロードに失敗しました。画像を右クリックして「名前を付けて保存」してください。",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
    </Dialog>
  )
}
