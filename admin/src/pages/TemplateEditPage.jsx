import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Field,
  Flex,
  JSONInput,
  TextInput,
  Toggle,
  Typography,
} from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import { Layouts, Page, useFetchClient, useNotification } from '@strapi/strapi/admin';
import { TemplateJsonEditor } from '../components/TemplateJsonEditor';
import { buildFieldVariables } from '../utils/buildFieldVariables';
import { PLUGIN_API, PLUGIN_ID, PERMISSIONS } from '../constants';

const DEFAULT_TEMPLATE = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '{{title}}',
};

const stringifyJson = (value, fallback = '{}') => {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
};

const parseTemplateJson = (text) => {
  const trimmed = (text ?? '').trim();
  if (!trimmed) {
    return null;
  }
  return JSON.parse(trimmed);
};

const TemplateEditPage = () => {
  const { uid: encodedUid } = useParams();
  const contentTypeUid = encodedUid ? decodeURIComponent(encodedUid) : '';
  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();
  const { get, put, post } = useFetchClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [displayName, setDisplayName] = useState(contentTypeUid);
  const [templateText, setTemplateText] = useState(() => stringifyJson(DEFAULT_TEMPLATE));
  const [populateText, setPopulateText] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [previewDocumentId, setPreviewDocumentId] = useState('');
  const [previewSlug, setPreviewSlug] = useState('');
  const [hasSlugField, setHasSlugField] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [previewSource, setPreviewSource] = useState(null);
  const [fieldOptions, setFieldOptions] = useState([]);

  const parsePopulate = useCallback(() => {
    return populateText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [populateText]);

  const handleRelationFieldInsert = useCallback((relationField) => {
    setPopulateText((prev) => {
      const parts = prev
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.includes(relationField)) {
        return prev;
      }
      return parts.length ? `${parts.join(', ')}, ${relationField}` : relationField;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!contentTypeUid) {
        return;
      }

      setIsLoading(true);
      try {
        const [templateRes, typesRes, configRes] = await Promise.all([
          get(`${PLUGIN_API}/template`, { params: { contentTypeUid } }),
          get('/content-manager/content-types', { params: { kind: 'collectionType' } }),
          get(
            `/content-manager/content-types/${encodeURIComponent(contentTypeUid)}/configuration`
          ).catch(() => ({ data: null })),
        ]);

        if (cancelled) {
          return;
        }

        const allTypes = typesRes.data?.data ?? [];
        const typeRow = allTypes.find((t) => t.uid === contentTypeUid);
        if (typeRow?.info?.displayName) {
          setDisplayName(typeRow.info.displayName);
        }

        const metadatas = configRes.data?.data?.contentType?.metadatas ?? {};
        setFieldOptions(buildFieldVariables(typeRow, allTypes, metadatas));
        setHasSlugField(Boolean(typeRow?.attributes?.slug));

        const dto = templateRes.data?.data;
        if (dto?.template && typeof dto.template === 'object') {
          setTemplateText(stringifyJson(dto.template));
        } else if (typeof dto?.template === 'string' && dto.template.trim()) {
          setTemplateText(dto.template);
        } else {
          setTemplateText(stringifyJson(DEFAULT_TEMPLATE));
        }
        setPopulateText(Array.isArray(dto?.populate) ? dto.populate.join(', ') : '');
        setEnabled(dto?.enabled !== false);
      } catch {
        if (!cancelled) {
          toggleNotification({
            type: 'danger',
            message: formatMessage({
              id: `${PLUGIN_ID}.template.load.error`,
              defaultMessage: 'Could not load template.',
            }),
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [contentTypeUid, get, formatMessage, toggleNotification]);

  const handleSave = async () => {
    let template;
    try {
      template = parseTemplateJson(templateText);
    } catch {
      toggleNotification({
        type: 'danger',
        message: formatMessage({
          id: `${PLUGIN_ID}.template.json.invalid`,
          defaultMessage: 'Template JSON is invalid. Fix errors before saving.',
        }),
      });
      return;
    }

    setIsSaving(true);
    try {
      await put(`${PLUGIN_API}/template`, {
        contentTypeUid,
        template,
        populate: parsePopulate(),
        enabled,
      });
      toggleNotification({
        type: 'success',
        message: formatMessage({
          id: `${PLUGIN_ID}.template.save.success`,
          defaultMessage: 'Global schema template saved.',
        }),
      });
    } catch {
      toggleNotification({
        type: 'danger',
        message: formatMessage({
          id: `${PLUGIN_ID}.template.save.error`,
          defaultMessage: 'Could not save template.',
        }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    const documentId = previewDocumentId.trim();
    const slug = previewSlug.trim();

    if (!documentId && !slug) {
      toggleNotification({
        type: 'warning',
        message: formatMessage({
          id: `${PLUGIN_ID}.template.preview.noLookup`,
          defaultMessage: 'Enter a document ID or slug to preview.',
        }),
      });
      return;
    }

    setIsPreviewing(true);
    setPreviewSource(null);
    try {
      const body = { contentTypeUid };
      if (documentId) {
        body.documentId = documentId;
      }
      if (slug) {
        body.slug = slug;
      }
      const { data } = await post(`${PLUGIN_API}/template/preview`, body);
      const result = data?.data;
      setPreviewSource(result?.source ?? 'none');
      setPreviewText(stringifyJson(result?.schemaMarkup ?? null, 'null'));
    } catch {
      setPreviewSource(null);
      setPreviewText('');
      toggleNotification({
        type: 'danger',
        message: formatMessage({
          id: `${PLUGIN_ID}.template.preview.error`,
          defaultMessage: 'Preview failed. Check document ID or slug.',
        }),
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const previewSourceLabel =
    previewSource === 'entry'
      ? formatMessage({
          id: `${PLUGIN_ID}.template.preview.source.entry`,
          defaultMessage: 'Source: entry (this page overrides the global template)',
        })
      : previewSource === 'global'
        ? formatMessage({
            id: `${PLUGIN_ID}.template.preview.source.global`,
            defaultMessage: 'Source: global (saved template below)',
          })
        : previewSource === 'none'
          ? formatMessage({
              id: `${PLUGIN_ID}.template.preview.source.none`,
              defaultMessage: 'Source: none (no entry schema and no saved global template)',
            })
          : null;

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <Page.Main tabIndex={-1}>
      <Layouts.Header
        title={formatMessage(
          {
            id: `${PLUGIN_ID}.template.title`,
            defaultMessage: 'Structured data — {name}',
          },
          { name: displayName }
        )}
        subtitle={formatMessage({
          id: `${PLUGIN_ID}.template.subtitle`,
          defaultMessage:
            'Default JSON-LD for all entries. Pick fields from the list to insert variables. Entry-level schema overrides this.',
        })}
        navigationAction={
          <RouterLink to="..">
            <Button startIcon={<ArrowLeft />} variant="tertiary">
              {formatMessage({
                id: `${PLUGIN_ID}.template.back`,
                defaultMessage: 'Back to list',
              })}
            </Button>
          </RouterLink>
        }
        primaryAction={
          <Button onClick={handleSave} loading={isSaving}>
            {formatMessage({
              id: `${PLUGIN_ID}.template.save`,
              defaultMessage: 'Save',
            })}
          </Button>
        }
      />
      <Layouts.Content>
        <Flex direction="column" alignItems="stretch" gap={6}>
          <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
            <Field.Root name="enabled">
              <Field.Label>
                {formatMessage({
                  id: `${PLUGIN_ID}.template.enabled`,
                  defaultMessage: 'Use global template',
                })}
              </Field.Label>
              <Toggle
                checked={enabled}
                onLabel={formatMessage({ id: 'app.utils.enabled', defaultMessage: 'Enabled' })}
                offLabel={formatMessage({ id: 'app.utils.disabled', defaultMessage: 'Disabled' })}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <Field.Hint>
                {formatMessage({
                  id: `${PLUGIN_ID}.template.enabled.hint`,
                  defaultMessage: 'When off, only entry-level schema is used (if set).',
                })}
              </Field.Hint>
            </Field.Root>
          </Box>

          <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius width="100%">
            <Flex direction="column" alignItems="stretch" gap={4} width="100%">
              <Flex direction="column" gap={1} alignItems="flex-start">
                <Typography variant="delta" tag="h2">
                  {formatMessage({
                    id: `${PLUGIN_ID}.template.json.title`,
                    defaultMessage: 'Template (JSON-LD)',
                  })}
                </Typography>
                <Typography variant="pi" textColor="neutral600">
                  {formatMessage({
                    id: `${PLUGIN_ID}.template.json.sectionHint`,
                    defaultMessage:
                      'Default structured data for every entry of this type. Use the field picker or edit JSON directly.',
                  })}
                </Typography>
              </Flex>
              <TemplateJsonEditor
                value={templateText}
                onChange={setTemplateText}
                fieldOptions={fieldOptions}
                onRelationFieldInsert={handleRelationFieldInsert}
              />
            </Flex>
          </Box>

          <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
            <Field.Root name="populate">
              <Field.Label>
                {formatMessage({
                  id: `${PLUGIN_ID}.template.populate`,
                  defaultMessage: 'Populate (relations)',
                })}
              </Field.Label>
              <TextInput
                name="populate"
                value={populateText}
                onChange={(e) => setPopulateText(e.target.value)}
                placeholder="author, category"
              />
              <Field.Hint>
                {formatMessage({
                  id: `${PLUGIN_ID}.template.populate.hint`,
                  defaultMessage:
                    'Comma-separated top-level fields (e.g. author, category, components). Components and dynamic zones are deep-populated automatically.',
                })}
              </Field.Hint>
            </Field.Root>
          </Box>

          <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
            <Typography variant="delta" tag="h2" paddingBottom={2}>
              {formatMessage({
                id: `${PLUGIN_ID}.template.preview.title`,
                defaultMessage: 'Preview (same as public API)',
              })}
            </Typography>
            <Typography variant="pi" textColor="neutral600" paddingBottom={4}>
              {formatMessage({
                id: `${PLUGIN_ID}.template.preview.hint`,
                defaultMessage:
                  'Uses saved global template only. Entry schema wins if set on that document. Save before previewing. Lookup by document ID or slug (same as GET /api/strapi-seo-schema-markup/schema).',
              })}
            </Typography>
            <Flex gap={2} paddingBottom={4} alignItems="flex-end" wrap="wrap">
              <Box flex="1" minWidth="200px">
                <Field.Root name="previewDocumentId">
                  <Field.Label>
                    {formatMessage({
                      id: `${PLUGIN_ID}.template.preview.documentId`,
                      defaultMessage: 'Document ID',
                    })}
                  </Field.Label>
                  <TextInput
                    name="previewDocumentId"
                    value={previewDocumentId}
                    onChange={(e) => setPreviewDocumentId(e.target.value)}
                    placeholder="e.g. k1evu4ouz2veq07mzmq8yq59"
                  />
                </Field.Root>
              </Box>
              {hasSlugField && (
                <Box flex="1" minWidth="200px">
                  <Field.Root name="previewSlug">
                    <Field.Label>
                      {formatMessage({
                        id: `${PLUGIN_ID}.template.preview.slug`,
                        defaultMessage: 'Slug',
                      })}
                    </Field.Label>
                    <TextInput
                      name="previewSlug"
                      value={previewSlug}
                      onChange={(e) => setPreviewSlug(e.target.value)}
                      placeholder="e.g. about-us"
                    />
                  </Field.Root>
                </Box>
              )}
              <Button variant="secondary" onClick={handlePreview} loading={isPreviewing}>
                {formatMessage({
                  id: `${PLUGIN_ID}.template.preview.run`,
                  defaultMessage: 'Preview',
                })}
              </Button>
            </Flex>
            {previewSourceLabel && (
              <Typography variant="omega" fontWeight="bold" textColor="primary600" paddingBottom={2}>
                {previewSourceLabel}
              </Typography>
            )}
            {previewText !== '' && (
              <JSONInput value={previewText} disabled minHeight="200px" />
            )}
          </Box>

          <Typography variant="pi" textColor="neutral600">
            <strong>{formatMessage({ id: `${PLUGIN_ID}.template.uid`, defaultMessage: 'UID' })}:</strong>{' '}
            {contentTypeUid}
          </Typography>
        </Flex>
      </Layouts.Content>
    </Page.Main>
  );
};

const ProtectedTemplateEditPage = () => (
  <Page.Protect permissions={PERMISSIONS.manageTemplate}>
    <TemplateEditPage />
  </Page.Protect>
);

export { TemplateEditPage, ProtectedTemplateEditPage };
