import type { FC } from 'react';
import { useNavigate } from 'react-router';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import type { PlanModalProps } from 'src/plans/actions/components/types';

import { PlanModelRef, type V1beta1MigrationStatusVms, type V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Flex, Popover, Stack, StackItem } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';

import { getMigrationCounterText } from './utils/migrationCounterText';
import { getMigrationProcessedText } from './utils/migrationProcessedText';
import { migrationStatusIconMap } from './utils/statusIconMapper';
import { getPopoverMessageByStatus } from './utils/statusPopoverMessages';
import {
  type MigrationVirtualMachinesStatusCountObjectVM,
  MigrationVirtualMachineStatus,
} from './utils/types';
import MigrationStageTable from './MigrationStageTable';

type StatusPopoverProps = {
  count: number;
  migrationVMs?: V1beta1MigrationStatusVms[];
  plan: V1beta1Plan;
  status: MigrationVirtualMachineStatus;
  vms: MigrationVirtualMachinesStatusCountObjectVM[];
};

const MigrationStatusPopover: FC<StatusPopoverProps> = ({ count, migrationVMs, plan, status }) => {
  const launchOverlay = useOverlay();
  const navigate = useNavigate();

  const { actionLabel, body } = getPopoverMessageByStatus(status, count);
  const openScheduleCutoverModal = (): void => {
    launchOverlay<PlanModalProps>(PlanCutoverMigrationModal, { plan });
  };

  const navigateToVMsTab = (): void => {
    const url = `${getResourceUrl({ name: getName(plan), namespace: getNamespace(plan), reference: PlanModelRef })}/vms`;
    navigate(url)?.catch(() => undefined);
  };
  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          {body && <StackItem>{body}</StackItem>}
          {migrationVMs && plan.spec?.vms.length && (
            <StackItem>{getMigrationCounterText(migrationVMs, plan.spec?.vms.length)}</StackItem>
          )}
          <StackItem>
            <MigrationStageTable vms={migrationVMs}></MigrationStageTable>
          </StackItem>
          <StackItem>
            {migrationVMs && plan.spec?.vms.length && (
              <StackItem>
                {getMigrationProcessedText(migrationVMs, plan.spec?.vms.length)}
              </StackItem>
            )}
          </StackItem>

          <StackItem>
            <Button
              isInline
              onClick={() => {
                if (status === MigrationVirtualMachineStatus.Paused) {
                  openScheduleCutoverModal();
                  return;
                }

                navigateToVMsTab();
              }}
              variant={ButtonVariant.link}
            >
              {actionLabel}
            </Button>
          </StackItem>
        </Stack>
      }
      headerContent={'Migration progress'}
      triggerAction="hover"
    >
      <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }}>
        {migrationStatusIconMap[status]}
        <Button isInline onClick={navigateToVMsTab} variant={ButtonVariant.link}>
          {count}
        </Button>
      </Flex>
    </Popover>
  );
};

export default MigrationStatusPopover;
