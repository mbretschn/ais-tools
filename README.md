# AIS Tools

A toolset for receiving, dispatching and store AIVDM/AIVDO Protocol data.

### Installation
AIS Tools is published to npm and can be inported into a project as a dependency
```javascript
npm install ais-tools
```
### AIS Tools - One library for the Backend, Frontend and Dispatcher
The AIS Tools are basically a model system for processing and storing AIVDM/AIVDO reports which are distributed via AIS. The following tasks are involved:

#### Decode AIVDM/AIVDO Protocol Reports
The AIS Tools decode messages for Position Reports (Types 1,2,3) as well as Static and Voyage Related Data (Type 5) All other Data received is stored as default data for later processing.

#### Store AIS reports with MongoDB
MongoDB offers a mechanism where geo information can be processed and queried. This helps to reduce the messages sent to a frontend and reduces data stored in the database. Geo information data is basically stored, indexed and queried as GeoJSON.

#### Convert ship data and positions to GeoJSON objects
One aspect addressed in AIS Tools is to convert Position and Static Data Reports into GeoJSON objects. These operations help to display the shape of a vessel to its latest position on a Map and display the track of past positions of its voyage.

Further information about this project can be found here:
[AIS Tools - A library for AIS processing](https://blog.3epnm.de/2020/05/13/AIS-Tools/)
