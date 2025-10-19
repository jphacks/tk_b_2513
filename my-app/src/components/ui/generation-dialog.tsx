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
  const [isContributing, setIsContributing] = useState(false)
  const { toast } = useToast()

  if (!image) return null

  const handleDownload = async () => {
    try {
      // 適切なファイル名を生成
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const fileName = `generated-image-${timestamp}.png`

      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}&filename=${encodeURIComponent(fileName)}`

      // fetchでダウンロードを検証してから実行
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error('ダウンロードに失敗しました')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // <a>タグを使用してダウンロード
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
        variant: "success",
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "エラー",
        description: "ダウンロードに失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleContribute = async () => {
    setIsContributing(true)
    try {
      // 1. 画像をダウンロード
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      const fileName = `generated-image-${timestamp}.png`
      const downloadUrl = `/api/download?url=${encodeURIComponent(image.url)}&filename=${encodeURIComponent(fileName)}`

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = fileName
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)

      // 2. データベースに寄稿
      const response = await fetch('/api/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: image.url,
          prompt: image.prompt,
        }),
      })

      if (response.ok) {
        toast({
          title: "完了しました",
          description: "画像をダウンロードし、共有データベースに追加されました",
        })
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "エラーが発生しました",
          description: errorData.error || "画像の寄稿に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('寄稿エラー:', error)
      toast({
        title: "エラーが発生しました",
        description: "画像の寄稿中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setIsContributing(false)
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

        <DialogFooter className="flex gap-2">
          <Button
            onClick={handleContribute}
            disabled={isContributing}
            variant="outline"
          >
            ダウンロードして寄稿
          </Button>
          <Button onClick={handleDownload} disabled={isSubmitting}>
            <Download className="h-4 w-4 mr-2" />
            ダウンロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
