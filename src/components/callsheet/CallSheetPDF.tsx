import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { CallSheet, Scene } from '@/types'

interface CallSheetPDFProps {
  projectTitle: string
  callSheet: CallSheet
  scenes: Scene[]
}

// @react-pdf/renderer pulls in fontkit and is large, so it's dynamically imported
// on click instead of bundled into the main chunk.
export function CallSheetPDF({ projectTitle, callSheet, scenes }: CallSheetPDFProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const [{ pdf }, { CallSheetPDFDoc }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/lib/pdf/callSheetTemplate'),
      ])
      const blob = await pdf(
        <CallSheetPDFDoc projectTitle={projectTitle} callSheet={callSheet} scenes={scenes} />,
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `call-sheet-${callSheet.shoot_date}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" variant="secondary" disabled={loading} onClick={handleDownload}>
      <Download /> {loading ? 'Generando…' : 'Descargar PDF'}
    </Button>
  )
}
