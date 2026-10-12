import React from 'react';
import { PhotonAddressInput } from './PhotonAddressInput';

interface CascadingAddressSelectorProps {
  initialCombinedAddress?: string;
  initialStructured?: any;
  onChange: (data: {
    combinedAddress: string;
    structured?: any;
    isValid: boolean;
  }) => void;
  required?: boolean;
  idPrefix?: string;
}

/**
 * Reusable Address Component:
 * Powered by Photon autocomplete API with fallback to manual typing and required detailed address textarea.
 * Replaces the obsolete 4 cascading dropdowns.
 */
export const CascadingAddressSelector: React.FC<CascadingAddressSelectorProps> = ({
  initialCombinedAddress = '',
  onChange,
  required = true,
  idPrefix = 'address',
}) => {
  return (
    <PhotonAddressInput
      initialValue={initialCombinedAddress}
      onChange={(val) => {
        onChange({
          combinedAddress: val,
          structured: undefined,
          isValid: Boolean(val && val.trim().length > 0),
        });
      }}
      required={required}
      idPrefix={idPrefix}
    />
  );
};
