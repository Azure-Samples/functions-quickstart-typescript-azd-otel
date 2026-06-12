import FunctionInstrumentation from "@azure/functions-opentelemetry-instrumentation";
import {
  AzureMonitorLogExporter,
  AzureMonitorTraceExporter,
} from "@azure/monitor-opentelemetry-exporter";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import {
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";

const { AzureFunctionsInstrumentationESM } = FunctionInstrumentation;

const tracerProvider = new NodeTracerProvider();
tracerProvider.addSpanProcessor(
  new SimpleSpanProcessor(new AzureMonitorTraceExporter())
);
tracerProvider.register();

const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new AzureMonitorLogExporter())
);

const consoleSpanExporter = new ConsoleSpanExporter();
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(consoleSpanExporter));

const azureFunctionsInstrumentation = new AzureFunctionsInstrumentationESM();
console.log("Made some changes:");
registerInstrumentations({
  tracerProvider,
  loggerProvider,
  instrumentations: [new HttpInstrumentation(), azureFunctionsInstrumentation],
});

const azureFunctions = await import("@azure/functions");
azureFunctionsInstrumentation.registerAzFunc(azureFunctions);

azureFunctions.app.setup({
  capabilities: { WorkerOpenTelemetryEnabled: true },
  enableHttpStream: true,
});
