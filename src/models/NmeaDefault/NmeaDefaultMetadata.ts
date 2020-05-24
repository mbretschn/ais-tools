import { INmeaFieldDescriptions } from '../AbstractNmea/INmea'

export const Description: INmeaFieldDescriptions = {
    _id: 'ObjectID',
    AIS: 'AIS message number',
    Channel: 'Chanel on which the Messages was send',
    MMSI: 'Unique ship identification number (MMSI)',
    TimeStamp: 'Received at (UTC)',
    CreatedAt: 'Created at (UTC)',
    CreatedBy: 'Created By',
    Sender: 'Sender'
}