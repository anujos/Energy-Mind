import { AnomalyEvent, FloorData, PipelineGatewayMetric, TelemetryLogEntry, TelemetryPoint24h } from '../types';

export const INITIAL_ANOMALIES: AnomalyEvent[] = [
  {
    id: 'ANOM-4029',
    title: 'Chilled Water Bypass Valve Oscillating & Hunting',
    zoneId: 'fl3-cleanroom',
    floorId: 3,
    timeString: '14:15',
    timeIndex: 57,
    severity: 'critical',
    system: 'HVAC',
    summary: 'Secondary chilled water 3-way mixing valve (CHW-VLV-302) cycling between 12% and 94% stroke at 45-second intervals, inducing 38 kW thermal churn.',
    detectedDelta: '+38.4 kW parasitic pump & chiller load',
    financialImpactPerHour: 48.6,
    carbonImpactPerHour: 22.8,
  },
  {
    id: 'ANOM-1082',
    title: 'Rooftop Inverter Array #3 String Degradation & Clipping',
    zoneId: 'fl4-solar-room',
    floorId: 4,
    timeString: '11:45',
    timeIndex: 47,
    severity: 'warning',
    system: 'Solar/BESS',
    summary: 'String Combiner Box #3 DC current dropped 42% despite peak GHI irradiance of 890 W/m². Potential DC isolator thermal trip or rapid soiling.',
    detectedDelta: '-62.0 kW clean generation deficit',
    financialImpactPerHour: 34.2,
    carbonImpactPerHour: 39.5,
  },
  {
    id: 'ANOM-9014',
    title: 'Off-Hours Vampire Basal Load Spike in Engineering Wing',
    zoneId: 'fl2-engineering',
    floorId: 2,
    timeString: '03:15',
    timeIndex: 13,
    severity: 'optimization',
    system: 'Occupancy',
    summary: 'PIR sensors detect 0 occupants, yet circuit branch PNL-2A active draw is 28.5 kW (normally 4.2 kW off-peak). Automated workstation sleep policy bypassed.',
    detectedDelta: '+24.3 kW ghost compute load',
    financialImpactPerHour: 11.5,
    carbonImpactPerHour: 14.1,
  },
  {
    id: 'ANOM-6031',
    title: 'Auditorium Microclimate CO2 Accumulation vs Fixed Damper',
    zoneId: 'fl1-auditorium',
    floorId: 1,
    timeString: '16:30',
    timeIndex: 66,
    severity: 'warning',
    system: 'Weather',
    summary: 'Occupancy headcount surged to 184 persons during unannounced townhall. Outdoor air damper locked at minimum 15% static limit; CO2 reached 1,420 ppm.',
    detectedDelta: 'IAQ Deficit + 920 ppm excess CO2',
    financialImpactPerHour: 18.0,
    carbonImpactPerHour: 8.5,
  },
  {
    id: 'ANOM-7720',
    title: 'Predicted Peak Tariff Threshold Exceedance (Demand Charge Risk)',
    zoneId: 'fl4-chiller-plant',
    floorId: 4,
    timeString: '15:15',
    timeIndex: 61,
    severity: 'critical',
    system: 'Solar/BESS',
    summary: 'Concurrent chiller staging and 40 EV fleet fast-chargers will breach 1,200 kW utility ratchet threshold in 25 mins without BESS discharge dispatch.',
    detectedDelta: 'Projected +$4,200 monthly peak penalty',
    financialImpactPerHour: 120.0,
    carbonImpactPerHour: 55.0,
  },
];

