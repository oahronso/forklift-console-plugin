import { getVMPipelineStep } from 'src/plans/details/tabs/VirtualMachines/components/MigrationStatusVirtualMachineList/utils/getVmPipelineStep';
import { getPipelineStepDisplayName } from 'src/plans/details/tabs/VirtualMachines/components/MigrationStatusVirtualMachineList/utils/utils';

import type { V1beta1MigrationStatusVms } from '@forklift-ui/types';

const extractAllPipelinesSteps = (vms: V1beta1MigrationStatusVms[]): Set<string> => {
  const allSteps = new Set<string>();

  for (const vm of vms) {
    for (const pipelineStep of vm.pipeline) {
      allSteps.add(getPipelineStepDisplayName(pipelineStep.name));
    }
  }
  return allSteps;
};

export const pipelineStepCount = (
  vms: V1beta1MigrationStatusVms[],
): Map<string, { failedVMs: number; runningVMs: number }> => {
  const allSteps = extractAllPipelinesSteps(vms);
  const counterMap = new Map<string, { failedVMs: number; runningVMs: number }>();
  for (const step of allSteps) {
    counterMap.set(step, { failedVMs: 0, runningVMs: 0 });
  }

  for (const vm of vms) {
    const { error, stepName } = getVMPipelineStep(vm);

    if (stepName) {
      if (error) {
        counterMap.set(stepName, {
          failedVMs: (counterMap.get(stepName)?.failedVMs ?? 0) + 1,
          runningVMs: counterMap.get(stepName)?.runningVMs ?? 0,
        });
      } else {
        counterMap.set(stepName, {
          failedVMs: counterMap.get(stepName)?.failedVMs ?? 0,
          runningVMs: (counterMap.get(stepName)?.runningVMs ?? 0) + 1,
        });
      }
    }
  }
  return counterMap;
};
