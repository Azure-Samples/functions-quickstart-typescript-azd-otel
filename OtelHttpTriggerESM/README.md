---
description: Azure Functions ECMAScript Module (ESM) HTTP-trigger sample with OpenTelemetry instrumentation, deployable to Azure with the Azure Developer CLI (`azd`).
page_type: sample
products:
- azure-functions
- azure
urlFragment: otel-http-trigger-esm
languages:
- javascript
- bicep
- azdeveloper
---

# Azure Functions ESM HTTP Trigger with OpenTelemetry (azd)

This sample shows how to use OpenTelemetry tracing and logging in an Azure Functions Node.js app written as an **ECMAScript Module (ESM)** (`.mjs` files, `"type": "module"`), and deploy it to Azure with the Azure Developer CLI (`azd`).

## Features

- ESM-based Azure Functions HTTP trigger
- OpenTelemetry instrumentation registered via `@azure/functions-opentelemetry-instrumentation` ESM API
- Trace + log export to Azure Monitor (Application Insights)
- Flex Consumption plan with managed identity

## Architecture

| Component | Purpose |
| --- | --- |
| Function App (Flex Consumption, Node 20) | Hosts the `httpTrigger1` function |
| User-assigned managed identity | Used for storage + Application Insights AAD auth |
| Storage Account | Deployment package container |
| Application Insights + Log Analytics | Trace and log destination |

## Prerequisites

- [Node.js 20.x or later](https://nodejs.org/) (required for ESM + Functions v4)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd)
- An Azure subscription

## Run locally

1. Install dependencies (the project uses `pnpm` by default but `npm` works as well):

    ```bash
    cd src/app
    npm install
    ```

2. Create `src/app/local.settings.json` (replace the connection string with your own Application Insights resource):

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

3. Start the host:

    ```bash
    npm start
    ```

4. Hit the endpoint:

    ```bash
    curl "http://localhost:7071/api/httpTrigger1?name=Azure"
    ```

The OpenTelemetry setup file `src/index.mjs` is loaded automatically because it is listed in the `main` glob of `package.json`.

## Deploy to Azure with `azd`

From this sample folder (`OtelHttpTriggerESM`):

```bash
azd auth login
azd up
```

`azd up` will prompt for:

- An environment name (used to derive a unique resource group + resource names)
- An Azure subscription
- A region

After deployment, invoke the function:

```bash
curl "https://<function-app-name>.azurewebsites.net/api/httpTrigger1?name=Azure"
```

Traces and logs flow to the deployed Application Insights instance.

To remove all created Azure resources:

```bash
azd down --purge
```

## Source layout

```
OtelHttpTriggerESM/
├── azure.yaml             # azd service definition
├── infra/                 # Bicep templates (Flex Consumption, AppI, storage, identity)
└── src/app/               # Function app project
    ├── host.json
    ├── package.json       # "type": "module"
    └── src/
        ├── index.mjs      # OpenTelemetry registration (loaded via package.json#main)
        └── functions/
            └── httpTrigger1.mjs
```
