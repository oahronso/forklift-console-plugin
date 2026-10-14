import { MigrationModel, type V1beta1Migration } from '@forklift-ui/types';
import { k8sPatch, type Patch } from '@openshift-console/dynamic-plugin-sdk';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { isEmpty } from '@utils/helpers';

export const formatDateTo12Hours = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeSuffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${timeSuffix}`;
};

export const patchMigrationCutover = async (
  migration: V1beta1Migration,
  cutover?: string,
  trackEvent?: (event: string, data: Record<string, unknown>) => void,
): Promise<V1beta1Migration> => {
  const op = migration?.spec?.cutover ? 'replace' : 'add';

  const result = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/cutover',
        value: cutover,
      },
    ],
    model: MigrationModel,
    resource: migration,
  });

  trackEvent?.(TELEMETRY_EVENTS.MIGRATION_CUTOVER_SCHEDULED, {
    cutoverTime: cutover,
    hasCutover: Boolean(cutover),
    migrationName: migration?.metadata?.name,
    planNamespace: migration?.metadata?.namespace,
  });

  return result;
};

export const getVmCutover = (migration: V1beta1Migration, vmId: string): string | undefined => {
  return migration.spec?.vmCutover?.find((cutover) => cutover.id === vmId)?.cutover;
};

export const getEffectiveVmCutover = (
  migration: V1beta1Migration,
  vmId: string,
): { cutover?: string; isInherited: boolean } => {
  const overrideCutover = getVmCutover(migration, vmId);

  return overrideCutover
    ? { cutover: overrideCutover, isInherited: false }
    : { cutover: migration.spec?.cutover, isInherited: true };
};

/*
Patch a specific virtual machine's cutover time.
if @cutover is not supplied - treat as remove cutover override by 
the vm and revert the cutover to the migration's time
*/
export const patchMigrationVmCutover = async (
  migration: V1beta1Migration,
  vmId: string,
  cutover?: string,
  trackEvent?: (event: string, data: Record<string, unknown>) => void,
): Promise<V1beta1Migration> => {
  const vmCutoverArray = migration?.spec?.vmCutover;
  const vmIndex = vmCutoverArray?.findIndex((entry) => entry.id === vmId) ?? -1;

  const patchByCase = (): Patch | undefined => {
    if (!cutover) {
      // If no desired cutover was supplied - treat as remove cutover function
      if (vmIndex === -1) return undefined; // Guard against non-existent entry deletion
      return {
        op: 'remove',
        path: `/spec/vmCutover/${vmIndex}`,
      };
    }

    if (isEmpty(vmCutoverArray)) {
      // Array is empty, meaning this is the first per-VM cutover on this migration
      return {
        op: 'add',
        path: '/spec/vmCutover',
        value: [{ cutover, id: vmId }],
      };
    }

    if (vmIndex >= 0) {
      // Case where the array contains an entry for the VM
      return {
        op: 'replace',
        path: `/spec/vmCutover/${vmIndex}/cutover`,
        value: cutover,
      };
    }

    // Final case: array exists, but this VM in not in it yet
    return {
      op: 'add',
      path: '/spec/vmCutover/-',
      value: { cutover, id: vmId },
    };
  };

  const patch = patchByCase();

  if (!patch) {
    // Guard against deletion of non-existent entry
    return migration;
  }

  const result = await k8sPatch({
    data: [patch],
    model: MigrationModel,
    resource: migration,
  });

  trackEvent?.(TELEMETRY_EVENTS.MIGRATION_VM_CUTOVER_SCHEDULED, {
    cutoverTime: cutover,
    hasCutover: Boolean(cutover),
    migrationName: migration?.metadata?.name,
    planNamespace: migration?.metadata?.namespace,
    vmId,
  });

  return result;
};
