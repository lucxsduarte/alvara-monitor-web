export interface ExpiringLicenseDTO {
  companyId: number;
  companyName: string;
  licenseType: string;
  expirationDate: string;
}

export interface DashboardSummaryDTO {
  totalCompanies: number;
  totalExpiredLicenses: number;
  licensesExpiringIn30Days: ExpiringLicenseDTO[];
  upcomingExpirations: ExpiringLicenseDTO[];
}
