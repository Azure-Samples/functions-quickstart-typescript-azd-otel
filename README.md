# Azure Functions Node.js + OpenTelemetry Samples

This repository contains Node.js Azure Functions samples that demonstrate OpenTelemetry instrumentation and deployment with the Azure Developer CLI (`azd`). Every sample is a self-contained subfolder with its own `azure.yaml`, `infra/`, and `README.md`.

## Samples

| Sample | Language | Trigger(s) | Highlights |
| --- | --- | --- | --- |
| [OtelHttpTriggerTypeScript](./OtelHttpTriggerTypeScript/) | TypeScript | HTTP | Minimal HTTP-trigger function with OpenTelemetry tracing + logs to Application Insights, deployed to a Flex Consumption plan with managed identity. |
| [OtelHttpTriggerESM](./OtelHttpTriggerESM/) | JavaScript (ESM, `.mjs`) | HTTP | Same scenario as above but using the ECMAScript Module variant of `@azure/functions-opentelemetry-instrumentation`. |
| [OtelDistributedTracingWithOutputbinding](./OtelDistributedTracingWithOutputbinding/) | TypeScript | HTTP + Service Bus | End-to-end distributed tracing across multiple Azure Functions on a Flex Consumption plan, using a Service Bus output binding, managed identity, and VNet integration. |

## Deploy a sample

Each sample is deployable independently:

```bash
cd <sample-folder>
azd auth login
azd up
```

For example:

```bash
cd OtelHttpTriggerTypeScript
azd up
```

To tear down resources for a sample:

```bash
azd down --purge
```

See each sample's `README.md` for prerequisites, local-run instructions, and architecture details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
