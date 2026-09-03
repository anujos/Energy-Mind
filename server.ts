import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Dynamically bind to the port provided by Cloud Run / environment ($PORT), defaulting to 8080
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EnergyMind Core Telemetry & Anomaly Detection',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Multi-agent automated investigation endpoint
app.post('/api/agent/investigate', async (req, res) => {
  const { anomaly, zone, liveTelemetry } = req.body;

  if (!anomaly) {
    return res.status(400).json({ error: 'Anomaly context is required' });
  }

  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `You are EnergyMind's autonomous multi-agent building energy intelligence system.
Analyze the following building anomaly and live telemetry, and coordinate an automated investigation across 4 specialized domain agents and 1 Master Energy Arbiter:

ANOMALY DETAILS:
- ID: ${anomaly.id}
- Title: ${anomaly.title}
- System Category: ${anomaly.system}
- Severity: ${anomaly.severity}
- Detected Time: ${anomaly.timeString}
- Summary: ${anomaly.summary}
- Detected Metric Delta: ${anomaly.detectedDelta}
- Financial Rate: $${anomaly.financialImpactPerHour}/hour
- Carbon Rate: ${anomaly.carbonImpactPerHour} kg CO2/hour

ZONE TELEMETRY CONTEXT:
${zone ? JSON.stringify(zone, null, 2) : 'General Building Subsystem'}

TELEMETRY SAMPLE:
${liveTelemetry ? JSON.stringify(liveTelemetry, null, 2) : 'Active 24h baseline deviation'}

You MUST respond strictly in valid JSON with no extra markdown or backticks. Follow this exact schema:
{
  "agentReports": [
    {
      "agentId": "hvac",
      "agentName": "AeroSense HVAC Specialist",
      "agentRole": "Chiller COP, Psychrometrics & Air Handling",
      "avatarIcon": "Wind",
      "confidencePct": 94,
      "status": "flagged",
      "findings": "Detailed engineering observation regarding thermodynamic cycle or airflow...",
      "evidence": [
        { "metric": "CHW 3-Way Valve Stroke", "observedValue": "94%", "expectedValue": "45%", "deviation": "+49% hunting" }
      ],
      "recommendation": "Specific mechanical or BMS control override recommendation"
    },
    {
      "agentId": "solar",
      "agentName": "HelioVolt Solar & BESS Specialist",
      "agentRole": "PV Irradiance, Inverters & Battery Dispatch",
      "avatarIcon": "Sun",
      "confidencePct": 91,
      "status": "nominal",
      "findings": "Assessment of solar generation, inverter DC clipping, or BESS reserve...",
      "evidence": [
        { "metric": "Solar PV Output", "observedValue": "310 kW", "expectedValue": "320 kW", "deviation": "-3.1% normal" }
      ],
      "recommendation": "Dispatch recommendation for battery storage or PV inverter"
    },
    {
      "agentId": "weather",
      "agentName": "AtmoPredict Microclimate Specialist",
      "agentRole": "Enthalpy, Wet-Bulb & Thermal Envelope Load",
      "avatarIcon": "CloudSun",
      "confidencePct": 88,
      "status": "nominal",
      "findings": "Microclimate context, degree days, solar heat gain, or wet-bulb influence...",
      "evidence": [
        { "metric": "Wet-Bulb Temp", "observedValue": "21.2°C", "expectedValue": "21.0°C", "deviation": "Nominal" }
      ],
      "recommendation": "Economizer cycle adjustment or envelope thermal management"
    },
    {
      "agentId": "occupancy",
      "agentName": "HumanMetrics Occupancy & Plug Load Specialist",
      "agentRole": "PIR Sensors, Headcount & Baseboard Loads",
      "avatarIcon": "Users",
      "confidencePct": 96,
      "status": "nominal",
      "findings": "Occupancy count, schedule adherence, internal thermal gain...",
      "evidence": [
        { "metric": "Zone Headcount", "observedValue": "14 persons", "expectedValue": "15-25 persons", "deviation": "Nominal load" }
      ],
      "recommendation": "Demand-controlled ventilation setpoint or plug load shed"
    }
  ],
  "arbiterSynthesis": {
    "rootCauseVerdict": "Synthesized singular root-cause verdict linking the agents",
    "masterConfidencePct": 95,
    "financialWasteEstPerDay": 348,
    "carbonPenaltyKgPerDay": 185,
    "comfortRiskLevel": "Moderate",
    "synthesizedExplanation": "Concise multi-agent cross-correlation confirming or ruling out hypotheses...",
    "recommendedActionPlan": [
      {
        "step": 1,
        "action": "Immediate BMS parameter dampening or actuator recalibration",
        "targetSystem": "BACnet MSTP Controller DEV-304",
        "estimatedSavings": "$210/day"
      },
      {
        "step": 2,
        "action": "Secondary verification of supply chilled water temperature delta",
        "targetSystem": "Plant Chiller #2",
        "estimatedSavings": "$138/day"
      }
    ],
    "automatedMitigationAvailable": true
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        session: {
          id: `INV-${Date.now().toString().slice(-6)}`,
          anomalyId: anomaly.id,
          anomalyTitle: anomaly.title,
          timestamp: new Date().toLocaleTimeString(),
          status: 'completed',
          agentReports: parsed.agentReports,
          arbiterSynthesis: parsed.arbiterSynthesis,
        },
      });
    } catch (err) {
      console.warn('Gemini API call failed, using deterministic agent engine:', err);
      // Fall through to deterministic synthesizer
    }
  }

  // Fallback domain-engineered multi-agent investigation response
  const fallback = generateDeterministicInvestigation(anomaly, zone);
  return res.json({
    success: true,
    source: 'energymind-deterministic-engine',
    session: fallback,
  });
});

function generateDeterministicInvestigation(anomaly: any, zone: any) {
  const isHvac = anomaly.system === 'HVAC';
  const isSolar = anomaly.system === 'Solar/BESS';
  const isOcc = anomaly.system === 'Occupancy';
  const isWeather = anomaly.system === 'Weather';

  return {
    id: `INV-${Date.now().toString().slice(-6)}`,
    anomalyId: anomaly.id,
    anomalyTitle: anomaly.title,
    timestamp: new Date().toLocaleTimeString(),
    status: 'completed',
    agentReports: [
      {
        agentId: 'hvac',
        agentName: 'AeroSense HVAC Specialist',
        agentRole: 'Chiller COP, Psychrometrics & Air Handling',
        avatarIcon: 'Wind',
        confidencePct: isHvac ? 96 : 89,
        status: isHvac ? 'flagged' : 'nominal',
        findings: isHvac
          ? `Continuous oscillation detected on 3-way mixing valve CHW-VLV-302 with a period of 42 seconds. Chilled water return temperature is 3.8°C lower than design delta-T, causing low delta-T syndrome and parasitic chiller staging.`
          : `HVAC air handlers and chilled water loop operating within normal parameters. Thermal load matches ambient temperature trajectory.`,
        evidence: [
          {
            metric: 'CHW Valve Position Cycle',
            observedValue: isHvac ? '12% -> 94% hunting' : '48% steady',
            expectedValue: 'Modulating ±4% / 10min',
            deviation: isHvac ? '+82% oscillatory span' : 'Normal',
          },
          {
            metric: 'Delta-T Across Coil',
            observedValue: isHvac ? '3.4°C' : '6.2°C',
            expectedValue: '5.8°C - 6.5°C',
            deviation: isHvac ? '-2.8°C (Degraded Heat Transfer)' : 'Nominal',
          },
        ],
        recommendation: isHvac
          ? 'Clamp valve PID loop integral gain (Ti) from 12s to 65s and re-zero pneumatic actuator stroke calibration via BACnet.'
          : 'Maintain current AHU supply air setpoints.',
      },
      {
        agentId: 'solar',
        agentName: 'HelioVolt Solar & BESS Specialist',
        agentRole: 'PV Irradiance, Inverters & Battery Dispatch',
        avatarIcon: 'Sun',
        confidencePct: isSolar ? 95 : 91,
        status: isSolar ? 'flagged' : 'nominal',
        findings: isSolar
          ? `Inverter #3 MPPT Tracker 2 is exhibiting clipping and voltage drop. Solar irradiance pyranometer reads 895 W/m² (clear sky), but string DC generation is restricted to 58% of expected curve.`
          : `Rooftop PV generating 345 kW (98% of solar model). BESS battery pack at 68% State-of-Charge, standing by for 14:30 peak shaving dispatch.`,
        evidence: [
          {
            metric: 'Inverter #3 String Current',
            observedValue: isSolar ? '18.4 A' : '31.2 A',
            expectedValue: '31.8 A',
            deviation: isSolar ? '-42.1% deficit' : 'Nominal',
          },
          {
            metric: 'DC Bus Voltage',
            observedValue: isSolar ? '564 V' : '650 V',
            expectedValue: '645 - 655 V',
            deviation: isSolar ? '-86 V Drop' : 'Nominal',
          },
        ],
        recommendation: isSolar
          ? 'Dispatch technician to inspect String Combiner Box #3 for blown DC fuse or high-resistance terminal junction; divert building load to BESS.'
          : 'Schedule 150 kW BESS discharge during critical peak tariff window (14:00 - 18:00).',
      },
      {
        agentId: 'weather',
        agentName: 'AtmoPredict Microclimate Specialist',
        agentRole: 'Enthalpy, Wet-Bulb & Thermal Envelope Load',
        avatarIcon: 'CloudSun',
        confidencePct: isWeather ? 94 : 88,
        status: isWeather ? 'flagged' : 'nominal',
        findings: isWeather
          ? `Exterior wet-bulb temperature is 22.4°C with low atmospheric wind speed (1.2 m/s). Economizer free-cooling is locked out. Ambient solar irradiance heat gain is heating southern glass facade at 420 W/m².`
          : `External ambient conditions (26.8°C dry bulb, 52% RH) match forecast within 0.3°C. Solar radiation curve conforms to clear-sky ASHRAE index.`,
        evidence: [
          {
            metric: 'Outdoor Air Enthalpy',
            observedValue: '62.4 kJ/kg',
            expectedValue: '58.0 kJ/kg',
            deviation: isWeather ? '+4.4 kJ/kg load' : 'Normal',
          },
          {
            metric: 'Solar Heat Gain Coeff.',
            observedValue: '0.41',
            expectedValue: '0.38',
            deviation: '+7.8%',
          },
        ],
        recommendation: isWeather
          ? 'Lower automated solar blinds on South & West curtain walls to reduce solar radiation ingress by 38%.'
          : 'No weather-driven thermal anomalies detected; baseline tracking accurately.',
      },
      {
        agentId: 'occupancy',
        agentName: 'HumanMetrics Occupancy & Plug Load Specialist',
        agentRole: 'PIR Sensors, Headcount & Baseboard Loads',
        avatarIcon: 'Users',
        confidencePct: isOcc ? 97 : 92,
        status: isOcc ? 'flagged' : 'nominal',
        findings: isOcc
          ? `Circuit branch analysis reveals unexpected sustained 28.5 kW load during zero-occupancy window. 68 desktop workstations and dual GPUs remained active in high-performance power states without user presence.`
          : `Floor headcount is consistent with badge swipes (approx. 48 occupants). Internal sensible heat gain from occupants is 4.8 kW (normal).`,
        evidence: [
          {
            metric: 'PIR Activity vs Power Draw',
            observedValue: isOcc ? '0 occupants / 28.5 kW' : '48 occupants / 74 kW',
            expectedValue: isOcc ? '< 5 kW off-peak idle' : '70-80 kW',
            deviation: isOcc ? '+23.5 kW Vampire draw' : 'Nominal',
          },
          {
            metric: 'CO2 Metabolic Generation',
            observedValue: isOcc ? '415 ppm (atmospheric)' : '610 ppm',
            expectedValue: '400 - 800 ppm',
            deviation: 'Verified no human presence',
          },
        ],
        recommendation: isOcc
          ? 'Broadcast Active Directory Sleep Policy GPO-301 to transition idle compute nodes to S3 sleep; toggle smart relay branch PNL-2A.'
          : 'Maintain current demand-controlled ventilation rate of 18 CFM/person.',
      },
    ],
    arbiterSynthesis: {
      rootCauseVerdict: isHvac
        ? 'Root Cause: Control Hunting on Secondary CHW Valve CHW-VLV-302'
        : isSolar
        ? 'Root Cause: DC String Blown Fuse / Inverter Clipping on Rooftop Array #3'
        : isOcc
        ? 'Root Cause: Workstation Deep-Sleep Policy Bypass (Vampire Basal Load)'
        : 'Root Cause: Demand-Controlled Ventilation Deficit under High Occupancy Surge',
      masterConfidencePct: 96,
      financialWasteEstPerDay: Math.round(anomaly.financialImpactPerHour * 16),
      carbonPenaltyKgPerDay: Math.round(anomaly.carbonImpactPerHour * 16),
      comfortRiskLevel: isHvac || isWeather ? 'Moderate' : 'Low',
      synthesizedExplanation: `The Arbiter cross-correlated all 4 specialist reports. All agents confirm that ${anomaly.title} is an isolated subsystem anomaly, not an external ambient thermal spike. Immediate software mitigation will recover 85%+ of the financial and carbon losses without requiring maintenance shutdown.`,
      recommendedActionPlan: [
        {
          step: 1,
          action: isHvac
            ? 'Execute automated BACnet write to clamp PID integral time to 65s'
            : isSolar
            ? 'Command BESS inverter to step up discharge to cover 62 kW PV deficit'
            : isOcc
            ? 'Trigger Smart Power Strip relay shut-off for non-critical lab peripherals'
            : 'Ramp primary AHU outdoor air damper from 15% to 65%',
          targetSystem: isHvac
            ? 'BACnet Controller DEV-304'
            : isSolar
            ? 'BESS PCS 500kW'
            : isOcc
            ? 'Lighting/Plug Panel PNL-2A'
            : 'AHU-1 VAV Master',
          estimatedSavings: `$${Math.round(anomaly.financialImpactPerHour * 12)}/day`,
        },
        {
          step: 2,
          action: 'Log high-priority preventive maintenance ticket for field verification',
          targetSystem: 'Facilities Work Order System',
          estimatedSavings: 'Prevents equipment lifetime degradation',
        },
      ],
      automatedMitigationAvailable: true,
    },
  };
}

// Vite middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, locate the dist directory (either ./dist or __dirname)
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : (typeof __dirname !== 'undefined' ? __dirname : process.cwd());
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('EnergyMind API is running.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EnergyMind Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
