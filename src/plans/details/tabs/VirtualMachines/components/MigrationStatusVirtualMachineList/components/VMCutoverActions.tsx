import type { FC } from 'react';

import type { V1beta1Migration, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import VMCutoverActionsDropdown from './VMCutoverActionsDropdown';

type VMCutoverActionsProps = {
  migration: V1beta1Migration;
  statusVM: V1beta1PlanStatusMigrationVms;
  vmId: string;
  vmName: string;
};

const VMCutoverActions: FC<VMCutoverActionsProps> = ({ migration, statusVM, vmId, vmName }) => {
  const isCompleted = Boolean(statusVM?.completed);
  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }} />

      <FlexItem align={{ default: 'alignRight' }}>
        <VMCutoverActionsDropdown
          isCompleted={isCompleted}
          migration={migration}
          vmId={vmId}
          vmName={vmName}
        />
      </FlexItem>
    </Flex>
  );
};

export default VMCutoverActions;
