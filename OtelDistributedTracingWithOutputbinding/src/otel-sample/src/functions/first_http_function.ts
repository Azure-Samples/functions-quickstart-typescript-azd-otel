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
 * First HTTP trigger function that demonstrates tracing and logging with OpenTelemetry.
 * This function calls the second HTTP function to demonstrate distributed tracing.
 *
 * @param request - Incoming HTTP request object
 * @param context - Azure Functions invocation context for logging and tracing
 * @returns HTTP response with message from both functions
 */
export async function firstHttpFunction(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("TypeScript HTTP trigger function (first) processed a request.");

  // Log incoming request traceparent header for distributed tracing
  context.log(`Header traceparent- "${request.headers.get("traceparent")}"`);

  // Log Azure Functions context traceparent for correlation
  context.log(`Context traceparent- "${context.traceContext.traceParent}"`);

  // Log active span trace ID from OpenTelemetry for debugging
  context.log(`ActiveSpan traceId- "${otelAPI.trace.getActiveSpan()}"`);

  // Log active span ID from OpenTelemetry for debugging
  context.log(`ActiveSpan spanId- "${otelAPI.trace.getActiveSpan()}"`);

  try {
    // Call the second function
    const baseUrl = request.url.split("/api/")[0];
    const secondFunctionUrl = `${baseUrl}/api/second_http_function`;

    const response = await axios.get(secondFunctionUrl);
    const secondFunctionResult = response.data;

    const result = {
      message: "Hello from the first function!",
      second_function_response: secondFunctionResult,
    };

    context.log("Successfully called second function");

    return {
      status: 200,
      body: JSON.stringify(result),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    context.log("Error occurred:", error);
    return {
      status: 500,
      body: JSON.stringify({
        error: "Failed to process request",
        message: error.message,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
}

// Register HTTP trigger function with Azure Functions runtime
app.http("first_http_function", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: firstHttpFunction,
});
