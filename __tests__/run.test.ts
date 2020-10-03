import * as KubernetesManifestUtility from '../src/utilities/manifest-stability-utility';
import * as KubernetesObjectUtility from '../src/utilities/resource-object-utility';
import * as core from '@actions/core';
import * as deployment from '../src/utilities/strategy-helpers/deployment-helper';
import * as fs from 'fs';
import * as io from '@actions/io';
import * as toolCache from '@actions/tool-cache';

import { Kubectl, Resource } from '../src/utilities/kubectl-object-model';

import { getkubectlDownloadURL } from "../src/utilities/kubectl-util";
import { mocked } from 'ts-jest/utils';

import { fromLiteralsToFromFile } from "../src/create-secret"

import { run_set_context } from '../src/set-context';
import { run_deploy } from '../src/deploy';


// -------------------------------------------------- set context tests ------------------------------------

describe('This is a placeholder for intial test cases, to be removed', () => {
    test('Dummy test case', async () => {
        await expect(run_set_context()).rejects.toThrow();
    })
})


// -------------------------------------------------- Create Secret tests ------------------------------------
const fileUtility = mocked(fs, true);

beforeAll(() => {
    process.env['RUNNER_TEMP'] = '/home/runner/work/_temp';
})

test('Literal converted to file', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key1");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key1=value")).toBe('--from-file=' + filePath);
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "value");
})

test('Multiple literal converted to file', () => {
    var filePath1 = path.join(process.env['RUNNER_TEMP'], "key1");
    var filePath2 = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key1=value1 --from-literal=key2=value2")).toBe('--from-file=' + filePath1 + ' --from-file=' + filePath2);
    expect(fileUtility.writeFileSync.mock.calls).toEqual([
        [filePath1, "value1"],
        [filePath2, "value2"]
    ])
})

test('File and other argument maintained maintained as-is', () => {
    expect(fromLiteralsToFromFile("--from-file=./filepath --otherArgument=value")).toBe('--from-file=./filepath --otherArgument=value')
})

test('File and other argument maintained with trailing spaces maintained as-is', () => {
    expect(fromLiteralsToFromFile("--from-file=./filepath          --otherArgument=value          "))
        .toBe('--from-file=./filepath --otherArgument=value')
})

test('File and other argument maintained with trailing spaces maintained as-is', () => {
    expect(fromLiteralsToFromFile("--from-file=./filepath      00    --otherArgument=value          "))
        .toBe('--from-file=./filepath      00 --otherArgument=value')
})

test('File and other argument maintained with trailing spaces maintained as-is', () => {
    expect(fromLiteralsToFromFile("--from-file=./filepath      00    --otherArgument=\"value     0\"     --otherArgument=value           "))
        .toBe('--from-file=./filepath      00 --otherArgument=\"value     0\" --otherArgument=value')
})

test('File and other argument maintained maintained as-is', () => {
    expect(fromLiteralsToFromFile("--from-file=./filepath --otherArgument=\"value     \""))
        .toBe('--from-file=./filepath --otherArgument=\"value     \"')
})

test('File maintained as-is', () => {
    expect(fromLiteralsToFromFile("--from-file=./filepath")).toBe('--from-file=./filepath')
})

test('Any other argument maintained as-is', () => {
    expect(fromLiteralsToFromFile("--otherArgument=value")).toBe('--otherArgument=value')
})

test('Any other arguments maintained as-is', () => {
    expect(fromLiteralsToFromFile("--otherArgument=value --otherArgument=value")).toBe('--otherArgument=value --otherArgument=value')
})

test('Invalid case, no value for secret', () => {
    expect(() => fromLiteralsToFromFile("--from-literal=key")).toThrow(Error);
})

test('Multiple commnads combined', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=value --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "value");
})

test('In-valid trailing space in secret is igonered', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=value           --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "value");
})

test('Missplaced values ignored', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=value     0       --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "value");
})

test('Valid Trailing space in secret', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=\"value     0\"       --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "value     0");
})

test('Valid space in secret Case1', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=\"value 023\"       --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "value 023");
})

test('Valid space in secret Case2', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=\"   Value 023\"       --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "   Value 023");
})

test('Valid " Case1', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=value\"ksk --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "value\"ksk");
})

test('Valid " Case2', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=\"valueksk     --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "\"valueksk");
})

test('Valid " Case3', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key2");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key2=valueksk\"     --from-file=./filepath --otherArgument=value"))
        .toBe('--from-file=' + filePath + ' --from-file=./filepath --otherArgument=value');
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "valueksk\"");
})

