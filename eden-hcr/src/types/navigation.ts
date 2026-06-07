// Définition stricte de toutes les vues internes accessibles depuis la Sidebar d'EDÈN Group
export type DashboardView = 
  | 'dashboard' 
  | 'missions' 
  | 'candidates' 
  | 'establishments' 
  | 'planning' 
  | 'contracts' 
  | 'reports'   // Gère le composant ReportManager
  | 'payments'  // Gère le composant PaymentManager
  | 'messages'; // Gère le composant MessageManager