export const BUILDING_FLOORS: FloorData[] = [
  {
    id: 1,
    name: 'Floor 1 — Atrium & Public Spaces',
    shortName: 'Level 1: Public Hub',
    description: 'High-ceiling glass atrium, 250-seat auditorium, dining facilities, and security logistics.',
    totalAreaSqM: 3200,
    zones: [
      {
        id: 'fl1-atrium',
        name: 'Grand Glass Atrium',
        floor: 1,
        areaSqM: 950,
        temperatureC: 23.4,
        targetTempC: 23.0,
        humidityPct: 48,
        co2Ppm: 580,
        powerKw: 42.5,
        powerDensityWPerSqM: 44.7,
        occupancyCount: 46,
        occupancyCapacity: 120,
        vavDamperPct: 55,
        lightingLux: 680,
        status: 'normal',
        coordinates: { x: 10, y: 15, w: 42, h: 32 },
      },
      {
        id: 'fl1-auditorium',
        name: 'Symposium Auditorium',
        floor: 1,
        areaSqM: 800,
        temperatureC: 25.8,
        targetTempC: 22.5,
        humidityPct: 62,
        co2Ppm: 1420,
        powerKw: 68.2,
        powerDensityWPerSqM: 85.2,
        occupancyCount: 184,
        occupancyCapacity: 250,
        vavDamperPct: 15,
        lightingLux: 450,
        status: 'warning',
        activeAlert: 'CO2 threshold spike (1,420 ppm) - Damper locked at 15%',
        coordinates: { x: 55, y: 15, w: 35, h: 32 },
      },
      {
        id: 'fl1-cafe',
        name: 'Bistro & Culinary Zone',
        floor: 1,
        areaSqM: 650,
        temperatureC: 22.8,
        targetTempC: 22.0,
        humidityPct: 54,
        co2Ppm: 690,
        powerKw: 55.4,
        powerDensityWPerSqM: 85.2,
        occupancyCount: 38,
        occupancyCapacity: 90,
        vavDamperPct: 65,
        lightingLux: 420,
        status: 'normal',
        coordinates: { x: 10, y: 52, w: 38, h: 36 },
      },
      {
        id: 'fl1-logistics',
        name: 'Loading Bay & Facility Staging',
        floor: 1,
        areaSqM: 800,
        temperatureC: 21.2,
        targetTempC: 21.0,
        humidityPct: 45,
        co2Ppm: 460,
        powerKw: 22.1,
        powerDensityWPerSqM: 27.6,
        occupancyCount: 8,
        occupancyCapacity: 30,
        vavDamperPct: 30,
        lightingLux: 310,
        status: 'normal',
        coordinates: { x: 52, y: 52, w: 38, h: 36 },
      },
    ],
  },
  {
    id: 2,
    name: 'Floor 2 — Engineering & Workspace',
    shortName: 'Level 2: Office & Exec',
    description: 'Open-plan agile engineering suites, conference rooms, focus booths, and executive boardrooms.',
    totalAreaSqM: 3400,
    zones: [
      {
        id: 'fl2-engineering',
        name: 'North Engineering Hub',
        floor: 2,
        areaSqM: 1200,
        temperatureC: 22.6,
        targetTempC: 22.5,
        humidityPct: 44,
        co2Ppm: 610,
        powerKw: 74.8,
        powerDensityWPerSqM: 62.3,
        occupancyCount: 92,
        occupancyCapacity: 140,
        vavDamperPct: 58,
        lightingLux: 510,
        status: 'normal',
        activeAlert: 'Nighttime vampire load pattern identified on panel PNL-2A',
        coordinates: { x: 8, y: 12, w: 44, h: 38 },
      },
      {
        id: 'fl2-boardroom',
        name: 'Executive Boardroom',
        floor: 2,
        areaSqM: 450,
        temperatureC: 21.9,
        targetTempC: 22.0,
        humidityPct: 42,
        co2Ppm: 520,
        powerKw: 18.2,
        powerDensityWPerSqM: 40.4,
        occupancyCount: 14,
        occupancyCapacity: 28,
        vavDamperPct: 40,
        lightingLux: 480,
        status: 'normal',
        coordinates: { x: 55, y: 12, w: 37, h: 38 },
      },
      {
        id: 'fl2-collab',
        name: 'Design & Collaboration Pods',
        floor: 2,
        areaSqM: 950,
        temperatureC: 23.1,
        targetTempC: 22.5,
        humidityPct: 46,
        co2Ppm: 630,
        powerKw: 38.0,
        powerDensityWPerSqM: 40.0,
        occupancyCount: 42,
        occupancyCapacity: 80,
        vavDamperPct: 50,
        lightingLux: 460,
        status: 'normal',
        coordinates: { x: 8, y: 54, w: 44, h: 34 },
      },
      {
        id: 'fl2-wellness',
        name: 'Quiet Zone & Wellness Lounge',
        floor: 2,
        areaSqM: 800,
        temperatureC: 22.2,
        targetTempC: 22.5,
        humidityPct: 45,
        co2Ppm: 480,
        powerKw: 14.5,
        powerDensityWPerSqM: 18.1,
        occupancyCount: 11,
        occupancyCapacity: 45,
        vavDamperPct: 35,
        lightingLux: 290,
        status: 'normal',
        coordinates: { x: 55, y: 54, w: 37, h: 34 },
      },
    ],
  },
  {
    id: 3,
    name: 'Floor 3 — Research Labs & HPC Center',
    shortName: 'Level 3: Research & HPC',
    description: 'High-density computational clusters, ISO-6 cleanroom suites, and advanced hardware testing cells.',
    totalAreaSqM: 3100,
    zones: [
      {
        id: 'fl3-datacenter',
        name: 'HPC AI Compute Cluster',
        floor: 3,
        areaSqM: 700,
        temperatureC: 20.8,
        targetTempC: 20.0,
        humidityPct: 40,
        co2Ppm: 410,
        powerKw: 245.0,
        powerDensityWPerSqM: 350.0,
        occupancyCount: 4,
        occupancyCapacity: 12,
        vavDamperPct: 92,
        lightingLux: 350,
        status: 'normal',
        coordinates: { x: 10, y: 12, w: 42, h: 40 },
      },
      {
        id: 'fl3-cleanroom',
        name: 'Nanotech Cleanroom ISO-6',
        floor: 3,
        areaSqM: 850,
        temperatureC: 24.9,
        targetTempC: 21.0,
        humidityPct: 58,
        co2Ppm: 540,
        powerKw: 142.6,
        powerDensityWPerSqM: 167.7,
        occupancyCount: 12,
        occupancyCapacity: 25,
        vavDamperPct: 88,
        lightingLux: 800,
        status: 'critical',
        activeAlert: 'Valve hunting +38 kW thermal churn. Temp rising towards safety limit!',
        coordinates: { x: 55, y: 12, w: 37, h: 40 },
      },
      {
        id: 'fl3-hardware',
        name: 'Hardware Prototyping Bay',
        floor: 3,
        areaSqM: 900,
        temperatureC: 22.7,
        targetTempC: 22.0,
        humidityPct: 43,
        co2Ppm: 510,
        powerKw: 68.3,
        powerDensityWPerSqM: 75.8,
        occupancyCount: 22,
        occupancyCapacity: 50,
        vavDamperPct: 60,
        lightingLux: 520,
        status: 'normal',
        coordinates: { x: 10, y: 55, w: 42, h: 33 },
      },
      {
        id: 'fl3-metrology',
        name: 'Metrology & Optical Testing',
        floor: 3,
        areaSqM: 650,
        temperatureC: 21.4,
        targetTempC: 21.5,
        humidityPct: 42,
        co2Ppm: 430,
        powerKw: 28.5,
        powerDensityWPerSqM: 43.8,
        occupancyCount: 6,
        occupancyCapacity: 18,
        vavDamperPct: 45,
        lightingLux: 600,
        status: 'normal',
        coordinates: { x: 55, y: 55, w: 37, h: 33 },
      },
    ],
  },
  {
    id: 4,
    name: 'Floor 4 / Penthouse — Energy Plant & Solar Array',
    shortName: 'Level 4: Plant & Rooftop',
    description: 'Central water-cooled chillers, cooling towers, BESS battery storage, and 450kWp rooftop solar PV.',
    totalAreaSqM: 2800,
    zones: [
      {
        id: 'fl4-chiller-plant',
        name: 'Central Chiller & Pump Plant',
        floor: 4,
        areaSqM: 850,
        temperatureC: 26.2,
        targetTempC: 25.0,
        humidityPct: 52,
        co2Ppm: 420,
        powerKw: 312.0,
        powerDensityWPerSqM: 367.0,
        occupancyCount: 2,
        occupancyCapacity: 10,
        vavDamperPct: 75,
        lightingLux: 300,
        status: 'warning',
        activeAlert: 'High demand period: Approaching 1,200 kW billing threshold',
        coordinates: { x: 8, y: 14, w: 44, h: 38 },
      },
      {
        id: 'fl4-solar-room',
        name: 'Solar Inverters & BESS 1.2MWh',
        floor: 4,
        areaSqM: 700,
        temperatureC: 24.5,
        targetTempC: 23.0,
        humidityPct: 38,
        co2Ppm: 390,
        powerKw: 48.0,
        powerDensityWPerSqM: 68.5,
        occupancyCount: 1,
        occupancyCapacity: 8,
        vavDamperPct: 60,
        lightingLux: 320,
        status: 'warning',
        activeAlert: 'Inverter #3 string current down 42% (generation loss)',
        coordinates: { x: 55, y: 14, w: 37, h: 38 },
      },
      {
        id: 'fl4-cooling-towers',
        name: 'Cooling Towers Station',
        floor: 4,
        areaSqM: 650,
        temperatureC: 28.1,
        targetTempC: 27.0,
        humidityPct: 78,
        co2Ppm: 400,
        powerKw: 58.2,
        powerDensityWPerSqM: 89.5,
        occupancyCount: 0,
        occupancyCapacity: 6,
        vavDamperPct: 100,
        lightingLux: 200,
        status: 'normal',
        coordinates: { x: 8, y: 55, w: 44, h: 33 },
      },
      {
        id: 'fl4-air-handlers',
        name: 'Primary AHU Fan Deck',
        floor: 4,
        areaSqM: 600,
        temperatureC: 23.0,
        targetTempC: 22.0,
        humidityPct: 48,
        co2Ppm: 410,
        powerKw: 64.0,
        powerDensityWPerSqM: 106.6,
        occupancyCount: 1,
        occupancyCapacity: 6,
        vavDamperPct: 80,
        lightingLux: 340,
        status: 'normal',
        coordinates: { x: 55, y: 55, w: 37, h: 33 },
      },
    ],
  },
];