test('No separator ', () => {
    expect(fromLiteralsToFromFile("test=this")).toBe('test=this')
})

test('Special characters & in value', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key3");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key3=hello&world")).toBe('--from-file=' + filePath);
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "hello&world");
})

test('Special characters # in value', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key4");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key4=hello#world")).toBe('--from-file=' + filePath);
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "hello#world");
})

test('Special characters = in value', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key5");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key5=hello=world")).toBe('--from-file=' + filePath);
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "hello=world");
})

test('Special characters in value', () => {
    var filePath = path.join(process.env['RUNNER_TEMP'], "key6");
    fileUtility.writeFileSync = jest.fn();
    expect(fromLiteralsToFromFile("--from-literal=key6=&^)@!&^@)")).toBe('--from-file=' + filePath);
    expect(fileUtility.writeFileSync).toBeCalledWith(filePath, "&^)@!&^@)");
})

// -------------------------------------------------- Deploy Tests -------------------------------------------
var path = require('path');

const coreMock = mocked(core, true);
const ioMock = mocked(io, true);

const toolCacheMock = mocked(toolCache, true);
//const fileUtility = mocked(fs, true);


const stableVersionUrl = 'https://storage.googleapis.com/kubernetes-release/release/stable.txt';

var deploymentYaml = "";

beforeAll(() => {
    deploymentYaml = fs.readFileSync(path.join(__dirname, 'manifests', 'deployment.yml'), 'utf8');
    process.env["KUBECONFIG"] = 'kubeConfig';
})

test("setKubectlPath() - install a particular version", async () => {
    const kubectlVersion = 'v1.18.0'
    //Mocks
    coreMock.getInput = jest.fn().mockReturnValue(kubectlVersion);
    toolCacheMock.find = jest.fn().mockReturnValue(undefined);
    toolCacheMock.downloadTool = jest.fn().mockReturnValue('downloadpath');
    toolCacheMock.cacheFile = jest.fn().mockReturnValue('cachepath');
    fileUtility.chmodSync = jest.fn();

    //Invoke and assert
    await expect(run_deploy()).resolves.not.toThrow();
    expect(toolCacheMock.find).toBeCalledWith('kubectl', kubectlVersion);
    expect(toolCacheMock.downloadTool).toBeCalledWith(getkubectlDownloadURL(kubectlVersion));
});

test("setKubectlPath() - install a latest version", async () => {
    const kubectlVersion = 'latest'
    //Mocks
    coreMock.getInput = jest.fn().mockReturnValue(kubectlVersion);
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => "");
    toolCacheMock.find = jest.fn().mockReturnValue(undefined);
    toolCacheMock.downloadTool = jest.fn().mockResolvedValue('');
    toolCacheMock.cacheFile = jest.fn().mockReturnValue('cachepath');
    fileUtility.chmodSync = jest.fn();

    //Invoke and assert
    await expect(run_deploy()).resolves.not.toThrow();
    expect(toolCacheMock.find).toBeCalledWith('kubectl', kubectlVersion);
    expect(toolCacheMock.downloadTool).toBeCalledWith(stableVersionUrl);

});

test("setKubectlPath() - kubectl version already avilable", async () => {
    const kubectlVersion = 'v1.18.0'
    //Mock
    coreMock.getInput = jest.fn().mockReturnValue(kubectlVersion);
    toolCacheMock.find = jest.fn().mockReturnValue('validPath');
    toolCacheMock.downloadTool = jest.fn().mockReturnValue('downloadpath');
    toolCacheMock.cacheFile = jest.fn().mockReturnValue('cachepath');
    fileUtility.chmodSync = jest.fn();

    //Invoke and assert
    await expect(run_deploy()).resolves.not.toThrow();
    expect(toolCacheMock.find).toBeCalledWith('kubectl', kubectlVersion);
    expect(toolCacheMock.downloadTool).toBeCalledTimes(0);
});

test("setKubectlPath() - kubectl version not provided and kubectl avilable on machine", async () => {
    //Mock
    coreMock.getInput = jest.fn().mockReturnValue(undefined);
    ioMock.which = jest.fn().mockReturnValue('validPath');

    //Invoke and assert
    await expect(run_deploy()).resolves.not.toThrow();
    expect(ioMock.which).toBeCalledWith('kubectl', false);
    expect(toolCacheMock.downloadTool).toBeCalledTimes(0);
});

