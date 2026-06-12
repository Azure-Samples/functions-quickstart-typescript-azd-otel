// Import Azure Functions types and app instance for HTTP trigger setup
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  output,
} from "@azure/functions";

// Import OpenTelemetry API for tracing
import otelAPI from "@opentelemetry/api";

// Define Service Bus output binding
const serviceBusOutput = output.serviceBusQueue({
  queueName: "%ServiceBusQueueName%",
  connection: "ServiceBusConnection",
});

/**
 * Second HTTP trigger function with Service Bus output binding.
 * This function demonstrates OpenTelemetry tracing and sends messages to Service Bus.
 *
 * @param request - Incoming HTTP request object
 * @param context - Azure Functions invocation context for logging and tracing
 * @returns HTTP response with confirmation message
 */
export async function secondHttpFunction(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("TypeScript HTTP trigger function (second) processed a request.");

  // Log incoming request traceparent header for distributed tracing
  context.log(`Header traceparent- "${request.headers.get("traceparent")}"`);

  // Log Azure Functions context traceparent for correlation
  context.log(`Context traceparent- "${context.traceContext.traceParent}"`);

  // Log active span trace ID from OpenTelemetry for debugging
  context.log(`ActiveSpan traceId- "${otelAPI.trace.getActiveSpan()}"`);

  // Log active span ID from OpenTelemetry for debugging
  context.log(`ActiveSpan spanId- "${otelAPI.trace.getActiveSpan()}"`);

  const message = "This is the second function responding.";

  // Send a message to the Service Bus queue
  const queueMessage =
    "Message from second HTTP function to trigger ServiceBus queue processing";
  
  // Set the Service Bus output binding
  context.extraOutputs.set(serviceBusOutput, queueMessage);
  
  context.log("Sent message to ServiceBus queue:", queueMessage);

  return {
    status: 200,
    body: message,
  };
}

// Register HTTP trigger function with Azure Functions runtime and Service Bus output
app.http("second_http_function", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  extraOutputs: [serviceBusOutput],
  handler: secondHttpFunction,
});
