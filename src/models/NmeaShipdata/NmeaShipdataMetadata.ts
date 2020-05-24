import { INmeaFieldDescriptions, INmeaLookup } from '../AbstractNmea/INmea'

export const Description: INmeaFieldDescriptions = {
    _id: 'ObjectID',
    AIS: 'AIS message number',
    Channel: 'Chanel on which the Messages was send',
    MMSI: 'Unique ship identification number (MMSI)',
    TimeStamp: 'Received at (UTC)',
    CreatedAt: 'Created at (UTC)',
    CreatedBy: 'Created By',
    UpdatedAt: 'Updated at (UTC)',
    UpdatedBy: 'Updated By',
    Sender: 'Sender',

    AISversion: 'Compliant with AIS edition',
    IMOnumber: 'Vessel identification number (IMO)',
    CallSign: 'Ship radio call sign',
    Name: 'Vessel name',
    DimA: 'Distance from bow to ref position',
    DimB: 'Distance from ref position to stern',
    DimC: 'Distance from port side to ref position',
    DimD: 'Distance from ref position to starboard side',
    Dimensions: 'Vessels Length / Beam',
    ShipType: 'Type of ship and cargo type',
    PositionType: 'Method used for positioning',
    ETA: 'Estimated time of arrival',
    Draught: 'Maximum present static draught',
    Destination: 'Vessels Destination'
}

export const AISversionLookup: INmeaLookup[] = [
    {
        'value': 0,
        'description': 'ITU-R M.1371-1'
    },
    {
        'value': 1,
        'description': 'ITU-R M.1371-3 (or later)'
    },
    {
        'value': 2,
        'description': 'ITU-R M.1371-5 (or later)'
    }
]

export const IMOnumberLookup: INmeaLookup[] = [
    {
        'value': 0,
        'description': 'unavailable'
    }
]

