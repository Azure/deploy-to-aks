## Action inputs

### Inputs specific to set cluster context
<table>
  <thead>
    <tr>
      <th>Action inputs</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td><code>method</code><br/>Method</td>
    <td>(Optional) Acceptable values: kubeconfig/service-account. Default value: kubeconfig</td>
  </tr>
  <tr>
    <td><code>kubeconfig</code><br/>Kubectl config</td>
    <td>(Relevant for kubeconfig approach) Contents of the configuration file to be used with kubectl (e.g. can be pulled from a secret)</td>
  </tr>
  <tr>
    <td><code>context</code><br/>Context</td>
    <td>(Relevant for kubeconfig approach) Context to be used within the provided kubeconfig file</td>
  </tr>
  <tr>
    <td><code>k8s-url</code><br/>API server URL</td>
    <td>(Relevant for service account approach) API Server URL for the K8s cluster</td>
  </tr>
  <tr>
    <td><code>k8s-secret</code><br/>Secret</td>
    <td>(Relevant for service account approach) Secret associated with the service account to be used for deployments</td>
  </tr>
</table>

### Inputs specific to create secret (Optional)
**Note:** Below mentioned inputs are only required when creating new secrets. For creating new secret please provide `secret-name` and required inputs. For skipping this part (create secret), do not specify `secret-name` as input.

<table>
  <thead>
    <tr>
      <th>Action inputs</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td><code>container-registry-url</code><br/>Container registry url</td>
    <td>(Only required when creating a new secret) Container registry url. </td>
  </tr>
  <tr>
    <td><code>container-registry-username</code><br/>username</td>
    <td>(Only required when creating a new secret) Container registry username</td>
  </tr>
  <tr>
    <td><code>container-registry-password</code><br/>password</td>
    <td>(Only required when creating a new secret) Container registry password</td>
  </tr>
  <tr>
    <td><code>container-registry-email</code><br/>Email</td>
    <td>(Optional) Container registry email</td>
  </tr>
  <tr>
    <td><code>secret-type</code><br/>secret type</td>
    <td>(Optional) Type of Kubernetes secret. For example, docker-registry or generic. default: docker-registry</td>
  </tr>
  <tr>
    <td><code>secret-name</code><br/>secret name</td>
    <td>(Only required when creating a new secret) Name of the secret. You can use this secret name in the Kubernetes YAML configuration file. <b>No secret will be created if left unspecified</b>. </td>
  </tr>
  <tr>
    <td><code>arguments</code><br/>arguments</td>
    <td>(Optional) Specify keys and literal values to insert in generic type secret.For example, --from-literal=key1=value1 --from-literal=key2="top secret".</td>
  </tr>
 </table>
 
