
export type ToolType = 
  | 'decision_tree'
  | 'psych' 
  | 'expiry' 
  | 'abx' 
  | 'accident' 
  | 'observation' 
  | 'admission' 
  | 'vax' 
  | 'coc';

export interface Recommendation {
  id: string;
  type: string;
  line: string;
}