test("setKubectlPath() - kubectl version not provided and kubectl not avilable on machine", async () => {
    //Mock
    coreMock.getInput = jest.fn().mockReturnValue(undefined);
    ioMock.which = jest.fn().mockReturnValue(undefined);
    toolCacheMock.findAllVersions = jest.fn().mockReturnValue(undefined);

    //Invoke and assert
    await expect(run_deploy()).rejects.toThrowError();
    expect(ioMock.which).toBeCalledWith('kubectl', false);
});

test("run() - action not provided", async () => {
    const kubectlVersion = 'v1.18.0'
    coreMock.getInput = jest.fn().mockImplementation((name) => {
        if (name == 'action') {
            return undefined;
        }
        return kubectlVersion;
    });
    coreMock.setFailed = jest.fn();
    //Mocks
    toolCacheMock.find = jest.fn().mockReturnValue(undefined);
    toolCacheMock.downloadTool = jest.fn().mockReturnValue('downloadpath');
    toolCacheMock.cacheFile = jest.fn().mockReturnValue('cachepath');
    fileUtility.chmodSync = jest.fn();

    //Invoke and assert
    await expect(run_deploy()).resolves.not.toThrow();
    expect(coreMock.setFailed).toBeCalledWith('Not a valid action. The allowed actions are deploy, promote, reject');
});

test("run() - deploy - Manifiest not provided", async () => {
    //Mocks
    const kubectlVersion = 'v1.18.0'
    coreMock.getInput = jest.fn().mockImplementation((name) => {
        if (name == 'manifests') {
            return undefined;
        }
        if (name == 'action') {
            return 'deploy';
        }
        return kubectlVersion;
    });
    coreMock.setFailed = jest.fn();
    toolCacheMock.find = jest.fn().mockReturnValue(undefined);
    toolCacheMock.downloadTool = jest.fn().mockReturnValue('downloadpath');
    toolCacheMock.cacheFile = jest.fn().mockReturnValue('cachepath');
    fileUtility.chmodSync = jest.fn();

    //Invoke and assert
    await expect(run_deploy()).resolves.not.toThrow();
    expect(coreMock.setFailed).toBeCalledWith('No manifests supplied to deploy');
});

test("deployment - deploy() - Invokes with no manifestfiles", async () => {
    const kubeCtl: jest.Mocked<Kubectl> = new Kubectl("") as any;

    //Invoke and assert
    await expect(deployment.deploy(kubeCtl, [], undefined)).rejects.toThrowError('ManifestFileNotFound');
});

test("run() - deploy", async () => {
    const kubectlVersion = 'v1.18.0'
    //Mocks
    coreMock.getInput = jest.fn().mockImplementation((name) => {
        if (name == 'manifests') {
            return 'manifests/deployment.yml';
        }
        if (name == 'action') {
            return 'deploy';
        }
        if (name == 'strategy') {
            return undefined;
        }
        return kubectlVersion;
    });

    coreMock.setFailed = jest.fn();
    toolCacheMock.find = jest.fn().mockReturnValue('validPath');
    toolCacheMock.downloadTool = jest.fn().mockReturnValue('downloadpath');
    toolCacheMock.cacheFile = jest.fn().mockReturnValue('cachepath');
    fileUtility.chmodSync = jest.fn();
    const deploySpy = jest.spyOn(deployment, 'deploy').mockImplementation();

    //Invoke and assert
    await expect(run_deploy()).resolves.not.toThrow();
    expect(deploySpy).toBeCalledWith({ "ignoreSSLErrors": false, "kubectlPath": 'validPath', "namespace": "v1.18.0" }, ['manifests/deployment.yml'], undefined);
    deploySpy.mockRestore();
});

test("deployment - deploy() - Invokes with manifestfiles", async () => {
    const KubernetesManifestUtilityMock = mocked(KubernetesManifestUtility, true);
    const KubernetesObjectUtilityMock = mocked(KubernetesObjectUtility, true);
    const kubeCtl: jest.Mocked<Kubectl> = new Kubectl("") as any;
    kubeCtl.apply = jest.fn().mockReturnValue("");
    const resources: Resource[] = [{ type: "Deployment", name: "AppName" }];
    KubernetesObjectUtilityMock.getResources = jest.fn().mockReturnValue(resources);
    kubeCtl.getResource = jest.fn().mockReturnValue("");
    KubernetesManifestUtilityMock.checkManifestStability = jest.fn().mockReturnValue("");

    const readFileSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => deploymentYaml);

    //Invoke and assert
    await expect(deployment.deploy(kubeCtl, ['manifests/deployment.yml'], undefined)).resolves.not.toThrowError();
    expect(readFileSpy).toBeCalledWith("manifests/deployment.yml");
    expect(kubeCtl.getResource).toBeCalledWith("ingress", "AppName");
});