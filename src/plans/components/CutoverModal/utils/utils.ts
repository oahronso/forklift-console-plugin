import { MigrationModel, type V1beta1Migration } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
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
  const existing = migration?.spec?.vmCutover;
  const remaining = (existing ?? []).filter((entry) => entry.id !== vmId);
  // If the caller provided a cutover for the VM - add the cutover to the future array.
  // Otherwise - remove the VM element from it.
  const next = cutover ? [...remaining, { cutover, id: vmId }] : remaining;

  // Guard: can't remove a cutover from a non-existing CutOver array
  if (!cutover && !existing) {
    return migration;
  }

  const data = isEmpty(next)
    ? [{ op: 'remove', path: '/spec/vmCutover' }]
    : [{ op: existing ? 'replace' : 'add', path: '/spec/vmCutover', value: next }];

  const result = await k8sPatch({ data, model: MigrationModel, resource: migration });

  trackEvent?.(TELEMETRY_EVENTS.MIGRATION_VM_CUTOVER_SCHEDULED, {
    cutoverTime: cutover,
    hasCutover: Boolean(cutover),
    migrationName: migration?.metadata?.name,
    planNamespace: migration?.metadata?.namespace,
    vmId,
  });

  return result;
};
