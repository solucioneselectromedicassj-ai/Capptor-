import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { CallSheet, Scene } from '@/types'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#555', marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  label: { color: '#555' },
  table: { borderTop: '1 solid #ccc' },
  tableRow: { flexDirection: 'row', borderBottom: '1 solid #eee', paddingVertical: 4 },
  cellNum: { width: 40 },
  cellIntExt: { width: 60 },
  cellLocation: { flex: 1 },
  cellPages: { width: 50, textAlign: 'right' },
})

interface CallSheetPDFDocProps {
  projectTitle: string
  callSheet: CallSheet
  scenes: Scene[]
}

export function CallSheetPDFDoc({ projectTitle, callSheet, scenes }: CallSheetPDFDocProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{projectTitle}</Text>
        <Text style={styles.subtitle}>Call Sheet — {callSheet.shoot_date}</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Llamado general</Text>
            <Text>{callSheet.general_call ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Locación</Text>
            <Text>{callSheet.location ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Clima</Text>
            <Text>{callSheet.weather ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escenas a rodar</Text>
          <View style={styles.table}>
            {scenes.map((scene) => (
              <View style={styles.tableRow} key={scene.id}>
                <Text style={styles.cellNum}>#{scene.scene_number}</Text>
                <Text style={styles.cellIntExt}>{scene.int_ext}</Text>
                <Text style={styles.cellLocation}>
                  {scene.location} — {scene.time_of_day}
                </Text>
                <Text style={styles.cellPages}>{scene.page_count} pág.</Text>
              </View>
            ))}
          </View>
        </View>

        {callSheet.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text>{callSheet.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  )
}