// Generate 96 points (24 hours in 15-minute increments)
export function generate24hTelemetry(): TelemetryPoint24h[] {
  const points: TelemetryPoint24h[] = [];

  for (let i = 0; i < 96; i++) {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const normalizedHour = hour + minute / 60;

    // Ambient temperature curve (minimum 18C at 05:00, peak 33C at 15:00)
    const ambientTemp = 18 + 15 * Math.sin(((normalizedHour - 5) / 19) * Math.PI);

    // Diurnal base load shape
    // Night base is ~240 kW; Day work hours ramp up to ~920 kW
    let workdayFactor = 0;
    if (normalizedHour >= 6 && normalizedHour <= 19) {
      workdayFactor = Math.sin(((normalizedHour - 6) / 13) * Math.PI);
    }

    const itLabs = 210 + Math.sin(normalizedHour) * 15; // Constant high baseline
    const lighting = normalizedHour >= 7 && normalizedHour <= 20 ? 85 + workdayFactor * 40 : 18;
    const plugLoads = normalizedHour >= 8 && normalizedHour <= 18 ? 120 + workdayFactor * 65 : 35;
    const evFleet =
      normalizedHour >= 8.5 && normalizedHour <= 10.5
        ? 95 + Math.random() * 20
        : normalizedHour >= 16.5 && normalizedHour <= 18.5
        ? 65 + Math.random() * 15
        : 10;

    // Chillers respond to ambient heat + occupant load
    const chillers =
      normalizedHour < 6
        ? 80 + Math.random() * 10
        : 180 + Math.pow(workdayFactor, 1.3) * 260 + (ambientTemp - 20) * 14;

    const ahuFans = normalizedHour < 6 ? 45 : 95 + workdayFactor * 45;

    // Solar PV generation (peaks around 13:00 up to 380 kW)
    let solarGen = 0;
    if (normalizedHour >= 6.5 && normalizedHour <= 18.5) {
      const solarFactor = Math.sin(((normalizedHour - 6.5) / 12) * Math.PI);
      solarGen = Math.max(0, Math.pow(solarFactor, 1.4) * 385);

      // Add slight cloud intermittency or anomaly dip around 11:30 - 12:30
      if (normalizedHour >= 11.5 && normalizedHour <= 12.5) {
        solarGen *= 0.68; // Inverter #3 dip
      }
    }

    // Tariff structures
    let tariffRate = 0.12; // off-peak default
    let tariffType: 'off-peak' | 'shoulder' | 'critical-peak' = 'off-peak';

    if (normalizedHour >= 8 && normalizedHour < 14) {
      tariffRate = 0.28;
      tariffType = 'shoulder';
    } else if (normalizedHour >= 14 && normalizedHour < 19) {
      tariffRate = 0.65;
      tariffType = 'critical-peak';
    } else if (normalizedHour >= 19 && normalizedHour < 22) {
      tariffRate = 0.28;
      tariffType = 'shoulder';
    }

    // Battery dispatch strategy (Arbitrage & Peak Shaving)
    // Charge during cheap off-peak/solar (negative batteryKw)
    // Discharge during critical peak 14:00-18:00 (positive batteryKw)
    let batteryKw = 0;
    if (normalizedHour >= 1 && normalizedHour <= 5) {
      batteryKw = -60; // slow grid charge
    } else if (solarGen > 300 && normalizedHour < 14) {
      batteryKw = -110; // absorb excess solar
    } else if (tariffType === 'critical-peak' && normalizedHour >= 14.5 && normalizedHour <= 17.5) {
      batteryKw = 145; // peak shave
    }

    const baseline = 240 + workdayFactor * 540 + (ambientTemp > 24 ? (ambientTemp - 24) * 20 : 0);

    let totalLoad = itLabs + lighting + plugLoads + evFleet + chillers + ahuFans;

    // Inject anomaly spike at 14:15 (index 57)
    if (i >= 56 && i <= 60) {
      totalLoad += 42; // Chilled water valve hunting
    }
    // Inject night anomaly at 03:15 (index 13)
    if (i >= 11 && i <= 16) {
      totalLoad += 26; // Vampire plug load
    }

    const predicted = baseline * 0.98 + (i % 3 === 0 ? 8 : -6);

    const pointAnomalies = INITIAL_ANOMALIES.filter((a) => a.timeIndex === i);

    points.push({
      time: timeStr,
      index: i,
      totalLoadKw: Math.round(totalLoad * 10) / 10,
      baselineKw: Math.round(baseline * 10) / 10,
      predictedKw: Math.round(predicted * 10) / 10,
      solarGenKw: Math.round(solarGen * 10) / 10,
      batteryKw: Math.round(batteryKw * 10) / 10,
      chillersKw: Math.round(chillers * 10) / 10,
      ahuFanskW: Math.round(ahuFans * 10) / 10,
      lightingKw: Math.round(lighting * 10) / 10,
      itLabsKw: Math.round(itLabs * 10) / 10,
      evFleetKw: Math.round(evFleet * 10) / 10,
      plugLoadsKw: Math.round(plugLoads * 10) / 10,
      ambientTempC: Math.round(ambientTemp * 10) / 10,
      gridTariffRate: tariffRate,
      tariffType,
      anomalies: pointAnomalies,
    });
  }

  return points;
}

