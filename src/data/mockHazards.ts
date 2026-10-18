import { HazardReport } from '../types';

export const INITIAL_HAZARDS: HazardReport[] = [
  {
    id: 'HAZ-2026-8941',
    title: 'High-Impact Asphalt Pothole with Sub-base Erosion',
    description: 'Deep road surface cavity measuring approximately 35cm across with sharp aggregate edges, causing vehicles to abruptly swerve into incoming traffic lane.',
    category: 'roads',
    severity: 'critical',
    status: 'assigned',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '840 Market Street, Downtown Central',
      district: 'District 6 (Civic Center)',
      crossStreet: 'Near 4th Street Crosswalk'
    },
    imageUrl: '/src/assets/images/hazard_pothole_road_1791218443596.jpg',
    aiAnalysis: {
      confidence: 0.96,
      categoryDetected: 'Severe Asphalt Pothole with Sub-base Exposure',
      severityDetected: 'critical',
      impactReason: 'Direct risk of rim fracturing, tire blowout, and vehicular collisions in active downtown arterial lane.',
      department: 'Department of Public Works — Street Maintenance',
      detectedHazards: ['Pavement Void', 'Fractured Bitumen Edges', 'Loose Ballast Gravel'],
      boundingBoxes: [
        { label: 'Deep Asphalt Cavity', box_2d: [320, 240, 760, 780], confidence: 0.96 },
        { label: 'Sub-base Aggregate', box_2d: [480, 360, 680, 650], confidence: 0.92 }
      ]
    },
    reportedAt: '2026-10-04T18:24:00Z',
    updatedAt: '2026-10-05T07:15:00Z',
    reporter: {
      id: 'usr-101',
      name: 'Maya Lin',
      isAnonymous: false,
      badge: 'Civic Guardian'
    },
    assignedTo: {
      team: 'DPW Rapid Asphalt Crew #3',
      department: 'Bureau of Street Repair',
      dispatchedAt: '2026-10-05T06:30:00Z',
      etaHours: 3
    },
    upvotes: 38,
    confirmations: [
      {
        id: 'conf-1',
        userId: 'usr-102',
        userName: 'David K.',
        timestamp: '2026-10-04T19:10:00Z',
        note: 'Nearly hit this on my bike commute. Very sharp drop off.'
      },
      {
        id: 'conf-2',
        userId: 'usr-103',
        userName: 'Elena Rostova',
        timestamp: '2026-10-04T20:45:00Z',
        note: 'Saw a taxi bust a tire here this morning.'
      }
    ],
    comments: [
      {
        id: 'comm-1',
        userId: 'usr-admin-1',
        userName: 'Officer Marcus Miller (DPW Dispatch)',
        userRole: 'authority',
        text: 'Work order #WO-9912 generated. Crew #3 en route with hot asphalt compaction unit.',
        timestamp: '2026-10-05T06:45:00Z'
      }
    ],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-04T18:24:00Z',
        label: 'Citizen Report Filed',
        note: 'Reported with GPS coordinates and verified photo.',
        actor: 'Maya Lin (Citizen)'
      },
      {
        status: 'verified',
        timestamp: '2026-10-04T18:26:00Z',
        label: 'AI Computer Vision Verification',
        note: 'AI classified severity as Critical (0.96 confidence). 38 community upvotes confirmed.',
        actor: 'CivicSense Vision Engine'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-05T06:30:00Z',
        label: 'Dispatched to Field Crew',
        note: 'Assigned to DPW Rapid Asphalt Crew #3. ETA ~3 hours.',
        actor: 'City Operations Dispatch'
      }
    ],
    priorityScore: 94,
    trafficImpact: 'high',
    isSchoolZone: false
  },
  {
    id: 'HAZ-2026-8942',
    title: 'Massive Fallen Tree Limb Blocking Bicycle & Transit Corridor',
    description: 'Heavy oak limb cracked under wind gust, blocking 100% of bicycle lane and 50% of the pedestrian sidewalk. Pedestrians forced into busy traffic lane.',
    category: 'trees',
    severity: 'high',
    status: 'in_progress',
    location: {
      lat: 37.7694,
      lng: -122.4467,
      address: '1420 Haight Street, Ashbury Heights',
      district: 'District 5 (Haight-Ashbury)',
      crossStreet: 'Corner of Masonic Ave'
    },
    imageUrl: '/src/assets/images/hazard_fallen_tree_1791218456024.jpg',
    aiAnalysis: {
      confidence: 0.95,
      categoryDetected: 'Fallen Tree & Obstructive Forestry Hazard',
      severityDetected: 'high',
      impactReason: 'Full obstruction of accessible pedestrian sidewalk and active bike corridor.',
      department: 'Department of Urban Forestry & Arborist Services',
      detectedHazards: ['Fractured Timber', 'Path Obstruction', 'Impeded Transit'],
      boundingBoxes: [
        { label: 'Fallen Oak Branch', box_2d: [350, 180, 780, 850], confidence: 0.95 },
        { label: 'Blocked Sidewalk Surface', box_2d: [480, 100, 890, 600], confidence: 0.91 }
      ]
    },
    reportedAt: '2026-10-05T06:10:00Z',
    updatedAt: '2026-10-05T08:30:00Z',
    reporter: {
      id: 'usr-104',
      name: 'Samira Patel',
      isAnonymous: false,
      badge: 'Neighborhood Lead'
    },
    assignedTo: {
      team: 'Arborist Unit Bravo-2',
      department: 'Bureau of Urban Forestry',
      dispatchedAt: '2026-10-05T07:20:00Z',
      etaHours: 1
    },
    upvotes: 42,
    confirmations: [
      {
        id: 'conf-3',
        userId: 'usr-105',
        userName: 'Liam Vance',
        timestamp: '2026-10-05T07:00:00Z',
        note: 'Strollers and wheelchairs cannot pass.'
      }
    ],
    comments: [
      {
        id: 'comm-2',
        userId: 'usr-admin-2',
        userName: 'Sgt. Frank Ramos (Forestry Lead)',
        userRole: 'authority',
        text: 'Crew is actively on site with chainsaws and wood chipper. Lane partially coned off.',
        timestamp: '2026-10-05T08:15:00Z'
      }
    ],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-05T06:10:00Z',
        label: 'Citizen Report Filed',
        note: 'Filed via mobile app with camera photo.',
        actor: 'Samira Patel'
      },
      {
        status: 'verified',
        timestamp: '2026-10-05T06:12:00Z',
        label: 'AI & Community Verification',
        note: 'Classified High severity. 42 community confirmations.',
        actor: 'CivicSense AI'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-05T07:20:00Z',
        label: 'Dispatched to Arborist Unit Bravo-2',
        note: 'High-capacity wood chipper dispatched.',
        actor: 'Municipal Forestry'
      },
      {
        status: 'in_progress',
        timestamp: '2026-10-05T08:00:00Z',
        label: 'Crews Active on Scene',
        note: 'Sectioning trunk and clearing roadway.',
        actor: 'Arborist Unit Bravo-2'
      }
    ],
    priorityScore: 89,
    trafficImpact: 'high',
    isSchoolZone: true
  },
  {
    id: 'HAZ-2026-8943',
    title: 'Clogged Municipal Storm Catch Basin Causing Road Inundation',
    description: 'Heavy debris, plastic waste, and autumn foliage completely blocking street storm drain. 4 inches of standing water pooling near busy school crosswalk.',
    category: 'water',
    severity: 'medium',
    status: 'verified',
    location: {
      lat: 37.7599,
      lng: -122.4148,
      address: '2240 Mission Street, Inner Mission',
      district: 'District 9 (Mission District)',
      crossStreet: 'Near 18th Street intersection'
    },
    imageUrl: '/src/assets/images/hazard_flooded_drain_1791218470195.jpg',
    aiAnalysis: {
      confidence: 0.94,
      categoryDetected: 'Storm Sewer Inundation & Street Flooding',
      severityDetected: 'medium',
      impactReason: 'Hydroplaning risk for buses and pedestrian splash hazard directly adjacent to elementary school route.',
      department: 'San Francisco Public Utilities Commission — Wastewater',
      detectedHazards: ['Drain Grate Inundation', 'Roadway Ponding', 'Curbside Submersion'],
      boundingBoxes: [
        { label: 'Submerged Catch Basin', box_2d: [420, 260, 820, 740], confidence: 0.94 },
        { label: 'Street Puddle Perimeter', box_2d: [280, 150, 910, 880], confidence: 0.89 }
      ]
    },
    reportedAt: '2026-10-05T07:45:00Z',
    updatedAt: '2026-10-05T08:00:00Z',
    reporter: {
      id: 'usr-106',
      name: 'Carlos Mendez',
      isAnonymous: false,
      badge: 'Active Contributor'
    },
    upvotes: 19,
    confirmations: [],
    comments: [
      {
        id: 'comm-3',
        userId: 'usr-107',
        userName: 'Clara Oswald',
        text: 'The water is rising with the morning rain. Kids had to jump across.',
        timestamp: '2026-10-05T08:10:00Z'
      }
    ],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-05T07:45:00Z',
        label: 'Citizen Report Filed',
        note: 'Reported with high-resolution photo.',
        actor: 'Carlos Mendez'
      },
      {
        status: 'verified',
        timestamp: '2026-10-05T07:48:00Z',
        label: 'AI Verification Completed',
        note: 'Identified catch basin blockage and standing water.',
        actor: 'CivicSense AI'
      }
    ],
    priorityScore: 78,
    trafficImpact: 'medium',
    isSchoolZone: true
  },
  {
    id: 'HAZ-2026-8930',
    title: 'Severe Sunken Pothole Re-paved and Sealed',
    description: 'Former 45cm diameter sunken road section repaired with compacted hot-mix asphalt and waterproof edge sealant. Smooth vehicular traverse restored.',
    category: 'roads',
    severity: 'high',
    status: 'resolved',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: '550 Geary Boulevard, Tenderloin / Nob Hill',
      district: 'District 3',
      crossStreet: 'Between Taylor and Jones St'
    },
    imageUrl: '/src/assets/images/hazard_pothole_road_1791218443596.jpg',
    resolvedImageUrl: '/src/assets/images/hazard_resolved_fix_1791218482910.jpg',
    aiAnalysis: {
      confidence: 0.97,
      categoryDetected: 'Permanent Roadway Bitumen Repair (Verified)',
      severityDetected: 'high',
      impactReason: 'Formerly hazardous road condition now fully stabilized according to municipal structural code.',
      department: 'Department of Public Works',
      detectedHazards: ['Resolved Pavement Repair', 'Smooth Finished Bitumen'],
      boundingBoxes: [
        { label: 'Compacted Asphalt Patch', box_2d: [300, 250, 750, 790], confidence: 0.98 }
      ]
    },
    reportedAt: '2026-10-03T11:20:00Z',
    updatedAt: '2026-10-04T15:40:00Z',
    resolvedAt: '2026-10-04T15:30:00Z',
    resolutionNote: 'Pavement milled, leveled, and sealed with 4-inch compacted hot-mix asphalt by DPW Paving Unit #1. Inspection passed.',
    reporter: {
      id: 'usr-108',
      name: 'Angela Wu',
      isAnonymous: false,
      badge: 'Civic Guardian'
    },
    assignedTo: {
      team: 'DPW Paving Unit #1',
      department: 'Bureau of Street Repair',
      dispatchedAt: '2026-10-04T08:00:00Z'
    },
    upvotes: 64,
    confirmations: [
      {
        id: 'conf-4',
        userId: 'usr-109',
        userName: 'Tom Bradley',
        timestamp: '2026-10-04T16:00:00Z',
        note: 'Drove over it this evening, completely smooth!'
      }
    ],
    comments: [
      {
        id: 'comm-4',
        userId: 'usr-admin-1',
        userName: 'Officer Marcus Miller (DPW)',
        userRole: 'authority',
        text: 'Work order closed out with QA photographic sign-off.',
        timestamp: '2026-10-04T15:35:00Z'
      }
    ],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-03T11:20:00Z',
        label: 'Citizen Report Filed',
        note: 'Reported by Angela Wu.',
        actor: 'Angela Wu'
      },
      {
        status: 'verified',
        timestamp: '2026-10-03T11:22:00Z',
        label: 'AI & Community Verified',
        note: 'Verified with priority ranking.',
        actor: 'CivicSense AI'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-04T08:00:00Z',
        label: 'Assigned to DPW Unit #1',
        note: 'Scheduled for morning milling.',
        actor: 'Municipal Dispatch'
      },
      {
        status: 'in_progress',
        timestamp: '2026-10-04T11:00:00Z',
        label: 'Crew Paving on Site',
        note: 'Traffic coned and asphalt laid.',
        actor: 'DPW Paving Unit #1'
      },
      {
        status: 'resolved',
        timestamp: '2026-10-04T15:30:00Z',
        label: 'Hazard Fully Resolved & Verified',
        note: 'Field inspection passed. Before/after photos archived.',
        actor: 'DPW Paving Unit #1'
      }
    ],
    priorityScore: 30,
    trafficImpact: 'high',
    isSchoolZone: false
  },
  {
    id: 'HAZ-2026-8944',
    title: 'Exposed Electrical Junction at Streetlight Base',
    description: 'Metal base access plate missing from pedestrian streetlight. Live terminal wires accessible to children and dogs along walkway.',
    category: 'electrical',
    severity: 'critical',
    status: 'assigned',
    location: {
      lat: 37.7885,
      lng: -122.4075,
      address: '290 Post Street, Union Square',
      district: 'District 3',
      crossStreet: 'Near Stockton Street'
    },
    imageUrl: '/src/assets/images/civicsense_hero_city_1791218428454.jpg',
    aiAnalysis: {
      confidence: 0.98,
      categoryDetected: 'Public Utility Electrical Hazard (Exposed)',
      severityDetected: 'critical',
      impactReason: 'Severe electrocution danger in high foot-traffic tourist and shopping district.',
      department: 'San Francisco Public Utilities Commission — Power',
      detectedHazards: ['Missing Handhole Cover', 'Exposed 120V Wiring', 'Moisture Ingress Risk'],
      boundingBoxes: [
        { label: 'Exposed Utility Base', box_2d: [600, 350, 950, 650], confidence: 0.98 }
      ]
    },
    reportedAt: '2026-10-05T08:15:00Z',
    updatedAt: '2026-10-05T08:45:00Z',
    reporter: {
      id: 'usr-110',
      name: 'Gabriel Santos',
      isAnonymous: false,
      badge: 'Civic Guardian'
    },
    assignedTo: {
      team: 'SFPUC Emergency Electric Crew #4',
      department: 'Electrical Maintenance',
      dispatchedAt: '2026-10-05T08:35:00Z',
      etaHours: 1
    },
    upvotes: 51,
    confirmations: [],
    comments: [],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-05T08:15:00Z',
        label: 'Citizen Report Filed',
        note: 'Marked as urgent electrical issue.',
        actor: 'Gabriel Santos'
      },
      {
        status: 'verified',
        timestamp: '2026-10-05T08:18:00Z',
        label: 'AI Critical Alert Triggered',
        note: 'AI classified as Critical priority score 98.',
        actor: 'CivicSense AI'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-05T08:35:00Z',
        label: 'Emergency Electric Dispatch',
        note: 'SFPUC Emergency Crew #4 rolling with replacement junction plate.',
        actor: 'City Operations Dispatch'
      }
    ],
    priorityScore: 98,
    trafficImpact: 'high',
    isSchoolZone: false
  },
  {
    id: 'HAZ-2026-8945',
    title: 'Buckled Concrete Sidewalk Slab Causing Trip Hazard',
    description: 'Tree root expansion has lifted concrete sidewalk flags by 3.5 inches, creating a non-compliant ADA barrier and acute trip hazard.',
    category: 'structural',
    severity: 'medium',
    status: 'reported',
    location: {
      lat: 37.7512,
      lng: -122.4285,
      address: '3810 24th Street, Noe Valley',
      district: 'District 8 (Noe Valley)',
      crossStreet: 'Near Sanchez St'
    },
    imageUrl: '/src/assets/images/hazard_pothole_road_1791218443596.jpg',
    aiAnalysis: {
      confidence: 0.91,
      categoryDetected: 'Heaved Sidewalk Concrete Slab (Root Incursion)',
      severityDetected: 'medium',
      impactReason: 'ADA mobility compliance violation and fall hazard for elderly pedestrians.',
      department: 'Department of Public Works — Sidewalk Inspection',
      detectedHazards: ['Vertical Offset > 2 inches', 'Root Displacement', 'Cracked Flag'],
      boundingBoxes: [
        { label: 'Buckled Slab Ledge', box_2d: [400, 300, 750, 700], confidence: 0.92 }
      ]
    },
    reportedAt: '2026-10-05T07:10:00Z',
    updatedAt: '2026-10-05T07:10:00Z',
    reporter: {
      id: 'usr-111',
      name: 'Anonymous Citizen',
      isAnonymous: true,
      badge: 'Community Contributor'
    },
    upvotes: 14,
    confirmations: [],
    comments: [],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-05T07:10:00Z',
        label: 'Citizen Report Filed',
        note: 'Anonymous submission with GPS photo.',
        actor: 'Citizen'
      }
    ],
    priorityScore: 66,
    trafficImpact: 'low',
    isSchoolZone: false
  },
  {
    id: 'HAZ-2026-8946',
    title: 'Illegal Commercial Waste Dump in Public Alleyway',
    description: 'Bulk construction debris, dry drywall, insulation, and discarded commercial paint buckets blocking rear fire exit alleyway.',
    category: 'waste',
    severity: 'high',
    status: 'reported',
    location: {
      lat: 37.7781,
      lng: -122.4089,
      address: '150 Harriet Street, South of Market (SOMA)',
      district: 'District 6 (SOMA)',
      crossStreet: 'Between Folsom and Howard'
    },
    imageUrl: '/src/assets/images/hazard_flooded_drain_1791218470195.jpg',
    aiAnalysis: {
      confidence: 0.93,
      categoryDetected: 'Illegal Commercial Refuse Dumping',
      severityDetected: 'high',
      impactReason: 'Blocked emergency egress corridor and potential chemical runoff into storm system.',
      department: 'San Francisco Department of Environment & Code Enforcement',
      detectedHazards: ['Alley Egress Obstruction', 'Hazardous Liquid Containers', 'Bulk Debris'],
      boundingBoxes: [
        { label: 'Illegal Debris Pile', box_2d: [300, 200, 850, 800], confidence: 0.94 }
      ]
    },
    reportedAt: '2026-10-05T05:30:00Z',
    updatedAt: '2026-10-05T05:30:00Z',
    reporter: {
      id: 'usr-112',
      name: 'Nadia Thorne',
      isAnonymous: false,
      badge: 'Civic Guardian'
    },
    upvotes: 27,
    confirmations: [],
    comments: [],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-05T05:30:00Z',
        label: 'Citizen Report Filed',
        note: 'Reported with alley photo.',
        actor: 'Nadia Thorne'
      }
    ],
    priorityScore: 82,
    trafficImpact: 'medium',
    isSchoolZone: false
  },
  {
    id: 'HAZ-2026-8947',
    title: 'Traffic Signal Outage at Multilane School Crossing',
    description: 'Four-way traffic signals dark and flashing unreliably following localized power surge. High student pedestrian traffic at morning bell.',
    category: 'traffic',
    severity: 'critical',
    status: 'assigned',
    location: {
      lat: 37.7634,
      lng: -122.4345,
      address: 'Castro Street & 18th Street, The Castro',
      district: 'District 8',
      crossStreet: 'Castro & 18th Intersection'
    },
    imageUrl: '/src/assets/images/civicsense_hero_city_1791218428454.jpg',
    aiAnalysis: {
      confidence: 0.99,
      categoryDetected: 'Traffic Control System Signal Failure',
      severityDetected: 'critical',
      impactReason: 'High danger of intersection gridlock and multi-vehicle collisions in high pedestrian zone.',
      department: 'San Francisco Municipal Transportation Agency (SFMTA)',
      detectedHazards: ['Dark Signal Heads', 'Intermittent Phase Conflict'],
      boundingBoxes: [
        { label: 'Dark Signal Head', box_2d: [200, 400, 500, 600], confidence: 0.99 }
      ]
    },
    reportedAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-05T08:15:00Z',
    reporter: {
      id: 'usr-113',
      name: 'Kenji Sato',
      isAnonymous: false,
      badge: 'Transit Advocate'
    },
    assignedTo: {
      team: 'SFMTA Signal Maintenance Team #2',
      department: 'Traffic Engineering',
      dispatchedAt: '2026-10-05T08:10:00Z',
      etaHours: 1
    },
    upvotes: 45,
    confirmations: [],
    comments: [],
    timeline: [
      {
        status: 'reported',
        timestamp: '2026-10-05T08:00:00Z',
        label: 'Citizen Report Filed',
        note: 'Reported by Kenji Sato.',
        actor: 'Kenji Sato'
      },
      {
        status: 'assigned',
        timestamp: '2026-10-05T08:10:00Z',
        label: 'Emergency Traffic Control Dispatched',
        note: 'Traffic officers dispatched for manual intersection management.',
        actor: 'SFMTA Dispatch'
      }
    ],
    priorityScore: 97,
    trafficImpact: 'high',
    isSchoolZone: true
  }
];

