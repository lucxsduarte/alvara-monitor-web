export function createDateFromYYYYMMDD(dateValue: string | Date | null | undefined): Date | null {
  if (!dateValue) {
    return null;
  }

  if (dateValue instanceof Date) {
    return dateValue;
  }

  const parts = dateValue.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function addDaysAndFormat(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  const year = result.getFullYear();
  const month = (result.getMonth() + 1).toString().padStart(2, '0');
  const day = result.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}
