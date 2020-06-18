# Deploy action for Azure Kubernetes Cluster

This action can be used to deploy manifests to Azure Kubernetes clusters.

There are three different sections of this action:
- **Kubernetes set context:**   
   This part of action is used to set cluster context before creating secret and deploying to Azure kubernetes cluster so that kubectl commands can be used subsequently in the action.

  There are two approaches for specifying the deployment target:

  - Kubeconfig file provided as input to the action
  - Service account approach where the secret associated with the service account is provided as input to the action

  If inputs related to both these approaches are provided, kubeconfig approach related inputs are given precedence.
- **Kubernetes create secret **(Optional)**:**  
  This part of the action will create a [generic secret or docker-registry secret](https://kubernetes.io/docs/concepts/configuration/secret/) in Kubernetes cluster. This part is optional and only to be used when creating new secret.
  
  The secret will be created in the cluster context which was set earlier in the workflow and will be used to pull images from registry.
  
  **Note:** This action can create only one secret. For using multiple secrets in deployment please use [k8s-cerete-secret](https://github.com/Azure/k8s-create-secret) action seperately.
- **Deploy to Azure Kubernetes Cluster:**  
  This part of the action is used to deploy manifests to Azure Kubernetes clusters.

 If you are looking to automate your workflows to deploy to [Azure Web Apps](https://azure.microsoft.com/en-us/services/app-service/web/) and [Azure Web App for Containers](https://azure.microsoft.com/en-us/services/app-service/containers/), consider using [`Azure/webapps-deploy`](https://github.com/Azure/webapps-deploy) action.
  
## Action inputs
Refer to the action detail file for details about all the inputs https://github.com/Azure/deploy-to-aks/blob/releases/preview/Action_inputs.md

## Example usage
### Kubeconfig approach to set context and creating docker-registry secret 

```yaml
- uses: azure/deploy-to-aks@v1
  with:
    kubeconfig: <your kubeconfig> # Use secret (https://developer.github.com/actions/managing-workflows/storing-secrets/)
    context: <context name>  #If left unspecified, current-context from kubeconfig is used as default
    
    container-registry-url: <your container regostry url>
    container-registry-username: # Use secret (https://developer.github.com/actions/managing-workflows/storing-secrets/)
    container-registry-password: # Use secret (https://developer.github.com/actions/managing-workflows/storing-secrets/)
    secret-name: <registry secret name to be created>
    
    manifests: <path to your manifests>
    imagepullsecrets: <secret names to pull images from registry>
```

**Please note** that the input requires the _contents_ of the kubeconfig file, and not its path.

For Azure Container registry refer to **admin [account document](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-authentication#admin-account)** for username and password. Now add the username and password as a secret in the GitHub repository.

Use the below mentioned way to fetch kubeconfig file onto your local development machine so that the same can be used in the action input shown above:

#### For Azure Kubernetes Service cluster

```sh
az aks get-credentials --name
                       --resource-group
                       [--admin]
                       [--file]
                       [--overwrite-existing]
                       [--subscription]
```

Further details can be found in [az aks get-credentials documentation](https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az-aks-get-credentials).

### Service account approach to set context and creating generic secret

```yaml
- uses: azure/k8s-set-context@v1
  with:
    method: service-account
    k8s-url: <URL of the cluster's API server>
    k8s-secret: <secret associated with the service account>
    
    secret-type: 'generic'
    arguments:  --from-literal=account-name=${{ secrets.AZURE_STORAGE_ACCOUNT }} --from-literal=access-key=${{ secrets.AZURE_STORAGE_ACCESS_KEY }}
    secret-name: <registry secret name to be created>
    
    manifests: <path to your manifests>
    imagepullsecrets: <secret names to pull images from registry>
```

For fetching Server URL, execute the following command on your shell:

```sh
kubectl config view --minify -o 'jsonpath={.clusters[0].cluster.server}'
```

For fetching Secret object required to connect and authenticate with the cluster, the following sequence of commands need to be run:

```sh
kubectl get serviceAccounts <service-account-name> -n <namespace> -o 'jsonpath={.secrets[*].name}'
```

```sh
kubectl get secret <service-account-secret-name> -n <namespace> -o yaml
```


# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
