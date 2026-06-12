// Import Azure Functions types and app instance for HTTP trigger setup
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

// Import axios for making HTTP requests
import axios from "axios";

// Import OpenTelemetry API for tracing
import otelAPI from "@opentelemetry/api";

/**
 * HTTP trigger function that demonstrates tracing and logging with OpenTelemetry.
 *
 * @param request - Incoming HTTP request object
 * @param context - Azure Functions invocation context for logging and tracing
 * @returns HTTP response with greeting message
 */
export async function httpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  // Log incoming request traceparent header for distributed tracing
  context.log(`Header traceparent- "${request.headers.get("traceparent")}"`);

  // Log Azure Functions context traceparent for correlation
  context.log(`Context traceparent- "${context.traceContext.traceParent}"`);

  // Log active span trace ID from OpenTelemetry for debugging
  context.log(`ActiveSpan traceId- "${otelAPI.trace.getActiveSpan()}"`);

  // Log active span ID from OpenTelemetry for debugging
  context.log(`ActiveSpan spanId- "${otelAPI.trace.getActiveSpan()}"`);

  try {
    // Make an HTTP GET request to Microsoft's homepage
    const response = await axios.get("https://www.microsoft.com/en-us/");

    // Log success message after successful API call
    context.log("API Call Succeeded ");
  } catch (error) {
    // Log error details if the HTTP request fails
    context.log("Error occurred:", error);
  }

  // Log the URL of the processed HTTP request
  context.log(`Http function processed request for url "${request.url}"`);

  // Extract 'name' parameter from query string or request body, defaulting to 'world'
  const name = request.query.get("name") || (await request.text()) || "world";

  // Return HTTP response with greeting message
  return { body: `Hello, ${name}!` };
}

// Register HTTP trigger function with Azure Functions runtime
app.http("httpTrigger", {
  methods: ["GET", "POST"], // Allow GET and POST HTTP methods
  authLevel: "anonymous", // Allow anonymous access to the function
  handler: httpTrigger, // Specify the handler function
});
