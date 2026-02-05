
export type ToolType = 
  | 'psych' 
  | 'expiry' 
  | 'abx' 
  | 'accident' 
  | 'observation' 
  | 'admission' 
  | 'vax' 
  | 'coc' 
  | 'transport';

export interface Recommendation {
  id: string;
  type: string;
  line: string;
}

export interface TransportRow {
  id: string;
  origin: string;
  resident: string;
  unit: string;
  room: string;
  location: string;
  phone: string;
  schedulingDate: string;
  referralDate: string;
  apptDueBy: string;
  status: string;
  apptDate: string;
  apptTime: string;
  pickupTime: string;
  apptType: string;
  refReason: string;
  inHouse: string;
  reasonIfIH: string;
  transportType: string;
  transportCompany: string;
  payer: string;
  roundTrip: string;
  escort: string;
  notes: string;
}

export interface CensusItem {
  resident: string;
  unit: string;
  room: string;
}
