import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/migrationVmStatus';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';

import { MigrationVirtualMachineStatus, type PlanStatuses } from './types';

export const getMigrationCounterText = (
  vms: V1beta1PlanStatusMigrationVms[],
  planSpecVMsTotal: number,
  phase?: PlanStatuses,
): string => {
  const counter = getMigrationVMsStatusCounts(vms, planSpecVMsTotal, phase);

  const inProgressCounter = counter[MigrationVirtualMachineStatus.InProgress].count;
  const succeededCounter = counter[MigrationVirtualMachineStatus.Succeeded].count;
  const canceledCounter = counter[MigrationVirtualMachineStatus.Canceled].count;
  const cantStartCounter = counter[MigrationVirtualMachineStatus.CantStart].count;
  const failedCounter = counter[MigrationVirtualMachineStatus.Failed].count;
  const pausedCounter = counter[MigrationVirtualMachineStatus.Paused].count;

  const baseMessage = `${succeededCounter} completed · ${inProgressCounter} migrating`;
  const canceledText = canceledCounter > 0 ? ` · ${canceledCounter} canceled` : '';
  const cantStartText = cantStartCounter > 0 ? ` · ${cantStartCounter} cant start` : '';
  const failedText = failedCounter > 0 ? ` · ${failedCounter} failed` : '';
  const pausedText = pausedCounter > 0 ? ` · ${pausedCounter} paused` : '';

  return baseMessage + failedText + cantStartText + canceledText + pausedText;
};
