# Azure Functions Node.js OpenTelemetry Sample

This sample demonstrates how to integrate OpenTelemetry tracing and logging into an Azure Functions application using Node.js. It showcases how to instrument Azure Functions and HTTP requests, and export telemetry data to Application insight.

## Features

- Azure Functions HTTP trigger with OpenTelemetry instrumentation.
- Tracing and logging integration using OpenTelemetry SDK.
- Export telemetry data (traces and logs) to Azure Monitor.
- Example of outgoing HTTP request instrumentation using Axios.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
- An Azure subscription ([Create a free account](https://azure.microsoft.com/free/))

## Setup

1. Clone this repository:

```bash
git clone <your-repo-url>
cd azure-functions-nodejs-opentelemetry-samples/typescript
```

2. Install dependencies:

```bash
npm install
```

3. Configure Azure Monitor Exporter:

Set the following environment variable with your Azure Monitor Connection String:

```bash
export APPLICATIONINSIGHTS_CONNECTION_STRING="<Your_Connection_String>"
```

(Replace `<Your_Connection_String>` with your Azure Monitor Application Insights connection string.)

## Run Locally

Start the Azure Functions app locally:

```bash
func start
```

The function will be available at:

```
http://localhost:7071/api/httpTrigger
```

You can test the function using a browser or tools like Postman or curl:

```bash
curl "http://localhost:7071/api/httpTrigger?name=Azure"
```

## Deploy to Azure

Deploy your Azure Functions app using Azure Functions Core Tools:

```bash
func azure functionapp publish <your-function-app-name>
```

Replace `<your-function-app-name>` with your Azure Function App name.

## Resources

- [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
- [OpenTelemetry for JavaScript](https://opentelemetry.io/docs/instrumentation/js/)
- [Azure Monitor OpenTelemetry Exporter](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-overview)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for