export const CATEGORIES_CONFIG: Record<
  string,
  { label: string; icon: string; description: string; color: string; badgeBg: string }
> = {
  roads: {
    label: 'Roads & Potholes',
    icon: 'Hammer',
    description: 'Pavement cavities, asphalt cracks, sunken manholes',
    color: '#D97706',
    badgeBg: 'rgba(217, 119, 6, 0.1)'
  },
  trees: {
    label: 'Fallen Trees & Debris',
    icon: 'Trees',
    description: 'Broken limbs, downed trunks, sidewalk root damage',
    color: '#16A34A',
    badgeBg: 'rgba(22, 163, 74, 0.1)'
  },
  electrical: {
    label: 'Streetlights & Utility',
    icon: 'Zap',
    description: 'Exposed wires, broken luminaires, pole damage',
    color: '#EAB308',
    badgeBg: 'rgba(234, 179, 8, 0.1)'
  },
  water: {
    label: 'Water Leaks & Flooding',
    icon: 'Droplets',
    description: 'Clogged catch basins, water main ruptures, street pooling',
    color: '#0284C7',
    badgeBg: 'rgba(2, 132, 199, 0.1)'
  },
  structural: {
    label: 'Sidewalks & Structural',
    icon: 'Building2',
    description: 'Cracked concrete slabs, collapsing curbs, retaining walls',
    color: '#8B5CF6',
    badgeBg: 'rgba(139, 92, 246, 0.1)'
  },
  waste: {
    label: 'Illegal Dumping & Waste',
    icon: 'Trash2',
    description: 'Bulk construction debris, chemical runoff, blocked alleys',
    color: '#64748B',
    badgeBg: 'rgba(100, 116, 139, 0.1)'
  },
  traffic: {
    label: 'Traffic Signal Outages',
    icon: 'AlertOctagon',
    description: 'Dark stoplights, knocked-down signs, crosswalk beacons',
    color: '#DC2626',
    badgeBg: 'rgba(220, 38, 38, 0.1)'
  },
  fire: {
    label: 'Fire & Chemical Spills',
    icon: 'Flame',
    description: 'Combustible materials, oil slicks, hydrants leaking',
    color: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.1)'
  }
};