### Inputs specific to Azure Kubernetes Cluster deploy
 
 <table>
  <thead>
    <tr>
      <th>Action inputs</th>
      <th>Description</th>
    </tr>
  </thead>

  <tr>
    <td><code>manifests</code><br/>Manifests</td>
    <td>(Required) Path to the manifest files to be used for deployment</td>
  </tr>
  <tr>
    <td><code>images</code><br/>Images</td>
    <td>(Optional) Fully qualified resource URL of the image(s) to be used for substitutions on the manifest files. This multiline input accepts specifying multiple artifact substitutions in newline separated form. For example - <br>images: |<br>&nbsp&nbspcontosodemo.azurecr.io/foo:test1<br>&nbsp&nbspcontosodemo.azurecr.io/bar:test2<br>In this example, all references to contosodemo.azurecr.io/foo and contosodemo.azurecr.io/bar are searched for in the image field of the input manifest files. For the matches found, the tags test1 and test2 are substituted.</td>
  </tr>
  <tr>
    <td><code>imagepullsecrets</code><br/>Image pull secrets</td>
    <td>(Optional) Multiline input where each line contains the name of a docker-registry secret that has already been setup within the cluster. Each of these secret names are added under imagePullSecrets field for the workloads found in the input manifest files. Also specify the sceret created along with this action if applicable.</td>
  </tr>
  <tr>
    <td><code>strategy</code><br/>Strategy</td>
    <td>(Optional) Deployment strategy to be used while applying manifest files on the cluster. Acceptable values: none/canary. none - No deployment strategy is used when deploying. canary - Canary deployment strategy is used when deploying to the cluster</td>
  </tr>
  <tr>
    <td><code>traffic-split-method</code><br/>Traffic split method</td>
    <td>(Optional) Acceptable values: pod/smi; Default value: pod <br>SMI: Percentage traffic split is done at request level using service mesh. Service mesh has to be setup by cluster admin. Orchestration of <a href="https://github.com/deislabs/smi-spec/blob/master/traffic-split.md" data-raw-source="TrafficSplit](https://github.com/deislabs/smi-spec/blob/master/traffic-split.md)">TrafficSplit</a> objects of SMI is handled by this action. <br>Pod: Percentage split not possible at request level in the absence of service mesh. So the percentage input is used to calculate the replicas for baseline and canary as a percentage of replicas specified in the input manifests for the stable variant.</td>
  </tr>
  <tr>
    <td><code>percentage</code><br/>Percentage</td>
    <td>(Required if strategy ==  canary) Percentage used to compute the number of replicas of &#39;-baseline&#39; and &#39;-canary&#39; varaints of the workloads found in manifest files. For the specified percentage input, if (percentage * numberOfDesirerdReplicas)/100 is not a round number, the floor of this number is used while creating &#39;-baseline&#39; and &#39;-canary&#39;<br/>Example: If Deployment hello-world was found in the input manifest file with &#39;replicas: 4&#39; and if &#39;strategy: canary&#39; and &#39;percentage: 25&#39; are given as inputs to the action, then the Deployments hello-world-baseline and hello-world-canary are created with 1 replica each. The &#39;-baseline&#39; variant is created with the same image and tag as the stable version (4 replica variant prior to deployment) while the &#39;-canary&#39; variant is created with the image and tag corresponding to the new changes being deployed</td>
  </tr>
  <tr>
    <td><code>baseline-and-canary-replicas</code><br/>Baseline and canary replicas</td>
    <td>(Optional; Relevant only if trafficSplitMethod ==  smi) When trafficSplitMethod == smi, as percentage traffic split is controlled in the service mesh plane, the actual number of replicas for canary and baseline variants could be controlled independently of the traffic split. For example, assume that the input Deployment manifest desired 30 replicas to be used for stable and that the following inputs were specified for the action - <br>&nbsp;&nbsp;&nbsp;&nbsp;strategy: canary<br>&nbsp;&nbsp;&nbsp;&nbsp;trafficSplitMethod: smi<br>&nbsp;&nbsp;&nbsp;&nbsp;percentage: 20<br>&nbsp;&nbsp;&nbsp;&nbsp;baselineAndCanaryReplicas: 1<br> In this case, stable variant will receive 80% traffic while baseline and canary variants will receive 10% each (20% split equally between baseline and canary). However, instead of creating baseline and canary with 3 replicas, the explicit count of baseline and canary replicas is honored. That is, only 1 replica each is created for baseline and canary variants.</td>
  </tr>
  <tr>
    <td><code>action</code><br/>Action</td>
    <td>(Required) Default value: deploy. Acceptable values: deploy/promote/reject. Promote or reject actions are used to promote or reject canary deployments. Sample YAML snippets are provided below for guidance on how to use the same.</td>
  </tr>
  <tr>
    <td><code>kubectl-version</code><br/>Kubectl version</td>
    <td>(Optional) Version of kubectl client to be used for deploying the manifest to the cluster. If this input is left unspecified, latest version is used.</td>
  </tr>
</table>

### Common inputs

<table>
  <thead>
    <tr>
      <th>Action inputs</th>
      <th>Description</th>
    </tr>
  </thead>

  <tr>
    <td><code>namespace</code><br/>Namespace</td>
    <td>(Optional) Choose the target Kubernetes namespace. If the namespace is not provided, the commands will run in the default namespace.</td>
  </tr>
</table>