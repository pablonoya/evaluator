import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid"
import { useCallback } from "react"

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  )
}

export default function DataTable(props) {
  const { height, columns, rows, rowCount, onPageSizeChange, pageSize = 10, ...otherProps } = props

  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        autoHeight
        columns={columns}
        rows={rows}
        rowCount={rowCount}
        rowsPerPageOptions={[5, 10, 20]}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        paginationMode="server"
        filterMode="server"
        components={{
          Toolbar: CustomToolbar,
        }}
        {...otherProps}
      />
    </div>
  )
}