export const PIPELINE_GATEWAYS: PipelineGatewayMetric[] = [
  {
    protocol: 'BACnet/IP',
    status: 'healthy',
    messagesPerSec: 1840,
    packetLossPct: 0.02,
    latencyMs: 14,
    nodesOnline: 412,
    nodesTotal: 415,
  },
  {
    protocol: 'Modbus TCP',
    status: 'healthy',
    messagesPerSec: 920,
    packetLossPct: 0.05,
    latencyMs: 8,
    nodesOnline: 186,
    nodesTotal: 186,
  },
  {
    protocol: 'MQTT Sparkplug B',
    status: 'healthy',
    messagesPerSec: 2450,
    packetLossPct: 0.01,
    latencyMs: 12,
    nodesOnline: 748,
    nodesTotal: 750,
  },
  {
    protocol: 'LoRaWAN',
    status: 'degraded',
    messagesPerSec: 120,
    packetLossPct: 1.4,
    latencyMs: 145,
    nodesOnline: 88,
    nodesTotal: 96,
  },
];

export const INITIAL_LOGS: TelemetryLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '14:15:32',
    protocol: 'BACnet/IP',
    topicOrAddress: 'DEV_304/ANALOG_VALUE_42 (CHW_VALVE_POS)',
    payloadPreview: '{ strokePct: 94.2, setpoint: 45.0, rateOfChange: +14%/s }',
    severity: 'error',
  },
  {
    id: 'log-2',
    timestamp: '14:15:30',
    protocol: 'MQTT Sparkplug B',
    topicOrAddress: 'spBv1.0/BMS/DDATA/FL3_LABS/METER_MAIN',
    payloadPreview: '{ activePowerKw: 142.6, reactivePowerKvar: 34.1, pf: 0.97 }',
    severity: 'warn',
  },
  {
    id: 'log-3',
    timestamp: '14:15:28',
    protocol: 'Modbus TCP',
    topicOrAddress: 'REG_40102: CHILLER_2_EVAP_PRESSURE',
    payloadPreview: '{ evapPressurePsi: 58.4, returnTempC: 13.8, supplyTempC: 6.9 }',
    severity: 'ok',
  },
  {
    id: 'log-4',
    timestamp: '14:15:25',
    protocol: 'BACnet/IP',
    topicOrAddress: 'DEV_102/ANALOG_INPUT_18 (ZONE_CO2_PPM)',
    payloadPreview: '{ val: 1420.0, unit: "ppm", quality: "GOOD" }',
    severity: 'warn',
  },
  {
    id: 'log-5',
    timestamp: '14:15:20',
    protocol: 'MQTT Sparkplug B',
    topicOrAddress: 'spBv1.0/ENERGY/DDATA/ROOF_SOLAR/INV_03',
    payloadPreview: '{ dcVolts: 640.2, dcAmps: 18.4, eff: 0.62, flag: "DERATED" }',
    severity: 'error',
  },
  {
    id: 'log-6',
    timestamp: '14:15:15',
    protocol: 'LoRaWAN',
    topicOrAddress: 'EUID_70B3D57ED0054A/PORT_2',
    payloadPreview: '{ pirMotion: 0, ambientLux: 12, batteryMv: 3240 }',
    severity: 'info',
  },
];
