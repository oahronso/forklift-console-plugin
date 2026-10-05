import { useCallback } from 'react';
import CutoverMigrationModal from 'src/plans/components/CutoverModal/CutoverMigrationModal';
import {
  getVmCutover,
  patchMigrationVmCutover,
} from 'src/plans/components/CutoverModal/utils/utils';

import type { V1beta1Migration } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { ForkliftTrans } from '@utils/i18n';

type VmModalProps = {
  migration: V1beta1Migration;
  vmId: string;
  vmName: string;
};

const VmCutoverMigrationModal: OverlayComponent<VmModalProps> = ({
  closeOverlay,
  migration,
  vmId,
  vmName,
}) => {
  const { trackEvent } = useForkliftAnalytics();
  const cutover = getVmCutover(migration, vmId);

  const onSetCutover = useCallback(
    async (vmCutover: string) => {
      await patchMigrationVmCutover(migration, vmId, vmCutover, trackEvent);
    },
    [trackEvent, migration, vmId],
  );

  const onRemoveCutover = useCallback(async () => {
    if (cutover) {
      await patchMigrationVmCutover(migration, vmId, undefined, trackEvent);
      closeOverlay();
    }
  }, [closeOverlay, cutover, migration, trackEvent, vmId]);

  return (
    <CutoverMigrationModal
      closeOverlay={closeOverlay}
      description={
        <ForkliftTrans values={{ vmName }}>
          <Stack hasGutter>
            <StackItem>
              Schedule the cutover for VM <strong className="co-break-word">{{ vmName }}</strong>?
            </StackItem>
            <StackItem>
              This VM will be shut down at the specified cutover date - regardless of the plan's
              defined cutover time.
            </StackItem>
          </Stack>
        </ForkliftTrans>
      }
      existingCutover={cutover}
      onRemoveCutover={onRemoveCutover}
      onSetCutover={onSetCutover}
    />
  );
};
export default VmCutoverMigrationModal;
