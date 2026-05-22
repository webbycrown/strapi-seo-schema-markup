import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  EmptyStateLayout,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';
import { EmptyDocuments } from '@strapi/icons/symbols';
import { Layouts, Page, useFetchClient } from '@strapi/admin/strapi-admin';
import { PLUGIN_API, PLUGIN_ID, PERMISSIONS } from '../constants';

const CollectionTypesListPage = () => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();
  const [rows, setRows] = useState([]);
  const [configuredUids, setConfiguredUids] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await get('/content-manager/content-types', {
          params: { kind: 'collectionType' },
        });
        if (!cancelled) {
          const all = Array.isArray(data?.data) ? data.data : [];
          const visible = all
            .filter((row) => row.isDisplayed === true)
            .sort((a, b) =>
              (a.info?.displayName ?? '').localeCompare(b.info?.displayName ?? '', undefined, {
                sensitivity: 'base',
              })
            );
          setRows(visible);

          const configured = new Set();
          await Promise.all(
            visible.map(async (row) => {
              try {
                const res = await get(`${PLUGIN_API}/template`, {
                  params: { contentTypeUid: row.uid },
                });
                if (res.data?.data?.configured) {
                  configured.add(row.uid);
                }
              } catch {
                // ignore per-row errors
              }
            })
          );
          if (!cancelled) {
            setConfiguredUids(configured);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
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
  }, [get]);

  if (isLoading) {
    return <Page.Loading />;
  }

  if (error) {
    return <Page.Error />;
  }

  return (
    <Page.Main tabIndex={-1}>
      <Layouts.Header
        title={formatMessage({
          id: `${PLUGIN_ID}.settings.title`,
          defaultMessage: 'Structured data',
        })}
        subtitle={formatMessage(
          {
            id: `${PLUGIN_ID}.settings.description`,
            defaultMessage:
              'Default schema (JSON-LD) for {count} content types. Per-page schema in Content Manager overrides these defaults.',
          },
          { count: rows.length }
        )}
      />
      <Layouts.Content>
        {rows.length === 0 ? (
          <EmptyStateLayout
            icon={<EmptyDocuments width={undefined} height={undefined} />}
            content={formatMessage({
              id: `${PLUGIN_ID}.settings.collection-types.empty`,
              defaultMessage: 'No content types available for schema templates.',
            })}
          />
        ) : (
          <Box background="neutral0" shadow="filterShadow" hasRadius padding={6}>
            <Table colCount={5} rowCount={rows.length}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography variant="sigma">
                      {formatMessage({
                        id: `${PLUGIN_ID}.settings.collection-types.column.displayName`,
                        defaultMessage: 'Display name',
                      })}
                    </Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">
                      {formatMessage({
                        id: `${PLUGIN_ID}.settings.collection-types.column.apiId`,
                        defaultMessage: 'API ID',
                      })}
                    </Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">
                      {formatMessage({
                        id: `${PLUGIN_ID}.settings.collection-types.column.global`,
                        defaultMessage: 'Global template',
                      })}
                    </Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">
                      {formatMessage({
                        id: `${PLUGIN_ID}.settings.collection-types.column.uid`,
                        defaultMessage: 'UID',
                      })}
                    </Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">
                      {formatMessage({
                        id: `${PLUGIN_ID}.settings.collection-types.column.actions`,
                        defaultMessage: 'Actions',
                      })}
                    </Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((row) => (
                  <Tr key={row.uid}>
                    <Td>
                      <Typography textColor="neutral800">{row.info?.displayName ?? '—'}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral800">{row.apiID ?? '—'}</Typography>
                    </Td>
                    <Td>
                      <Typography textColor={configuredUids.has(row.uid) ? 'success600' : 'neutral600'}>
                        {configuredUids.has(row.uid)
                          ? formatMessage({
                              id: `${PLUGIN_ID}.settings.collection-types.configured`,
                              defaultMessage: 'Configured',
                            })
                          : formatMessage({
                              id: `${PLUGIN_ID}.settings.collection-types.notConfigured`,
                              defaultMessage: 'Not set',
                            })}
                      </Typography>
                    </Td>
                    <Td>
                      <Typography textColor="neutral600" variant="omega">
                        {row.uid}
                      </Typography>
                    </Td>
                    <Td>
                      <Link to={encodeURIComponent(row.uid)}>
                        <Button size="S" variant="secondary">
                          {formatMessage({
                            id: `${PLUGIN_ID}.settings.collection-types.configure`,
                            defaultMessage: 'Configure',
                          })}
                        </Button>
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Layouts.Content>
    </Page.Main>
  );
};

const ProtectedCollectionTypesListPage = () => (
  <Page.Protect permissions={PERMISSIONS.readCollectionTypes}>
    <CollectionTypesListPage />
  </Page.Protect>
);

export { CollectionTypesListPage, ProtectedCollectionTypesListPage };
