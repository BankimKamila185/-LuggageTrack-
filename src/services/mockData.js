// Mock Database Store for LuggageTrack
// Journey Statuses: Checked In → Security Cleared → Loaded Into Aircraft → In Transit → Arrived At Destination → Handed Over
// Special Statuses: Lost, Delayed

export const BAGGAGE_STATUSES = [
  "Checked In",
  "Security Cleared",
  "Loaded Into Aircraft",
  "In Transit",
  "Arrived At Destination",
  "Handed Over",
  "Lost",
  "Delayed"
];

export const USER_ROLES = [
  "Passenger",
  "Check-In Staff",
  "Loading Staff",
  "Handover Staff",
  "Admin"
];

export const initialBaggageData = [
  {
    id: "LT-89302-JFK",
    passengerName: "Eleanor Vance",
    flightNumber: "UA-2402",
    origin: "ORD",
    destination: "JFK",
    status: "Handed Over",
    weight: 22.4,
    lastUpdated: "2026-06-16T12:45:00Z",
    notes: "Priority lane, heavy tag"
  },
  {
    id: "LT-10293-LHR",
    passengerName: "Marcus Sterling",
    flightNumber: "BA-0178",
    origin: "JFK",
    destination: "LHR",
    status: "Loaded Into Aircraft",
    weight: 18.2,
    lastUpdated: "2026-06-16T13:30:00Z",
    notes: "Security checked twice"
  },
  {
    id: "LT-72524-SIN",
    passengerName: "Emma Watson",
    flightNumber: "SQ-180",
    origin: "JFK",
    destination: "SIN",
    status: "Checked In",
    weight: 18.5,
    lastUpdated: "2026-06-18T13:30:00Z",
    notes: "SkyPass Business class passenger. PNR: 8MOAFW.",
    pnr: "8MOAFW"
  },
  {
    id: "LT-55421-HND",
    passengerName: "Aiko Tanaka",
    flightNumber: "JL-0006",
    origin: "LAX",
    destination: "HND",
    status: "In Transit",
    weight: 25.1,
    lastUpdated: "2026-06-16T11:15:00Z",
    notes: "Fragile contents"
  },
  {
    id: "LT-77381-CDG",
    passengerName: "Pierre Dubois",
    flightNumber: "AF-0023",
    origin: "CDG",
    destination: "MIA",
    status: "Delayed",
    weight: 21.0,
    lastUpdated: "2026-06-16T09:20:00Z",
    notes: "Missed connection, loading on next flight"
  },
  {
    id: "LT-44920-DXB",
    passengerName: "Zayn Khalid",
    flightNumber: "EK-0201",
    origin: "DXB",
    destination: "JFK",
    status: "Checked In",
    weight: 29.8,
    lastUpdated: "2026-06-16T13:50:00Z",
    notes: "Oversized baggage"
  },
  {
    id: "LT-33291-SIN",
    passengerName: "Sarah Lim",
    flightNumber: "SQ-0021",
    origin: "SIN",
    destination: "EWR",
    status: "Security Cleared",
    weight: 15.6,
    lastUpdated: "2026-06-16T13:10:00Z",
    notes: "Standard baggage"
  },
  {
    id: "LT-11823-SYD",
    passengerName: "Liam Henderson",
    flightNumber: "QF-0012",
    origin: "LAX",
    destination: "SYD",
    status: "Lost",
    weight: 23.0,
    lastUpdated: "2026-06-15T18:00:00Z",
    notes: "Last seen at sorting hub B. Investigation active."
  },
  {
    id: "LT-99201-DFW",
    passengerName: "Sofia Rodriguez",
    flightNumber: "AA-0451",
    origin: "DFW",
    destination: "MEX",
    status: "Handed Over",
    weight: 19.5,
    lastUpdated: "2026-06-16T10:05:00Z",
    notes: "None"
  },
  {
    id: "LT-66129-FRA",
    passengerName: "Hans Müller",
    flightNumber: "LH-0430",
    origin: "FRA",
    destination: "ORD",
    status: "In Transit",
    weight: 22.8,
    lastUpdated: "2026-06-16T12:00:00Z",
    notes: "Priority tag"
  },
  {
    id: "LT-88401-AMS",
    passengerName: "Emma de Jong",
    flightNumber: "KL-0641",
    origin: "AMS",
    destination: "JFK",
    status: "Security Cleared",
    weight: 17.9,
    lastUpdated: "2026-06-16T13:42:00Z",
    notes: "Standard"
  },
  {
    id: "LT-24810-BOM",
    passengerName: "Priya Sharma",
    flightNumber: "AI-0102",
    origin: "BOM",
    destination: "LHR",
    status: "Arrived At Destination",
    weight: 20.3,
    lastUpdated: "2026-06-17T06:15:00Z",
    notes: "Business class luggage"
  },
  {
    id: "LT-37652-NRT",
    passengerName: "Kenji Watanabe",
    flightNumber: "NH-0008",
    origin: "NRT",
    destination: "SFO",
    status: "Loaded Into Aircraft",
    weight: 24.5,
    lastUpdated: "2026-06-17T07:30:00Z",
    notes: "Diplomatic pouch — handle with care"
  },
  {
    id: "LT-51239-YYZ",
    passengerName: "Rachel Thompson",
    flightNumber: "AC-0858",
    origin: "YYZ",
    destination: "LHR",
    status: "Checked In",
    weight: 16.8,
    lastUpdated: "2026-06-17T08:00:00Z",
    notes: "First-time traveler, extra assistance"
  },
  {
    id: "LT-62847-GRU",
    passengerName: "Carlos Mendez",
    flightNumber: "LA-8063",
    origin: "GRU",
    destination: "MIA",
    status: "Arrived At Destination",
    weight: 26.2,
    lastUpdated: "2026-06-17T09:10:00Z",
    notes: "Sports equipment"
  },
  {
    id: "LT-75918-ICN",
    passengerName: "Ji-Young Park",
    flightNumber: "KE-0086",
    origin: "ICN",
    destination: "LAX",
    status: "In Transit",
    weight: 19.1,
    lastUpdated: "2026-06-17T10:00:00Z",
    notes: "Medical equipment inside"
  },
  {
    id: "LT-83024-MEL",
    passengerName: "Oliver Chase",
    flightNumber: "VA-0003",
    origin: "MEL",
    destination: "DXB",
    status: "Delayed",
    weight: 28.7,
    lastUpdated: "2026-06-17T04:20:00Z",
    notes: "Flight delay propagated"
  },
  {
    id: "LT-91547-FCO",
    passengerName: "Isabella Rossi",
    flightNumber: "AZ-0609",
    origin: "FCO",
    destination: "JFK",
    status: "Security Cleared",
    weight: 14.5,
    lastUpdated: "2026-06-17T11:00:00Z",
    notes: "Fashion week samples"
  },
  {
    id: "LT-12374-DOH",
    passengerName: "Ahmed Al-Rashid",
    flightNumber: "QR-0745",
    origin: "DOH",
    destination: "LHR",
    status: "Handed Over",
    weight: 23.9,
    lastUpdated: "2026-06-17T12:30:00Z",
    notes: "VIP passenger"
  },
  {
    id: "LT-46891-CPT",
    passengerName: "Nomvula Dlamini",
    flightNumber: "SA-0234",
    origin: "CPT",
    destination: "AMS",
    status: "Loaded Into Aircraft",
    weight: 21.6,
    lastUpdated: "2026-06-17T13:00:00Z",
    notes: "Artwork, requires careful handling"
  },
  {
    id: "LT-58302-PEK",
    passengerName: "Wei Zhang",
    flightNumber: "CA-0981",
    origin: "PEK",
    destination: "SFO",
    status: "Checked In",
    weight: 18.0,
    lastUpdated: "2026-06-17T14:15:00Z",
    notes: "Electronics — do not bend"
  },
  {
    id: "LT-69015-DEL",
    passengerName: "Raj Patel",
    flightNumber: "6E-0110",
    origin: "DEL",
    destination: "DXB",
    status: "Security Cleared",
    weight: 22.2,
    lastUpdated: "2026-06-17T15:00:00Z",
    notes: "Standard"
  },
  {
    id: "LT-74203-BCN",
    passengerName: "Lucia Fernandez",
    flightNumber: "VY-0823",
    origin: "BCN",
    destination: "CDG",
    status: "Arrived At Destination",
    weight: 12.3,
    lastUpdated: "2026-06-17T15:45:00Z",
    notes: "Hand luggage upgraded to hold"
  }
];

