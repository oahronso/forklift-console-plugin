import type { FC } from 'react';

import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { Flex } from '@patternfly/react-core';

import { isPlanArchived, isPlanExecuting } from './utils/planStatusResolver';
import {
  type MigrationVirtualMachinesStatusCountObject,
  type MigrationVirtualMachineStatus,
  statusPriority,
} from './utils/types';
import MigrationStatusPopover from './MigrationStatusPopover';
import StatusPopover from './StatusPopover';

type VMStatusIconsRowProps = {
  migrationVMs?: V1beta1PlanStatusMigrationVms[];
  plan: V1beta1Plan;
  statuses: Record<MigrationVirtualMachineStatus, MigrationVirtualMachinesStatusCountObject>;
};

const VMStatusIconsRow: FC<VMStatusIconsRowProps> = ({ migrationVMs, plan, statuses }) => {
  const isPlanRunning = isPlanExecuting(plan) && !isPlanArchived(plan);

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      direction={{ default: 'row' }}
      flexWrap={{ default: 'nowrap' }}
      gap={{ default: 'gapSm' }}
    >
      {(
        Object.entries(statuses) as [
          MigrationVirtualMachineStatus,
          MigrationVirtualMachinesStatusCountObject,
        ][]
      )
        .filter(([, { count }]) => count > 0)
        .sort(([statusA], [statusB]) => statusPriority[statusA] - statusPriority[statusB])
        .map(([status, { count, vms }]) => {
          return isPlanRunning ? (
            <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }} key={status}>
              <MigrationStatusPopover
                count={count}
                migrationVMs={migrationVMs}
                plan={plan}
                status={status}
                vms={vms}
              />{' '}
            </Flex>
          ) : (
            <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }} key={status}>
              <StatusPopover count={count} plan={plan} status={status} vms={vms} />
            </Flex>
          );
        })}
    </Flex>
  );
};

export default VMStatusIconsRow;
