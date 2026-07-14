import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { BusinessRegisterFormValues } from '../../schema';

export type StepProps = {
  register: UseFormRegister<BusinessRegisterFormValues>;
  control: Control<BusinessRegisterFormValues>;
  errors: FieldErrors<BusinessRegisterFormValues>;
  watch: UseFormWatch<BusinessRegisterFormValues>;
  setValue: UseFormSetValue<BusinessRegisterFormValues>;
};
