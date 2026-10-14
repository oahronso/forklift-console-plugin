import { type FC, type Ref, useState } from 'react';

import type { V1beta1Migration } from '@forklift-ui/types';
import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import VMCutoverActionsDropDownItems from './VMCutoverActionsDropDownItems';

type VMCutoverActionsDropdownProps = {
  isCompleted: boolean;
  migration: V1beta1Migration;
  vmId: string;
  vmName: string;
};

const VMCutoverActionsDropdown: FC<VMCutoverActionsDropdownProps> = ({
  isCompleted,
  migration,
  vmId,
  vmName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => {
    setIsOpen((open) => !open);
  };

  const handleSelect = (): void => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      className="forklift-dropdown"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={handleSelect}
      popperProps={{
        position: 'right',
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          data-testid="vm-cutover-modal-toggle"
          isExpanded={isOpen}
          onClick={handleClick}
          ref={toggleRef}
          variant="plain"
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
    >
      <VMCutoverActionsDropDownItems
        isCompleted={isCompleted}
        migration={migration}
        vmId={vmId}
        vmName={vmName}
      />
    </Dropdown>
  );
};

export default VMCutoverActionsDropdown;
