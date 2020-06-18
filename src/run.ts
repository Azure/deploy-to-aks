import * as core from '@actions/core';
import { run_set_context } from './set-context';
import { run_create_secret } from './create-secret';
import { run_deploy } from './deploy';


export async function run(){
    await run_set_context().catch(core.setFailed);
    
    let secret_name = core.getInput('secret-name');
    if (secret_name) {
        await run_create_secret().catch(core.setFailed);
    }
    
    await run_deploy().catch(core.setFailed);
}

run().catch(core.setFailed);
