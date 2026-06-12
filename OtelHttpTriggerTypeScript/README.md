---
description: Azure Functions TypeScript HTTP-trigger sample with OpenTelemetry instrumentation, deployable to Azure with the Azure Developer CLI (`azd`).
page_type: sample
products:
- azure-functions
- azure
urlFragment: otel-http-trigger-typescript
languages:
- typescript
- bicep
- azdeveloper
---

# Azure Functions TypeScript HTTP Trigger with OpenTelemetry (azd)

This sample demonstrates how to integrate OpenTelemetry tracing and logging into an Azure Functions HTTP-trigger app written in TypeScript, and deploy it to Azure with the Azure Developer CLI (`azd`).

## Features

- Azure Functions HTTP trigger with OpenTelemetry instrumentation
- Trace + log export to Azure Monitor (Application Insights)
- Outgoing HTTP request instrumentation with Axios
- Flex Consumption plan, managed identity, and AAD-only Application Insights ingestion

## Architecture

| Component | Purpose |
| --- | --- |
| Function App (Flex Consumption, Node 20) | Hosts the `httpTrigger` function |
| User-assigned managed identity | Used for storage + Application Insights AAD auth |
| Storage Account | Deployment package container |
| Application Insights + Log Analytics | Trace and log destination |

## Prerequisites

- [Node.js 18.x or later](https://nodejs.org/)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd)
- An Azure subscription

## Run locally

1. Install dependencies:

    ```bash
    cd src/app
    npm install
    ```

2. Build the TypeScript:

    ```bash
    npm run build
    ```

3. Create `src/app/local.settings.json` (replace the connection string with your own Application Insights resource, or use Azurite + leave it blank to test purely locally):

    ```json
    {
      "IsEncrypted": false,
      "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AzureWebJobsStorage": "UseDevelopmentStorage=true",
        "APPLICATIONINSIGHTS_CONNECTION_STRING": "<Your_Connection_String>"
      }
    }
    ```

4. Start the host:

    ```bash
    npm start
    ```

5. Hit the endpoint:

    ```bash
    curl "http://localhost:7071/api/httpTrigger?name=Azure"
    ```

## Deploy to Azure with `azd`

From this sample folder (`OtelHttpTriggerTypeScript`):

```bash
azd auth login
azd up
```

`azd up` will prompt for:

- An environment name (used to derive a unique resource group + resource names)
- An Azure subscription
- A region

After deployment, the function URL is shown in the output. Invoke it as:

```bash
curl "https://<function-app-name>.azurewebsites.net/api/httpTrigger?name=Azure"
```

Traces and logs flow to the deployed Application Insights instance — open it in the Azure portal to see the request span and the outgoing call to `microsoft.com`.

To remove all created Azure resources:

```bash
azd down --purge
```

## Source layout

```
OtelHttpTriggerTypeScript/
├── azure.yaml             # azd service definition
├── infra/                 # Bicep templates (Flex Consumption, AppI, storage, identity)
└── src/app/               # Function app project
    ├── host.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts       # OpenTelemetry registration
        └── functions/
            └── httpTrigger.ts
```
