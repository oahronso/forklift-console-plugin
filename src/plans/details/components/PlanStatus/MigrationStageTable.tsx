import type { FC } from 'react';
import { MigrationVirtualMachineStatus } from 'src/plans/details/components/PlanStatus/utils/types';

import type { V1beta1MigrationStatusVms } from '@forklift-ui/types';
import { Card, Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon, InProgressIcon } from '@patternfly/react-icons';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { getMigrationVMStatus } from './utils/migrationVmStatus';
import { pipelineStepCount } from './utils/pipeLineStepCounter';

type MigrationStageTableProps = {
  vms: V1beta1MigrationStatusVms[] | undefined;
};

const MigrationStageTable: FC<MigrationStageTableProps> = ({ vms }) => {
  if (!vms) return null;
  const activeVMs = vms.filter(
    (vm) =>
      getMigrationVMStatus(vm) === MigrationVirtualMachineStatus.InProgress ||
      getMigrationVMStatus(vm) === MigrationVirtualMachineStatus.Paused,
  );
  const completedVMs = vms.filter(
    (vm) => getMigrationVMStatus(vm) === MigrationVirtualMachineStatus.Succeeded,
  );
  const stepsCounter = pipelineStepCount(activeVMs);
  stepsCounter.set('Fully migrated', { failedVMs: 0, runningVMs: completedVMs.length });

  return (
    <Card>
      <Table
        aria-label="Migration progress stage table"
        data-testid="migration progress stage table"
        variant={TableVariant.compact}
      >
        <Thead>
          <Tr>
            <Th key={'stage'}> {'Stage'}</Th>
            <Th key={'vms'}> {'VMs'}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {[...stepsCounter].map(([step, { failedVMs, runningVMs }]) => (
            <Tr key={step}>
              <Td dataLabel={'stage'}>{step}</Td>
              <Td dataLabel={'vms'}>
                {Boolean(runningVMs) && step !== 'Fully migrated' && (
                  <>
                    <Icon style={{ marginRight: '6px' }}>
                      <InProgressIcon />
                    </Icon>{' '}
                  </>
                )}
                {runningVMs}{' '}
                {Boolean(failedVMs) && (
                  <>
                    <Icon>
                      <ExclamationTriangleIcon />
                    </Icon>{' '}
                  </>
                )}
                {failedVMs > 0 ? failedVMs : ''}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
};

export default MigrationStageTable;
