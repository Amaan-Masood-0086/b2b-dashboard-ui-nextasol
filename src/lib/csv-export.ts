export interface CSVColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export function exportToCSV<T>(data: T[], columns: CSVColumn<T>[], filename: string): void {
  const headers = columns.map((c) => `"${c.header}"`).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = col.accessor(row);
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      })
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