export const initialUsersData = [
  { id: "U-001", name: "Alex Mercer", email: "alex.mercer@luggagetrack.com", role: "Admin", status: "Active", username: "admin" },
  { id: "U-002", name: "Sarah Connor", email: "sarah.connor@luggagetrack.com", role: "Check-In Staff", status: "Active", username: "checkin" },
  { id: "U-003", name: "David Kim", email: "david.kim@luggagetrack.com", role: "Loading Staff", status: "Active", username: "loading" },
  { id: "U-004", name: "Elena Rostova", email: "elena.r@luggagetrack.com", role: "Handover Staff", status: "Active", username: "handover" },
  { id: "U-005", name: "James Wilson", email: "james.wilson@luggagetrack.com", role: "Loading Staff", status: "Suspended", username: "jwilson" },
  { id: "U-006", name: "Maria Santos", email: "m.santos@luggagetrack.com", role: "Check-In Staff", status: "Active", username: "msantos" },
  { id: "U-007", name: "Tom Bradley", email: "t.bradley@luggagetrack.com", role: "Handover Staff", status: "Active", username: "tbradley" },
  { id: "U-008", name: "Nina Petrov", email: "n.petrov@luggagetrack.com", role: "Passenger", status: "Active", username: "passenger" }
];

export const initialSystemHealth = {
  cpu: { current: 42, history: [35, 38, 40, 48, 45, 42, 39, 41, 44, 42] },
  memory: { current: 68, history: [62, 63, 65, 66, 67, 68, 68, 67, 68, 68] },
  storage: { current: 54, history: [54, 54, 54, 54, 54, 54, 54, 54, 54, 54] },
  network: { current: 120, history: [95, 110, 105, 130, 125, 115, 110, 122, 118, 120] }
};

