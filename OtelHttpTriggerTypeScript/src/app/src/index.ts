// Import Azure Functions app instance to configure and set up the function app
import { app } from "@azure/functions";

// Import Azure Functions instrumentation for OpenTelemetry to enable tracing and monitoring
import { AzureFunctionsInstrumentation } from "@azure/functions-opentelemetry-instrumentation";

// Import Azure Monitor exporters for logs and traces to send telemetry data to Azure Monitor
import {
  AzureMonitorLogExporter,
  AzureMonitorTraceExporter,
} from "@azure/monitor-opentelemetry-exporter";

// Import HTTP instrumentation from OpenTelemetry to trace outgoing HTTP requests
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

// Import OpenTelemetry instrumentation registration utility to enable instrumentation
import { registerInstrumentations } from "@opentelemetry/instrumentation";

// Import LoggerProvider and SimpleLogRecordProcessor from OpenTelemetry SDK for logging
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";

// Import tracing utilities from OpenTelemetry SDK for Node.js
import {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";

// Create a NodeTracerProvider instance to manage tracing configuration
const tracerProvider = new NodeTracerProvider();

// Add Azure Monitor Trace Exporter to send trace data to Azure Monitor
tracerProvider.addSpanProcessor(
  new SimpleSpanProcessor(new AzureMonitorTraceExporter())
);

// Register the tracer provider globally to enable tracing across the application
tracerProvider.register();

// Create a LoggerProvider instance to manage logging configuration
const loggerProvider = new LoggerProvider();

// Add Azure Monitor Log Exporter to send log data to Azure Monitor
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new AzureMonitorLogExporter())
);

//DEBUGGING PURPOSE only.
// Create a ConsoleSpanExporter instance to output trace data to the console for debugging purposes
const consoleSpanExporter = new ConsoleSpanExporter();
// Add ConsoleSpanExporter to tracer provider to output spans to console
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(consoleSpanExporter));

// Register instrumentations for HTTP requests and Azure Functions with OpenTelemetry
registerInstrumentations({
  loggerProvider,
  instrumentations: [
    // Instrument outgoing HTTP requests, disable incoming request instrumentation as Azure Functions handles it
    new HttpInstrumentation({ disableIncomingRequestInstrumentation: true }),
    // Instrument Azure Functions to enable tracing and logging
    new AzureFunctionsInstrumentation(),
  ],
});

// Configure Azure Functions app with OpenTelemetry enabled and HTTP streaming support
app.setup({
  capabilities: {
    WorkerOpenTelemetryEnabled: true, // Enable OpenTelemetry integration for Azure Functions worker
  },
  enableHttpStream: true, // Enable HTTP streaming capability