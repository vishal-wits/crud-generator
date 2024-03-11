export type Status = "active" | "inactive"
export type SubscriberType = "BPP" | "BAP" | "BG"
export type Role = "user" | "admin"

export interface IUser {
  first_name: string
  last_name: string
  username: string
  email: string
  // password: string
  mobile: string
  address: string
  country: string
  gst_legal_entity_name: string
  gst_business_address: string
  gst_city_code: string
  gst_no: string
  name_as_per_pan: string
  pan_no: string
  pan_date_of_incorporation: string
  subscriber_id: string
  subscriber_type: SubscriberType
  status: Status
  role: Role
  created_at: Date
  updated_at: Date
}