export const mockNotifications = [
  { id: "n-1", type: "warning", message: "Baggage LT-77381-CDG delayed by flight scheduling", timestamp: "10 mins ago" },
  { id: "n-2", type: "info", message: "User David Kim checked in 12 bags on AA-0451", timestamp: "25 mins ago" },
  { id: "n-3", type: "error", message: "Lost baggage report LR-001 filed for LT-11823-SYD", timestamp: "2 hours ago" },
  { id: "n-4", type: "success", message: "Lost baggage LR-002 (Pierre Dubois) — item located!", timestamp: "3 hours ago" },
  { id: "n-5", type: "warning", message: "Baggage LT-83024-MEL flight delayed — reprogramming", timestamp: "4 hours ago" },
  { id: "n-6", type: "info", message: "System health check passed: all instances healthy", timestamp: "5 hours ago" }
];

export const mockRecentActivity = [
  { id: "a-1", action: "Status Updated", details: "LT-89302-JFK updated to 'Handed Over'", user: "Elena Rostova", time: "5 mins ago" },
  { id: "a-2", action: "Record Created", details: "Added LT-44920-DXB for Zayn Khalid", user: "Sarah Connor", time: "12 mins ago" },
  { id: "a-3", action: "User Modified", details: "James Wilson set to 'Suspended'", user: "Alex Mercer", time: "45 mins ago" },
  { id: "a-4", action: "Status Updated", details: "LT-10293-LHR updated to 'Loaded Into Aircraft'", user: "David Kim", time: "1 hour ago" },
  { id: "a-5", action: "Report Exported", details: "Monthly baggage processing report downloaded", user: "Alex Mercer", time: "2 hours ago" },
  { id: "a-6", action: "Status Updated", details: "LT-12374-DOH updated to 'Handed Over'", user: "Tom Bradley", time: "2.5 hours ago" },
  { id: "a-7", action: "Record Created", details: "Added LT-58302-PEK for Wei Zhang", user: "Maria Santos", time: "3 hours ago" },
  { id: "a-8", action: "Lost Report Filed", details: "LR-001 opened for LT-11823-SYD — Liam Henderson", user: "Sarah Connor", time: "4 hours ago" }
];

export const weeklyBaggageData = [
  { week: "Week 1", processed: 3280, delayed: 64, lost: 5 },
  { week: "Week 2", processed: 3520, delayed: 48, lost: 3 },
  { week: "Week 3", processed: 3190, delayed: 79, lost: 8 },
  { week: "Week 4", processed: 3750, delayed: 41, lost: 2 }
];

export const flightWiseBaggageData = [
  { flight: "UA-2402", baggage: 187 },
  { flight: "BA-0178", baggage: 234 },
  { flight: "JL-0006", baggage: 298 },
  { flight: "AF-0023", baggage: 142 },
  { flight: "EK-0201", baggage: 315 },
  { flight: "SQ-0021", baggage: 276 },
  { flight: "QF-0012", baggage: 203 },
  { flight: "AA-0451", baggage: 189 }
];
