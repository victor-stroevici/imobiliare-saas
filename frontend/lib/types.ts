export type TipImobil = 'apartament' | 'casa' | 'teren' | 'spatiu_comercial' | 'garsoniera' | 'industrial';
export type TipTranzactie = 'vanzare' | 'inchiriere';
export type StatusAnunt = 'draft' | 'activ' | 'inactiv' | 'vandut';

export interface User {
  id: string;
  email: string;
  nume: string;
  prenume: string;
  telefon?: string;
  este_premium: boolean;
  created_at: string;
}

export interface Poza {
  id: number;
  url: string;
  este_principala: boolean;
  ordine: number;
}

export interface Anunt {
  id: number;
  titlu: string;
  descriere?: string;
  tip_imobil: TipImobil;
  tip_tranzactie: TipTranzactie;
  status: StatusAnunt;
  pret: number;
  moneda: string;
  suprafata_utila?: number;
  suprafata_construita?: number;
  nr_camere?: number;
  nr_bai?: number;
  etaj?: number;
  an_constructie?: number;
  oras: string;
  judet?: string;
  adresa?: string;
  dotari?: string[];
  are_centrala_proprie: boolean;
  are_parcare: boolean;
  are_balcon: boolean;
  are_ac: boolean;
  are_lift: boolean;
  dosar_verificat: boolean;
  vizualizari: number;
  este_promovat: boolean;
  proprietar_id: string;
  created_at: string;
  poze: Poza[];
  proprietar?: User;
}

export interface AnuntList {
  items: Anunt[];
  total: number;
  page: number;
  per_page: number;
}
