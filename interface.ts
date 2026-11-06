export interface RequestResult {
  message: string;
  status: number;
  body: string | string[];
}

export interface Workload {
    'id': string;
    'name': string;
    'hostname': string;
    'state': string;
    'players': unknown[];
}