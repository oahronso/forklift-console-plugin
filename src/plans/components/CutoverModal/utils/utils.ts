import { MigrationModel, type V1beta1Migration } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';

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

const getVmCutover = (migration: V1beta1Migration, vmId: string): string | undefined => {
  return migration.spec?.vmCutover?.find((cutover) => cutover.id === vmId)?.cutover;
};

export const getEffectiveVmCutover = (
  migration: V1beta1Migration,
  vmId: string,
): { cutover?: string; isInherited: boolean } => {
  const overrideCutover = getVmCutover(migration, vmId);

  return overrideCutover
    ? { cutover: overrideCutover, isInherited: true }
    : { cutover: migration.spec?.cutover, isInherited: false };
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
  const cutoverArray = migration?.spec?.vmCutover ?? [];
  const nextCutoverArray = cutover
    ? [...cutoverArray.filter((element) => element.id !== vmId)]
    : [...cutoverArray.filter((element) => element.id !== vmId), { cutover, vmId }];
  const op = migration?.spec?.vmCutover ? 'replace' : 'add';

  const result = await k8sPatch({
    data: [{ op, path: '/spec/cancel', value: nextCutoverArray }],
    model: MigrationModel,
    resource: migration,
  });

  trackEvent?.(TELEMETRY_EVENTS.MIGRATION_CUTOVER_SCHEDULED, {
    cutoverTime: cutover,
    hasCutover: Boolean(cutover),
    migrationName: migration?.metadata?.name,
    planNamespace: migration?.metadata?.namespace,
    vmId,
  });

  return result;
};
