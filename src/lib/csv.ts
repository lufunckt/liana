export function exportToCsv(filename: string, rows: any[], columns: string[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    columns.join(separator) +
    '\n' +
    rows.map(row => {
      return columns.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
        cell = cell.replace(/"/g, '""'); // Escape double quotes
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`; // Wrap in quotes if needed
        return cell;
      }).join(separator);
    }).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importFromCsv(file: File, columns: string[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        resolve([]);
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const result = [];
      for (let i = 1; i < lines.length; i++) {
        const rowString = lines[i];
        const rowMatch = rowString.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rowString.split(',');
        const obj: any = {};
        rowMatch.forEach((val, index) => {
          if (headers[index] && columns.includes(headers[index])) {
            let cleanVal = val.replace(/^"|"$/g, '').trim();
            cleanVal = cleanVal.replace(/""/g, '"');
            obj[headers[index]] = cleanVal;
          }
        });
        obj.id = Math.random().toString(36).substring(2, 9);
        result.push(obj);
      }
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