export const ShipTypeLookup: INmeaLookup[] = [
    {
        'value': 0,
        'description': 'unavailable'
    },
    {
        'value': 10,
        'description': 'unspecified (10)'
    },
    {
        'value': 11,
        'description': 'unspecified (11)'
    },
    {
        'value': 12,
        'description': 'unspecified (12)'
    },
    {
        'value': 13,
        'description': 'unspecified (13)'
    },
    {
        'value': 14,
        'description': 'unspecified (14)'
    },
    {
        'value': 15,
        'description': 'unspecified (15)'
    },
    {
        'value': 16,
        'description': 'unspecified (16)'
    },
    {
        'value': 17,
        'description': 'unspecified (17)'
    },
    {
        'value': 18,
        'description': 'unspecified (18)'
    },
    {
        'value': 19,
        'description': 'unspecified (19)'
    },
    {
        'value': 20,
        'description': 'Wing in ground (WIG), all ships of this type'
    },
    {
        'value': 21,
        'description': 'Wing in ground (WIG), Hazardous catagory A'
    },
    {
        'value': 22,
        'description': 'Wing in ground (WIG), Hazardous catagory B'
    },
    {
        'value': 23,
        'description': 'Wing in ground (WIG), Hazardous catagory C'
    },
    {
        'value': 24,
        'description': 'Wing in ground (WIG), Hazardous catagory D'
    },
    {
        'value': 25,
        'description': 'Wing in ground (WIG), Reserved for future use'
    },
    {
        'value': 26,
        'description': 'Wing in ground (WIG), Reserved for future use'
    },
    {
        'value': 27,
        'description': 'Wing in ground (WIG), Reserved for future use'
    },
    {
        'value': 28,
        'description': 'Wing in ground (WIG), Reserved for future use'
    },
    {
        'value': 29,
        'description': 'Wing in ground (WIG), No additional information'
    },
    {
        'value': 30,
        'description': 'fishing'
    },
    {
        'value': 31,
        'description': 'towing'
    },
    {
        'value': 32,
        'description': 'towing length exceeds 200m or breadth exceeds 25m'
    },
    {
        'value': 33,
        'description': 'dredging or underwater ops'
    },
    {
        'value': 34,
        'description': 'diving ops'
    },
    {
        'value': 35,
        'description': 'military ops'
    },
    {
        'value': 36,
        'description': 'sailing'
    },
    {
        'value': 37,
        'description': 'pleasure craft'
    },
    {
        'value': 38,
        'description': 'reserved'
    },
    {
        'value': 39,
        'description': 'reserved'
    },
    {
        'value': 40,
        'description': 'High speed craft (HSC), all ships of this type'
    },
    {
        'value': 41,
        'description': 'High speed craft (HSC), Hazardous catagory A'
    },
    {
        'value': 42,
        'description': 'High speed craft (HSC), Hazardous catagory B'
    },
    {
        'value': 43,
        'description': 'High speed craft (HSC), Hazardous catagory C'
    },
    {
        'value': 44,
        'description': 'High speed craft (HSC), Hazardous catagory D'
    },
    {
        'value': 45,
        'description': 'High speed craft (HSC), Reserved for future use'
    },
    {
        'value': 46,
        'description': 'High speed craft (HSC), Reserved for future use'
    },
    {
        'value': 47,
        'description': 'High speed craft (HSC), Reserved for future use'
    },
    {
        'value': 48,
        'description': 'High speed craft (HSC), Reserved for future use'
    },
    {
        'value': 49,
        'description': 'High speed craft (HSC), No additional information'
    },
    {
        'value': 50,
        'description': 'pilot vessel'
    },
    {
        'value': 51,
        'description': 'search and rescue vessel'
    },
    {
        'value': 52,
        'description': 'tug'
    },
    {
        'value': 53,
        'description': 'port tender'
    },
    {
        'value': 54,
        'description': 'anti-polution equipment'
    },
    {
        'value': 55,
        'description': 'law enforcement'
    },
    {
        'value': 56,
        'description': 'spare - local vessel'
    },
    {
        'value': 57,
        'description': 'spare - local vessel'
    },
    {
        'value': 58,
        'description': 'medical transport'
    },
    {
        'value': 59,
        'description': 'ship according to RR Resolution No. 18'
    },
    {
        'value': 60,
        'description': 'passenger, all ships of this type'
    },
    {
        'value': 61,
        'description': 'passenger, Hazardous catagory A'
    },
    {
        'value': 62,
        'description': 'passenger, Hazardous catagory B'
    },
    {
        'value': 63,
        'description': 'passenger, Hazardous catagory C'
    },
    {
        'value': 64,
        'description': 'passenger, Hazardous catagory D'
    },
    {
        'value': 65,
        'description': 'passenger, Reserved for future use'
    },
    {
        'value': 66,
        'description': 'passenger, Reserved for future use'
    },
    {
        'value': 67,
        'description': 'passenger, Reserved for future use'
    },
    {
        'value': 68,
        'description': 'passenger, Reserved for future use'
    },
    {
        'value': 69,
        'description': 'passenger, No additional information'
    },
    {
        'value': 70,
        'description': 'cargo, all ships of this type'
    },
    {
        'value': 71,
        'description': 'cargo, Hazardous catagory A'
    },
    {
        'value': 72,
        'description': 'cargo, Hazardous catagory B'
    },
    {
        'value': 73,
        'description': 'cargo, Hazardous catagory C'
    },
    {
        'value': 74,
        'description': 'cargo, Hazardous catagory D'
    },
    {
        'value': 75,
        'description': 'cargo, Reserved for future use'
    },
    {
        'value': 76,
        'description': 'cargo, Reserved for future use'
    },
    {
        'value': 77,
        'description': 'cargo, Reserved for future use'
    },
    {
        'value': 78,
        'description': 'cargo, Reserved for future use'
    },
    {
        'value': 79,
        'description': 'cargo, No additional information'
    },
    {
        'value': 80,
        'description': 'tanker, all ships of this type'
    },
    {
        'value': 81,
        'description': 'tanker, Hazardous catagory A'
    },
    {
        'value': 82,
        'description': 'tanker, Hazardous catagory B'
    },
    {
        'value': 83,
        'description': 'tanker, Hazardous catagory C'
    },
    {
        'value': 84,
        'description': 'tanker, Hazardous catagory D'
    },
    {
        'value': 85,
        'description': 'tanker, Reserved for future use'
    },
    {
        'value': 86,
        'description': 'tanker, Reserved for future use'
    },
    {
        'value': 87,
        'description': 'tanker, Reserved for future use'
    },
    {
        'value': 88,
        'description': 'tanker, Reserved for future use'
    },
    {
        'value': 89,
        'description': 'tanker, No additional information'
    },
    {
        'value': 90,
        'description': 'other type, all ships of this type'
    },
    {
        'value': 91,
        'description': 'other type, Hazardous catagory A'
    },
    {
        'value': 92,
        'description': 'other type, Hazardous catagory B'
    },
    {
        'value': 93,
        'description': 'other type, Hazardous catagory C'
    },
    {
        'value': 94,
        'description': 'other type, Hazardous catagory D'
    },
    {
        'value': 95,
        'description': 'other type, Reserved for future use'
    },
    {
        'value': 96,
        'description': 'other type, Reserved for future use'
    },
    {
        'value': 97,
        'description': 'other type, Reserved for future use'
    },
    {
        'value': 98,
        'description': 'other type, Reserved for future use'
    },
    {
        'value': 99,
        'description': 'other type, No additional information'
    }
]

export const DraughtLookup: INmeaLookup[] = [
    {
        'value': 0,
        'description': 'unavailable'
    },
    {
        'value': 25.5,
        'description': '25.5 m or greater'
    }
]

export const PositionTypeLookup: INmeaLookup[] = [
    {
        'value': 0,
        'description': 'unavailable'
    },
    {
        'value': 1,
        'description': 'GPS'
    },
    {
        'value': 2,
        'description': 'GLONASS'
    },
    {
        'value': 3,
        'description': 'combined GPS/GLONASS'
    },
    {
        'value': 4,
        'description': 'Loran-C'
    },
    {
        'value': 5,
        'description': 'Chayka'
    },
    {
        'value': 6,
        'description': 'integrated navigation system'
    },
    {
        'value': 7,
        'description': 'surveyed'
    },
    {
        'value': 15,
        'description': 'internal GNSS'
    }
]