import type { FC } from 'react';
import { getVmCutover } from 'src/plans/components/CutoverModal/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Migration } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';

import type { VmModalProps } from '../../VmCutover/VmCutoverMigrationModal';
import VmCutoverMigrationModal from '../../VmCutover/VmCutoverMigrationModal';

type VMCutoverActionsDropDownItemsProps = {
  isCompleted: boolean;
  migration: V1beta1Migration;
  vmId: string;
  vmName: string;
};

const VMCutoverActionsDropDownItems: FC<VMCutoverActionsDropDownItemsProps> = ({
  isCompleted,
  migration,
  vmId,
  vmName,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  const hasCutover = Boolean(getVmCutover(migration, vmId));

  return (
    <DropdownList>
      <DropdownItem
        data-testid="edit-vm-cutover-item"
        isDisabled={isCompleted}
        key="edit-vm-cutover"
        onClick={() => {
          launchOverlay<VmModalProps>(VmCutoverMigrationModal, {
            migration,
            vmId,
            vmName,
          });
        }}
      >
        {hasCutover ? t('Edit cutover') : t('Schedule cutover')}
      </DropdownItem>
    </DropdownList>
  );
};

export default VMCutoverActionsDropDownItems;
