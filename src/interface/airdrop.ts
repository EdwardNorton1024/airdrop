export interface I_COLLECTION_URL_RESULT {
  wallet: string;
  inscriptions: I_INSCRIPTIONS[];
  inscriptions_count: number;
}
export interface I_INSCRIPTIONS {
  inscription_id: string;
  inscription_number: number;
}
export interface I_WALLET_WHITE_LIST {
  inscriptions_count: number;
  collections: Record<string, I_INSCRIPTIONS[]>;
}
