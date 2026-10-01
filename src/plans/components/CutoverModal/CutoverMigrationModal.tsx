import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { ButtonVariant, Flex, FlexItem, Radio } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCutoverDateTimeHandlers } from './hooks/useCutoverDateTimeHandlers';
import {
  CUTOVER_MODE_ASAP,
  CUTOVER_MODE_SCHEDULED,
  useCutoverFormState,
} from './hooks/useCutoverFormState';
import ScheduledCutoverFields from './ScheduledCutoverFields';

import './CutoverMigrationModal.scss';

type CutoverMigrationModalProps = {
  closeOverlay: () => void;
  description: ReactNode;
  existingCutover: string | undefined;
  onRemoveCutover?: () => Promise<unknown>;
  onSetCutover: (cutover: string) => Promise<unknown>;
};

const CutoverMigrationModal: FC<CutoverMigrationModalProps> = ({
  closeOverlay,
  description,
  existingCutover,
  onRemoveCutover,
  onSetCutover,
}) => {
  const { t } = useForkliftTranslation();
  const [isDateValid, setIsDateValid] = useState<boolean>(true);
  const [isTimeValid, setIsTimeValid] = useState<boolean>(true);

  const hasExistingCutover = Boolean(existingCutover);
  const { cutoverDate, cutoverMode, setCutoverDate, setCutoverMode, setTime, time } =
    useCutoverFormState(existingCutover);

  const { getCutoverDateToSet, isScheduledInPast, isScheduledInvalid, onDateChange, onTimeChange } =
    useCutoverDateTimeHandlers({
      cutoverDate,
      cutoverMode,
      setCutoverDate,
      setIsDateValid,
      setIsTimeValid,
      setTime,
    });

  const onConfirm = useCallback(async () => {
    await onSetCutover(getCutoverDateToSet());
  }, [getCutoverDateToSet, onSetCutover]);

  const additionalAction = useMemo(
    () =>
      cutoverMode === CUTOVER_MODE_SCHEDULED && hasExistingCutover && onRemoveCutover
        ? {
            children: t('Remove cutover'),
            onClick: onRemoveCutover,
            variant: ButtonVariant.secondary,
          }
        : undefined,
    [cutoverMode, hasExistingCutover, onRemoveCutover, t],
  );

  return (
    <ModalForm
      additionalAction={additionalAction}
      closeOverlay={closeOverlay}
      confirmLabel={t('Set cutover')}
      isDisabled={isScheduledInvalid(isTimeValid, isDateValid)}
      onConfirm={onConfirm}
      title={hasExistingCutover ? t('Edit cutover') : t('Schedule cutover')}
    >
      {description}
      <Flex
        className="forklift-cutover-migration-inputgroup"
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsMd' }}
      >
        <FlexItem>
          <Radio
            data-testid="cutover-mode-asap"
            description={t('Migration will begin final cutover immediately.')}
            id="cutover-mode-asap"
            isChecked={cutoverMode === CUTOVER_MODE_ASAP}
            label={t('Cutover as soon as possible')}
            name="cutoverMode"
            onChange={() => {
              setCutoverMode(CUTOVER_MODE_ASAP);
            }}
          />
        </FlexItem>
        <FlexItem>
          <Radio
            data-testid="cutover-mode-scheduled"
            description={t('Schedule cutover for a future date and time.')}
            id="cutover-mode-scheduled"
            isChecked={cutoverMode === CUTOVER_MODE_SCHEDULED}
            label={t('Cutover at a specific time')}
            name="cutoverMode"
            onChange={() => {
              setCutoverMode(CUTOVER_MODE_SCHEDULED);
            }}
          />
        </FlexItem>
        {cutoverMode === CUTOVER_MODE_SCHEDULED && (
          <ScheduledCutoverFields
            cutoverDate={cutoverDate}
            isScheduledInPast={isScheduledInPast(isTimeValid, isDateValid)}
            onDateChange={onDateChange}
            onTimeChange={onTimeChange}
            time={time}
          />
        )}
      </Flex>
    </ModalForm>
  );
};

export default CutoverMigrationModal;
