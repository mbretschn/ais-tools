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

    Longitude: 'Longitude (East West location)',
    Latitude: 'Latitude (North South location)',
    ROT: 'Rate of turning',
    SOG: 'Speed over ground',
    COG: 'Course over ground',
    TrueHeading: 'True heading (relative to true North)',
    NavigationStatus: 'What is the vessel doing',
    PositionAccuracy: 'Accuracy of positioning fixes',
    TimeStampStatus: 'UTC second when the report was generated'
    // TimeStampReceived: 'UTC second when the report was received',
    // DistanceMoved:     'Distance from last known Position',
    // DerivedSpeed:      'Speed calculated from last known Position',
    // Sequence:          'Database Sequence'
}

export const NavigationStatusLookup: INmeaLookup[] = [
    {
        'value': 0,
        'description': "under way using engine"
    },
    {
        'value': 1,
        'description': "at anchor"
    },
    {
        'value': 2,
        'description': "not under command"
    },
    {
        'value': 3,
        'description': "restricted maneuverability"
    },
    {
        'value': 4,
        'description': "constrained by her draught"
    },
    {
        'value': 5,
        'description': "moored"
    },
    {
        'value': 6,
        'description': "aground"
    },
    {
        'value': 7,
        'description': "engaged in fishing"
    },
    {
        'value': 8,
        'description': "under way sailing"
    },
    {
        'value': 9,
        'description': "reserved for future use (hazmat)"
    },
    {
        'value': 10,
        'description': "reserved for future use"
    },
    {
        'value': 11,
        'description': "reserved for future use"
    },
    {
        'value': 12,
        'description': "reserved for future use"
    },
    {
        'value': 13,
        'description': "reserved for future use"
    },
    {
        'value': 14,
        'description': "reserved for future use"
    },
    {
        'value': 15,
        'description': "not defined = default"
    }
]

export const ROTLookup: INmeaLookup[] = [
    {
        'value': 127,
        'description': 'turning right > 5°/30s'
    },
    {
        'value': -127,
        'description': 'turning left > 5°/30s'
    },
    {
        'value': -128,
        'description': 'unavailable'
    }
]

export const SOGLookup: INmeaLookup[] = [
    {
        'value': 102.2,
        'description': '102.2 knots or higher'
    }
]

export const COGLookup: INmeaLookup[] = [
    {
        'value': 360,
        'description': 'unavailable'
    }
]

export const LongitudeLookup: INmeaLookup[] = [
    {
        'value': 181,
        'description': 'unavailable'
    }
]

export const LatitudeLookup: INmeaLookup[] = [
    {
        'value': 91,
        'description': 'unavailable'
    }
]

export const PositionAccuracyLookup: INmeaLookup[] = [
    {
        'value': 0,
        'description': 'low (greater than 10 m)'
    },
    {
        'value': 1,
        'description': 'high (less than 10 m)'
    }
]

export const TimeStampStatusLookup: INmeaLookup[] = [
    {
        'value': 60,
        'description': 'not available/default'
    },
    {
        'value': 61,
        'description': 'manual input'
    },
    {
        'value': 62,
        'description': 'dead reckoning'
    },
    {
        'value': 63,
        'description': 'inoperative'
    }
]

export const TrueHeadingLookup: INmeaLookup[] = [
    {
        'value': 511,
        'description': 'unavailable'
    }
]
