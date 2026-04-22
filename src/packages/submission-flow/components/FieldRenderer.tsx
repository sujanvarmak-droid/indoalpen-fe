import { ComponentType } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFlowContext } from '../context/FlowContext';
import { FieldConfig, FieldType } from '../types/config';
import { evaluateCondition } from '../utils/evaluateCondition';
import { TextField } from './fields/TextField';
import { TextareaField } from './fields/TextareaField';
import { SelectField } from './fields/SelectField';
import { MultiSelectField } from './fields/MultiSelectField';
import { RadioField } from './fields/RadioField';
import { DateField } from './fields/DateField';
import { TagsField } from './fields/TagsField';
import { LinkField } from './fields/LinkField';
import { RepeatableSection } from './RepeatableSection';

interface FieldProps {
  field: FieldConfig;
  namePrefix?: string;
}

const FIELDS: Record<FieldType, ComponentType<FieldProps>> = {
  text: TextField,
  textarea: TextareaField,
  select: SelectField,
  multiselect: MultiSelectField,
  radio: RadioField,
  date: DateField,
  tags: TagsField,
  repeatable: RepeatableSection,
  link: LinkField,
};

export function FieldRenderer({ field, namePrefix }: FieldProps) {
  const { watch } = useFormContext();
  const { state } = useFlowContext();

  if (field.visibleIf) {
    const currentValues = watch();
    if (!evaluateCondition(field.visibleIf, state.flowData, currentValues)) {
      return null;
    }
  }

  const Component = FIELDS[field.type];
  return <Component field={field} namePrefix={namePrefix} />;
}
