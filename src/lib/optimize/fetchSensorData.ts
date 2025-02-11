// src/lib/optimize/fetchSensorData.ts
import { format } from "date-fns";
import { sensorsService } from "lib/services/sensor.service";
import { MainReadingData } from "lib/types/environment";
import { SensorValue } from "lib/types/sensor";

  const fetchSensorData = async (sensorSN: string, startDate: Date, endDate: Date, isDateRangeSelected: boolean = false) => {
    const valuesResponse = await sensorsService.getSensorValues(sensorSN, startDate, endDate);
    
    if (!valuesResponse.success || !valuesResponse.sensorvalue?.length) {
      throw new Error('No sensor data available');
    }
  
    const allReadings = valuesResponse.sensorvalue.sort((a: SensorValue, b: SensorValue) => 
      new Date(b.CreateDateTime).getTime() - new Date(a.CreateDateTime).getTime()
    )
  
    const mostRecentReading = allReadings[0];
    const mostRecentTime = new Date(mostRecentReading.CreateDateTime);
    const fourHoursBeforeMostRecent = new Date(mostRecentTime.getTime() - (4 * 60 * 60 * 1000));
  
    const filteredReadings = isDateRangeSelected
      ? allReadings.filter((reading: { CreateDateTime: string | number | Date; }) => {
          const readingTime = new Date(reading.CreateDateTime);
          const rangeStartTime = new Date(startDate);
          rangeStartTime.setHours(0, 0, 0, 0);
          const rangeEndTime = new Date(endDate);
          rangeEndTime.setHours(23, 59, 59, 999);
          return readingTime >= rangeStartTime && readingTime <= rangeEndTime;
        })
      : allReadings.filter((reading: { CreateDateTime: string | number | Date; }) => {
          const readingTime = new Date(reading.CreateDateTime);
          return readingTime >= fourHoursBeforeMostRecent && readingTime <= mostRecentTime;
        });
  
    if (filteredReadings.length === 0) {
      throw new Error('No data available for selected time range');
    }
  
    const readings = filteredReadings
      .map((reading: { SENSORDATAJSON: string; CreateDateTime: string | number | Date; }) => {
        const parsed = JSON.parse(reading.SENSORDATAJSON);
        const readingDateTime = new Date(reading.CreateDateTime);
        
        return {
          time: format(readingDateTime, isDateRangeSelected ? 'MMM dd HH:mm' : 'HH:mm'),
          temp: parsed.AirTemp,
          humidity: parsed.AirHum,
          vpd: parsed.AirVPD,
          co2: parsed.AirCO2
        } as MainReadingData;
      })
      .sort((a: { time: string | number | Date; }, b: { time: string | number | Date; }) => new Date(a.time).getTime() - new Date(b.time).getTime())
      
    return {
      sensorData: JSON.parse(allReadings[0].SENSORDATAJSON),
      chartData: {
        months: readings.map((r: { time: MainReadingData; }) => r.time),
        tempData: readings.map((r: { temp: MainReadingData; }) => r.temp),
        humidityData: readings.map((r: { humidity: MainReadingData; }) => r.humidity),
        vpdData: readings.map((r: { vpd: MainReadingData; }) => r.vpd),
        co2Data: readings.map((r: { co2: MainReadingData; }) => r.co2)
      },
      historicalData: allReadings
    };
  };

  export default fetchSensorData;