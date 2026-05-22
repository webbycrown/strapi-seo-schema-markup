import { useCallback, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Box,
  Divider,
  Field,
  Flex,
  JSONInput,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system';
import { EditorView } from '@codemirror/view';
import { PLUGIN_ID } from '../constants';

const getCodeMirrorView = (wrapperEl) => {
  if (!wrapperEl) {
    return null;
  }
  const content = wrapperEl.querySelector('.cm-content');
  if (!content) {
    return null;
  }
  return EditorView.findFromDOM(content);
};

const insertTextAtSelection = (view, text, fallbackValue, onChange) => {
  if (view) {
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
    });
    onChange(view.state.doc.toString());
    return;
  }

  onChange(`${fallbackValue}${text}`);
};

const TemplateJsonEditor = ({ value, onChange, fieldOptions = [], onRelationFieldInsert }) => {
  const { formatMessage } = useIntl();
  const wrapperRef = useRef(null);
  const [selectKey, setSelectKey] = useState(0);

  const handleFieldSelect = useCallback(
    (path) => {
      if (!path) {
        return;
      }

      const option = fieldOptions.find((o) => o.value === path);
      const token = `{{${path}}}`;
      const view = getCodeMirrorView(wrapperRef.current);
      insertTextAtSelection(view, token, value, onChange);

      if (option?.isRelation && option.relationField && onRelationFieldInsert) {
        onRelationFieldInsert(option.relationField);
      }

      setSelectKey((k) => k + 1);
    },
    [fieldOptions, value, onChange, onRelationFieldInsert]
  );

  const fieldCountLabel = formatMessage(
    {
      id: `${PLUGIN_ID}.template.insertField.count`,
      defaultMessage: '{count} fields available',
    },
    { count: fieldOptions.length }
  );

  return (
    <Flex direction="column" alignItems="stretch" gap={4} width="100%">
      <Box
        width="100%"
        background="neutral100"
        borderColor="neutral200"
        hasRadius
        padding={4}
      >
        <Flex direction="column" alignItems="stretch" gap={3} width="100%">
          <Flex justifyContent="space-between" alignItems="flex-start" gap={4} width="100%">
            <Flex direction="column" gap={1} alignItems="flex-start">
              <Typography variant="pi" fontWeight="bold">
                {formatMessage({
                  id: `${PLUGIN_ID}.template.insertField.label`,
                  defaultMessage: 'Insert field variable',
                })}
              </Typography>
              <Typography variant="pi" textColor="neutral600">
                {formatMessage({
                  id: `${PLUGIN_ID}.template.insertField.hint`,
                  defaultMessage:
                    'Place the cursor in the editor, then select a field. Relations are added to Populate automatically.',
                })}
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral500">
              {fieldCountLabel}
            </Typography>
          </Flex>

          <Box width="100%">
            <SingleSelect
              key={selectKey}
              size="M"
              placeholder={formatMessage({
                id: `${PLUGIN_ID}.template.insertField.placeholder`,
                defaultMessage: 'Choose a field to insert…',
              })}
              onChange={handleFieldSelect}
              disabled={fieldOptions.length === 0}
            >
              {fieldOptions.map((opt) => (
                <SingleSelectOption key={opt.value} value={opt.value}>
                  {opt.label} ({`{{${opt.value}}}`})
                </SingleSelectOption>
              ))}
            </SingleSelect>
          </Box>
        </Flex>
      </Box>

      <Divider />

      <Field.Root name="templateJson" width="100%">
        <Field.Label>
          {formatMessage({
            id: `${PLUGIN_ID}.template.json.editorLabel`,
            defaultMessage: 'JSON-LD body',
          })}
        </Field.Label>
        <Box
          ref={wrapperRef}
          width="100%"
          style={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <JSONInput
            value={value}
            onChange={onChange}
            minHeight="320px"
            width="100%"
            style={{ width: '100%', maxWidth: '100%' }}
          />
        </Box>
        <Field.Hint>
          {formatMessage({
            id: `${PLUGIN_ID}.template.json.hint`,
            defaultMessage: 'Valid JSON object. Variables use double curly braces, e.g. {{title}}.',
          })}
        </Field.Hint>
      </Field.Root>
    </Flex>
  );
};

export { TemplateJsonEditor };
