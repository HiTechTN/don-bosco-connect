export interface DemoAccount {
  role: string;
  email: string;
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'Admin', email: 'admin@donbosco.tn', password: 'admin123!' },
  { role: 'Enseignant', email: 'karim.hamdi@donbosco.tn', password: 'teacher123!' },
  { role: 'Élève', email: 'adam.slim@donbosco.tn', password: 'student123!' },
  { role: 'Parent', email: 'ahmed.slim@parent.tn', password: 'parent123!' },
];