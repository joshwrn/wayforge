import type { FC } from "react"

import { css } from "@emotion/react"
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer"

import type { WC } from "~/packages/hamr/src/react-json-editor"

import { useSetTitle } from "../../services/view"
import { Data_EnergyCard_A } from "../energy/EnergyCard_A"

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: `row`,
    backgroundColor: `#E4E4E4`,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
})

// Create Document Component
const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
        <Data_EnergyCard_A energyId="" />
      </View>
      <View style={styles.section}>
        <Text>Section #2</Text>
      </View>
    </Page>
  </Document>
)

export const PrintHome: FC = () => {
  useSetTitle(`Print`)
  return (
    <div>
      <PDFViewer
        css={css`
          width: 100%;
          height: 100%;
        `}
      >
        <MyDocument />
      </PDFViewer>
    </div>
  )
}
