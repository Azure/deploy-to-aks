# Deploy action for Azure Kubernetes Service

This action is dedicated to deploying workloads to Azure Kubernetes Service. A single action to take care of all the tasks required to deploy to AKS.

There are three parts to this action-
- **Setting the Kubernetes Context**   
  This part of the action is used to set the cluster context required for creating secrets and deploying. Subsequent actions/scripts in the workflow can leverage this to run any `kubectl` commands.

  There are two approaches for specifying the deployment target:
  - Kubeconfig file provided as input to the action
  - Service account approach where the secret associated with the service account is provided as input to the action

  If inputs related to both these approaches are provided, the kubeconfig approach related inputs are given precedence.
- **Create a Kubernetes secret (Optional)**  
  This part of the action will create a [generic secret or docker-registry secret](https://kubernetes.io/docs/concepts/configuration/secret/) in the Kubernetes cluster. This is optional and only needs to be used when creating a new secret.
  
  The secret will be created in the cluster for which the context was set and can be used to pull images from a registry.
  
  **Note:** This action can create only one secret. For using multiple secrets in the deployment, please use the [k8s-create-secret](https://github.com/Azure/k8s-create-secret) action seperately.
- **Deployment Configuration**  
  This part of the action is used to deploy manifests to Azure Kubernetes Service clusters. Other configuration options such as `kubectl` version, strategy and image name overrides can also be provided. Please check the inputs for more details.
  
## Action inputs
For a detailed description on all the action inputs and configurations, please refer to the [action inputs doc](https://github.com/Azure/deploy-to-aks/blob/master/action_inputs.md).

## Sample usage
### Kubeconfig approach to set context and creating a docker-registry secret 

```yaml
- uses: azure/deploy-to-aks@v1
  with:
    kubeconfig: <your kubeconfig> # Use secret (https://developer.github.com/actions/managing-workflows/storing-secrets/)
    context: <context name>  #If left unspecified, current-context from kubeconfig is used as default
    
    container-registry-url: <your container registry url>
    container-registry-username: # Use secret (https://developer.github.com/actions/managing-workflows/storing-secrets/)
    container-registry-password: # Use secret (https://developer.github.com/actions/managing-workflows/storing-secrets/)
    secret-name: <registry secret name to be created>
    
    manifests: <path to your manifests>
    imagepullsecrets: <secret names to pull images from registry>
```

Run the following script from an azure CLI enabled shell to get the kubeconfig file on a local machine and store it as a Github repository secret.

```sh
az aks get-credentials --name <cluster-name>
                       --resource-group <resource-group-name>
                       --file <path-to-output-file>
```

Further details can be found in the [az aks get-credentials documentation](https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az-aks-get-credentials).

**Please note** that the action input requires the _contents_ of the kubeconfig file, and not its path.

To create a docker-registry secret for Azure Container Registry, its admin account will need to be enabled. Refer to the [admin account document](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-authentication#admin-account) for details. Now add the username and password of the registry as secrets in the GitHub repository.

### Service account approach to set context and creating generic secret

```yaml
- uses: azure/deploy-to-aks@v1
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

For fetching the server URL, execute the following command on your shell:

```sh
kubectl config view --minify -o 'jsonpath={.clusters[0].cluster.server}'
```

For fetching secret object required to connect and authenticate with the cluster, the following sequence of commands needs to be run:

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
