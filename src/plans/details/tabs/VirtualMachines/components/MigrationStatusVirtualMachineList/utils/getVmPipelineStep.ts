import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { taskStatuses } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import { CUTOVER_NAME, getPipelineStepDisplayName } from './utils';

export const getVMPipelineStep = (
  statusVM: V1beta1PlanStatusMigrationVms | undefined,
): { error: string | undefined; stepName: string | undefined } => {
  const pipeline = statusVM?.pipeline;
  if (isEmpty(pipeline)) {
    return { error: undefined, stepName: undefined };
  }

  const failedStep = pipeline?.find((step) => step.error !== undefined);
  if (failedStep) {
    return {
      error: failedStep.error?.phase,
      stepName: getPipelineStepDisplayName(failedStep.name),
    };
  }

  if (isMigrationVirtualMachinePaused(statusVM)) {
    return { error: undefined, stepName: CUTOVER_NAME };
  }

  const activeStep = pipeline?.find((step) => step.phase !== taskStatuses.completed);
  if (activeStep !== undefined) {
    return { error: undefined, stepName: getPipelineStepDisplayName(activeStep.name) };
  }

  // If we got here it means that we are between steps
  const middleStep = pipeline?.find((step) => step.phase !== taskStatuses.completed);
  if (middleStep !== undefined) {
    return { error: undefined, stepName: getPipelineStepDisplayName(middleStep?.name) };
  }

  return { error: undefined, stepName: undefined };
};
