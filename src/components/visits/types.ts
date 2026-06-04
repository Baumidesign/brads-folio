export interface Person {
  id: string;
  user_id: string;
  name: string;
  address: string;
  area: string;
  lat: number | null;
  lng: number | null;
  interest: number;
  follow_up: string;
  created_at: string;
  updated_at: string;
  // from people_with_last_visit view
  last_visit_date: string | null;
  visit_count: number;
}
