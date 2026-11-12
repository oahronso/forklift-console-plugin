import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';

import { MigrationVirtualMachineStatus, type PlanStatuses } from './types';

export const getMigrationProcessedText = (
  vms: V1beta1PlanStatusMigrationVms[],
  planSpecVMsTotal: number,
  phase?: PlanStatuses,
): string => {
  const totalVMs = vms.length;

  const counter = getMigrationVMsStatusCounts(vms, planSpecVMsTotal, phase);
  const succeededCounter = counter[MigrationVirtualMachineStatus.Succeeded].count;
  const percentage = Math.trunc((succeededCounter / totalVMs) * 100);

  return `${succeededCounter} of ${totalVMs} VMs processed (${percentage}%)`;
};
