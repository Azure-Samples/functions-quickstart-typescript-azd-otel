targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
@allowed(['australiaeast', 'eastasia', 'eastus', 'eastus2', 'northeurope', 'southcentralus', 'southeastasia', 'swedencentral', 'uksouth', 'westus2', 'eastus2euap'])
@metadata({
  azd: {
    type: 'location'
  }
})
param location string

param processorServiceName string = ''
param processorUserAssignedIdentityName string = ''
param applicationInsightsName string = ''
param appServicePlanName string = ''
param logAnalyticsName string = ''
param resourceGroupName string = ''
param storageAccountName string = ''

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }
var appName = !empty(processorServiceName) ? processorServiceName : '${abbrs.webSitesFunctions}${resourceToken}'
var deploymentStorageContainerName = 'app-package-${take(appName, 32)}-${take(resourceToken, 7)}'

@description('Id of the user or app to assign application roles')
param principalId string = ''
var principalIds = !empty(principalId) ? [processorUserAssignedIdentity.outputs.principalId, principalId] : [processorUserAssignedIdentity.outputs.principalId]

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

module processorUserAssignedIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.4.1' = {
  name: 'processorUserAssignedIdentity'
  scope: rg
  params: {
    name: !empty(processorUserAssignedIdentityName) ? processorUserAssignedIdentityName : '${abbrs.managedIdentityUserAssignedIdentities}processor-${resourceToken}'
    location: location
    tags: tags
  }
}

module processor './app/processor.bicep' = {
  name: 'processor'
  scope: rg
  params: {
    name: appName
    location: location
    tags: tags
    applicationInsightsName: monitoring.outputs.name
    appServicePlanId: appServicePlan.outputs.resourceId
    runtimeName: 'node'
    runtimeVersion: '20'
    storageAccountName: storage.outputs.name
    identityId: processorUserAssignedIdentity.outputs.resourceId
    identityClientId: processorUserAssignedIdentity.outputs.clientId
    appSettings: {
    }
    deploymentStorageContainerName: deploymentStorageContainerName
  }
}

module storage 'br/public:avm/res/storage/storage-account:0.8.3' = {
  name: 'storage'
  scope: rg
  params: {
    name: !empty(storageAccountName) ? storageAccountName : '${abbrs.storageStorageAccounts}${resourceToken}'
    location: location
    tags: tags
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
    blobServices: {
      containers: [
        {
          name: deploymentStorageContainerName
          publicAccess: 'None'
        }
      ]
    }
    skuName: 'Standard_LRS'
    allowSharedKeyAccess: false
    minimumTlsVersion: 'TLS1_2'
  }
}

// Storage Blob Data Owner / Contributor / Table Data Contributor
var roleIds = ['b7e6dc6d-f1e8-4753-8033-0f276bb0955b', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe', '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3']
module storageBlobDataOwnerRoleDefinitionApi 'app/storage-Access.bicep' = [for roleId in roleIds: {
  name: 'blobDataOwner${roleId}'
  scope: rg
  params: {
    storageAccountName: storage.outputs.name
    roleId: roleId
    principalIds: principalIds
  }
}]

module appServicePlan 'br/public:avm/res/web/serverfarm:0.1.1' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : '${abbrs.webServerFarms}${resourceToken}'
    location: location
    tags: tags
    sku: {
      name: 'FC1'
      tier: 'FlexConsumption'
    }
    reserved: true
  }
}

// Monitoring Metrics Publisher role on Application Insights for the function identity
module appInsightsMetricsPublisherRole 'app/appinsights-Access.bicep' = {
  name: 'appInsightsMetricsPublisher'
  scope: rg
  params: {
    applicationInsightsName: monitoring.outputs.name
    roleId: '3913510d-42f4-4e42-8a64-420c390055eb'
    principalIds: principalIds
  }
}

module logAnalytics 'br/public:avm/res/operational-insights/workspace:0.11.1' = {
  name: '${uniqueString(deployment().name, location)}-loganalytics'
  scope: rg
  params: {
    name: !empty(logAnalyticsName) ? logAnalyticsName : '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    location: location
    tags: tags
    dataRetention: 30
  }
}

module monitoring 'br/public:avm/res/insights/component:0.6.0' = {
  name: '${uniqueString(deployment().name, location)}-appinsights'
  scope: rg
  params: {
    name: !empty(applicationInsightsName) ? applicationInsightsName : '${abbrs.insightsComponents}${resourceToken}'
    location: location
    tags: tags
    workspaceResourceId: logAnalytics.outputs.resourceId
    disableLocalAuth: true
  }
}

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output SERVICE_PROCESSOR_NAME string = processor.outputs.SERVICE_PROCESSOR_NAME
output AZURE_FUNCTION_NAME string = processor.outputs.SERVICE_PROCESSOR_NAME
