export interface AlvaraVencendoDTO {
  empresaId: number;
  nomeEmpresa: string;
  tipoAlvara: string;
  dataVencimento: string;
}

export interface DashboardSummaryDTO {
  totalEmpresas: number;
  totalAlvarasVencidos: number;
  alvarasVencendo30Dias: AlvaraVencendoDTO[];
  proximosVencimentos: AlvaraVencendoDTO[];
}
