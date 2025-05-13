export function formatarData(data: string | Date): string {
  const date = new Date(data);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo', // ou 'UTC' dependendo do seu backend
  });
}
